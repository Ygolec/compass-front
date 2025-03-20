<template>
  <v-card variant="flat">
    <v-card-title>
      Контактные данные
    </v-card-title>
    <v-card-text class="mt-2">
      <v-row>
        <v-col>
          <v-text-field label="Фамилия" v-model="contact_data.first_name" variant="outlined" readonly></v-text-field>
        </v-col>
        <v-col>
          <v-text-field label="Имя" variant="outlined" v-model="contact_data.last_name" readonly></v-text-field>
        </v-col>
        <v-col>
          <v-text-field label="Отчество" v-model="contact_data.middle_name" variant="outlined" readonly></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field label="Email" v-model="contact_data.email" variant="outlined" readonly></v-text-field>
        </v-col>
        <v-col>
          <v-text-field label="Телефон" variant="outlined" readonly></v-text-field>
        </v-col>
        <v-col>
          <v-text-field label="Дата рождения" v-model="contact_data.birth_date" variant="outlined"
                        readonly></v-text-field>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
const contact_data = ref({
  first_name: '',
  last_name: '',
  middle_name: '',
  email: '',
  phone: '',
  birth_date: '',
});

onMounted(async () => {
  await getContactData()
});

async function getContactData(): Promise<void> {
  contact_data.value = await $fetch('/api/profile/contact-data', {
    method: 'GET',
  });
}


</script>

<style scoped>

</style>