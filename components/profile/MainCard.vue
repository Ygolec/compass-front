<template>
  <v-card>
    <v-card-title>
      Профиль
    </v-card-title>
    <v-card-item>
      <v-avatar
          size="150"
          color="brown">
        {{initials}}
      </v-avatar>
      <ContactCard/>
      <StudyCard/>
      <LinkedAppsCard/>
      <NotificationsCard/>
    </v-card-item>
  </v-card>
</template>
<script setup lang="ts">
import ContactCard from "~/components/profile/ContactCard.vue";
import StudyCard from "~/components/profile/StudyCard.vue";
import NotificationsCard from "~/components/profile/NotificationsCard.vue";
import LinkedAppsCard from "~/components/profile/LinkedAppsCard.vue";
const initials = ref('NO')
onMounted(async () => {
  initials.value = await $fetch('/api/profile/initials')
})
</script>
<style scoped>

</style>