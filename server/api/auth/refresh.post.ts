export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);

    if (!body.refresh_token) {
        throw createError({
            statusCode: 400,
            message: 'Отсутствует refresh token',
        });
    }

    try {
        // Отправляем запрос на обновление токена к внешнему бэкенду
        const response = await $fetch(`${config.AUTH_BACKEND_URL}/api/v1/users/refresh`, {
            method: 'POST',
            body: {
                refresh_token: body.refresh_token
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response; // Возвращаем данные на фронт
    } catch (error: any) {
        console.error('Ошибка обновления токена:', error);
        throw createError({
            statusCode: error.response?.status || 401,
            message: 'Ошибка обновления токена',
        });
    }
});
