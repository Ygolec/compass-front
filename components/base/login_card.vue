<template>
  <registration_dialog :dialog="registration_dialog" @update:dialog="registration_dialog = $event"/>
  <v-card
      class="mx-auto my-auto"
      min-width="500"
  >
    <v-card-title>Вход</v-card-title>
    <v-form @submit.prevent="handle_submit">
      <v-card-text>
        <v-text-field
            label="Email"
            prepend-icon="mdi-account"
            :rules="[required,email_check]"
            v-model="email"
            type="text"
        ></v-text-field>
        <v-text-field
            label="Пароль"
            prepend-icon="mdi-lock"
            v-model="password"
            :rules="[required]"
            type="password"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-container>
          <v-btn
              :disabled="loading"
              :loading="loading"
              type="submit"
              color="primary"
              variant="flat"
              block>Войти
          </v-btn>
          <v-btn
              class="mt-4"
              color="primary"
              variant="tonal"
              @click="registration_dialog = true"
              block>Регистрация
          </v-btn>
        </v-container>
      </v-card-actions>
    </v-form>
  </v-card>
</template>
<script setup lang="ts">
import {email_check, required} from "~/utils/rules";
import Registration_dialog from "~/components/base/registration_dialog.vue";
import {useAuthStore} from "~/stores/auth_store";

const authStore = useAuthStore();
const email = ref<string>('');
const password = ref<string>('');
const loading = ref<boolean>(false);
const registration_dialog = ref<boolean>(false);
const error = ref('');

const login = async () => {
  loading.value = true;

  const {data} = await useFetch('/api/auth/login', {
    method: 'POST',
    body: ({
      email: email.value,
      password: password.value
    })
  })

  if (data.value?.status === 'success' &&  'token' in data.value) {
    loading.value=false;
    authStore.setToken(data.value.token);
  } else {
    loading.value = false;
    if (data.value?.status === 'error' && 'message' in data.value) {
      error.value = data.value.message;
    } else {
      error.value = 'Ошибка авторизации';
    }
  }
};

const handle_submit = () => {
  const emailValid = required(email.value) === true && email_check(email.value) === true;
  const passwordValid = required(password.value) === true;

  if (emailValid && passwordValid) {
    login();
  }
};
</script>
<style scoped>

</style>