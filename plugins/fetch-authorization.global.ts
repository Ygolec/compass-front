// ~/plugins/fetch-authorization.global.ts
export default defineNuxtPlugin(() => {
    const authStore = useAuthStore();

    const _fetch = globalThis.$fetch;
    globalThis.$fetch = async (request, options = {}) => {
        if (!options.headers) {
            options.headers = {};
        }

        if (authStore.access_token) {
            (options.headers as Record<string, string>)['Authorization'] =
                `Bearer ${authStore.access_token}`;
        }

        options.credentials = 'include';

        try {
            return await _fetch(request, options);
        } catch (error: any) {
            const isUnauthorized = error?.response?.status === 401;
            const isNotFound  = error?.response?.status === 404;

            // Добавляем защиту от бесконечного цикла
            const isRefreshRequest = typeof request === 'string'
                ? request.includes('/api/auth/refresh')
                : false;

            if (!authStore.access_token || (!isUnauthorized && !isNotFound)|| isRefreshRequest) {
                throw error;
            }

            try {
                // Пробуем обновить токен
                await authStore.refreshAccessToken();

                // Обновляем заголовок
                (options.headers as Record<string, string>)['Authorization'] =
                    `Bearer ${authStore.access_token}`;

                // Повторяем оригинальный запрос
                return await _fetch(request, options);
            } catch (refreshError) {
                // Рефреш не удался — выходим из аккаунта и пробрасываем ошибку
                await authStore.logout(); // если у тебя есть такая функция
                throw refreshError;
            }
        }
    };
});
