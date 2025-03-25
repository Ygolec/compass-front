import {aggregate, createDirectus, readItems, rest, staticToken} from "@directus/sdk";
import {readBody} from "h3";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const headers = getHeaders(event)
    const body = await readBody(event);

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

    const is_user_have_application = await client.request(readItems('student_relocation_applications', {
            filter: {
                _and: [
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
        }
    ));

    if (is_user_have_application.length === 0) {
        throw createError({
            statusCode: 400,
            message: 'User have not application',
        })
    }

    try {
        const count=await client.request(readItems('student_relocation_applications',{
            fields:['id'],
            filter: {
                _and: [
                    {
                        student_relocation_id: {
                            _eq: body.relocation_id
                        },
                    },
                    {
                        student_accommodation_id_from: {
                            _eq: is_user_have_application[0].student_accommodation_id_to
                        }
                    },
                    {
                        '_or': [
                            {
                                status: {
                                    '_neq': 'canceled'
                                },
                            },
                            {
                                status: {
                                    '_neq': 'rejected'
                                },
                            }
                        ],
                    }
                ]
            },
        }))


        const result = await client.request(readItems('student_relocation_applications', {
            fields: ['*,' +
            'student_accommodation_to_address_id.*,' +
            'photos_of_room.*,' +
            'student_accommodation_from_address_id.*,' +
            'student_accommodation_id_from.*,' +
            'student_accommodation_id_to.*,' +
            'user_created.first_name'],
            ...(body.limit && {limit: body.itemsPerPage}),
            ...(body.page && {page: body.page}),
            // ...(body.sortBy && { sort: ['sort',`-${body.sortBy}`] }),
            filter: {
                _and: [
                    {
                        _and: [
                            {
                                student_relocation_id: {
                                    _eq: body.relocation_id
                                },
                            },
                            {
                                student_accommodation_id_from: {
                                    _eq: is_user_have_application[0].student_accommodation_id_to
                                }
                            }
                        ],
                    },
                    {
                        '_or': [
                            {
                                status: {
                                    '_neq': 'canceled'
                                },
                            },
                            {
                                status: {
                                    '_neq': 'rejected'
                                },
                            }
                        ],
                    }
                ]
            }
        }))

        result.push({count: count.length});


        return result;

    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }


});