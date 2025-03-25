<template>
  <create-application :dialog="create_application_dialog" @update:dialog="create_application_dialog = $event"/>
  <v-card>
    <v-card-text>
      <v-empty-state
          v-if="!student_relocation_application && authStore.isAuthenticated"
          icon="mdi-magnify"
          text="Создайте новую заявку для переселения"
          title="Не можем найти вашу заявку.">
      </v-empty-state>
      <v-empty-state
          v-if="!authStore.isAuthenticated"
          icon="mdi-magnify"
          text="Зарегестрируйтесь или авторизируйтесь"
          title="Вы не авторизированы.">
      </v-empty-state>
      <v-card v-if="student_relocation_application">
        <v-card-title class="mt-2 ml-2"
        >Ваша заявка
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
            <v-card-title class="mt-2 ml-2"
            >
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
            <v-card-title class="mt-2 ml-2">
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
          <v-row justify="end" class="mr-2">
            <v-btn
                color="red"
                @click="confirm_dialog = true"
            >
              Отменить заявку
            </v-btn>
            <v-btn
                variant="flat"
                color="blue"
            >
              Отредактировать заявку
            </v-btn>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-card-text>
    <v-card-actions
        v-if="authStore.isAuthenticated && !student_relocation_application"
    >
      <v-btn
          color="primary"
          @click="create_application_dialog = true"
      >
        Создать заявку
      </v-btn>
    </v-card-actions>
  </v-card>
  <ConfirmDialog
      :dialog="confirm_dialog"
      @update:dialog="confirm_dialog = $event"
      :details="details_confirm"
      @confirm="cancel_my_application"
  />
</template>
<script setup lang="ts">
import CreateApplication from "~/components/relocation/CreateApplication.vue";
import {useAuthStore} from "~/stores/auth_store";
import ConfirmDialog from "~/components/base/ConfirmDialog.vue";

const confirm_dialog = ref(false)
const details_confirm = ref({
  title: 'Отменить заявку',
  text: `Вы уверены что хотите удалить переселение?`,
  button_confirm_text: 'удалить',
  button_confirm_color: 'red'
})
const confirm_loading = ref(false)
const create_application_dialog = ref<boolean>(false);
const authStore = useAuthStore();
const route = useRoute()
const student_relocation_application = ref<StudentRelocationApplicationDetails>()
const get_address = (address: StudentAccommodationAddresses) => {
  const parts = [
    address.city,
    address.street,
    address.building_number,
    address.corpus
  ].filter(Boolean);
  return parts.join(',');
}

async function cancel_my_application(){
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
  }
}

onMounted(async () => {
  student_relocation_application.value = await $fetch<StudentRelocationApplicationDetails>(`/api/student_relocation_applications/application_by_user`, {
    method: 'POST',
    body: {relocation_id: route.params.id},
  });
});
</script>
<style scoped>

</style>