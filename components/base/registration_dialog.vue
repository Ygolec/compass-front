<template>
  <v-dialog
      :model-value="dialog"
      @update:model-value="update_dialog">
    <v-card
        class="mx-auto my-auto"
        min-width="500">
      <v-form @submit.prevent="handle_submit">
        <v-card-title>Регистрация</v-card-title>
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
              :rules="[required,password_check,password_confirm(password_repeat)]"
              type="password"
          ></v-text-field>
          <v-text-field
              label="Повторите пароль"
              prepend-icon="mdi-lock"
              v-model="password_repeat"
              :rules="[required,password_check,password_confirm(password)]"
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
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import {email_check, required, password_check, password_confirm} from "~/utils/rules";

const props = defineProps({
  dialog: Boolean,
});
const emit = defineEmits(["update:dialog"]);

const email = ref<string>('');
const password = ref<string>('');
const password_repeat = ref<string>('');
const loading = ref<boolean>(false);
const register = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 2000);
}

const handle_submit = () => {
  const emailValid = required(email.value) === true && email_check(email.value) === true;
  const passwordValid = required(password.value) === true && password_check(password.value) === true;
  const passwordRepeatValid = required(password_repeat.value) === true && password_repeat.value === password.value;
  if (emailValid && passwordValid && passwordRepeatValid) {
    register();
  }
};

const update_dialog = (value: boolean) => {
  emit('update:dialog', value);
};

watch(() => props.dialog, (newVal) => {
  if (!newVal) {
    email.value = '';
    password.value = '';
    password_repeat.value = '';
  }
});
</script>
<style scoped>

</style>