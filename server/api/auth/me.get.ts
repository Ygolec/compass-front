export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    try {
        // Запрос к внешнему API для получения информации о пользователе
        const response = await $fetch(`${config.public.AUTH_BACKEND_URL}/api/v1/users/me`, {
            method: 'GET',
            credentials: 'include',
            headers: getRequestHeaders(event),
        });

        return response; // Возвращаем данные о пользователе на фронт
    } catch (error: any) {
        console.error('Ошибка получения данных пользователя:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных пользователя',
        });
    }
});
