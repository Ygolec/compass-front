import {createDirectus, readItem, readItems, readUser, rest, staticToken} from "@directus/sdk";


export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const headers = getHeaders(event)

    const user: user = await $fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: headers as HeadersInit
    });

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized',
        })
    }

    try {
        const student_relocation_applications = await client.request(readItems('student_relocation_applications', {
            fields: ['id'],
            filter:{
                '_and': [
                    {
                        user_created: {
                            '_eq': user.directus_id
                        },
                    },
                    {
                        student_relocation_id: {
                            '_eq': body.relocation_id
                        }
                    }
                ]
            }
        }))

        if (student_relocation_applications.length === 0) {
            throw createError({
                statusCode: 400,
                message: 'Application not found',
            })
        }

        const student_relocation_application_id: string = student_relocation_applications[0].id;

        const result = await client.request(readItem('student_relocation_applications',student_relocation_application_id, {
            fields: ['*' +
            ',student_accommodation_id_from.*' +
            ',student_accommodation_id_to.*' +
            ',student_accommodation_from_address_id.*' +
            ',student_accommodation_to_address_id.*' +
            ',photos_of_room.*'
            ],
            filter: {
                "_or": [
                    {
                        status: {
                            '_neq': 'rejected'
                        }
                    },
                    {
                        status: {
                            '_neq': 'canceled'
                        }
                    }
                ]
            }
        }))

        const user2 = await client.request(readUser(result.user_created, {
            fields:['id','first_name','last_name','email']
        }))

        result.user_created = user2

        return result;

    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }
});
