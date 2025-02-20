<template>
  <v-dialog
      :model-value="dialog"
      @update:model-value="update_dialog"
  >
    <v-card v-if="student_relocation_application">
      <v-card-title>
        Заявка на переселение
      </v-card-title>
      <v-card-text>
        <v-carousel
            v-if="student_relocation_application.photos_of_room.length == 0"
            show-arrows="hower"
        >
          <v-empty-state
              headline="Изображения отсутствуют"
              title="У данной заявки не прикреплены изображения">
          </v-empty-state>
        </v-carousel>
        <v-carousel
            v-if="student_relocation_application.photos_of_room.length != 0"
            show-arrows="hower"
        >
          <v-carousel-item
              v-for="image in student_relocation_application.photos_of_room"
              :src="`https://directus.hse-compass.ru/assets/${image.directus_files_id}`"
          >
          </v-carousel-item>
        </v-carousel>
        <v-divider class="my-3"/>
        <v-card
            variant="outlined"
        >
          <v-card-title>
            Об общежитии
          </v-card-title>
          <v-card-text>
            <v-col>
              <v-row>
                <v-col>
                  <v-text-field
                      variant="underlined"
                      label="Общежитие откуда"
                      v-model="student_relocation_application.student_accommodation_id_from.name"
                      hide-details
                      readonly
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                      variant="underlined"
                      label="Общежитие куда"
                      v-model="student_relocation_application.student_accommodation_id_to.name"
                      hide-details
                      readonly
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                      label="Адрес откуда"
                      variant="underlined"
                      :model-value="get_address(student_relocation_application.student_accommodation_from_address_id)"
                      readonly
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                      label="Адрес куда"
                      variant="underlined"
                      :model-value="get_address(student_relocation_application.student_accommodation_to_address_id)"
                      readonly
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                      prepend-icon="mdi-floor-plan"
                      label="Этаж"
                      variant="underlined"
                      v-model="student_relocation_application.floor"
                      readonly
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                      prepend-icon="mdi-account-group-outline"
                      label="Кол-во жильцов в комнате"
                      variant="underlined"
                      v-model="student_relocation_application.occupancy"
                      readonly
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
          </v-card-text>
        </v-card>
        <v-divider class="my-3"/>
        <v-card
            variant="outlined"
        >
          <v-card-title>
            Контактная информация
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col>
                <v-text-field
                    variant="underlined"
                    label="Имя"
                    v-model="student_relocation_application.user_created.first_name"
                    hide-details
                    readonly
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                    variant="underlined"
                    label="Почта"
                    v-model="student_relocation_application.user_created.email"
                    hide-details
                    readonly
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                    variant="underlined"
                    label="Телеграм"
                    v-model="student_relocation_application.telegram"
                    hide-details
                    readonly
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card-text>
      <v-card-actions>
        <v-btn
            color="gray"
            variant="flat"
            @click="update_dialog(false)"
        >
          Закрыть
        </v-btn>
        <v-btn
            variant="flat"
            color="green"
            @click="confirm_dialog = true"
            :loading="confirm_loading"
        >
          Предложить переселение
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <confirm_dialog
      :dialog="confirm_dialog"
      @update:dialog="confirm_dialog = $event"
      :details="details_confirm"
      @confirm="sent_application"
  />
</template>
<script setup lang="ts">
import Confirm_dialog from "~/components/base/confirm_dialog.vue";
const confirm_dialog = ref(false)
const props = defineProps({
  dialog: Boolean,
  student_relocation_applications_id: Number,
});
const emit = defineEmits(["update:dialog"]);
const student_relocation_application = ref<student_relocation_application_details>()
const details_confirm = ref({
  title: 'Предложить переселение',
  text: `Вы уверены что хотите предложить переселение?`,
  button_confirm_text: 'Предложить',
  button_confirm_color: 'green'
})
const confirm_loading = ref(false)

const update_dialog = (value: boolean) => {
  emit('update:dialog', value);
};

const get_address = (address: student_accommodation_addresses) => {
  const parts = [
    address.city,
    address.street,
    address.building_number,
    address.corpus
  ].filter(Boolean);
  return parts.join(',');
}

watch(() => props.dialog, (value) => {
  if (value) {
    fetchData()
  }
});

async function sent_application(){
  confirm_loading.value = true
  try {
    await $fetch(`/api/student_relocation_applications_match/create_match`, {
      method: 'POST',
      body: student_relocation_application.value
    });
  } catch (error: any) {
    console.error(error)
  } finally {
    confirm_loading.value = false
    update_dialog(false)
  }
}

const fetchData = async () => {
  try {
    student_relocation_application.value = await $fetch(`/api/student_relocation_applications/${props.student_relocation_applications_id}`);
  } catch (error: any) {
  }
};


</script>
<style scoped>

</style>