<template>
  <v-card>
    <v-card-title>Заполнение анкеты для пользователя</v-card-title>
    <v-card-text>
      <v-text-field v-model="anketa_data.lastName" label="Фамилия" :rules="[required]"></v-text-field>
      <v-text-field v-model="anketa_data.firstName" label="Имя" :rules="[required]"></v-text-field>
      <v-text-field v-model="anketa_data.middleName" label="Отчество"></v-text-field>

      <v-text-field v-model="anketa_data.birthDate" label="Дата рождения" type="date" :rules="[required]"></v-text-field>
      <v-text-field v-model="anketa_data.phone" label="Контактный телефон" type="tel" :rules="[required, phone_check]"></v-text-field>
      <v-text-field v-model="anketa_data.email" label="Электронная почта" type="email" :rules="[required, email_hse_student_check]"></v-text-field>

      <v-divider class="my-4"></v-divider>

      <v-text-field v-model="anketa_data.facultyFullName" label="Полное название факультета" :rules="[required]"></v-text-field>
      <v-text-field v-model="anketa_data.facultyShortName" label="Короткое название факультета" :rules="[required]"></v-text-field>
      <v-select v-model="anketa_data.course" label="Курс" :items="[1, 2, 3, 4, 5, 6, 7]" :rules="[required]"></v-select>
      <v-text-field v-model="anketa_data.city" label="Город проживания" :rules="[required]"></v-text-field>

      <v-divider class="my-4"></v-divider>

      <v-radio-group v-model="anketa_data.sex" label="Пол" :rules="[required]">
        <v-radio label="Мужской" value="male"></v-radio>
        <v-radio label="Женский" value="female"></v-radio>
      </v-radio-group>
      <v-select v-model="anketa_data.roomType" label="Предпочтительный тип комнаты" :items="['Одноместная', 'Двухместная', 'Трехместная', 'Четырёхместная']" :rules="[required]"></v-select>
      <v-text-field v-model="anketa_data.preferredFloor" label="Предпочтительный этаж" type="number" min="1" max="21"></v-text-field>
      <v-select v-model="anketa_data.roomStyle" label="Квартирный тип или коридорный" :items="['Квартирный', 'Коридорный']" :rules="[required]"></v-select>

      <v-divider class="my-4"></v-divider>

      <v-checkbox v-model="anketa_data.hasChronicDiseases" label="Есть хронические заболевания"></v-checkbox>
      <v-checkbox v-model="anketa_data.needsBenefitPlacement" label="Нуждается в льготном размещении"></v-checkbox>
      <v-checkbox v-model="anketa_data.needsSpecialConditions" label="Нуждается в специальных условиях"></v-checkbox>
      <v-checkbox v-model="anketa_data.boardGames" label="Играете в настольные игры?"></v-checkbox>
      <v-checkbox v-model="anketa_data.doSports" label="Занимаетесь спортом?"></v-checkbox>
      <v-combobox v-if="anketa_data.doSports" v-model="anketa_data.sports" label="Каким спортом занимаетесь?" multiple :items="sportsList"></v-combobox>
      <v-checkbox v-model="anketa_data.hasHobbies" label="Есть хобби?"></v-checkbox>
      <v-combobox v-if="anketa_data.hasHobbies" v-model="anketa_data.hobbies" label="Какие у вас хобби?" multiple :items="hobbiesList"></v-combobox>

      <v-checkbox v-model="anketa_data.doSmoke" label="Курите?"></v-checkbox>
      <v-checkbox v-model="anketa_data.earlyBird" label="Рано просыпаетесь?"></v-checkbox>

      <v-divider class="my-4"></v-divider>
      <v-select v-model="anketa_data.russianProficiency" label="Знание русского языка" :items="['Начальный', 'Средний', 'Свободный']" :rules="[required]"></v-select>
      <v-select v-model="anketa_data.englishProficiency" label="Знание английского языка" :items="['Начальный', 'Средний', 'Свободный']" :rules="[required]"></v-select>

      <v-alert v-if="emailExists" type="error">Этот email уже используется</v-alert>
      <v-alert v-if="successAlert" type="success">Анкета успешно отправлена!</v-alert>
      <v-alert v-if="errorAlert" type="error">Произошла ошибка при отправке анкеты. Попробуйте снова.</v-alert>
    </v-card-text>

    <v-card-actions>
      <v-btn :disabled="!isFormValid" color="primary" @click="submitForm">Отправить</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { email_hse_student_check, required } from "~/utils/rules";

const sportsList = ref(["Футбол", "Баскетбол", "Теннис", "Плавание", "Бег", "Волейбол", "Лыжи", "Тренажерный зал"]);

const hobbiesList = ref(["Чтение", "Музыка", "Спорт", "Рисование", "Программирование"]);

const courseOptions = ref([
  { title: "1", value: 1 },
  { title: "2", value: 2 },
  { title: "3", value: 3 },
  { title: "4", value: 4 },
  { title: "5", value: 5 },
  { title: "M1", value: 6 },
  { title: "M2", value: 7 }
]);

const anketa_data = ref({
  lastName: '',
  firstName: '',
  middleName: '',
  birthDate: '',
  facultyFullName: '',
  facultyShortName: '',
  course: 0,
  city: '',
  sex: '',
  roomType: '',
  preferredFloor: null,
  hasChronicDiseases: false,
  needsBenefitPlacement: false,
  needsSpecialConditions: false,
  phone: '',
  email: '',
  doSports: false,
  sports: [],
  hasHobbies: false,
  hobbies: [],
  boardGames: false,
  russianProficiency: '',
  englishProficiency: '',
  roomStyle: '',
  doSmoke: false,
  earlyBird: false
});

const emailExists = ref(false);
const successAlert = ref(false);
const errorAlert = ref(false);

const phone_check = v => /^\+?\d{10,15}$/.test(v) || 'Неверный формат телефона';

const isFormValid = computed(() => {
  return anketa_data.value.lastName &&
      anketa_data.value.firstName &&
      anketa_data.value.birthDate &&
      anketa_data.value.facultyFullName &&
      anketa_data.value.facultyShortName &&
      anketa_data.value.course !== null &&
      anketa_data.value.city &&
      anketa_data.value.sex &&
      anketa_data.value.roomType &&
      anketa_data.value.phone &&
      anketa_data.value.email &&
      anketa_data.value.russianProficiency &&
      anketa_data.value.englishProficiency &&
      anketa_data.value.roomStyle;
});

const submitForm = async () => {
  emailExists.value = false;
  successAlert.value = false;
  errorAlert.value = false;
  try {
    await $fetch('/api/anketa/send_data', {
      method: 'POST',
      body: { ...anketa_data.value}
    });
    successAlert.value = true;
    anketa_data.value = { ...anketa_data.value, lastName: '', firstName: '', middleName: '', email: '', phone: '' };
  } catch (error) {
    if (error.response?.status === 409) {
      emailExists.value = true;
    }
    errorAlert.value = true;
    console.error(error);
  }
};
</script>
