<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card v-if="authStore.isAuthenticated">
          <v-card-title class="text-h5 mb-4">Анкета для заселения</v-card-title>
          <v-card-text>
            <AnketaDialogue />
          </v-card-text>
        </v-card>
        <v-alert v-else type="warning">
          Для заполнения анкеты необходимо авторизоваться
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth_store';
import AnketaDialogue from '~/components/anketa/AnketaDialogue.vue';

const authStore = useAuthStore();

definePageMeta({
  middleware: ['auth']
});
</script> 