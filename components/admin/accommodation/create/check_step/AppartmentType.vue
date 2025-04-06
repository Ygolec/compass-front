<template>
  <v-card class="mx-auto pa-4" max-width="600">
    <v-card-title class="text-h6">
      Иерархия общежития
    </v-card-title>

    <v-list v-model:opened="openedGroups" density="comfortable">
      <v-list-item
          prepend-icon="mdi-home"
      >
        <v-list-item-title>
          Общежитие: <strong>{{ acc.find(item => item.id === props.data.selectedAccommodation.accommodation_id)?.name || 'Не выбрано' }}</strong><br/>
          Адрес: <strong>{{ acc.find(item => item.id === props.data.selectedAccommodation.accommodation_id)?.addresses.find(item => item.id === props.data.selectedAccommodation.address_id)?.city || 'Не выбрано' }}, {{ acc.find(item => item.id === props.data.selectedAccommodation.accommodation_id)?.addresses.find(item => item.id === props.data.selectedAccommodation.address_id)?.street || 'Не выбрано' }}, {{ acc.find(item => item.id === props.data.selectedAccommodation.accommodation_id)?.addresses.find(item => item.id === props.data.selectedAccommodation.address_id)?.building_number || 'Не выбрано' }}</strong>
        </v-list-item-title>
      </v-list-item>

      <v-list-group
          v-for="(floor, floorIndex) in props.data.contentOfAccommodations.floors"
          :key="floor.number"
          :value="floor.number"
      >
        <template #activator="{ props }">
          <VListItem
              v-bind="props"
              :title="`Этаж ${floor.number} (квартир: ${floor.number_of_apartments})`"
              prepend-icon="mdi-city"
          />
        </template>

        <v-list-group
            v-for="(apartment, aptIndex) in floor.apartments"
            :key="floor.number+' '+apartment.number"
            :value="floor.number+' '+apartment.number"
        >
          <template #activator="{ props }">
            <v-list-item
                v-bind="props"
                :title="`Квартира №${apartment.number} (комнат: ${apartment.number_of_rooms}, пол: ${apartment.gender})`"
                prepend-icon="mdi-home-group"
            />
          </template>

          <v-list-item
              v-for="(room, roomIndex) in apartment.rooms"
              :key="floor.number+' '+apartment.number+' '+room.room_number"
              :title="`Комната №${room.room_number} (макс. чел. = ${room.max_capacity})`"
              prepend-icon="mdi-bed"
          />
        </v-list-group>
      </v-list-group>
    </v-list>
  </v-card>
</template>
<script setup lang="ts">
const openedGroups = ref([]);
const props = defineProps<{
  data: {
    selectedAccommodation: {
      accommodation_id: string | null,
      address_id: string | null,
    },
    contentOfAccommodations: {
      floors: {
        number: number,
        number_of_apartments: number,
        apartments: {
          number: number,
          gender: string,
          number_of_rooms: number,
          rooms: {
            max_capacity: number,
            room_number: number
          }[]
        }[]
      }[]
    }
  },
  acc:student_accommodations_with_addresses[]
}>();
watch(
    () => props.data.contentOfAccommodations.floors,
    (floors) => {
      openedGroups.value = floors.flatMap(floor => [
        floor.number,
        ...floor.apartments.map(apartment => `${floor.number} ${apartment.number}`)
      ]);
    },
    {deep: true, immediate: true}
);

</script>
<style scoped>

</style>