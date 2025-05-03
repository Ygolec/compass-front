<template>
  <v-main class="bg-grey-lighten-3" height="100%">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-sheet rounded="lg">
            <v-expansion-panels>
              <v-expansion-panel v-for="item in student_relocations" :key="item.id">
                <v-expansion-panel-title>
                  <span v-html="item.name"></span>
                  <template v-slot:actions>
                    <v-row>
                      <v-chip :color="getStatusColor(item.status)">{{ getStatusTranslate(item.status) }}</v-chip>
                      <v-icon class="ma-auto" :icon="getStatusIcon(item.status)"/>
                    </v-row>
                  </template>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row>
                    <v-col>
                      <v-text-field v-model="item.date_start" label="Дата начала переселения" variant="solo" readonly>
                      </v-text-field>
                    </v-col>
                    <v-col>
                      <v-text-field v-model="item.date_end" label="Дата конца переселения" variant="solo" readonly>
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-btn v-if="item.status!='planned'" :href="`/relocation/${item.id}`">Перейти к заявкам на переселение</v-btn>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import {useDate} from 'vuetify'
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
dayjs.locale('ru');

const student_relocations = ref<student_relocation[]>([]);
const date = useDate();
const statusTranslate: { [key: string]: { translation: string; color: string } } = {
  planned: {translation: 'Запланировано', color: 'orange'},
  open: {translation: 'Регистрация открыта', color: 'green'},
  close: {translation: 'Регистрация закрыта', color: 'dark-grey'},
};
const statusIcons: { [key: string]: string } = {
  planned: 'mdi-timer-sand',
};
const getStatusIcon = (status: string) => {
  return statusIcons[status] || 'mdi-help-circle';
};
const getStatusTranslate = (status: string) => {
  return statusTranslate[status]?.translation || 'Неизвестно';
};
const getStatusColor = (status: string) => {
  return statusTranslate[status]?.color || 'grey';
};
onMounted(async () => {
  student_relocations.value = await $fetch<student_relocation[]>('/api/relocation/list_of_relocations');
  student_relocations.value.forEach((item) => {
    item.date_start = dayjs(item.date_start).format('DD.MM.YYYY HH:mm');
    item.date_end = dayjs(item.date_end).format('DD.MM.YYYY HH:mm');
  });
  // console.log(student_relocations.value);
});
</script>

<style scoped>

</style>