export default defineNuxtPlugin(async (nuxtApp) => {
    const authStore = useAuthStore();
    
    try {
        await authStore.initAuth();

        // Если токен есть, пробуем получить данные пользователя
        if (authStore.access_token) {
            try {
                await authStore.fetchCurrentUser();
            } catch (error: any) {
                console.error('Ошибка при получении данных пользователя:', error);
                // Если не удалось получить данные пользователя, разлогиниваем
                await authStore.logout();
            }
        }
    } catch (error: any) {
        console.error('Ошибка при инициализации авторизации:', error);
        // В случае ошибки очищаем состояние авторизации
        await authStore.logout();
    }
});
