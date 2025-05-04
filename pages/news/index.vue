<template>
  <v-main class="bg-grey-lighten-3" height="100%">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-sheet rounded="lg">
            <v-card>
              <v-data-iterator
              :items="news"
              >
                <template v-slot:default="{ items }">
                  <v-container class="pa-2" fluid>
                    <v-row dense>
                      <v-col
                          v-for="item in items"
                          :key="item.title"
                          cols="auto"
                          md="4"
                      >
                        <v-card class="pb-3" border flat>
                          <v-img :src="item.raw.img"></v-img>

                          <v-list-item :subtitle="item.raw.subtitle" class="mb-2">
                            <template v-slot:title>
                              <strong class="text-h6 mb-2">{{ item.raw.title }}</strong>
                            </template>
                          </v-list-item>

                          <div class="d-flex justify-space-between px-4">
                            <div class="d-flex align-center text-caption text-medium-emphasis me-1">
                              <v-icon icon="mdi-clock" start></v-icon>

                              <div class="text-truncate">{{ item.raw.duration }}</div>
                            </div>

                            <v-btn
                                class="text-none"
                                size="small"
                                text="Read"
                                variant="flat"
                                border
                            >
                            </v-btn>
                          </div>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-container>
                </template>
              </v-data-iterator>
            </v-card>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
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