import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware(async(to, from) => {

    if (process.server) {
        return
    }

    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
        return
    }
    const is_filled = await $fetch('/api/anketa/is-fill', {
        method: 'GET',
        credentials: 'include',
    });

    if (!is_filled.is_fill && to.path !== '/anketa') {
        return navigateTo('/anketa')
    }

})
