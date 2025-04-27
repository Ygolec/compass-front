<template>
  <v-stepper-window-item
      :value="3"
  >
    <v-container>
      <AppartmentType
          v-if="data.selectedAccommodation.type_of_accommodation==='Квартирный' || data.selectedAccommodation.type_of_accommodation==='Блочный'"
          :data="data" :acc="acc"/>
      <CorridorType v-if="data.selectedAccommodation.type_of_accommodation==='Коридорный'" :data="data" :acc="acc"/>
      <CorridorBlockType v-if="data.selectedAccommodation.type_of_accommodation==='Блочно-коридорный'" :data="data" :acc="acc"/>
    </v-container>
  </v-stepper-window-item>
</template>
<script setup lang="ts">
import CorridorType from "~/components/admin/accommodation/create/check_step/CorridorType.vue";
import AppartmentType from "~/components/admin/accommodation/create/check_step/AppartmentType.vue";
import CorridorBlockType from "~/components/admin/accommodation/create/check_step/CorridorBlockType.vue";

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
      floors: {
        gender: string
        number: number
        number_of_rooms: number
        rooms: {
          max_capacity: number
          room_number: number
        }[]
      }[]
    },
    contentOfAccommodationsCorridorsBlock: {
      floors: {
        gender: string
        number: number
        number_of_rooms: number
        number_of_apartments: number
        apartments: {
          number: number
          gender: string
          number_of_rooms: number
          rooms: {
            max_capacity: number
            room_number: number
          }[]
        }[]
        rooms: {
          max_capacity: number
          room_number: number
        }[]
      }[]
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