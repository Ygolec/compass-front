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
          v-for="(floor, floorIndex) in props.data.contentOfAccommodationsCorridors.floors"
          :key="floor.number"
          :value="floor.number"
      >
        <template #activator="{ props }">
          <VListItem
              v-bind="props"
              :title="`Этаж ${floor.number} (комнат: ${floor.number_of_rooms})`"
              prepend-icon="mdi-city"
          />
        </template>

        <v-list-item
            v-for="(room, roomIndex) in floor.rooms"
            :key="floor.number+' '+room.room_number+' '+room.room_number"
            :title="`Комната №${room.room_number} (макс. чел. = ${room.max_capacity})`"
            prepend-icon="mdi-bed"
        />

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
    },
    contentOfAccommodationsCorridors: {
      floors: [
        {
          gender: "М",
          number: 1,
          number_of_rooms: 1,
          rooms: [
            {
              max_capacity: 1,
              room_number: 1
            }
          ]
        }
      ]
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