import {defineStore} from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        access_token: '' as string | null,
        user: null as user | null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.access_token,
    },

    actions: {
        async login(credentials: user) {
            try {
                // const config = useRuntimeConfig();
                // const data = await $fetch(`${config.public.AUTH_BACKEND_URL}/api/v1/users/login`, {
                //     method: 'POST',
                //     body: credentials,
                //     credentials: 'include'
                // });
                const data = await $fetch('/api/auth/login', {
                    method: 'POST',
                    body: credentials,
                });
                this.setAccessToken(data.access_token);
                await this.fetchCurrentUser();
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        },

        setAccessToken(token: string) {
            this.access_token = token;
            if (process.client) {
                localStorage.setItem('access_token', token);
            }
        },

        setUser(user: { name: string; email: string }) {
            this.user = user;
        },

        async logout() {
            try {
                // const config = useRuntimeConfig();
                // await $fetch(`${config.public.AUTH_BACKEND_URL}/api/v1/users/logout`, {
                //     method: 'POST',
                //     credentials: 'include'
                // });
                await $fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
            this.clearAccessToken();
            this.clearUser();
        },

        clearAccessToken() {
            this.access_token = null;
            if (process.client) {
                localStorage.removeItem('access_token');
            }
        },

        loadTokenFromStorage() {
            if (process.client) {
                const saved = localStorage.getItem('access_token');
                if (saved) this.access_token = saved;
            }
        },

        async refreshAccessToken() {
            try {
                // const config = useRuntimeConfig();
                // await $fetch(`${config.public.AUTH_BACKEND_URL}/api/v1/users/refresh`, {
                //     method: 'POST',
                //     credentials: 'include'
                // });
                const data = await $fetch('/api/auth/refresh', {
                    method: 'POST',
                    credentials: 'include'
                });
                this.setAccessToken(data.access_token);
            } catch (err) {
                console.error('Refresh token error:', err);
                await this.logout();
            }
        },

        clearUser() {
            this.user = null;
        },

        async fetchCurrentUser() {
            try {
                // const config = useRuntimeConfig();
                // const data = await $fetch(`${config.public.AUTH_BACKEND_URL}/api/v1/users/me`, {
                //     method: 'GET',
                //     credentials: 'include'
                // });
                const data = await $fetch('/api/auth/me', {
                    method: 'GET',
                    credentials: 'include',
                });
                this.setUser(data);
            } catch (error: any) {
                console.error('Ошибка получения данных пользователя:', error);
                if (error?.response?.status === 401) {
                    await this.logout();
                }
            }
        },

    },
});