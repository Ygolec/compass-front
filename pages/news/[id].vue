<template>
  <v-main class="bg-grey-lighten-3" height="100%">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-breadcrumbs>
            <v-breadcrumbs-item
                href="/news"
                title="Новости"
            />
            <v-breadcrumbs-divider/>
            <v-breadcrumbs-item
                v-if="news?.title"
                href=""
                :title="news?.title"
                :disabled="true"
            />
          </v-breadcrumbs>
          <v-sheet rounded="lg">
            <v-card
            >
              <v-card-title class="text-h6">
                {{ news?.title }}
              </v-card-title>
              <v-card-text>
                <v-card-text v-html="news?.description">
                </v-card-text>
              </v-card-text>
            </v-card>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
<script setup lang="ts">
const news = ref()
const route = useRoute()
onMounted(async () => {
  news.value = await $fetch('/api/news/' + route.params.id)
})
</script>
<style scoped>

</style>