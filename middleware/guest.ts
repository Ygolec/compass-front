export default defineNuxtRouteMiddleware(() => {
    const authStore = useAuthStore();

    // Если пользователь авторизован, перенаправляем на главную страницу
    if (authStore.isAuthenticated) {
        return navigateTo('/');
    }
});