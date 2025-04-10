<template>
  <v-main class="bg-grey-lighten-3" height="100%">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-sheet rounded="lg">
            <v-card>
              <v-card-title>
                Распределение по общежитиям
              </v-card-title>
              <v-card-text>
                <v-select
                    label="Выберите общежитие"
                    :items="acc"
                    :item-title="item => item.name"
                    :item-value="item => item.id"
                    v-model="selectedAccommodation.accommodation_id"
                    :rules="[required]"
                />
                <v-select
                    label="Выберите адрес общежития"
                    :disabled="!selectedAccommodation.accommodation_id"
                    :items="getAccommodationAddress(selectedAccommodation.accommodation_id)"
                    :item-value="item => item.id"
                    :item-title="item => `${item.city}, ${item.street}, ${item.building_number}`"
                    v-model="selectedAccommodation.address_id"
                    :rules="[required]"
                />
                <v-select
                    label="Выберите этаж"
                    :items="floors"
                    :disabled="!selectedAccommodation.address_id"
                    :item-title="item => `Этаж: ${item.floor_number}`"
                    :item-value="item => item.floor_id"
                    v-model="selectedAccommodation.floor_id"
                >
                  <template v-slot:item="{ props: itemProps, item }">
                    <v-list-item v-bind="itemProps">
                      <v-list-item-subtitle>
                        Кол-во квартир: {{ item.raw.apartments_count }}, Кол-во комнат: {{ item.raw.rooms_count }},
                        Кол-во
                        свободных мест: {{ item.raw.free_places }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-select>
                <v-select
                    label="Выберите квартиру"
                    :disabled="!selectedAccommodation.floor_id"
                    :items="apartments"
                    :item-title="item => `Квартира: ${item.number}`"
                    :item-value="item => item.id"
                    v-model="selectedAccommodation.apartment_id"
                >
                  <template v-slot:item="{ props: itemProps, item }">
                    <v-list-item v-bind="itemProps">
                      <v-list-item-subtitle>
                        Кол-во комнат: {{ item.raw.number_of_rooms }}, Пол проживания: {{ item.raw.gender }}, Кол-во
                        свободных мест: {{ item.raw.free_slots }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-select>
                <v-select
                    label="Выберите комнату"
                    :items="rooms"
                    :disabled="!selectedAccommodation.apartment_id"
                    :item-title="item => `Комната: ${item.room_number}`"
                    :item-value="item => item.id"
                    v-model="selectedAccommodation.room_id"
                >
                  <template v-slot:item="{ props: itemProps, item }">
                    <v-list-item v-bind="itemProps">
                      <v-list-item-subtitle>
                        Макс. кол-во мест : {{ item.raw.max_capacity }}, Кол-во
                        свободных мест: {{ item.raw.free_places }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-select>
                <v-card v-if="selectedAccommodation.room_id">
                  <v-card-title>
                    Состав комнаты
                  </v-card-title>
                  <v-card-text>
                    <v-card v-for="resident in roomsInfo.residents">
                      <v-card-title>
                        {{ resident.firstname }} {{ resident.lastname }}
                      </v-card-title>
                      <v-card-text>
                        Группа: {{ resident.study_group }}, Начало проживания: {{ resident.start_date }}
                      </v-card-text>
                      <v-card-actions>
                        <v-btn>
                          Заменить
                        </v-btn>
                        <v-btn>
                          Отвязать
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                    <v-btn class="mt-2" block>Добавить человека вручную</v-btn>
                    <v-btn class="mt-2" block>Сформировать группу для этой комнаты</v-btn>
                  </v-card-text>
                </v-card>
              </v-card-text>
            </v-card>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
<script setup lang="ts">
const acc = ref<student_accommodations_with_addresses[]>([]);


const selectedAccommodation = ref({
  accommodation_id: null,
  address_id: null,
  type_of_accommodation: null,
  floor_id: null,
  apartment_id: null,
  room_id: null
})

const floors = ref([])
const apartments = ref([])
const rooms = ref([])
const roomsInfo = ref([])
const getAccommodationAddress = (id: string | null) => {
  return acc.value.find(acc => acc.id === id)?.addresses || [];
};

watch(
    () => [selectedAccommodation.value.accommodation_id, selectedAccommodation.value.address_id],
    ([accommodationId, addressId]) => {
      if (accommodationId && addressId) {
        fetchDataFromServer(accommodationId, addressId);
      }
    }
);
onMounted(async () => {
  acc.value = await $fetch<student_accommodations_with_addresses[]>('/api/student_accommodation/list_of_accommodation');
})

const fetchDataFromServer = async (accommodationId: string, addressId: string) => {
  try {
    floors.value = await $fetch(`/api/admin/allocation/floor_with_accommodation?accommodation_id=${accommodationId}&address_id=${addressId}`);
  } catch (error) {
    console.error('Ошибка при получении данных с сервера:', error);
  }
};


const fetchApartments = async (floor_id: string) => {
  try {
    apartments.value = await $fetch(`/api/admin/allocation/apartment_with_rooms?floor_id=${floor_id}`);
  } catch (error) {
    console.error('Ошибка при получении данных с сервера:', error);
  }
};
const fetchRooms = async (apartment_id: string) => {
  try {
    rooms.value = await $fetch(`/api/admin/allocation/rooms_by_apartment?apartment_id=${apartment_id}`);
  } catch (error) {
    console.error('Ошибка при получении данных с сервера:', error);
  }
};
const fetchInfoAboutRoom = async (room_id: string) => {
  try {
    roomsInfo.value = await $fetch(`/api/admin/allocation/room-info?room_id=${room_id}`);
  } catch (error) {
    console.error('Ошибка при получении данных с сервера:', error);
  }
};

watch(
    () => selectedAccommodation.value.accommodation_id,
    () => {
      selectedAccommodation.value.address_id = null;
      selectedAccommodation.value.floor_id = null;
      selectedAccommodation.value.apartment_id = null;
      selectedAccommodation.value.room_id = null;
      floors.value = [];
      apartments.value = [];
      rooms.value = [];
      roomsInfo.value = [];
    }
);

watch(
    () => selectedAccommodation.value.floor_id,
    () => {
      if (selectedAccommodation.value.floor_id)
        fetchApartments(selectedAccommodation.value.floor_id)
    }
);
watch(
    () => selectedAccommodation.value.apartment_id,
    () => {
      if (selectedAccommodation.value.apartment_id)
        fetchRooms(selectedAccommodation.value.apartment_id)
    }
);
watch(
    () => selectedAccommodation.value.room_id,
    () => {
      if (selectedAccommodation.value.room_id)
        fetchInfoAboutRoom(selectedAccommodation.value.room_id)
    }
);
</script>
<style scoped>

</style>