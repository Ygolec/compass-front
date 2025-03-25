<template>
  <v-card variant="flat">
    <v-card-title>
      Уведомления
    </v-card-title>
    <v-card-item>
      <v-row>
        <v-col>
          <v-switch label="Получать уведомления в Telegram" v-model="notifications.telegram.is_get_notifications"
                    base-color="red" color="green" @change="updateNotificationTelegram">
          </v-switch>
        </v-col>
      </v-row>
    </v-card-item>
  </v-card>
</template>
<script setup lang="ts">
const notifications = ref({
  telegram: {
    is_get_notifications: false
  }
})
onMounted(async () => {
  await getNotifications();
})

async function getNotifications() {
  notifications.value = await $fetch('/api/profile/notification-data')
}

async function updateNotificationTelegram() {
  await $fetch('api/profile/update-telegram-notification', {
    method: 'PUT',
    body: JSON.stringify({
      is_get_notifications: notifications.value.telegram.is_get_notifications
    })
  })
  await getNotifications();
}
</script>
<style scoped>

</style>