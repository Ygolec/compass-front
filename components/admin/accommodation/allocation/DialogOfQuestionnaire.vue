<template>
  <v-dialog
      :model-value="dialog"
      @update:model-value="updateDialog"
      max-width="900"
  >
    <v-card>
      <v-card-text>
        <v-form ref="form">
          <!-- Личные данные -->
          <div class="text-h6 mb-4">Личные данные</div>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field readonly v-model="anketaData.lastname" label="Фамилия" :rules="[required]"></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field readonly v-model="anketaData.firstname" label="Имя" :rules="[required]"></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field readonly v-model="anketaData.middleName" label="Отчество"></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field readonly v-model="anketaData.birthdate" label="Дата рождения" type="date"
                            :rules="[required]"></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field readonly v-model="anketaData.phone" label="Контактный телефон" type="tel"
                            :rules="[required, phoneCheck]"></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field readonly v-model="anketaData.email" label="Электронная почта" type="email"
                            :rules="[required, emailHseStudentCheck]"></v-text-field>
            </v-col>
          </v-row>

          <v-divider class="my-6"></v-divider>

          <!-- Информация об обучении -->
          <div class="text-h6 mb-4">Информация об обучении</div>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field readonly v-model="anketaData.facultyFullName" label="Полное название факультета"
                            :rules="[required]"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field readonly v-model="anketaData.facultyShortName" label="Короткое название факультета"
                            :rules="[required]"></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-select readonly v-model="anketaData.course" label="Курс" :items="courseOptions"
                        :rules="[required]"></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field readonly v-model="anketaData.city" label="Город проживания"
                            :rules="[required]"></v-text-field>
            </v-col>
          </v-row>

          <v-divider class="my-6"></v-divider>

          <!-- Предпочтения по размещению -->
          <div class="text-h6 mb-4">Предпочтения по размещению</div>
          <v-row>
            <v-col cols="12" md="4">
              <v-select readonly v-model="anketaData.roomType" label="Предпочтительный тип комнаты"
                        :items="['Одноместная', 'Двухместная', 'Трехместная', 'Четырёхместная']"></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field readonly v-model="anketaData.preferredfloor" label="Предпочтительный этаж" type="number"
                            min="1" max="21"></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-select readonly v-model="anketaData.roomstyle" label="Квартирный тип или коридорный"
                        :items="['Квартирный', 'Коридорный']" :rules="[required]"></v-select>
            </v-col>
          </v-row>

          <v-divider class="my-6"></v-divider>

          <!-- Дополнительная информация -->
          <div class="text-h6 mb-4">Дополнительная информация</div>
          <v-row>
            <v-col cols="12" md="6">
              <v-radio-group readonly v-model="anketaData.sex" label="Пол" :rules="[required]">
                <v-radio label="Мужской" value="male"></v-radio>
                <v-radio label="Женский" value="female"></v-radio>
              </v-radio-group>
            </v-col>
            <v-col cols="12" md="6">
              <v-select readonly v-model="anketaData.russianproficiency" label="Знание русского языка"
                        :items="['Начальный', 'Средний', 'Свободный']" :rules="[required]"></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-select readonly v-model="anketaData.englishproficiency" label="Знание английского языка"
                        :items="['Начальный', 'Средний', 'Свободный']" :rules="[required]"></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-checkbox readonly v-model="anketaData.is_foreigner" label="Я иностранный студент"></v-checkbox>
            </v-col>
          </v-row>

          <v-divider class="my-6"></v-divider>

          <!-- Особенности и предпочтения -->
          <div class="text-h6 mb-4">Особенности и предпочтения</div>
          <v-row>
            <v-col cols="12" md="6">
              <v-checkbox readonly v-model="anketaData.haschronicdiseases"
                          label="Есть хронические заболевания"></v-checkbox>
              <v-checkbox readonly v-model="anketaData.needsbenefitplacement"
                          label="Нуждается в льготном размещении"></v-checkbox>
              <v-checkbox readonly v-model="anketaData.needsspecialconditions"
                          label="Нуждается в специальных условиях"></v-checkbox>
            </v-col>
            <v-col cols="12" md="6">
              <v-checkbox readonly v-model="anketaData.boardgames" label="Играете в настольные игры?"></v-checkbox>
              <v-checkbox readonly v-model="anketaData.sports" label="Занимаетесь спортом?"></v-checkbox>
              <v-checkbox readonly v-model="anketaData.hasHobbies" label="Есть хобби?"></v-checkbox>
              <v-checkbox readonly v-model="anketaData.doSmoke" label="Курите?"></v-checkbox>
              <v-checkbox readonly v-model="anketaData.earlyBird" label="Рано просыпаетесь?"></v-checkbox>
            </v-col>
          </v-row>

          <v-row v-if="anketaData.sports">
            <v-col cols="12">
              <v-combobox readonly v-model="anketaData.sportstype" label="Каким спортом занимаетесь?" multiple
                          :items="sportsList"></v-combobox>
            </v-col>
          </v-row>

          <v-row v-if="anketaData.hasHobbies">
            <v-col cols="12">
              <v-combobox readonly v-model="anketaData.hobbies" label="Какие у вас хобби?" multiple
                          :items="hobbiesList"></v-combobox>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="updateDialog(false)">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
const props = defineProps<{
  dialog: boolean,
  questionnaire_id: number | null
}>()
const emit = defineEmits(['update:dialog'])

function updateDialog(value: boolean) {
  emit('update:dialog', value)
}

import {email_hse_student_check as emailHseStudentCheck, required} from "~/utils/rules";
import {ref} from "vue";

const sportsList = ref(["Футбол", "Баскетбол", "Теннис", "Плавание", "Бег", "Волейбол", "Лыжи", "Тренажерный зал"]);
const hobbiesList = ref(["Чтение", "Музыка", "Спорт", "Рисование", "Программирование"]);
const courseOptions = ref([
  {title: "1", value: 1},
  {title: "2", value: 2},
  {title: "3", value: 3},
  {title: "4", value: 4},
  {title: "5", value: 5},
  {title: "M1", value: 6},
  {title: "M2", value: 7}
]);


const anketaData = ref({
  id: null,
  lastname: '',
  firstname: '',
  middleName: '',
  birthdate: '',
  facultyFullName: '',
  facultyShortName: '',
  course: 0,
  city: '',
  sex: '',
  roomType: '',
  preferredfloor: null,
  haschronicdiseases: false,
  needsbenefitplacement: false,
  needsspecialconditions: false,
  phone: '',
  email: '',
  sports: false,
  sportstype: [],
  hasHobbies: true,
  hobbies: [],
  boardgames: false,
  russianproficiency: '',
  englishproficiency: '',
  roomstyle: '',
  doSmoke: false,
  earlyBird: false,
  is_foreigner: false
});

watch(() => props.dialog, async (isOpen) => {
  if (isOpen && props.questionnaire_id != null) {
    anketaData.value = await $fetch('/api/admin/allocation/questionnaire_by_id?questionnaire_id=' + props.questionnaire_id, {
      method: 'GET',
    });
  }
});

</script>
<style scoped>

</style>