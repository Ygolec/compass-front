<script setup lang="ts">

import ChatAdminPanel from "~/components/admin/ChatAdminPanel.vue";
</script>

<template>
  <v-main class="bg-grey-lighten-3" height="100%">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-breadcrumbs>
            <v-breadcrumbs-item
                href="/admin"
                title="Панель администрирования"
            />
            <v-breadcrumbs-divider/>
            <v-breadcrumbs-item
                href="/admin/smart-search"
                title="Умный поиск"
                :disabled="true"
            />
          </v-breadcrumbs>
          <v-sheet rounded="lg">
            <ChatAdminPanel/>

          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<style scoped>

</style>