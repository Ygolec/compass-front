import {
    createDirectus,
    readItems,
    rest,
    staticToken,
    updateItem, updateItems,
} from "@directus/sdk";


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
            fields: ['id','status'],
            filter: {
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
                    },
                    {
                        status: {
                            '_neq': 'canceled'
                        }
                    },
                    {
                        status: {
                            '_neq': 'rejected'
                        }
                    },
                ]
            }
        }))

        if (student_relocation_applications.length === 0) {
            throw createError({
                statusCode: 400,
                message: 'Application not found',
            })
        }

        if (student_relocation_applications[0].status==='ended'){
            throw createError({
                statusCode: 400,
                message: 'Application already ended',
            })
        }

        const student_relocation_application_id: string = student_relocation_applications[0].id;

        const result = await client.request(updateItem('student_relocation_applications', student_relocation_application_id, {
            status: 'canceled',
        }))

        const matchesForApplication = await client.request(readItems('student_relocation_applications_match', {
            fields: ['id'],
            filter: {
                "relocation_applications_id_to": {
                    "_eq": student_relocation_application_id
                }
            }
        }))

        const cancelledMatches = await client.request(updateItems('student_relocation_applications_match', matchesForApplication.map(match => match.id), {
            status: 'canceled',
        }))

        return {status: 'success'}

    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }
});
