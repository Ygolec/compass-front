<script setup lang="ts">

import AvatarMenu from "~/components/layouts/AvatarMenu.vue";
</script>

<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>
        <v-btn href="/" icon>
          <v-icon size="35"><v-img src="/logo.svg"></v-img></v-icon>
        </v-btn>
        <v-btn href="/relocation">Переселение</v-btn>
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