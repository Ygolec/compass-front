import {defineStore} from 'pinia';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    directus_id?: string;
}

interface UserApiResponse {
    id: string;
    name: string;
    email: string;
    role: string;
    directus_id?: string;
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        access_token: '' as string | null,
        user: null as User | null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.access_token,
        canAccessFiles: (state) => {
            if (!state.user || !state.user.role) return false;
            const allowedRoles = ['admin', 'manager', 'coordinator', 'administrator'];
            return allowedRoles.includes(state.user.role.toLowerCase());
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

        setUser(userData: UserApiResponse) {
            this.user = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                directus_id: userData.directus_id
            };
        },

        async logout() {
            try {
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
                const data = await $fetch<{ access_token: string }>('/api/auth/refresh', {
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
                const data = await $fetch<UserApiResponse>('/api/auth/me', {
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
