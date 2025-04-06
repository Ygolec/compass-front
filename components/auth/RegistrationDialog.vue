<template>
  <v-dialog
      :model-value="dialog"
      @update:model-value="update_dialog"
      max-width="500"
  >
    <v-card
        class="mx-auto my-auto w-100"
    >
      <v-window
          :touch="false"
          v-model="registration_step">
        <v-window-item :value="0">
          <v-form @submit.prevent="handle_submit">
            <v-card-title>Регистрация</v-card-title>
            <v-card-text>
              <v-text-field
                  label="Email с доменом @edu.hse.ru"
                  prepend-icon="mdi-account"
                  placeholder="test@edu.hse.ru"
                  :rules="[required,email_hse_student_check]"
                  v-model="email"
                  type="text"
                  :error-messages="serverEmailError ? [serverEmailError] : []"
              ></v-text-field>
              <v-text-field
                  label="Пароль"
                  prepend-icon="mdi-lock"
                  v-model="password"
                  :rules="[required,password_check]"
                  type="password"
              ></v-text-field>
              <v-text-field
                  label="Повторите пароль"
                  prepend-icon="mdi-lock"
                  v-model="password_repeat"
                  :rules="[required,password_check,confirm_password]"
                  type="password"
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-btn
                  :disabled="loading"
                  :loading="loading"
                  type="submit"
                  color="primary"
                  variant="flat"
                  block>Зарегистрироваться
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-window-item>
        <v-window-item :value="1">
          <div class="pa-4 text-center">
            <v-fab
                class="mt-6 ml-2"
                icon="mdi-chevron-left"
                location="top start"
                size="small"
                absolute
                offset
                @click="registration_step=0"
            >
            </v-fab>
            <v-img
                class="mb-4"
                height="128"
                src="https://cdn.vuetifyjs.com/images/logos/v.svg"
            ></v-img>
            <h3 class="text-h6 font-weight-light mb-2">
              Добро пожаловать!
            </h3>
            <span class="text-h4 text-grey">Активируйте свой аккаунт по ссылке на почте!</span>
          </div>
        </v-window-item>
      </v-window>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import {required, password_check, password_confirm, email_hse_student_check} from "~/utils/rules";

const props = defineProps({
  dialog: Boolean,
});
const emit = defineEmits(["update:dialog"]);
const email = ref<string>('');
const password = ref<string>('');
const password_repeat = ref<string>('');
const loading = ref<boolean>(false);
const serverEmailError = ref<string>('');
const registration_step = ref<number>(1);
const confirm_password = password_confirm(password);
const register = async () => {
  loading.value = true;
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });
    registration_step.value = 1;
  } catch (error: any) {
    if (error.response?._data?.message === "Такой email существует") {
      serverEmailError.value = "Такой email существует";
    }
  } finally {
    loading.value = false;
  }
}

const handle_submit = () => {
  serverEmailError.value = '';
  const emailValid = required(email.value) === true && email_hse_student_check(email.value) === true;
  const passwordValid = required(password.value) === true && password_check(password.value) === true;
  const passwordRepeatValid = required(password_repeat.value) === true && password_repeat.value === password.value;
  if (emailValid && passwordValid && passwordRepeatValid) {
    register();
  }
};

const update_dialog = (value: boolean) => {
  emit('update:dialog', value);
};
// Если диалог закрывается – сбрасываем поля и ошибки
watch(() => props.dialog, (newVal) => {
  if (!newVal) {
    email.value = '';
    password.value = '';
    password_repeat.value = '';
    serverEmailError.value = '';
  }
});
// Сбрасываем серверную ошибку, если пользователь изменил email
watch(email, () => {
  serverEmailError.value = '';
});
</script>
<style scoped>

</style>