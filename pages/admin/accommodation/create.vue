<template>
  <v-main class="bg-grey-lighten-3" height="100%">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-breadcrumbs>
            <v-breadcrumbs-item
            href="/admin"
            title="Панель администрирования"
            />
            <v-breadcrumbs-divider/>
            <v-breadcrumbs-item
            href="/admin/accommodation/create"
            title="Заполнение общежития"
            :disabled="true"
            />
          </v-breadcrumbs>
          <v-sheet rounded="lg">
            <v-stepper v-model="step">
              <v-stepper-header>
                <v-stepper-item
                    title="Выбор общежития"
                    :value="1"
                    complete
                ></v-stepper-item>
                <v-divider></v-divider>
                <v-stepper-item
                    title="Заполнение общежития"
                    :value="2"
                ></v-stepper-item>
                <v-divider></v-divider>
                <v-stepper-item
                    title="Проверка данных"
                    :value="3"
                ></v-stepper-item>
                <v-divider></v-divider>
                <v-stepper-item
                    title="Готово"
                    :value="4"
                >
                </v-stepper-item>
              </v-stepper-header>
              <v-stepper-window>
                <SelectStep v-model:selected-accommodation="data.selectedAccommodation"/>
                <FillStep v-model:content-of-accommodations="data.contentOfAccommodations"
                          :accommodations-type="data.selectedAccommodation.type_of_accommodation"
                          v-model:content-of-accommodations-corridors="data.contentOfAccommodationsCorridors"
                          v-model:content-of-accommodations-corridors-block="data.contentOfAccommodationsCorridorsBlock"/>
                <CheckStep v-model:data="data"/>
                <v-stepper-window-item
                :value="4"
                >
                  <v-empty-state icon="$success">
                    <template v-slot:media>
                      <v-icon color="green"></v-icon>
                    </template>

                    <template v-slot:headline>
                      <div class="text-h4">
                        Общежитие было заполнено
                      </div>
                    </template>

                    <template v-slot:title>
                      <div class="text-h6">
                        Можете переходить к распределению студентов
                      </div>
                    </template>

                    <template v-slot:text>
                      <div class="text-medium-emphasis text-caption">
                       <v-btn
                           prepend-icon="mdi-arrow-left"
                       href="/admin"
                       >Вернуться к админ панели</v-btn>
                      </div>
                    </template>
                  </v-empty-state>
                </v-stepper-window-item>
              </v-stepper-window>
              <v-stepper-actions
                  :disabled="disabled()"
                  @click:next="nextStep"
                  @click:prev="step--"
                  :next-text="step === 3 ? 'Заполнить' : (step < 3 ? 'Далее' : '')"
                  prev-text="Назад"
              >
              </v-stepper-actions>
            </v-stepper>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
<script setup lang="ts">
import SelectStep from "~/components/admin/accommodation/create/SelectStep.vue";
import FillStep from "~/components/admin/accommodation/create/FillStep.vue";
import CheckStep from "~/components/admin/accommodation/create/CheckStep.vue";

const step = ref(1);
const data = ref({
  selectedAccommodation: {
    accommodation_id: null,
    address_id: null,
    type_of_accommodation: ''
  },
  contentOfAccommodations: {
    floors: [
      {
        number: 1,
        number_of_apartments: 1,
        apartments: [
          {
            number: 1,
            gender: "М",
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
    ]
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
  },
  contentOfAccommodationsCorridorsBlock: {
    floors: [
      {
        gender: "М",
        number: 1,
        number_of_rooms: 1,
        number_of_apartments: 1,
        rooms: [
          {
            max_capacity: 1,
            room_number: 1
          }
        ],
        apartments: [
          {
            number: 1,
            gender: "М",
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
    ]
  }
})

async function send() {
  const response = await $fetch('/api/admin/accommodation/create', {
    method: 'POST',
    body: {
      ...data.value
    }
  });
}

function isAccommodationSelected() {
  return data.value.selectedAccommodation.accommodation_id !== null && data.value.selectedAccommodation.address_id !== null;
}

function isContentFilled() {
  return data.value.contentOfAccommodations.floors.length > 0;
}

function nextStep() {
  if (step.value === 1 && !isAccommodationSelected()) {
    return;
  }
  if (step.value === 2 && !isContentFilled()) {
    return;
  }
  if (step.value === 3) {
    send();
    step.value++;
    return;
  }
  if (step.value === 4) {
    return;
  }
  step.value++;
}

function disabled() {
  return step.value === 1 || step.value === 4 ? 'prev' : step.value === 4 ? 'next' : undefined;
}
</script>
<style scoped>

</style>