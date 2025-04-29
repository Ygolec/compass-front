<template>
  <v-dialog
      :model-value="dialog"
      @update:model-value="update_dialog"
  >
    <v-card>
      <v-form @submit.prevent="handle_submit">
        <v-card-title>Редактирование заявки на переселение</v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <!-- Из какого общежития (заблокирован) -->
              <v-select
                  label="Из какого общежития"
                  :items="accommodations"
                  :item-title="item => item.name"
                  :item-value="item => item.id"
                  v-model="student_application.accommodation_from.id"
                  disabled
              >
              </v-select>
            </v-col>
            <v-col>
              <!-- В какое общежитие (заблокирован) -->
              <v-select
                  label="В какое общежитие"
                  :items="accommodations"
                  :item-title="item => item.name"
                  :item-value="item => item.id"
                  v-model="student_application.accommodation_to.id"
                  disabled
              >
              </v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <!-- Адрес нынешнего общежития (заблокирован) -->
              <v-select
                  label="Адрес нынешнего общежития"
                  :items="getAccommodationAddress(student_application.accommodation_from.id)"
                  :item-value="item => item.id"
                  :item-title="item => `${item.city}, ${item.street}, ${item.building_number}`"
                  v-model="student_application.accommodation_from.id_address"
                  disabled
              >
              </v-select>
            </v-col>
            <v-col>
              <!-- Адрес общежития переселения (заблокирован) -->
              <v-select
                  label="Адрес общежития переселения"
                  :items="getAccommodationAddress(student_application.accommodation_to.id)"
                  :item-value="item => item.id"
                  :item-title="item => `${item.city}, ${item.street}, ${item.building_number}`"
                  v-model="student_application.accommodation_to.id_address"
                  disabled
              >
              </v-select>
            </v-col>
          </v-row>

          <!-- Остальные поля редактируемые -->
          <v-number-input
              label="Этаж"
              control-variant="hidden"
              :min="1"
              :max="25"
              v-model="student_application.floor"
              :rules="[required]"
          ></v-number-input>

          <v-number-input
              label="Номер квартиры"
              control-variant="hidden"
              v-model="student_application.apartment_number"
          ></v-number-input>

          <v-number-input
              label="Номер комнаты"
              control-variant="hidden"
              v-model="student_application.room_number"
              :rules="[required]"
          ></v-number-input>

          <v-number-input
              label="Кол-во проживающих в комнате"
              control-variant="hidden"
              :min="1"
              :max="4"
              type="number"
              v-model="student_application.occupancy"
              :rules="[required]"
          ></v-number-input>

          <v-text-field
              label="Телеграм"
              :rules="[telegram_tag_check]"
              v-model="student_application.telegram"
              clearable
              @input="
              student_application.telegram =
                '@' + student_application.telegram.replace(/^@/, '')
            "
              hint="Нужен для связи с вами другими студентами"
          ></v-text-field>

          <v-text-field
              label="Номер телефона"
              hint="Информация, только для администрации"
              clearable
              :rules="[required, phone_russian_check]"
              v-model="student_application.phone_number"
              @input="
              student_application.phone_number =
                '+7' + student_application.phone_number.replace(/^\+7/, '')
            "
          ></v-text-field>

          <!-- При необходимости меняем или добавляем новые фото -->
          <v-container>
            <v-file-upload
                title="Загрузите фотографии комнаты (при необходимости)"
                density="compact"
                v-model="photos"
                multiple
                clearable
            >
            </v-file-upload>
          </v-container>

        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn @click="update_dialog(false)">Отмена</v-btn>
          <v-btn
              type="submit"
              color="green"
              variant="flat"
          >
            Сохранить изменения
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
  <!-- Ваш компонент уведомлений -->
  <BaseSnackbar
      @update:snackbar="snackbar = $event"
      :snackbar="snackbar"
      :details="snackbar_details"
  />
</template>

