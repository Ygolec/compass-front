import { useAuthStore } from "~/stores/auth_store";

export default defineNuxtPlugin(async () => {
    console.log('Инициализация плагина авторизации...');
    const authStore = useAuthStore();
    authStore.loadTokenFromStorage();
}); 