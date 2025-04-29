import {useAuthStore} from "~/stores/auth_store";

export default defineNuxtRouteMiddleware(async (to) => {
        if (!to.path.startsWith('/admin')) {
            return
        }

        if (process.server) {
            return
        }

        const authStore = useAuthStore();
        try {
            const checkAdmin = await $fetch('/api/auth/check-admin');
        } catch (error: any) {
            const statusCode = error?.response?.status;
            if (statusCode === 401) {
                return navigateTo('/login'); // Перенаправление на страницу авторизации
            } else if (statusCode === 403) {
                return navigateTo('/'); // Перенаправление на главную страницу
            } else {
                console.error('Ошибка при проверке прав администратора:', error);
                return navigateTo('/'); // Перенаправление на главную страницу
            }
        }
    }
)