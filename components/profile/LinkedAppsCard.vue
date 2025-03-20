<template>
  <v-card variant="flat">
    <v-card-title>
      Привязанные приложения
    </v-card-title>
    <v-card-text class="mt-2">
      <v-row>
        <v-col>
          <div id="telegram-login" :hidden="hide_telegram_login"></div>
          <v-btn v-if="linked_apps_data.telegram_data.telegram_username!=null" @click="unlinkTelegramDialog()"
                 append-icon="mdi-close" color="blue">{{ linked_apps_data.telegram_data.telegram_username }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <ConfirmDialog :dialog="confirm_dialog" :details="confirm_dialog_dialog_details"
                 @confirm="handleConfirm" @update:dialog="confirm_dialog = $event"/>
</template>
<script setup lang="ts">
import ConfirmDialog from "~/components/base/ConfirmDialog.vue";
const hide_telegram_login = computed(() => linked_apps_data.value.telegram_data.telegram_username != null);
const confirm_dialog_dialog_details = ref({
  title: 'Подтверждение',
  text: '',
  button_confirm_text: 'Подтвердить',
  button_confirm_color: 'red',
});
const unlinkingApp = ref('');
const confirm_dialog = ref(false);
const linked_apps_data = ref({
  telegram_data: {
    id: '',
    telegram_username: '',
  }
});
onMounted(async () => {
  await getLinkedAppsData();

  async function telegram_login(user: any) {
    await $fetch(`/api/telegram-auth`, {
      method: 'POST',
      query: user
    })
    await getLinkedAppsData();
  }

  window.telegram_login = telegram_login

  // 1. Подключаем скрипт Telegram
  const script = document.createElement('script')
  script.src = 'https://telegram.org/js/telegram-widget.js?21'
  script.setAttribute('data-telegram-login', 'hse_compass_bot')
  script.setAttribute('data-size', 'large')

  // Куда Telegram будет отправлять данные о пользователе
  // после того как он нажмёт "Войти" (или "Продолжить в Telegram").
  // Укажите любой роут на вашем сайте.
  // script.setAttribute('data-auth-url', 'http://127.0.0.1/api/telegram-auth')
  script.setAttribute('data-onauth', 'telegram_login(user)')
  script.setAttribute('data-userpic', 'false')
  script.setAttribute('data-request-access', 'write')
  script.async = true

  const container = document.getElementById('telegram-login')
  if (container) {
    container.appendChild(script)
  }

})

async function getLinkedAppsData(): Promise<void> {
  linked_apps_data.value = await $fetch('/api/profile/linked-apps-data', {
    method: 'GET',
  });
}

function unlinkTelegramDialog() {
  confirm_dialog_dialog_details.value.text = 'Вы уверены, что хотите отвязать Telegram?'
  confirm_dialog.value = true
  unlinkingApp.value = 'telegram';
}

async function handleConfirm() {
  if (unlinkingApp.value === 'telegram') {
    await unlinkTelegram()
  }
  confirm_dialog.value = false;
}

async function unlinkTelegram() {
  await $fetch('/api/profile/unlink-telegram', {
    method: 'get',
  });

  await getLinkedAppsData();
}
</script>

<style scoped>

</style>