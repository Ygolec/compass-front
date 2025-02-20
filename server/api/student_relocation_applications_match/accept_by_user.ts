import {
    createDirectus,
    readItem,
    readItems,
    rest,
    staticToken,
    updateItem,
    updateItems,
} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL)
        .with(staticToken(config.DIRECTUS_TOKEN))
        .with(rest());
    const requestBody = await readBody(event);
    const requestHeaders = getHeaders(event);

    if (!requestHeaders) {
        throw createError({
            statusCode: 400,
            message: "No data",
        });
    }

    const currentUser: user = await $fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        headers: requestHeaders as HeadersInit,
    });

    if (!currentUser) {
        throw createError({
            statusCode: 401,
            message: "Unauthorized",
        });
    }

    // Проверяем, что релокация открыта
    const openRelocationRecords = await client.request(
        readItems("student_relocation", {
            filter: {
                _and: [
                    {
                        status: {
                            _eq: "open",
                        },
                    },
                    {
                        id: {
                            _eq: requestBody.relocation_id,
                        },
                    },
                ],
            },
        })
    );

    if (openRelocationRecords.length === 0) {
        throw createError({
            statusCode: 400,
            message: "Relocation is not open",
        });
    }

    // Проверяем, что статус заявки (applications_match) от пользователя — "sent"
    const sentApplicationMatchesFromUser = await client.request(
        readItems("student_relocation_applications_match", {
            filter: {
                _and: [
                    {
                        id: {
                            _eq: requestBody.student_relocation_applications_match_id,
                        },
                        status: {
                            _eq: "sent",
                        },
                    },
                ],
            },
        })
    );

    if (sentApplicationMatchesFromUser.length === 0) {
        throw createError({
            statusCode: 400,
            message: "Application status error",
        });
    }

    // Проверяем, что у текущего пользователя есть "created" заявка для данной релокации
    const createdApplicationsFromCurrentUser = await client.request(
        readItems("student_relocation_applications", {
            filter: {
                _and: [
                    {
                        user_created: {
                            _eq: currentUser.directus_id,
                        },
                    },
                    {
                        student_relocation_id: {
                            _eq: requestBody.relocation_id,
                        },
                    },
                    {
                        status: {
                            _eq: "created",
                        },
                    },
                ],
            },
        })
    );

    if (createdApplicationsFromCurrentUser.length === 0) {
        throw createError({
            statusCode: 400,
            message: "Your application is closed",
        });
    }

    try {
        // Завершаем заявку текущего пользователя
        const endedUserApplication = await client.request(
            updateItem(
                "student_relocation_applications",
                createdApplicationsFromCurrentUser[0].id,
                {
                    status: "ended",
                }
            )
        );

        // Одобряем match-запись от другого пользователя
        const approvedApplicationMatchFromOther = await client.request(
            updateItem(
                "student_relocation_applications_match",
                requestBody.student_relocation_applications_match_id,
                {
                    status: "approved",
                }
            )
        );

        // Получаем user_created из одобренной match-записи
        const applicationMatchOwner = await client.request(
            readItem(
                "student_relocation_applications_match",
                requestBody.student_relocation_applications_match_id,
                {
                    fields: ["user_created"],
                }
            )
        );

        // Получаем все "sent" match-записи от пользователя, которого мы одобрили
        const sentApplicationMatchesFromApprovedUser = await client.request(
            readItems("student_relocation_applications_match", {
                filter: {
                    _and: [
                        {
                            user_created: {
                                _eq: applicationMatchOwner.user_created,
                            },
                            status: {
                                _eq: "sent",
                            },
                        },
                    ],
                },
            })
        );

        // Ищем заявку (статус "created") у того же пользователя, чтобы поменять её статус на "ended"
        const createdApplicationsFromApprovedUser = await client.request(
            readItems("student_relocation_applications", {
                fields: ["id"],
                filter: {
                    _and: [
                        {
                            user_created: {
                                _eq: applicationMatchOwner.user_created,
                            },
                        },
                        {
                            student_relocation_id: {
                                _eq: requestBody.relocation_id,
                            },
                        },
                        {
                            status: {
                                _eq: "created",
                            },
                        },
                    ],
                },
            })
        );


        if (createdApplicationsFromApprovedUser.length != 0) {
            const endedApplicationFromApprovedUser = await client.request(
                updateItem(
                    "student_relocation_applications",
                    createdApplicationsFromApprovedUser[0].id,
                    {
                        status: "ended",
                    }
                )
            );
            console.log(endedApplicationFromApprovedUser)
        }

        // Все остальные заявки (match) от того пользователя помечаем "rejected"
        if (sentApplicationMatchesFromApprovedUser.length != 0) {
            const rejectedMatchesFromApprovedUser = await client.request(
                updateItems(
                    "student_relocation_applications_match",
                    sentApplicationMatchesFromApprovedUser.map((item) => item.id),
                    {
                        status: "rejected",
                    }
                )
            );
        }

        // Все остальные заявки (match) от текущего пользователя также "rejected"
        const sentApplicationMatchesToCurrentUser = await client.request(
            readItems("student_relocation_applications_match", {
                filter: {
                    _and: [
                        {
                            user_created: {
                                _eq: currentUser.directus_id,
                            },
                            status: {
                                _eq: "sent",
                            },
                        },
                    ],
                },
            })
        );

        if (sentApplicationMatchesToCurrentUser.length != 0) {
            const rejectedMatchesToCurrentUser = await client.request(
                updateItems(
                    "student_relocation_applications_match",
                    sentApplicationMatchesToCurrentUser.map((item) => item.id),
                    {
                        status: "rejected",
                    }
                )
            );
        }
    } catch (error: any) {
        console.error("Ошибка получения данных:", error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: "Ошибка получения данных",
        });
    }

    return {status: "success"};
});
