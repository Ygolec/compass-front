<template>
  <v-dialog
      :model-value="dialog"
      @update:model-value="update_dialog"
      max-width="500">
    <v-card
        class="mx-auto my-auto w-100"
    >
      <v-window
          :touch="false"
          v-model="forgot_step">
        <v-window-item :value="0">
          <v-form @submit.prevent="handle_submit">
            <v-card-title>Сброс пароля</v-card-title>
            <v-card-text>
              <v-text-field
                  label="Email с доменом @edu.hse.ru"
                  prepend-icon="mdi-account"
                  placeholder="test@edu.hse.ru"
                  :rules="[required,email_hse_student_check]"
                  v-model="email"
                  type="text"
                  :error-messages="serverEmailError ? [serverEmailError] : []">
              </v-text-field>
              <v-card-actions>
                <v-btn
                    :disabled="loading"
                    :loading="loading"
                    type="submit"
                    color="primary"
                    variant="flat"
                    block>
                  Сбросить пароль
                </v-btn>
              </v-card-actions>
            </v-card-text>
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
                @click="forgot_step=0"
            >
            </v-fab>
            <v-img
                class="mb-4"
                height="128"
                src="https://cdn.vuetifyjs.com/images/logos/v.svg"
            ></v-img>
            <h3 class="text-h6 font-weight-light mb-2">
              Запрос на сброс пароля создан!
            </h3>
            <span class="text-h4 text-grey">Сбросьте свой пароль по ссылке на своей почте!</span>
          </div>
        </v-window-item>
      </v-window>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import {email_hse_student_check, required} from "~/utils/rules";

const props = defineProps({
  dialog: Boolean,
});
const forgot_step = ref<number>(0);
const serverEmailError = ref<string>('');
const email = ref<string>('');
const loading = ref<boolean>(false);

const emit = defineEmits(["update:dialog"]);
const update_dialog = (value: boolean) => {
  emit('update:dialog', value);
};
const reset_password = async () => {
  loading.value = true;
  try {
    await $fetch('/api/password-reset/request-to-reset-by-directus', {
      method: 'POST',
      body: {
        email: email.value,
      }
    });
    forgot_step.value = 1;
  } catch (error: any) {
    if (error.response?._data?.message === "Пользователь не найден") {
      serverEmailError.value = "Ошибка получения данных, неверный email";
    }
  } finally {
    loading.value = false;
  }
}
const handle_submit = () => {
  serverEmailError.value = '';
  const emailValid = required(email.value) === true && email_hse_student_check(email.value) === true;
  if (emailValid) {
    reset_password();
  }
};

</script>
<style scoped>

</style>