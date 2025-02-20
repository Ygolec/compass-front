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
          <v-text-field label="Этаж"
                        v-model="student_application.floor"
                        :rules="[required]"
          ></v-text-field>
          <v-text-field label="Номер квартиры"
                        v-model="student_application.apartment_number"
          ></v-text-field>
          <v-text-field label="Номер комнаты"
                        v-model="student_application.room_number"
                        :rules="[required]"
          ></v-text-field>
          <v-text-field label="Кол-во проживающих в комнате"
                        v-model="student_application.occupancy"
                        :rules="[required]"
          ></v-text-field>
          <v-text-field label="Телеграмм"
                        hint="Нужен для связи с вами другими студентами"
          ></v-text-field>
          <v-text-field label="Номер телефона"
                        hint="Информация, только для администрации"
                        :rules="[required]"
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
</template>
<script setup lang="ts">
import {email_hse_student_check, password_check, required} from "~/utils/rules";

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


  if (emailValid && passwordValid && passwordRepeatValid) {
    create_application()
  }
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
  } catch (e) {
    console.error(e);
  }
  update_dialog(false);
}

onMounted(async () => {
  accommodations.value = await $fetch<student_accommodations_with_addresses[]>('/api/student_accommodation/list_of_accommodation');
});
</script>
<style scoped>

</style>