<template>
  <v-main class="bg-grey-lighten-3" height="100%">
    <v-container>
      <v-row>
        <v-col cols="12">
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
                ></v-stepper-item>
              </v-stepper-header>
              <v-stepper-window>
                <SelectStep v-model:selected-accommodation="data.selectedAccommodation"/>
                <FillStep v-model:content-of-accommodations="data.contentOfAccommodations"/>
                <CheckStep v-model:data="data"/>
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
  }
})

async function send() {
  const response = await $fetch('/api/admin/accommodation/create', {
    method: 'POST',
    body: {
      ...data.value
    }
  });
  console.log(response);
  if (response.status === 'ok') {
    alert('Общежитие успешно создано');
  } else {
    alert('Ошибка при создании общежития');
  }
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
  if (step.value===3){
    // send();
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