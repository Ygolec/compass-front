<template>
  <v-container>
    <v-card
        class="mx-auto my-auto w-90"
    >
      <v-window
          :touch="false"
          v-model="reset_step"
      >
        <v-window-item :value="0">
          <v-form @submit.prevent="handle_submit">
            <v-card-title>Сброс пароля</v-card-title>
            <v-card-subtitle>Никому не сообщайте url страницы!</v-card-subtitle>
            <v-card-text>
              <v-text-field
                  label="Новый пароль"
                  v-model="password"
                  :rules="[required,password_check]"
                  :error-messages="serverEmailError ? [serverEmailError] : []"
                  type="password"
              >
              </v-text-field>
              <v-text-field
                  label="Повтор нового пароля"
                  v-model="password_repeat"
                  :rules="[required,password_check,confirm_password]"
                  type="password"
                  :error-messages="serverEmailError ? [serverEmailError] : []"
              >
              </v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-btn
                  :loading="loading"
                  type="submit"
                  block>
                Сбросить пароль
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-window-item>
        <v-window-item :value="1">
          <v-card-title>Сброс пароля</v-card-title>
          <v-card-text>
            <div class="pa-4 text-center">
              <v-img
                  class="mb-4"
                  height="128"
                  src="https://cdn.vuetifyjs.com/images/logos/v.svg"
              ></v-img>
              <h3 class="text-h6 font-weight-light mb-2">
                Пароль успешно изменен!
              </h3>
              <span class="text-h4 text-grey">
                Теперь вы можете войти в систему
              </span>
              <v-btn href="/login" class="mt-6" color="primary" block>
                Войти
              </v-btn>
            </div>
          </v-card-text>
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
import {password_check, password_confirm, required} from "~/utils/rules";

const password = ref<string>('');
const password_repeat = ref<string>('');
const loading = ref<boolean>(false);
const confirm_password = password_confirm(password);
const serverEmailError = ref<string>('');
const token = ref(useRoute().query.token);
const reset_step = ref<number>(0);

const reset_password = async () => {
  loading.value = true;
  try {
    await $fetch('/api/auth/reset-password-by-token-directus', {
      method: 'POST',
      body: JSON.stringify({
        token: token.value,
        password: password.value,
      }),
    });
    reset_step.value = 1;
  } catch (error: any) {
    if (error.response?._data?.message === "Ошибка сброса пароля") {
      serverEmailError.value = "Ошибка, запросите смену пароля снова";
    }
  } finally {
    loading.value = false;
  }
}


const handle_submit = () => {
  const passwordValid = required(password.value) === true && password_check(password.value) === true;
  const passwordRepeatValid = required(password_repeat.value) === true && password_repeat.value === password.value;
  if (passwordValid && passwordRepeatValid) {
    reset_password();
  }
};
</script>
<style scoped>

</style>