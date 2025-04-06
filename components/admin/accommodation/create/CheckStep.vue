<template>
  <v-stepper-window-item
      :value="3"
  >
    <v-container>
      <AppartmentType
          v-if="data.selectedAccommodation.type_of_accommodation==='Квартирный' || data.selectedAccommodation.type_of_accommodation==='Блочный'"
          :data="data" :acc="acc"/>
      <CorridorType v-if="data.selectedAccommodation.type_of_accommodation==='Коридорный'" :data="data" :acc="acc"/>
    </v-container>
  </v-stepper-window-item>
</template>
<script setup lang="ts">
import CorridorType from "~/components/admin/accommodation/create/check_step/CorridorType.vue";
import AppartmentType from "~/components/admin/accommodation/create/check_step/AppartmentType.vue";

const props = defineProps<{
  data: {
    selectedAccommodation: {
      accommodation_id: string | null,
      address_id: string | null,
      type_of_accommodation: string ,
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
  }
}>();
const acc = ref<student_accommodations_with_addresses[]>([]);

onMounted(async () => {
  acc.value = await $fetch<student_accommodations_with_addresses[]>('/api/student_accommodation/list_of_accommodation');
})
</script>
<style scoped>

</style>