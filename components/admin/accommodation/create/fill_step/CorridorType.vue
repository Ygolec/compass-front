<template>
  <v-card>
    <v-card-text>
      <v-expansion-panels>
        <v-expansion-panel
            v-for="(floor, floorIndex) in contentOfAccommodationsCorridors.floors"
            :key="floorIndex"
        >
          <v-expansion-panel-title>Этаж {{ floorIndex + 1 }}</v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row>
              <v-col
                  class="mb-2"
                  cols="12"
                  sm="6"
              >
                <p>Пол проживания</p>
                <v-btn-toggle
                    variant="outlined"
                    v-model="floor.gender"
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
            <v-number-input
                label="Кол-во жилых комнат"
                :min="0"
                :max="20"
                v-model="floor.number_of_rooms"
            >
            </v-number-input>
            <v-expansion-panels
            >
              <v-expansion-panel
                  v-for="(room, roomIndex) in floor.rooms"
                  :key="roomIndex"
              >
                <v-expansion-panel-title>
                  Комната {{ roomIndex + 1 }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row>
                    <v-col>
                      <v-text-field
                          label="Номер комнаты"
                          v-model="room.room_number"
                      ></v-text-field>
                    </v-col>
                    <v-col>
                      <v-number-input
                          label="Кол-во мест"
                          :min="1"
                          :max="4"
                          v-model="room.max_capacity"
                      >
                      </v-number-input>
                    </v-col>
                  </v-row>
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


</script>

<style scoped>

</style>