
<template>
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
</script>

<style scoped>

</style>