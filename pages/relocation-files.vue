<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Файлы переселения</h1>
        <v-alert
          v-if="!authStore.isAuthenticated"
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          Для доступа к файлам переселения необходимо авторизоваться
        </v-alert>
        <get_reloc_files v-else/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import get_reloc_files from "~/components/relocations_data/get_reloc_files.vue";
import { useAuthStore } from "~/stores/auth_store";

const authStore = useAuthStore();

// Добавляем middleware для проверки авторизации
definePageMeta({
  middleware: ['auth']
});
</script>

<style scoped>
.text-h4 {
  color: rgba(0, 0, 0, 0.87);
  font-weight: 400;
}
</style>