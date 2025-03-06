<template>
  <div id="telegram-login"></div>
</template>
<script setup lang="ts">
onMounted(() => {
  // 1. Подключаем скрипт Telegram
  const script = document.createElement('script')
  script.src = 'https://telegram.org/js/telegram-widget.js?21'
  script.setAttribute('data-telegram-login', 'hse_compass_bot')
  script.setAttribute('data-size', 'large')

  // Куда Telegram будет отправлять данные о пользователе
  // после того как он нажмёт "Войти" (или "Продолжить в Telegram").
  // Укажите любой роут на вашем сайте.
  script.setAttribute('data-auth-url', 'https://hse-compass/api/telegram-auth')
  script.setAttribute('data-request-access', 'write')
  script.async = true

  const container = document.getElementById('telegram-login')
  if (container) {
    container.appendChild(script)
  }
})
</script>
<style scoped>

</style>