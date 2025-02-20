<template>
  <create_application :dialog="create_application_dialog" @update:dialog="create_application_dialog = $event"/>
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
        <v-card-title>Моя заявка</v-card-title>
        <v-card-text>
          <v-carousel>
            <v-carousel-item
            v-for="image in student_relocation_application.photos_of_room"
            :src="`https://directus.hse-compass.ru/assets/${image}`"
            >
            </v-carousel-item>
          </v-carousel>
          <v-row>
            <v-col>
              <v-text-field
                  label="Из какого общежития"
                  v-model="student_relocation_application.student_accommodation_from.name"
                  readonly
              ></v-text-field>
            </v-col>
            <v-col>
              <v-text-field
                  label="В какое общежитие"
                  v-model="student_relocation_application.student_accommodation_to.name"
                  readonly
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                  label="Адрес нынешнего общежития"
                  v-model="student_relocation_application.student_accommodation_from_address.city"
                  readonly
              ></v-text-field>
            </v-col>
            <v-col>
              <v-text-field
                  label="Адрес общежития переселения"
                  v-model="student_relocation_application.student_accommodation_to_address.city"
                  readonly
              ></v-text-field>
            </v-col>
          </v-row>
          <v-text-field
              label="Этаж"
              v-model="student_relocation_application.floor"
              readonly
          ></v-text-field>
        </v-card-text>
      </v-card>
    </v-card-text>
    <v-card-actions>
      <v-btn
          color="primary"
          @click="create_application_dialog = true"
      >
        Создать заявку
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script setup lang="ts">
import Create_application from "~/components/relocation/create_application.vue";
import {useAuthStore} from "~/stores/auth_store";
const create_application_dialog = ref<boolean>(false);
const authStore = useAuthStore();
const route = useRoute()
const student_relocation_application = ref<student_relocation_application_with_data>()

onMounted(async () => {
  student_relocation_application.value = await $fetch<student_relocation_application_with_data>(`/api/student_relocation_applications/application_by_user`, {
    method: 'POST',
    body: {relocation_id: route.params.id},
  });
});
</script>
<style scoped>

</style>