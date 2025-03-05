<template>
  <v-menu
      v-model="menu"
      :close-on-content-click="false"
      location="bottom"
      transition="slide-y-transition"
  >
    <template v-slot:activator="{ props }">
      <v-avatar
          color="surface-variant"
          size="50"
          v-bind="props"
      >
      </v-avatar>
    </template>

    <v-card
        class="mt-2"
        min-width="200">
      <v-list>
        <template v-if="!user">
          <v-list-item>
            <v-btn
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
            <v-btn block @click="logout">Выйти</v-btn>
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

const user = computed(() => {
  return authStore.user;
});

async function logout() {
  await authStore.logout()
}

</script>

<style scoped>

</style>