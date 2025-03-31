<script setup lang="ts">
import AvatarMenu from "~/components/layouts/AvatarMenu.vue";
import { useAuthStore } from "~/stores/auth_store";

const authStore = useAuthStore();
</script>

<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>
        <v-btn href="/">Compass</v-btn>
        <v-btn href="/relocation">Переселение</v-btn>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn 
        v-if="authStore.canAccessFiles"
        href="/relocation-files" 
        prepend-icon="mdi-file-document-multiple"
        color="primary"
        variant="tonal"
      >
        Файлы переселения
      </v-btn>
      <v-app-bar-nav-icon class="ml-4">
        <avatar-menu/>
      </v-app-bar-nav-icon>
    </v-app-bar>
    <v-main>
      <NuxtPage/>
    </v-main>
  </v-app>
</template>

<style scoped>
.v-btn {
  margin-right: 8px;
}
</style>