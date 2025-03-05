import {
    aggregate,
    createDirectus,
    createItem,
    readItems,
    rest,
    staticToken,
    updateItem,
    withToken
} from "@directus/sdk";
import {readBody} from "h3";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const student_relocation_application = await readBody<StudentRelocationApplicationDetails>(event);
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
                        '_eq': student_relocation_application.student_relocation_id
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

    const is_user_have_application = await client.request(readItems('student_relocation_applications_match', {
        filter: {
            _and: [
                {
                    _or: [
                        {
                            status: {
                                '_eq': 'sent'
                            }
                        },
                        {
                            status: {
                                '_eq': 'approved'
                            }
                        },
                    ]
                },
                {
                    relocation_applications_id_from: {
                        student_relocation_id: {
                            '_eq': student_relocation_application.student_relocation_id
                        }
                    }
                },
                {
                    user_created: {
                        '_eq': user.directus_id
                    }
                }
            ]
        }
    }))

    if (is_user_have_application.length > 0) {
        throw createError({
            statusCode: 400,
            message: 'User already have application',
        })
    }

    const user_application_from = await client.request(readItems('student_relocation_applications', {
        filter: {
            _and: [
                {
                    status: {
                        '_eq': 'created'
                    }
                },
                {
                    user_created: {
                        '_eq': user.directus_id,
                    }
                },
                {
                    student_relocation_id: {
                        '_eq': student_relocation_application.student_relocation_id
                    }
                }
            ]
        }
    }))

    if (user_application_from.length === 0) {
        throw createError({
            statusCode: 400,
            message: 'User have no application',
        })
    }

    try {
        await client.request(createItem('student_relocation_applications_match', {
            status: 'sent',
            user_created: user.directus_id,
            relocation_applications_id_from: user_application_from[0].id,
            relocation_applications_id_to: student_relocation_application.id,
        }))
    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }

    return {status: 'ok'}
});
