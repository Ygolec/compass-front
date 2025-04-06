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
      <template v-slot:append>
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
    <v-card>
      <v-card-text>
        <v-expansion-panels>
          <v-expansion-panel
              v-for="(floor, floorIndex) in contentOfAccommodations.floors"
              :key="floorIndex"
          >
            <v-expansion-panel-title>Этаж {{ floorIndex + 1 }}</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-number-input
                  label="Кол-во жилых квартир"
                  :min="0"
                  :max="30"
                  v-model="floor.number_of_apartments"
              >
              </v-number-input>
              <v-expansion-panels
              >
                <v-expansion-panel
                    v-for="(apartment, apartmentIndex) in floor.apartments"
                    :key="apartmentIndex"
                >
                  <v-expansion-panel-title>
                    Квартира {{ apartmentIndex + 1 }}
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row>
                      <v-col>
                        <v-text-field
                            label="Номер квартиры"
                            v-model="apartment.number"
                        ></v-text-field>
                      </v-col>
                      <v-col>
                        <v-number-input
                            label="Кол-во комнат"
                            :min="1"
                            :max="4"
                            v-model="apartment.number_of_rooms"
                        >
                        </v-number-input>
                      </v-col>
                      <v-col class="d-flex justify-center">
                        <v-row>
                          <v-col
                              class="py-0"
                              cols="12"
                              sm="6"
                          >
                            <p>Пол проживания</p>
                            <v-btn-toggle
                                variant="outlined"
                                v-model="apartment.gender"
                                divided
                            >
                              <v-btn
                                  v-for="(type, index) in ['М', 'Ж']"
                                  :key="index"
                                  :value="type"
                              >
                                {{ type }}
                              </v-btn>
                            </v-btn-toggle>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>

                    <v-expansion-panels
                        :model-value="Array.from({ length: apartment.rooms.length }, (_, i) => i)"
                        multiple
                    >
                      <v-row>
                        <v-col
                            v-for="(room, roomIndex) in apartment.rooms"
                            :key="roomIndex"
                            cols="12"
                            md="3"
                        >
                          <v-expansion-panel>

                            <v-expansion-panel-title>
                              Комната {{ roomIndex + 1 }}
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                              <v-number-input
                                  label="Максимальная вместимость"
                                  :min="1"
                                  :max="5"
                                  v-model="room.max_capacity"
                              >
                              </v-number-input>
                              <v-text-field
                                  label="Номер комнаты"
                                  v-model="room.room_number"
                              ></v-text-field>
                            </v-expansion-panel-text>

                          </v-expansion-panel>
                        </v-col>
                      </v-row>
                    </v-expansion-panels>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </v-stepper-window-item>
</template>
<script setup lang="ts">
const props = defineProps<{
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
  }
}>()
const slider = ref(1);

const emit = defineEmits<{
  (e: 'update:contentOfAccommodations', value: typeof props.contentOfAccommodations): void
}>()
const contentOfAccommodations = computed({
  get: () => props.contentOfAccommodations,
  set: (val) => {
    emit('update:contentOfAccommodations', val);
  }
});
function getNextApartmentNumber(floors: any[]): number {
  const lastFloor = floors[floors.length - 1];
  if (!lastFloor || lastFloor.apartments.length === 0) return 1;

  const lastApartment = lastFloor.apartments[lastFloor.apartments.length - 1];
  return Number(lastApartment.number) + 1;
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


watch(slider, (newVal) => {
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
});


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


</script>
<style scoped>

</style>