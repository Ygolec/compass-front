<script setup lang="ts">
import AvatarMenu from "~/components/layouts/AvatarMenu.vue";
import { useAuthStore } from '~/stores/auth_store';

const authStore = useAuthStore();
</script>

<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>
        <v-btn href="/">Compass</v-btn>
        <v-btn
          v-if="authStore.isAuthenticated"
          to="/relocation"
          color="primary"
          variant="text"
        >
          Переселения
        </v-btn>
        <v-btn
          v-if="authStore.isAuthenticated"
          to="/relocation-files"
          color="primary"
          variant="text"
        >
          Файлы переселения
        </v-btn>
        <v-btn
          v-if="authStore.isAuthenticated"
          to="/anketa"
          color="primary"
          variant="text"
        >
          Заполнить анкету
        </v-btn>
      </v-app-bar-title>
      <v-app-bar-nav-icon
          class="mr-5"
      >
        <avatar-menu/>
      </v-app-bar-nav-icon>
    </v-app-bar>
    <v-main>
      <NuxtPage/>
    </v-main>
  </v-app>
</template>

<style scoped>

</style>