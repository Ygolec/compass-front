import {useAuthStore} from "~/stores/auth_store";

export default defineNuxtRouteMiddleware(() => {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
        return navigateTo('/login'); // Перенаправление на страницу авторизации
    }
});
