<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-icon icon="mdi-file-document-multiple" size="32" class="mr-3" color="primary"/>
          <h1 class="text-h4">Файлы переселения</h1>
        </div>

        <v-alert
          v-if="!authStore.isAuthenticated"
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          Для доступа к файлам переселения необходимо авторизоваться
        </v-alert>

        <v-alert
          v-else-if="!authStore.canAccessFiles"
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          У вас нет прав для просмотра и скачивания файлов переселения. 
          Необходимы права администратора, менеджера или координатора.
        </v-alert>

        <v-progress-circular
          v-else-if="loading"
          indeterminate
          color="primary"
          size="64"
          class="ma-auto d-flex"
        ></v-progress-circular>

        <v-alert
          v-else-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <RelocationFiles v-else/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import RelocationFiles from "~/components/relocation/RelocationFiles.vue";
import { useAuthStore } from "~/stores/auth_store";
import { ref, onMounted } from 'vue';

const authStore = useAuthStore();
const loading = ref(false);
const error = ref<string | null>(null);

// Добавляем middleware для проверки авторизации
definePageMeta({
  middleware: ['auth']
});

onMounted(async () => {
  if (authStore.isAuthenticated && authStore.canAccessFiles) {
    loading.value = true;
    try {
      // Проверяем, что пользователь действительно имеет доступ
      await authStore.fetchCurrentUser();
    } catch (e: any) {
      error.value = e.message || 'Ошибка при проверке прав доступа';
    } finally {
      loading.value = false;
    }
  }
});
</script>

<style scoped>
.text-h4 {
  color: rgba(0, 0, 0, 0.87);
  font-weight: 400;
}
</style> 