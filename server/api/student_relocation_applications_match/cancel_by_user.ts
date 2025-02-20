import {
    createDirectus,
    readItems,
    rest,
    staticToken,
    updateItem,
} from "@directus/sdk";


export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const body = await readBody(event);
    const headers = getHeaders(event)

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

    const is_open_relocation = await client.request(readItems('student_relocation', {
        filter: {
            _and: [
                {
                    status: {
                        '_eq': 'open'
                    }
                },
                {
                    id: {
                        '_eq': body.relocation_id
                    }
                }
            ]
        }
    }))

    if (is_open_relocation.length === 0) {
        throw createError({
            statusCode: 400,
            message: 'Relocation is not open',
        })
    }

    const is_sent_application = await client.request(readItems('student_relocation_applications_match', {
        filter: {
            _and: [
                {
                    user_created: {
                        '_eq': user.directus_id
                    },
                    id: {
                        '_eq': body.student_relocation_applications_match_id
                    },
                    status: {
                        '_eq': 'sent'
                    }
                },

            ]
        }
    }))


    if (is_sent_application.length === 0) {
        throw createError({
            statusCode: 400,
            message: 'Application status error',
        })
    }

    try {
        const update = await client.request(updateItem('student_relocation_applications_match', body.student_relocation_applications_match_id, {
            status: 'canceled'
        }))
    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }

    return {status: 'success'}
})