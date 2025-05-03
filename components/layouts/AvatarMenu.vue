<template>
  <v-menu
      v-model="menu"
      :close-on-content-click="false"
      location="bottom"
      transition="slide-y-transition"
  >
    <template v-slot:activator="{ props }">
      <v-avatar
          color="#031545"
          size="50"
          v-bind="props"
      >
        <v-icon>mdi-account</v-icon>
      </v-avatar>
    </template>

    <v-card
        class="mt-2"
        min-width="200">
      <v-list>
        <template v-if="!user">
          <v-list-item>
            <v-btn
                variant="outlined"
                href="/login"
                block
            >
              Войти
            </v-btn>
          </v-list-item>
        </template>
        <template v-else>
          <v-list-item>
            <v-list-item-title>
              {{ user.email }}
            </v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item>
            <v-btn variant="plain" block href="/profile">Профиль</v-btn>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item v-if="isAdmin">
            <v-btn variant="plain" block href="/admin">Администрирование</v-btn>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item>
            <v-btn variant="plain" block @click="logout">Выйти</v-btn>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>
<script setup lang="ts">
import {useAuthStore} from "~/stores/auth_store";

const config = useRuntimeConfig();
const menu = ref<boolean>(false);
const authStore = useAuthStore();
const isAdmin = ref(false)

const user = computed(() => {
  return authStore.user;
});

async function logout() {
  await authStore.logout()
}

watch(user, async () => {
  if (!user.value) {
    isAdmin.value = false;
    return
  }
  const response = await $fetch('/api/auth/check-admin');
  if (response.status === 'success') {
    isAdmin.value = true;
  } else {
    isAdmin.value = false;
  }
}, { immediate: true }
);


</script>

<style scoped>

</style>