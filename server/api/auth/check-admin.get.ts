import {
    createDirectus,
    readItems, readRole, readUser,
    rest,
    staticToken,
    updateItem,
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
        fields: ['id', 'role']
    }))


    try {
        const is_admin = await client.request(readRole(directus_user.role, {
            fields: ['id', 'name']
        }))

        if (is_admin.length === 0) {
            throw createError({
                statusCode: 403,
                message: 'Forbidden',
            })
        }

        if (is_admin.name !== 'Dormitory Admin') {
            throw createError({
                statusCode: 403,
                message: 'Forbidden',
            })
        }
    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }

    return {status: 'success'}
})