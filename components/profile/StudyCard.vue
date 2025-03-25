<template>
  <v-card variant="flat">
    <v-card-title>
      Учебные данные
    </v-card-title>
    <v-card-text class="mt-2">
      <v-row>
        <v-col>
          <v-text-field label="Факультет" v-model="study_data.program_title" variant="outlined" readonly></v-text-field>
        </v-col>
        <v-col>
          <v-text-field label="Программа" v-model="study_data.program_title" variant="outlined" readonly></v-text-field>
        </v-col>
        <v-col>
          <v-text-field label="Группа" v-model="study_data.study_group" variant="outlined" readonly></v-text-field>
        </v-col>
        <v-col>
          <v-text-field label="Курс" variant="outlined" readonly></v-text-field>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
const study_data = ref({
  study_group: '',
  program_title: '',
  faculty_title: '',
});

onMounted(async () => {
  await getStudyData()
});

async function getStudyData(): Promise<void> {
  study_data.value = await $fetch('/api/profile/study-data', {
    method: 'GET',
  });
}
</script>
<style scoped>

</style>