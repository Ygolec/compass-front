<template>
  <v-card>
    <v-card-title>
      Заполнение анкеты для пользователя
    </v-card-title>
    <v-card-text>
      <v-text-field v-model="anketa_data.fullName" label="ФИО" :rules="[required]" required></v-text-field>
      <v-text-field v-model="anketa_data.birthDate" label="Дата рождения" type="date" :rules="[required]" required></v-text-field>
      <v-text-field v-model="anketa_data.faculty" label="Факультет" :rules="[required]" required></v-text-field>
      <v-text-field v-model="anketa_data.course" label="Курс" type="number" :rules="[required, isNumber]" required></v-text-field>
      <v-text-field v-model="anketa_data.city" label="Город проживания" :rules="[required]" required></v-text-field>
      <v-radio-group v-model="anketa_data.sex" label="Пол" :rules="[required]" required>
        <v-radio label="Мужской" value="male"></v-radio>
        <v-radio label="Женский" value="female"></v-radio>
      </v-radio-group>
      <v-select v-model="anketa_data.roomType" label="Предпочтительный тип комнаты"
                :items="['Одноместная', 'Двухместная', 'Трехместная']" :rules="[required]" required></v-select>
      <v-select v-model="anketa_data.preferredFloor" label="Предпочтительный этаж"
                :items="[1, 2, 3, 4, 5, 99]"></v-select>
      <v-select v-model="anketa_data.hasChronicDiseases" label="Наличие хронических заболеваний"
                :items="[{title:'Да', value: true}, {title:'Нет', value: false}]" :rules="[required]" required></v-select>
      <v-checkbox v-model="anketa_data.needsBenefitPlacement" label="Нуждается в льготном размещении"></v-checkbox>
      <v-checkbox v-model="anketa_data.needsSpecialConditions"
                  label="Нуждается в доступе к специальным условиям (например, пандус, лифт)"></v-checkbox>
      <v-text-field v-model="anketa_data.phone" label="Контактный телефон" type="tel" :rules="[required, phone_check]" required></v-text-field>
      <v-text-field v-model="anketa_data.email" label="Электронная почта" type="email" :rules="[required, email_hse_student_check]" required></v-text-field>
      <v-select v-model="anketa_data.sports" label="Занимаетесь ли вы спортом?"
                :items="[{title:'Да', value: true}, {title:'Нет', value: false}]" required></v-select>
      <v-text-field v-model="anketa_data.sportsType" label="Какими видами спорта увлекаетесь?" :rules="[optional]"></v-text-field>
      <v-select v-model="anketa_data.boardGames" label="Играете ли вы в настольные игры?"
                :items="[{title:'Да', value: true}, {title:'Нет', value: false}]" required></v-select>
      <v-text-field v-model="anketa_data.hobbies" label="Есть ли у вас другие хобби?" :rules="[optional]"></v-text-field>
      <v-text-field v-model="anketa_data.religion" label="Какое у вас вероисповедание?" :rules="[required]" required></v-text-field>
      <v-select v-model="anketa_data.sameReligionNeighbor" label="Хотели бы вы жить с соседом того же вероисповедания?"
                :items="[{title:'Да', value: true}, {title:'Нет', value: false}]" required></v-select>
      <v-text-field v-model="anketa_data.nationality" label="Национальность" :rules="[required]" required></v-text-field>
      <v-select v-model="anketa_data.russianProficiency" label="Знание русского языка"
                :items="['Начальный', 'Средний', 'Свободный']" required></v-select>
      <v-select v-model="anketa_data.englishProficiency" label="Знание английского языка"
                :items="['Начальный', 'Средний', 'Свободный']" required></v-select>
      <v-select v-model="anketa_data.roomStyle" label="Квартирный тип или коридорный"
                :items="['Квартирный', 'Коридорный']" required></v-select>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="submitForm">Отправить</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {email_hse_student_check, required, password_check, password_confirm} from "~/utils/rules";

const anketa_data = ref<anketa_data>({
  fullName: '',
  birthDate: '',
  faculty: '',
  course: 0,
  city: '',
  sex: '',
  roomType: '',
  preferredFloor: 0,
  hasChronicDiseases: false,
  needsBenefitPlacement: false,
  needsSpecialConditions: false,
  phone: '',
  email: '',
  sports: false,
  sportsType: '',
  boardGames: false,
  hobbies: '',
  religion: '',
  sameReligionNeighbor: false,
  nationality: '',
  russianProficiency: '',
  englishProficiency: '',
  roomStyle: ''
});

const phone_check = v => /^\+?\d{10,15}$/.test(v) || 'Неверный формат телефона';
const isNumber = v => !isNaN(v) || 'Должно быть числом';
const optional = v => true;

const submitForm = async () => {
  try {
    await $fetch('/api/anketa/send_data', {
      method: 'POST',
      body: anketa_data.value,
    });
  } catch (error) {
    console.error(error);
  }
};
</script>

<style scoped>
</style>