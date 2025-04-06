<template>
  <v-stepper-window-item
      :value="2"
  >
    <v-slider
        label="Кол-во этажей"
        v-model="slider"
        :max="30"
        :min="1"
        step="1"
        class="align-center"
        hide-details
    >
      <template v-slot:prepend>
        <v-tooltip
            location="top"
        >
          <template v-slot:activator="{ props }">
            <v-btn
                variant="text"
                icon
                v-bind="props"
            >
              <v-icon>
                mdi-help
              </v-icon>
            </v-btn>
          </template>
          <span>Если хотите, чтобы номера квартир наследовались от последней квартиры, добавляйте этажи последовательно.</span>
        </v-tooltip>
        <v-btn
            icon="mdi-minus"
            size="small"
            variant="text"
            @click="decrement"
        ></v-btn>
      </template>
      <template v-slot:append>
        <v-btn
            icon="mdi-plus"
            size="small"
            variant="text"
            @click="increment"
        ></v-btn>
        <v-text-field
            v-model="slider"
            density="compact"
            style="width: 70px"
            type="number"
            hide-details
            single-line
        ></v-text-field>
      </template>
    </v-slider>
    <ApartmentType v-if="accommodationsType==='Квартирный' || accommodationsType==='Блочный'" :content-of-accommodations="contentOfAccommodations"/>
    <CorridorType v-if="accommodationsType==='Коридорный'"
                  :content-of-accommodations-corridors="contentOfAccommodationsCorridors"/>
  </v-stepper-window-item>
</template>
<script setup lang="ts">
import ApartmentType from "~/components/admin/accommodation/create/fill_step/ApartmentType.vue";
import CorridorType from "~/components/admin/accommodation/create/fill_step/CorridorType.vue";


const props = defineProps<{
  accommodationsType: string,
  contentOfAccommodations: {
    floors: {
      number: number
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
  }
}>()
const slider = ref(1);

const emit = defineEmits<{
  (e: 'update:contentOfAccommodations', value: typeof props.contentOfAccommodations): void
  (e: 'update:contentOfAccommodationsCorridors', value: typeof props.contentOfAccommodationsCorridors): void
}>()
const contentOfAccommodations = computed({
  get: () => props.contentOfAccommodations,
  set: (val) => {
    emit('update:contentOfAccommodations', val);
  }
});
const contentOfAccommodationsCorridors = computed({
  get: () => props.contentOfAccommodationsCorridors,
  set: (val) => {
    emit('update:contentOfAccommodationsCorridors', val);
  }
});

function getNextApartmentNumber(floors: any[]): number {
  const lastFloor = floors[floors.length - 1];
  if (!lastFloor || lastFloor.apartments.length === 0) return 1;

  const lastApartment = lastFloor.apartments[lastFloor.apartments.length - 1];
  return Number(lastApartment.number) + 1;
}

function getNextRoomNumber(floors: any[]): number {
  const lastFloor = floors[floors.length - 1];
  if (!lastFloor || lastFloor.rooms.length === 0) return 1;

  const lastRoom = lastFloor.rooms[lastFloor.rooms.length - 1];
  return Number(lastRoom.room_number) + 1;
}

function generateApartments(count: number, startFrom: number) {
  const apartments = [];
  for (let i = 0; i < count; i++) {
    apartments.push({
      number: startFrom + i,
      gender: 'М',
      number_of_rooms: 1,
      rooms: [
        {
          max_capacity: 1,
          room_number: 1,
        }
      ]
    });
  }
  return apartments;
}

function generateRooms(count: number, startFrom: number) {
  const rooms = [];
  for (let i = 0; i < count; i++) {
    rooms.push({
      room_number: startFrom + i,
      max_capacity: 1,
    });
  }
  return rooms;
}


watch(slider, (newVal) => {
  if (props.accommodationsType === 'Квартирный' || props.accommodationsType === 'Блочный') {
    const floors = contentOfAccommodations.value.floors;
    const currentLength = floors.length;
    if (newVal > currentLength) {
      for (let i = currentLength; i < newVal; i++) {
        const nextApartmentNumber = getNextApartmentNumber(floors);

        floors.push({
          number: i + 1,
          number_of_apartments: 1,
          apartments: [
            {
              number: nextApartmentNumber,
              gender: 'М',
              number_of_rooms: 1,
              rooms: [
                {
                  max_capacity: 1,
                  room_number: 1,
                }
              ]
            }
          ]
        });
      }
    } else if (newVal < currentLength) {
      floors.splice(newVal);
    }
  }
  if (props.accommodationsType === 'Коридорный') {
    const floors = contentOfAccommodationsCorridors.value.floors;
    const currentLength = floors.length;
    if (newVal > currentLength) {
      for (let i = currentLength; i < newVal; i++) {
        const nextRoomNumber = getNextRoomNumber(floors);
        floors.push({
          number: i + 1,
          number_of_rooms: 1,
          gender: 'М',
          rooms: [
            {
              room_number: nextRoomNumber,
              max_capacity: 1
            }
          ]
        });
      }
    } else if (newVal < currentLength) {
      floors.splice(newVal);
    }
  }

});


watch(
    () => contentOfAccommodationsCorridors.value.floors,
    (floors) => {
      floors.forEach((floor, floorIndex) => {
        watch(
            () => floor.number_of_rooms,
            (newVal) => {
              const currentLength = floor.rooms.length;
              if (newVal > currentLength) {
                const lastNumber = currentLength
                    ? Number(floor.rooms[currentLength - 1].room_number)
                    : Number(floor.rooms[0]?.room_number) || 1;

                const newRooms = generateRooms(
                    newVal - currentLength,
                    lastNumber + 1
                );
                floor.rooms.push(...newRooms);
              } else if (newVal < currentLength) {
                floor.rooms.splice(newVal);
              }
            },
            {immediate: true}
        );

      });
    },
    {deep: true, immediate: true}
);

watch(
    () => contentOfAccommodations.value.floors,
    (floors) => {
      floors.forEach((floor, floorIndex) => {
        watch(
            () => floor.number_of_apartments,
            (newVal) => {
              const currentLength = floor.apartments.length;
              if (newVal > currentLength) {
                const lastNumber = currentLength
                    ? Number(floor.apartments[currentLength - 1].number)
                    : Number(floor.apartments[0]?.number) || 1;

                const newApartments = generateApartments(
                    newVal - currentLength,
                    lastNumber + 1
                );
                floor.apartments.push(...newApartments);
              } else if (newVal < currentLength) {
                floor.apartments.splice(newVal);
              }
            },
            {immediate: true}
        );

        // Для каждой квартиры следим за количеством комнат
        floor.apartments.forEach((apartment, apartmentIndex) => {
          watch(
              () => apartment.number_of_rooms,
              (newVal) => {
                const currentLength = apartment.rooms.length;
                if (newVal > currentLength) {
                  for (let i = currentLength; i < newVal; i++) {
                    apartment.rooms.push({
                      max_capacity: 1,
                      room_number: i + 1,
                    });
                  }
                } else if (newVal < currentLength) {
                  apartment.rooms.splice(newVal);
                }
              },
              {immediate: true}
          );
        });
      });
    },
    {deep: true, immediate: true}
);

function decrement() {
  if (slider.value > 1) {
    slider.value--;
  }
}

function increment() {
  if (slider.value < 30) {
    slider.value++;
  }
}
</script>
<style scoped>

</style>