import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);

    if (!body.refresh_token) {
        throw createError({
            statusCode: 401,
            message: 'Не авторизован',
        });
    }

    try {
        const response = await fetch(`${config.DIRECTUS_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refresh_token: body.refresh_token
            }),
        });

        if (!response.ok) {
            throw createError({
                statusCode: response.status,
                message: 'Ошибка при выходе из системы',
            });
        }

        return { success: true };
    } catch (error: any) {
        if (error.statusCode) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            message: 'Ошибка при выходе из системы',
            cause: error,
        });
    }
});
