import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: '' as string | null,
    }),
    actions: {
        setToken(newToken: string) {
            this.token = newToken;
            if (process.client) {
                localStorage.setItem('jwtToken', newToken);
            }
        },
        clearToken() {
            this.token = null;
            if (process.client) {
                localStorage.removeItem('jwtToken');
            }
        },
        loadTokenFromStorage() {
            if (process.client) {
                const savedToken = localStorage.getItem('jwtToken');
                if (savedToken) {
                    this.token = savedToken;
                }
            }
        },
    },
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
});
