import {useAuthStore} from "~/stores/auth_store";

export default defineNuxtPlugin(() => {
    const authStore = useAuthStore();
    authStore.loadTokenFromStorage();
});
