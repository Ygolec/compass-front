<template>
  <v-card variant="flat"
          class="slider-with-news-and-guides">
    <v-card-title style="color: #dceeff">
      Новости и гайды
    </v-card-title>
    <v-slide-group
        show-arrows
        style="color: white"
    >
      <v-slide-group-item v-for="item in news">
        <v-card
            class="mx-auto ml-2 mr-2"
            color="surface-variant"
            image="https://cdn.vuetifyjs.com/docs/images/cards/dark-beach.jpg"
            min-width="300"
            max-width="540"
        >
          <v-card-subtitle style="color: #fff9">
            {{ item.date_created }}
          </v-card-subtitle>
          <v-card-title>
            {{ item.title }}
          </v-card-title>
          <template v-slot:actions>
            <v-btn
                append-icon="mdi-chevron-right"
                color="white"
                text="Просмотреть"
                variant="outlined"
                block
                :href="'/news/'+item.id"
            ></v-btn>
          </template>
        </v-card>
      </v-slide-group-item>
    </v-slide-group>
  </v-card>
</template>
<script setup lang="ts">

const news = ref([])
onMounted(async () => {
  news.value = await $fetch('/api/news/main')
  news.value = news.value.map((item: any) => {
    item.date_created = new Date(item.date_created).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    return item
  })
})
</script>
<style scoped>

</style>