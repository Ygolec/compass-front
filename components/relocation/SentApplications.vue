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
          :items="student_relocation_applications_match"
          :items-length="items_length"
          :loading="loading"
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
            <v-toolbar-title>Список с отправленными предложениями</v-toolbar-title>
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
        <template v-slot:item.full_name="{ item }">
          {{ item.relocation_applications_id_to.user_created.first_name }}
          {{ item.relocation_applications_id_to.user_created.last_name }}
        </template>
        <template v-slot:item.address="{ item }">
          {{ get_address(item.relocation_applications_id_to.student_accommodation_from_address_id) }}
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip>
            {{ get_status(item.status) }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-menu v-if="item.status === 'sent'">
            <template v-slot:activator="{ props }">
              <v-btn
                  v-bind="props"
              >
                Действия
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="">
                Просмотр заявки
              </v-list-item>
              <v-list-item @click="cancel_application_match(item.id)">
                Отменить свою заявку
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table-server>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import {useAuthStore} from "~/stores/auth_store";

const authStore = useAuthStore();
const student_relocation_applications_match = ref()
const route = useRoute()
const itemsPerPage = ref(5)
const loading = ref(false)
const page = ref(1)
const sortBy = ref([])
const headers = ref([
  {title: 'ФИО', key: 'full_name'},
  {title: 'Общежитие куда', key: 'relocation_applications_id_to.student_accommodation_id_from.name'},
  {title: 'Адрес общежития переселения', key: 'address'},
  {title: 'Этаж', key: 'relocation_applications_id_to.floor'},
  {title: 'Статус', key: 'status'},
  {title: 'Действия', key: 'actions', align: "center"},
])
const items_length = ref(0)

async function load_applications({page, itemsPerPage, sortBy}) {
  loading.value = true
  try {
    student_relocation_applications_match.value = await $fetch(`/api/student_relocation_applications_match/sent_applications_by_user`, {
      method: 'POST',
      body: {relocation_id: route.params.id, page, itemsPerPage, sortBy},
    });
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
    items_length.value = student_relocation_applications_match.value[student_relocation_applications_match.value.length - 1].count
    student_relocation_applications_match.value = student_relocation_applications_match.value.slice(0, -1)
  }
}

const get_address = (address: StudentAccommodationAddresses) => {
  const parts = [
    address.city,
    address.street,
    address.building_number,
    address.corpus
  ].filter(Boolean);
  return parts.join(',');
}

const get_status = (status: string) => {
  switch (status) {
    case 'sent':
      return 'Отправлено, ожидание принятия'
    case 'approved':
      return 'Принято'
    case 'rejected':
      return 'Пользователь принял другую заявку или отклонил вам'
    case 'canceled':
      return 'Вы отменили заявку'
    default:
      return 'Неизвестно'
  }
}

async function cancel_application_match(id: number) {
  try {
    await $fetch(`/api/student_relocation_applications_match/cancel_by_user`, {
      method: 'POST',
      body: {student_relocation_applications_match_id:id, relocation_id: route.params.id},
    });
    await load_applications({page: 1, itemsPerPage: 5, sortBy: []})
  } catch (error) {
    console.error(error)
  }
}
</script>
<style scoped>

</style>