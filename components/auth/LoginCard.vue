<template>
  <RegistrationDialog :dialog="registration_dialog" @update:dialog="registration_dialog = $event"/>
  <v-container>
    <v-card
        class="mx-auto my-auto w-90"
        min-width=""
        max-width=""
    >
      <v-card-title>Вход</v-card-title>
      <v-form @submit.prevent="handle_submit">
        <v-card-text>
          <v-text-field
              label="Email"
              prepend-icon="mdi-account"
              :rules="[required,email_hse_student_check]"
              v-model="email"
              type="text"
              :error-messages="serverEmailError ? [serverEmailError] : serverVerifiedError ? [serverVerifiedError] : []"
          ></v-text-field>
          <v-text-field
              label="Пароль"
              prepend-icon="mdi-lock"
              v-model="password"
              :rules="[required]"
              type="password"
              :error-messages="serverPasswordError ? [serverPasswordError] : serverVerifiedError ? [serverVerifiedError] : []"
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
  </v-container>
</template>
<script setup lang="ts">
import {email_hse_student_check, required} from "~/utils/rules";
import RegistrationDialog from "~/components/auth/RegistrationDialog.vue";
import {useAuthStore} from "~/stores/auth_store";

const authStore = useAuthStore();
const email = ref<string>('');
const password = ref<string>('');
const loading = ref<boolean>(false);
const registration_dialog = ref<boolean>(false);
const serverEmailError = ref<string>('');
const serverPasswordError = ref<string>('');
const serverVerifiedError = ref<string>('');

const login = async () => {
  loading.value = true;
  try {
    await authStore.login({email: email.value, password: password.value});
    if (authStore.user) {
      loading.value = false
      email.value = '';
      password.value = '';
      return navigateTo('/');
    }
  } catch (error: any) {
    if (error.response?._data?.message === "Email не найден.") {
      serverEmailError.value = "Такой email не существует";
    }
    if (error.response?._data?.message === "Неверный пароль.") {
      serverPasswordError.value = "Неверный пароль";
    }
    if (error.response?._data?.message === "Пользователь не подтвержден") {
      serverVerifiedError.value = "Ваша почта не подтверждена, проверьте почту и подтвердите её по ссылке в письме";
    }
  } finally {
    loading.value = false;
  }
};

const handle_submit = () => {
  const emailValid = required(email.value) === true && email_hse_student_check(email.value) === true;
  const passwordValid = required(password.value) === true;
  serverEmailError.value = '';
  serverPasswordError.value = '';
  serverVerifiedError.value = '';
  if (emailValid && passwordValid) {
    login();
  }
};

watch(email, () => {
  serverEmailError.value = '';
  serverVerifiedError.value = '';
});
watch(password, () => {
  serverPasswordError.value = '';
  serverVerifiedError.value = '';
});
</script>
<style scoped>

</style>