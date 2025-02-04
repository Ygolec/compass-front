export default defineNuxtPlugin(async (nuxtApp) => {
    const authStore = useAuthStore();
    authStore.loadTokenFromStorage();

    // Если токен есть, пробуем получить данные пользователя
    if (authStore.access_token) {
        await authStore.fetchCurrentUser();
    }
});
