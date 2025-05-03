<template>
  <v-dialog
      :model-value="dialog"
      @update:model-value="updateDialog"
      max-width="900"
  >
    <v-card v-if="resident">
      <v-card-title>
        Выберите студента для замены {{resident.firstname + ' ' + resident.lastname}} в комнату {{ roomId }}
      </v-card-title>
      <v-card-text>
        <v-autocomplete
            label="ФИО"
            v-model="search"
            :items="items"
            :item-title="item => `${item.last_name || ''} ${item.first_name || ''} ${item.middle_name || ''}`.trim()"
            :item-value="item => item.id"
            :loading="loading"
            hide-no-data
            hide-selected
            no-filter
            @update:search="searching"
        >
          <template v-slot:item="{ props, item }">
            <v-list-item
                v-bind="props"
                :key="item.raw.id"
            >
              <v-list-item-subtitle>
                Факультет: {{ item.raw.faculty_title }}, Программа {{ item.raw.program_title }}, Группа:
                {{ item.raw.study_group }}, Почта: {{ item.raw.email }}
              </v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-card-text>
      <v-card-actions>
        <v-btn
            :disabled="!search"
            @click="swapUsers(roomId, resident.user_id, search)"
        >
          Заменить
        </v-btn>
        <v-btn
            color="primary"
            @click="updateDialog(false)"
        >
          Закрыть
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import {ref} from "vue";

const props = defineProps<{
  dialog: boolean,
  room_id: number | null
  resident:{
    user_id: string,
    firstname: string,
    lastname: string,
  } | null
}>()
const loading = ref(false);
const search = ref('');

const items = ref<{
  id: string,
  first_name: string,
  last_name: string,
  middle_name: string,
  email: string,
  study_group: string,
  program_title: string,
  faculty_title: string,
}[]>([]);

const emit = defineEmits(['update:dialog','update:swapped'])

function updateDialog(value: boolean) {
  emit('update:dialog', value)
}

const roomId = computed({
  get: () => props.room_id,
  set: (val) => {
    emit('update:dialog', val)
  }
})

const fetchItems = async (query: string) => {
  try {
    loading.value = true;
    items.value = [];
    const response = await $fetch('/api/admin/allocation/search-by-name-for-swap', {
      method: 'POST',
      body: {
        q: query
      }
    });
    items.value = response?.success && Array.isArray(response?.data) ? response?.data : [];
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    items.value = [];
  } finally {
    loading.value = false;
  }
};

async function searching(searchQuery: string | null) {
  if (searchQuery && searchQuery.length >= 3) {
    // search.value = searchQuery || '';
    try {
      loading.value = true;
      await fetchItems(searchQuery);
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  }
}

async function swapUsers(roomId: number | null, user_from_id: string,user_to_id:string) {
  if (roomId && user_from_id && user_to_id) {
    try {
      const response = await $fetch('/api/admin/allocation/swap-person', {
        method: 'POST',
        body: {
          user_from_id: user_from_id,
          user_to_id: user_to_id,
          room_id: roomId,
        }
      });
      if (response?.success) {
        // handle success
        updateDialog(false);
        emit('update:swapped');
      } else if (response?.error) {
        // handle error
        console.error('Ошибка при добавлении студента в комнату:', response.error);
      } else {
        // handle error
      }
    } catch (error) {
      console.error('Ошибка при добавлении студента в комнату:', error);
    }
  }
}


</script>
<style scoped>

</style>