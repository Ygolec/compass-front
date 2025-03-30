<script setup lang="ts">

import AvatarMenu from "~/components/layouts/AvatarMenu.vue";
</script>

<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>
        <v-btn href="/">Compass</v-btn>
        <v-btn href="/relocation">Переселение</v-btn>
        <v-btn href="/relocation-files" prepend-icon="mdi-file-document-multiple">
          Файлы переселения
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
.v-btn {
  margin-right: 8px;
}
</style>