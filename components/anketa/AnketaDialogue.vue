<template>
  <v-card>
    <v-card-title>Заполнение анкеты для пользователя</v-card-title>
    <v-card-text>
      <v-text-field v-model="anketaData.lastName" label="Фамилия" :rules="[required]"></v-text-field>
      <v-text-field v-model="anketaData.firstName" label="Имя" :rules="[required]"></v-text-field>
      <v-text-field v-model="anketaData.middleName" label="Отчество"></v-text-field>

      <v-text-field v-model="anketaData.birthDate" label="Дата рождения" type="date" :rules="[required]"></v-text-field>
      <v-text-field v-model="anketaData.phone" label="Контактный телефон" type="tel" :rules="[required, phoneCheck]"></v-text-field>
      <v-text-field v-model="anketaData.email" label="Электронная почта" type="email" :rules="[required, emailHseStudentCheck]"></v-text-field>

      <v-divider class="my-4"></v-divider>

      <v-text-field v-model="anketaData.facultyFullName" label="Полное название факультета" :rules="[required]"></v-text-field>
      <v-text-field v-model="anketaData.facultyShortName" label="Короткое название факультета" :rules="[required]"></v-text-field>
      <v-select v-model="anketaData.course" label="Курс" :items="courseOptions" :rules="[required]"></v-select>
      <v-text-field v-model="anketaData.city" label="Город проживания" :rules="[required]"></v-text-field>

      <v-divider class="my-4"></v-divider>

      <v-radio-group v-model="anketaData.sex" label="Пол" :rules="[required]">
        <v-radio label="Мужской" value="male"></v-radio>
        <v-radio label="Женский" value="female"></v-radio>
      </v-radio-group>

      <v-checkbox v-model="anketaData.isForeigner" label="Я иностранный студент"></v-checkbox>

      <v-select v-model="anketaData.roomType" label="Предпочтительный тип комнаты" :items="['Одноместная', 'Двухместная', 'Трехместная', 'Четырёхместная']" :rules="[required]"></v-select>
      <v-text-field v-model="anketaData.preferredFloor" label="Предпочтительный этаж" type="number" min="1" max="21"></v-text-field>
      <v-select v-model="anketaData.roomStyle" label="Квартирный тип или коридорный" :items="['Квартирный', 'Коридорный']" :rules="[required]"></v-select>

      <v-divider class="my-4"></v-divider>

      <v-checkbox v-model="anketaData.hasChronicDiseases" label="Есть хронические заболевания"></v-checkbox>
      <v-checkbox v-model="anketaData.needsBenefitPlacement" label="Нуждается в льготном размещении"></v-checkbox>
      <v-checkbox v-model="anketaData.needsSpecialConditions" label="Нуждается в специальных условиях"></v-checkbox>
      <v-checkbox v-model="anketaData.boardGames" label="Играете в настольные игры?"></v-checkbox>
      <v-checkbox v-model="anketaData.doSports" label="Занимаетесь спортом?"></v-checkbox>
      <v-combobox v-if="anketaData.doSports" v-model="anketaData.sports" label="Каким спортом занимаетесь?" multiple :items="sportsList"></v-combobox>
      <v-checkbox v-model="anketaData.hasHobbies" label="Есть хобби?"></v-checkbox>
      <v-combobox v-if="anketaData.hasHobbies" v-model="anketaData.hobbies" label="Какие у вас хобби?" multiple :items="hobbiesList"></v-combobox>

      <v-checkbox v-model="anketaData.doSmoke" label="Курите?"></v-checkbox>
      <v-checkbox v-model="anketaData.earlyBird" label="Рано просыпаетесь?"></v-checkbox>

      <v-divider class="my-4"></v-divider>
      <v-select v-model="anketaData.russianProficiency" label="Знание русского языка" :items="['Начальный', 'Средний', 'Свободный']" :rules="[required]"></v-select>
      <v-select v-model="anketaData.englishProficiency" label="Знание английского языка" :items="['Начальный', 'Средний', 'Свободный']" :rules="[required]"></v-select>

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
import { ref, computed, onMounted } from 'vue';
import { email_hse_student_check as emailHseStudentCheck, required } from "~/utils/rules";
import { useAuthStore } from "~/stores/auth_store";

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

const anketaData = ref({
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
  earlyBird: false,
  isForeigner: false
});

const emailExists = ref(false);
const successAlert = ref(false);
const errorAlert = ref(false);

const phoneCheck = (value: string): boolean | string => /^\+?\d{10,15}$/.test(value) || 'Неверный формат телефона';

const isFormValid = computed(() => {
  return anketaData.value.lastName &&
      anketaData.value.firstName &&
      anketaData.value.birthDate &&
      anketaData.value.facultyFullName &&
      anketaData.value.facultyShortName &&
      anketaData.value.course !== null &&
      anketaData.value.city &&
      anketaData.value.sex &&
      anketaData.value.roomType &&
      anketaData.value.phone &&
      anketaData.value.email &&
      anketaData.value.russianProficiency &&
      anketaData.value.englishProficiency &&
      anketaData.value.roomStyle;
});

const authStore = useAuthStore();
const loading = ref(false);
const error = ref<string | null>(null);

// Проверяем только авторизацию при монтировании компонента
onMounted(async () => {
  loading.value = true;
  try {
    // Проверяем, что пользователь авторизован
    await authStore.fetchCurrentUser();
  } catch (e: any) {
    error.value = e.message || 'Ошибка при проверке авторизации';
  } finally {
    loading.value = false;
  }
});

const submitForm = async () => {
  emailExists.value = false;
  successAlert.value = false;
  errorAlert.value = false;
  try {
    await $fetch('/api/anketa/send_data', {
      method: 'POST',
      body: { ...anketaData.value}
    });
    successAlert.value = true;
    anketaData.value = { ...anketaData.value, lastName: '', firstName: '', middleName: '', email: '', phone: '' };
  } catch (error: any) {
    if (error.response?.status === 409) {
      emailExists.value = true;
    }
    errorAlert.value = true;
    console.error(error);
  }
};
</script> 