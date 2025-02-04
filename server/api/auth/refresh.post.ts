

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    try {
        // Отправляем запрос на обновление токена к внешнему бэкенду
        const response = await $fetch(`${config.public.AUTH_BACKEND_URL}/api/v1/users/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: getRequestHeaders(event),
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
