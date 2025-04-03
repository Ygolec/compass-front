import {defineStore} from 'pinia';
import {createDirectus, readUser} from '@directus/sdk';
import type {RestClient} from '@directus/sdk';
import {rest} from '@directus/sdk';

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

interface DirectusRole {
    id: string;
    name: string;
    icon: string;
    description: string | null;
}

interface DirectusUser {
    id: string;
    email: string | null;
    role: string | DirectusRole;
    // другие поля Directus
}

interface DirectusResponse {
    data: DirectusUser;
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        access_token: null as string | null,
        user: null as User | null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.access_token,
        canAccessFiles: (state) => {
            // Временно отключаем проверку роли для дебага
            console.log('Текущая роль пользователя:', state.user?.role);
            return !!state.access_token; // Разрешаем доступ любому авторизованному пользователю
        },
        canAccessAnketa: (state) => {
            return !!state.access_token;
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
                console.log('Получены данные пользователя из /api/auth/me:', data);

                if (data.directus_id) {
                    try {
                        // Получаем роль через новый эндпоинт
                        const roleData = await $fetch<{ role: string }>('/api/auth/get_role', {
                            query: {
                                directus_id: data.directus_id
                            }
                        });
                        
                        console.log('Получена роль пользователя:', roleData);
                        
                        if (roleData.role) {
                            // Обновляем данные пользователя с полученной ролью
                            this.setUser({
                                ...data,
                                role: roleData.role
                            });
                        } else {
                            this.setUser(data);
                        }
                    } catch (roleError) {
                        console.error('Ошибка получения роли пользователя:', roleError);
                        // Если не удалось получить роль, используем данные из /api/auth/me
                        this.setUser(data);
                    }
                } else {
                    this.setUser(data);
                }
            } catch (error: any) {
                console.error('Ошибка получения данных пользователя:', error);
                if (error?.response?.status === 401) {
                    await this.logout();
                }
            }
        },

    },
});
