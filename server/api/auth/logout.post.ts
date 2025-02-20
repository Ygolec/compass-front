export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    try {

        const backendResponse = await fetch(`${config.AUTH_BACKEND_URL}/api/v1/users/logout`, {
            method: 'POST',
            credentials: 'include',
        })

        // 3. Получаем JSON-данные из ответа бэкенда
        const data = await backendResponse.json()

        // 4. Читаем Set-Cookie из заголовков бэкенда
        const setCookie = backendResponse.headers.get('set-cookie')
        if (setCookie) {
            // Устанавливаем cookie в ответ Nuxt-сервера
            // Благодаря этому на фронтенде у пользователя будет установлена кука
            event.node.res.setHeader('Set-Cookie', setCookie)
        }

        // 5. Возвращаем тело ответа (JSON) обратно на фронтенд
        return data
        // Отправляем запрос на внешний API для выхода пользователя
    } catch (error: any) {
        console.error('Ошибка выхода:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка выхода',
        });
    }
});
