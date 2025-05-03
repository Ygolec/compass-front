<template>
  <v-dialog
      :model-value="dialog"
      @update:model-value="update_dialog"
  >
    <v-card>
      <v-form @submit.prevent="handle_submit">
        <v-card-title>Редактирование заявки на переселение</v-card-title>
        <v-card-text v-if="student_relocation_application">
          <v-row>
            <v-col>
              <v-select label="Из какого общежития"
                        :items="accommodations"
                        :item-title="item => item.name"
                        :item-value="item => item.id"
                        v-model="student_relocation_application.student_accommodation_id_from.id"
                        readonly
                        disabled
                        :rules="[required]"
              >
              </v-select>
            </v-col>
            <v-col>
              <v-select label="В какое общежитие"
                        :items="accommodations"
                        :item-title="item => item.name"
                        :item-value="item => item.id"
                        v-model="student_relocation_application.student_accommodation_id_to.id"
                        readonly
                        disabled
                        :rules="[required]"
              >
              </v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select label="Адрес нынешнего общежития"
                        :items="getAccommodationAddress(student_relocation_application.student_accommodation_from_address_id.id)"
                        :item-value="item => item.id"
                        :item-title="item => `${item.city}, ${item.street}, ${item.building_number}`"
                        v-model="student_relocation_application.student_accommodation_from_address_id.id"
                        readonly
                        disabled
                        :rules="[required]"
              >
              </v-select>
            </v-col>
            <v-col>
              <v-select label="Адрес общежития переселения"
                        :items="getAccommodationAddress(student_relocation_application.student_accommodation_to_address_id.id)"
                        :item-value="item => item.id"
                        :item-title="item => `${item.city}, ${item.street}, ${item.building_number}`"
                        v-model="student_relocation_application.student_accommodation_to_address_id.id"
                        readonly
                        disabled
                        :rules="[required]"
              >
              </v-select>
            </v-col>
          </v-row>
          <v-number-input label="Этаж"
                          control-variant="hidden"
                          :min="1"
                          :max="25"
                          v-model="student_relocation_application.floor"
                          :rules="[required]"
          ></v-number-input>
          <v-text-field label="Номер квартиры"
                        control-variant="hidden"
                        v-model="student_relocation_application.apartment_number"
          ></v-text-field>
          <v-text-field label="Номер комнаты"
                        control-variant="hidden"
                        v-model="student_relocation_application.room_number"
                        :rules="[required]"
          ></v-text-field>
          <v-number-input label="Кол-во проживающих в комнате"
                          control-variant="hidden"
                          :min="1"
                          :max="4"
                          type="number"
                          v-model="student_relocation_application.occupancy"
                          :rules="[required]"
          ></v-number-input>
          <v-text-field label="Телеграмм"
                        :rules="[telegram_tag_check]"
                        v-model="student_relocation_application.telegram"
                        clearable
                        @input="student_relocation_application.telegram = '@' + student_relocation_application.telegram.replace(/^@/, '')"
                        hint="Нужен для связи с вами другими студентами"
          ></v-text-field>
          <v-text-field label="Номер телефона"
                        hint="Информация, только для администрации"
                        clearable
                        :rules="[required,phone_russian_check]"
                        v-model="student_relocation_application.phone_number"
                        @input="student_relocation_application.phone_number = '+7' + student_relocation_application.phone_number.replace(/^\+7/, '')"
          ></v-text-field>
          <v-container>
            <v-file-upload
                title="Загрузите фотографии комнаты"
                density="compact"
                v-model="files"
                clearable
                multiple
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
            Отредактировать заявку
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>

</template>

<script setup lang="ts">
import {phone_russian_check, required, telegram_tag_check} from "~/utils/rules";

const props = defineProps({
  dialog: Boolean,
});
const files = shallowRef<File[] | null>(null)
const student_relocation_application = ref<StudentRelocationApplicationDetails>()
const route = useRoute()
const emit = defineEmits(["update:dialog", "edited"]);
const accommodations = ref<student_accommodations_with_addresses[]>([])
const serverEmailError = ref<string>('');

const update_dialog = (value: boolean) => {
  emit('update:dialog', value);
};

async function get_application() {
  try {
    student_relocation_application.value = await $fetch<StudentRelocationApplicationDetails>(`/api/student_relocation_applications/application_by_user`, {
      method: 'POST',
      body: {relocation_id: route.params.id},
    });
    await fetchImagesFromDirectus(student_relocation_application.value.photos_of_room)
  } catch (error) {
    console.error(error)
  }
}

async function fetchImagesFromDirectus(photos: { directus_files_id: string }[]) {
  const downloadedFiles = await Promise.all(
      photos.map(async (photo, index) => {
        const url = `https://directus.hse-compass.ru/assets/${photo.directus_files_id}`
        const res = await fetch(url)
        const blob = await res.blob()
        return new File([blob], `room_photo_${index}.jpg`, {type: blob.type})
      })
  )

  files.value = downloadedFiles
}
const getAccommodationAddress = (id: string | null) => {
  return accommodations.value.find(acc => acc.id === id)?.addresses || [];
};
const handle_submit = () => {
  serverEmailError.value = '';
  if (!student_relocation_application.value)
    return;

  if (required(student_relocation_application.value.floor) !== true)
    return;

  if (required(student_relocation_application.value.room_number) !== true)
    return;

  if (required(student_relocation_application.value.occupancy) !== true)
    return;

  if (student_relocation_application.value.telegram !== null)
    if (telegram_tag_check(student_relocation_application.value.telegram) !== true)
      return;

  if (required(student_relocation_application.value.phone_number) !== true)
    return;

  if (student_relocation_application.value.phone_number !== null)
    if (phone_russian_check(student_relocation_application.value.phone_number) !== true)
      return;

  edit_application()
};

async function edit_application() {
  const formData = new FormData()
  if (files.value != null) {
    files.value.forEach((photo: File) => {
      formData.append('photos', photo)
    })
  }
  formData.append('student_application', JSON.stringify(student_relocation_application.value));
  try {
    await $fetch('/api/student_relocation_applications/edit-application', {
      method: 'POST',
      body: formData,
    });
  } catch (error: any) {
    console.error(error);
  }
  update_dialog(false);
  emit("edited");
}

watch(() => props.dialog, async (newVal) => {
  if (newVal) {
    await get_application()
    accommodations.value = await $fetch<student_accommodations_with_addresses[]>('/api/student_accommodation/list_of_accommodation');
  } else {
    files.value = null
  }
}, {immediate: true})
</script>

<style scoped>
</style>
