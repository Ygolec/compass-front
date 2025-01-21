<script setup lang="ts">

import Avatar_menu from "~/components/layouts/default/avatar_menu.vue";
</script>

<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>
        <v-btn href="/">Compass</v-btn>
      </v-app-bar-title>
      <v-app-bar-nav-icon
          class="mr-5"
      >
        <avatar_menu/>
      </v-app-bar-nav-icon>
    </v-app-bar>
    <v-main>
      <NuxtPage/>
    </v-main>
  </v-app>
</template>

<style scoped>

</style>