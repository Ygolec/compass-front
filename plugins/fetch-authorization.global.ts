// ~/plugins/fetch-authorization.global.ts
export default defineNuxtPlugin(() => {
    const authStore = useAuthStore();

    // Перехватываем $fetch
    const _fetch = globalThis.$fetch;
    globalThis.$fetch = async (request, options = {}) => {
        if (!options.headers) {
            options.headers = {};
        }
        // Если есть accessToken, добавляем Authorization
        if (authStore.access_token) {
            (options.headers as Record<string, string>)['Authorization'] =
                `Bearer ${authStore.access_token}`;
        }

        // А чтобы куки тоже отправлялись
        options.credentials = 'include';

        let response;
        try {
            response = await _fetch(request, options);
        } catch (error: any) {

            if (!authStore.access_token || error?.response?.status !== 401) {
                throw error;
            }
            // Если сервер вернул 401 — пробуем рефрешнуть
            if (error?.response?.status === 401) {
                // Пытаемся рефрешнуть
                await authStore.refreshAccessToken();
                // Повторяем запрос с обновлённым токеном
                (options.headers as Record<string, string>)['Authorization'] =
                    `Bearer ${authStore.access_token}`;
                response = await _fetch(request, options);
            } else {
                throw error;
            }
        }
        return response;
    };
});