<script setup lang="ts">
import {
  phone_russian_check,
  required,
  telegram_tag_check
} from "~/utils/rules";
import Snackbar from "~/components/base/Snackbar.vue";

// Типизация, заменить на актуальные
interface student_accommodations_with_addresses {
  id: number;
  name: string;
  addresses: {
    id: number;
    city: string;
    street: string;
    building_number: string;
  }[];
}

interface student_application {
  id?: number;
  accommodation_from: {
    id: number|null;
    id_address: number|null;
  };
  accommodation_to: {
    id: number|null;
    id_address: number|null;
  };
  floor: number|null;
  apartment_number: number|null;
  room_number: number|null;
  occupancy: number|null;
  telegram: string|null;
  phone_number: string|null;
  student_relocation_id?: number|null;
}

// Локальные стэйты
const snackbar_details = ref<{
  text: string,
  color: string,
  timeout: number,
  button_close_color: string
}>({
  text: '',
  color: '',
  timeout: 5000,
  button_close_color: 'green'
});
const snackbar = ref(false);

const accommodations = ref<student_accommodations_with_addresses[]>([]);

// Исходные данные вашей заявки (заполняются при запросе)
const student_application = ref<student_application>({
  accommodation_from: { id: null, id_address: null },
  accommodation_to: { id: null, id_address: null },
  floor: null,
  apartment_number: null,
  room_number: null,
  occupancy: null,
  telegram: null,
  phone_number: null,
});

// Если нужны фотографии
const photos = shallowRef<File[] | null>(null);

const props = defineProps({
  dialog: Boolean,
  applicationId: {
    type: Number,
    required: true,
  }
});
const emit = defineEmits(["update:dialog"]);

const update_dialog = (value: boolean) => {
  emit('update:dialog', value);
};

const getAccommodationAddress = (id: number | null) => {
  return accommodations.value.find(acc => acc.id === id)?.addresses || [];
};

const handle_submit = async () => {
  // Валидация основных полей
  if (required(student_application.value.floor) !== true) return;
  if (required(student_application.value.room_number) !== true) return;
  if (required(student_application.value.occupancy) !== true) return;

  // Проверка телеграма (если заполнен)
  if (student_application.value.telegram) {
    if (telegram_tag_check(student_application.value.telegram) !== true) return;
  }

  // Проверка телефона
  if (required(student_application.value.phone_number) !== true) return;
  if (phone_russian_check(student_application.value.phone_number!) !== true) return;

  await update_application();
};

async function update_application() {
  try {
    const formData = new FormData();

    // Добавляем фото, если есть
    if (photos.value) {
      photos.value.forEach((photo: File) => {
        formData.append("photos", photo);
      });
    }

    // Данные заявки в JSON
    formData.append("student_application", JSON.stringify(student_application.value));

    // Вызовите ваш API для обновления (пример эндпоинта)
    await $fetch(`/api/student_relocation_applications/update_application/${props.applicationId}`, {
      method: "POST", // или PUT, в зависимости от реализации бэка
      body: formData,
    });

    // Закрытие модального окна
    update_dialog(false);
  } catch (error: any) {
    // Ловим ошибку и показываем уведомление
    console.error(error);

    snackbar_details.value = {
      text: error?.response?._data?.message || "Ошибка при сохранении заявки",
      color: 'red',
      timeout: 5000,
      button_close_color: 'black'
    };
    snackbar.value = true;
  }
}

onMounted(async () => {
  // Подгружаем список общаг
  accommodations.value = await $fetch<student_accommodations_with_addresses[]>(
      '/api/student_accommodation/list_of_accommodation'
  );

  // Загружаем данные заявки по ID
  // Предполагается, что ваш бэк может отдать заявку по её идентификатору
  const existing_application = await $fetch<student_application>(
      `/api/student_relocation_applications/application/${props.applicationId}`
  );

  // Заполняем форму
  student_application.value = existing_application;
});
</script>

<style scoped>
</style>
