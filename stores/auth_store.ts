import {defineStore} from 'pinia';

interface User {
    name: string;
    email: string;
    directus_id: string;
    role: {
        name: string;
    };
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        access_token: null as string | null,
        user: null as User | null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.access_token,
        isAdmin: (state) => state.user?.role?.name === 'Adminitrator',
        isManager: (state) => state.user?.role?.name === 'Dormitory Admin',
        canAccessFiles: (state) => {
            const allowedRoles = ['Adminitrator', 'Adminitrator Admin'];
            return state.user?.role?.name && allowedRoles.includes(state.user.role.name);
        }
    },

    actions: {
        async login(credentials: { email: string; password: string }) {
            try {
                const data = await $fetch<{ access_token: string }>('/api/auth/login', {
                    method: 'POST',
                    body: credentials,
                });
                this.setAccessToken(data.access_token);
                await this.fetchCurrentUser();
            } catch (error) {
                console.error('Ошибка входа:', error);
                throw error;
            }
        },

        setAccessToken(token: string) {
            this.access_token = token;
            if (process.client) {
                localStorage.setItem('auth_token', token);
            }
        },

        async logout() {
            try {
                await $fetch('/api/auth/logout', {
                    method: 'POST',
                });
                this.clearAccessToken();
                this.clearUser();
            } catch (error) {
                console.error('Ошибка выхода:', error);
                throw error;
            }
        },

        clearAccessToken() {
            this.access_token = null;
            if (process.client) {
                localStorage.removeItem('auth_token');
            }
        },

        clearUser() {
            this.user = null;
        },

        async fetchCurrentUser() {
            try {
                const data = await $fetch<User>('/api/auth/me', {
                    method: 'GET',
                });
                this.user = data;
            } catch (error) {
                console.error('Ошибка получения данных пользователя:', error);
                this.logout();
                throw error;
            }
        },

        initAuth() {
            if (process.client) {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    this.setAccessToken(token);
                    this.fetchCurrentUser();
                }
            }
        }
    },
});
