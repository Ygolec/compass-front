<template>
  <v-main class="bg-grey-lighten-3" height="100%">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-sheet rounded="lg">
            <v-row
                no-gutters
            >
              <v-col cols="6" v-for="card in cards" :key="card.id" class="pa-0 ma-0">
                <v-card
                    variant="outlined"
                    rounded="0"
                    :class="routeToCard(card.id)"
                    :href="card.href"
                >
                  <v-card-title>
                    <v-row>
                      <v-col cols="12">
                        <v-card-title class="text-h6">
                          {{ card.title }}
                        </v-card-title>
                      </v-col>
                    </v-row>
                  </v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12">
                        <v-card-text>
                          {{ card.text }}
                        </v-card-text>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
<script setup lang="ts">

const cards = [
  {id: 1, title: 'Заполнение общежития',text:'Наполните общежитие квартирами/комнатами для дальнейшего заселения и редактирования',href: '/admin/accommodation/create'},
  {id: 2, title: 'Распределение абитуриентов',text: 'Распределите абитуриентов по комнатам с учетом их интересов, чтобы они могли заселиться в общежитие',href: '/admin/allocation'},
  {id: 3, title: 'Выгрузка документов',text: 'Выгрузите документы для различных целей, таких как отчетность или предоставление информации',href: '/admin/relocation-files'},
];

function routeToCard(cardId: number) {
  if (cardId === 1) {
    return 'rounded-ts-lg';
  }
  if (cardId === 2) {
    return 'rounded-te-lg';
  }
  if (cardId%4===3){
    return 'rounded-bs-lg rounded-be-lg';
  }
  if (cardId % cards.length === cards.length-1) {
    return 'rounded-bs-lg';
  }
  if (cardId % cards.length === 0) {
    return 'rounded-be-lg';
  }
}

</script>
<style scoped>

</style>