<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-icon icon="mdi-clipboard-list" size="32" class="mr-3" color="primary"/>
          <h1 class="text-h4">Анкета для заселения</h1>
        </div>

        <v-alert
          v-if="!authStore.isAuthenticated"
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          Для доступа к анкете необходимо авторизоваться
        </v-alert>

        <v-alert
          v-else-if="!authStore.canAccessAnketa"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          У вас нет прав для доступа к анкете
        </v-alert>

        <v-progress-circular
          v-if="loading"
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

        <v-card v-else>
          <v-card-text>
            <AnketaDialogue />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth_store';
import AnketaDialogue from '~/components/anketa/AnketaDialogue.vue';
import { ref, onMounted } from 'vue';

const authStore = useAuthStore();
const loading = ref(false);
const error = ref<string | null>(null);

definePageMeta({
  middleware: ['auth']
});

onMounted(async () => {
  loading.value = true;
  try {
    // Проверяем, что пользователь действительно имеет доступ
    await authStore.fetchCurrentUser();
    // Задержка для имитации загрузки
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (e: any) {
    error.value = e.message || 'Ошибка при проверке прав доступа';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.text-h4 {
  color: rgba(0, 0, 0, 0.87);
  font-weight: 400;
}
</style> 