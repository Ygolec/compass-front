<template>
  <v-dialog
      :model-value="dialog"
      @update:model-value="update_dialog"
  >
    <v-card>
      <v-form @submit.prevent="handle_submit">
        <v-card-title>Заполнение заявки на переселение</v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-select label="Из какого общежития"
                        :items="accommodations"
                        :item-title="item => item.name"
                        :item-value="item => item.id"
                        v-model="student_application.accommodation_from.id"
                        @update:model-value="setNullForAddressFrom"
                        clearable
                        :rules="[required]"
              >
              </v-select>
            </v-col>
            <v-col>
              <v-select label="В какое общежитие"
                        :items="accommodations"
                        :item-title="item => item.name"
                        :item-value="item => item.id"
                        v-model="student_application.accommodation_to.id"
                        @update:model-value="setNullForAddressTo"
                        clearable
                        :rules="[required]"
              >
              </v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select label="Адрес нынешнего общежития"
                        :disabled="!student_application.accommodation_from.id"
                        :items="getAccommodationAddress(student_application.accommodation_from.id)"
                        :item-value="item => item.id"
                        :item-title="item => `${item.city}, ${item.street}, ${item.building_number}`"
                        v-model="student_application.accommodation_from.id_address"
                        clearable
                        :rules="[required]"
              >
              </v-select>
            </v-col>
            <v-col>
              <v-select label="Адрес общежития переселения"
                        :disabled="!student_application.accommodation_to.id"
                        :items="getAccommodationAddress(student_application.accommodation_to.id)"
                        :item-value="item => item.id"
                        :item-title="item => `${item.city}, ${item.street}, ${item.building_number}`"
                        v-model="student_application.accommodation_to.id_address"
                        clearable
                        :rules="[required]"
              >
              </v-select>
            </v-col>
          </v-row>
          <v-number-input label="Этаж"
                          control-variant="hidden"
                          :min="1"
                          :max="25"
                          v-model="student_application.floor"
                          :rules="[required]"
          ></v-number-input>
          <v-number-input label="Номер квартиры"
                          control-variant="hidden"
                          v-model="student_application.apartment_number"
          ></v-number-input>
          <v-number-input label="Номер комнаты"
                          control-variant="hidden"
                          v-model="student_application.room_number"
                          :rules="[required]"
          ></v-number-input>
          <v-number-input label="Кол-во проживающих в комнате"
                          control-variant="hidden"
                          :min="1"
                          :max="4"
                          type="number"
                          v-model="student_application.occupancy"
                          :rules="[required]"
          ></v-number-input>
          <v-text-field label="Телеграмм"
                        :rules="[telegram_tag_check]"
                        v-model="student_application.telegram"
                        clearable
                        @input="student_application.telegram = '@' + student_application.telegram.replace(/^@/, '')"
                        hint="Нужен для связи с вами другими студентами"
          ></v-text-field>
          <v-text-field label="Номер телефона"
                        hint="Информация, только для администрации"
                        clearable
                        :rules="[required,phone_russian_check]"
                        v-model="student_application.phone_number"
                        @input="student_application.phone_number = '+7' + student_application.phone_number.replace(/^\+7/, '')"
          ></v-text-field>
          <v-container>
            <v-file-upload
                title="Загрузите фотографии комнаты"
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
            Создать заявку
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
  <snackbar @update:snackbar="snackbar = $event" :snackbar="snackbar" :details="snackbar_details"/>
</template>
<script setup lang="ts">
import {
  phone_russian_check,
  required,
  telegram_tag_check
} from "~/utils/rules";
import Snackbar from "~/components/base/snackbar.vue";
import Confirm_dialog from "~/components/base/confirm_dialog.vue";

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
const snackbar = ref(false)
const route = useRoute()
const accommodations = ref<student_accommodations_with_addresses[]>([])
const student_application = ref<student_application>({
  accommodation_from: {
    id: null,
    id_address: null,
  },
  accommodation_to: {
    id: null,
    id_address: null,
  },
  floor: null,
  apartment_number: null,
  room_number: null,
  occupancy: null,
  telegram: null,
  phone_number: null,
  student_relocation_id: +route.params.id,
})
const photos = shallowRef(null)
const serverEmailError = ref<string>('');
const props = defineProps({
  dialog: Boolean,
});
const emit = defineEmits(["update:dialog"]);

const update_dialog = (value: boolean) => {
  emit('update:dialog', value);
};
const getAccommodationAddress = (id: string | null) => {
  return accommodations.value.find(acc => acc.id === id)?.addresses || [];
};
const setNullForAddressFrom = () => {
  student_application.value.accommodation_from.id_address = null;
};
const setNullForAddressTo = () => {
  student_application.value.accommodation_to.id_address = null;
};

const handle_submit = () => {
  serverEmailError.value = '';

  if (required(student_application.value.accommodation_from.id) !== true)
    return;

  if (required(student_application.value.accommodation_from.id_address) !== true)
    return;

  if (required(student_application.value.accommodation_to.id) !== true)
    return;

  if (required(student_application.value.accommodation_to.id_address) !== true)
    return;

  if (required(student_application.value.floor) !== true)
    return;

  if (required(student_application.value.room_number) !== true)
    return;

  if (required(student_application.value.occupancy) !== true)
    return;

  if (student_application.value.telegram !== null)
    if (telegram_tag_check(student_application.value.telegram) !== true)
      return;

  if (required(student_application.value.phone_number) !== true)
    return;

  if (student_application.value.phone_number !== null)
    if (phone_russian_check(student_application.value.phone_number) !== true)
      return;

  create_application();
};

async function create_application() {
  const formData = new FormData()
  if (photos.value != null) {
    photos.value.forEach((photo: File) => {
      formData.append('photos', photo)
    })
  }
  formData.append('student_application', JSON.stringify(student_application.value));
  try {
    await $fetch('/api/student_relocation_applications/create_application', {
      method: 'POST',
      body: formData,
    });
  } catch (error: any) {
    console.error(error);
    if (error.response?._data?.message === "Application exists") {
      snackbar_details.value = {
        text: 'Заявка на переселение уже существует, отмените прошлую заявку',
        timeout: 5000,
        color: 'red',
        button_close_color: 'black'
      }
      snackbar.value = true
    }
  }
  update_dialog(false);
}

onMounted(async () => {
  accommodations.value = await $fetch<student_accommodations_with_addresses[]>('/api/student_accommodation/list_of_accommodation');
});
</script>
<style scoped>

</style>