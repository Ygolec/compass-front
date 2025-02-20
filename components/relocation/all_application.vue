<template>
  <v-card>
    <v-card-text>
      <v-empty-state
          v-if="!authStore.isAuthenticated"
          icon="mdi-magnify"
          text="Зарегестрируйтесь или авторизируйтесь"
          title="Вы не авторизированы.">
      </v-empty-state>
      <v-data-table-server

          v-if="authStore.isAuthenticated"
          v-model:items-per-page="itemsPerPage"
          :headers="headers"
          :items="student_relocation_applications"
          :items-length="items_length"
          :loading="loading"
          :search="search"
          item-value="id"
          @update:options="load_applications"
          loading-text="Загрузка... Пожалуйста подождите"
      >
        <template v-slot:top>
          <v-toolbar
              rounded="lg"
              density="compact"
              flat
          >
            <v-toolbar-title>Список со всеми заявками</v-toolbar-title>
            <v-divider
                class="mx-4"
                inset
                vertical
            ></v-divider>
            <v-btn
                variant="elevated"
                @click="load_applications({page: page, itemsPerPage: itemsPerPage, sortBy: sortBy})"
                density="compact"
                append-icon="mdi-refresh"
                class="mr-3"
            >
              Обновить
            </v-btn>
          </v-toolbar>
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip>
            {{ get_status(item.status) }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn v-if="item.user_created==authStore.user?.directus_id" disabled>Моя заявка</v-btn>
          <v-btn v-else @click="open_detail(item.id)">Подробнее</v-btn>
        </template>
      </v-data-table-server>
    </v-card-text>
  </v-card>
  <application_detail :dialog="dialog_detail" @update:dialog="dialog_detail = $event"
                      :student_relocation_applications_id="dialog_student_relocation_applications_id"/>
</template>
<script setup lang="ts">
import {useAuthStore} from "~/stores/auth_store";
import Application_detail from "~/components/relocation/application_detail.vue";

const dialog_detail = ref(false)
const dialog_student_relocation_applications_id = ref(0)
const route = useRoute()
const student_relocation_applications = ref([])
const authStore = useAuthStore();
const loading = ref(false)
const search = ref('')
const page = ref(1)
const sortBy = ref([])
const itemsPerPage = ref(5)
const headers = ref([
  {title: 'Общежитие откуда', key: 'student_accommodation_id_from.name'},
  {title: 'Общежитие куда', key: 'student_accommodation_id_to.name'},
  {title: 'Этаж', key: 'floor'},
  {title: 'Статус', key: 'status'},
  {title: 'Действия', key: 'actions', align: "center"},
])
const items_length = ref(0)

async function load_applications({page, itemsPerPage, sortBy}) {
  loading.value = true
  try {
    student_relocation_applications.value = await $fetch(`/api/student_relocation_applications/all`, {
      method: 'POST',
      body: {relocation_id: route.params.id, page, itemsPerPage, sortBy},
    });
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
    items_length.value = student_relocation_applications.value[student_relocation_applications.value.length - 1].count
    student_relocation_applications.value = student_relocation_applications.value.slice(0, -1)
  }
}

function open_detail(student_relocation_applications_id: number) {
  dialog_student_relocation_applications_id.value = student_relocation_applications_id
  dialog_detail.value = true
}

const get_status = (status: string) => {
  switch (status) {
    case 'created':
      return 'Создана, ожидает заявок'
    case 'rejected':
      return 'Отклонено системой'
    case 'ended':
      return 'Завершено'
    case 'canceled':
      return 'Отменено пользователем'
    default:
      return 'Неизвестно'
  }
}

async function test() {
  await $fetch(`/api/student_relocation_applications_match/create_match`, {
    method: 'POST',
    body: {relocation_applications_id_from: 14, relocation_applications_id_to: 15},
  });
}

</script>
<style scoped>

</style>