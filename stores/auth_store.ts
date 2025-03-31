import {defineStore} from 'pinia';
import {createError} from 'h3';

interface User {
    id: string;
    name: string;
    email: string;
    directus_id: string;
    role: string;
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        access_token: null as string | null,
        refresh_token: null as string | null,
        user: null as User | null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.access_token,
        isAdmin: (state) => state.user?.role === 'Administrator',
        isManager: (state) => state.user?.role === 'Manager',
        canAccessFiles: (state) => ['Administrator', 'Manager', 'Coordinator'].includes(state.user?.role || ''),
    },

    actions: {
        async login(credentials: { email: string; password: string }) {
            try {
                const response = await $fetch('/api/auth/login', {
                    method: 'POST',
                    body: credentials,
                });

                if (response.data?.access_token && response.data?.refresh_token) {
                    const { access_token, refresh_token } = response.data;
                    this.access_token = access_token;
                    this.refresh_token = refresh_token;

                    // Сохраняем токены в localStorage
                    if (process.client) {
                        localStorage.setItem('access_token', access_token);
                        localStorage.setItem('refresh_token', refresh_token);
                    }

                    // Получаем данные пользователя
                    await this.fetchCurrentUser();
                }

                return response;
            } catch (error: any) {
                throw createError({
                    statusCode: error.statusCode || 500,
                    message: error.message || 'Ошибка при входе в систему',
                });
            }
        },

        async logout() {
            try {
                if (this.refresh_token) {
                    await $fetch('/api/auth/logout', {
                        method: 'POST',
                        body: {
                            refresh_token: this.refresh_token
                        },
                    });
                }

                this.access_token = null;
                this.refresh_token = null;
                this.user = null;

                // Удаляем токены из localStorage
                if (process.client) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
            } catch (error: any) {
                console.error('Ошибка при выходе:', error);
                throw createError({
                    statusCode: error.statusCode || 500,
                    message: 'Ошибка при выходе из системы',
                });
            }
        },

        async fetchCurrentUser() {
            try {
                if (!this.access_token) {
                    throw createError({
                        statusCode: 401,
                        message: 'Не авторизован',
                    });
                }

                const user = await $fetch<User>('/api/auth/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.access_token}`
                    }
                });

                this.user = user;
                return user;
            } catch (error: any) {
                console.error('Ошибка при получении данных пользователя:', error);
                throw createError({
                    statusCode: error.statusCode || 500,
                    message: error.message || 'Ошибка при получении данных пользователя',
                });
            }
        },

        async refreshAccessToken() {
            try {
                if (!this.refresh_token) {
                    throw createError({
                        statusCode: 401,
                        message: 'Нет refresh токена',
                    });
                }

                interface RefreshResponse {
                    data?: {
                        access_token: string;
                    };
                }

                const response = await $fetch<RefreshResponse>('/api/auth/refresh', {
                    method: 'POST',
                    body: {
                        refresh_token: this.refresh_token
                    }
                });

                if (response.data?.access_token) {
                    this.access_token = response.data.access_token;
                    if (process.client) {
                        localStorage.setItem('access_token', response.data.access_token);
                    }
                }

                return response;
            } catch (error: any) {
                console.error('Ошибка при обновлении токена:', error);
                // Если не удалось обновить токен, разлогиниваем пользователя
                await this.logout();
                throw createError({
                    statusCode: error.statusCode || 500,
                    message: error.message || 'Ошибка при обновлении токена',
                });
            }
        },

        initAuth() {
            if (process.client) {
                const access_token = localStorage.getItem('access_token');
                const refresh_token = localStorage.getItem('refresh_token');

                if (access_token && refresh_token) {
                    this.access_token = access_token;
                    this.refresh_token = refresh_token;
                    this.fetchCurrentUser();
                }
            }
        },
    },
});
