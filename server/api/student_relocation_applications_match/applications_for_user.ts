import {aggregate, createDirectus, readItems, rest, staticToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const headers = getHeaders(event)
    const body = await readBody(event)

    if (!headers) {
        throw createError({
            statusCode: 400,
            message: 'No data',
        })
    }

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
        const count=await client.request(readItems('student_relocation_applications_match',{
            fields:['id'],
            filter: {
                _and: [
                    {
                        relocation_applications_id_to: {
                            user_created: {
                                '_eq': user.directus_id
                            }
                        }
                    },
                    {
                        relocation_applications_id_to: {
                            student_relocation_id: {
                                '_eq': body.relocation_id
                            }
                        }
                    },
                ]
            }
        }))

        const student_relocation_applications_match = await client.request(readItems('student_relocation_applications_match', {
            fields:['*' +
            ',relocation_applications_id_from.id' +
            ',relocation_applications_id_from.student_accommodation_id_from.*' +
            ',relocation_applications_id_from.student_accommodation_from_address_id.*' +
            ',relocation_applications_id_from.floor'+
            ',relocation_applications_id_from.user_created.first_name'+
            ',relocation_applications_id_from.user_created.last_name'
            ],
            ...(body.limit && { limit: body.itemsPerPage }),
            ...(body.page && { page: body.page }),
            filter: {
                _and: [
                    {
                        relocation_applications_id_to: {
                            user_created: {
                                '_eq': user.directus_id
                            }
                        }
                    },
                    {
                        relocation_applications_id_to: {
                            student_relocation_id: {
                                '_eq': body.relocation_id
                            }
                        }
                    }
                ]
            }
        }))

        student_relocation_applications_match.push({count: count.length});

        return student_relocation_applications_match

    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }

})