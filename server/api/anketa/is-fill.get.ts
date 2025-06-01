import {
    createDirectus,
    readItems, readUser,
    rest,
    staticToken,
} from "@directus/sdk";


export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
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

    const directus_user = await client.request(readUser(user.directus_id, {
        fields: ['id']
    }))


    try {
        const is_fill = await client.request(readItems("questionnaires", {
            filter: { user_id: { _eq: directus_user.id } },
            limit: 1
        }));

        if (is_fill.length > 0) {
            return {status: 'success', is_fill: true}
        }

        return {status: 'success', is_fill: false}
    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }

})