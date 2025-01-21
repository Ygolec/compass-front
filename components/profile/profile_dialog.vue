<template>
  <v-dialog
      :model-value="dialog"
      @update:model-value="update_dialog"
      max-width="500"
  >
    <v-card
        class="mx-auto my-auto"
        min-width="500"
    >
      <v-form @submit.prevent="handle_submit">
        <v-card-title>Пользовательские данные</v-card-title>
        <v-card-text>
          <v-autocomplete
              label="ФИО"
              v-model="search"
              :items="items"
              :item-title="item => item.full_name"
              :item-value="item => item.email"
              :loading="loading"
              hide-no-data
              hide-selected
              no-filter
              @update:search="searching"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                  v-bind="props"
                  :key="item.raw.email"
                  :subtitle="item.raw.description"
                  :title="item.raw.full_name"
              ></v-list-item>
            </template>
          </v-autocomplete>
          <div>
            <v-text-field
                v-model="profile.first_name"
                label="Имя">
            </v-text-field>
            <v-text-field
                v-model="profile.last_name"
                label="Фамилия">
            </v-text-field>
            <v-text-field
                v-model="profile.middle_name"
                label="Отчество">
            </v-text-field>
            <v-text-field
                v-model="profile.education_email"
                label="Учебная почта">
            </v-text-field>
            <v-text-field
                v-model="profile.group"
                label="Группа">
            </v-text-field>
            <v-text-field
                v-model="profile.program_title"
                label="Название программы">
            </v-text-field>
            <v-text-field
                v-model="profile.faculty_title"
                label="Факультет">
            </v-text-field>
            <v-text-field
                v-model="profile.degree_level"
                label="Степень">
            </v-text-field>
          </div>
        </v-card-text>
      </v-form>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import {ref, watch} from 'vue';


const props = defineProps({
  dialog: Boolean,
});
const emit = defineEmits(["update:dialog"]);


const search = ref('');
const loading = ref(false);
const items = ref<{
  id: string,
  full_name: string,
  email: string,
  has_phone: boolean,
  type: string,
  description: string,
  avatar_url?: string
}[]>([]);

const profile = ref<{
  first_name: string,
  last_name: string,
  middle_name: string,
  education_email: string,
  group: string,
  program_title: string,
  faculty_title: string,
  degree_level: string,
}>({
  first_name: '',
  last_name: '',
  middle_name: '',
  education_email: '',
  group: '',
  program_title: '',
  faculty_title: '',
  degree_level: '',
});

const fetchItems = async (query: string) => {
  try {
    loading.value = true;
    items.value = [];
    const response = await $fetch('/api/hse_api/search_by_name', {
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


const handle_submit = () => {
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

async function search_by_email(email: string) {
  try {
    loading.value = true;
    const response = await $fetch('/api/hse_api/search_by_email', {
      method: 'POST',
      body: {
        email
      }
    });

    if (response?.success) {
      profile.value.group = response?.data?.education[0]?.group_title || '';
      profile.value.program_title = response?.data?.education[0]?.program_title || '';
      profile.value.faculty_title = response?.data?.education[0]?.faculty_title || '';
      profile.value.degree_level = response?.data?.education[0]?.degree_level || '';
      profile.value.education_email = response?.data?.email || '';
      profile.value.first_name = response?.data?.names.first_name || '';
      profile.value.last_name = response?.data?.names.last_name || '';
      profile.value.middle_name = response?.data?.names.middle_name || '';
    }
console.log(response)
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    items.value = [];
  } finally {
    loading.value = false;
  }
}

watch((search), (newVal) => {
  if (newVal) {
    search_by_email(newVal);
  }
}, {immediate: true});

const update_dialog = (value: boolean) => {
  emit('update:dialog', value);
};


</script>
<style scoped>

</style>