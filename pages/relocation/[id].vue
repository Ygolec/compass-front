<template>
  <v-main class="bg-grey-lighten-3" height="100%">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-sheet rounded="lg">
            <v-card>
              <v-card-title>
                <span v-html="relocation?.name"></span>
              </v-card-title>
              <v-card-item>
                <v-tabs
                    v-model="tab"
                    align-tabs="center"
                    bg-color="blue"
                    color="black"
                >
                  <v-tab value="my-application">
                    <v-icon icon=""></v-icon>
                    Моя заявка
                  </v-tab>
                  <v-tab value="sent-application">
                    <v-icon icon=""></v-icon>
                    Отправленная заявка
                  </v-tab>
                  <v-tab value="applications_to_me">
                    <v-icon icon=""></v-icon>
                    Предложения
                  </v-tab>
                  <v-tab value="recommended-application">
                    <v-icon icon=""></v-icon>
                    Рекомендованные заявки
                  </v-tab>
                  <v-tab value="all-application">
                    <v-icon icon=""></v-icon>
                    Все заявки
                  </v-tab>
                </v-tabs>
                <v-tabs-window v-model="tab">
                  <v-tabs-window-item value="my-application">
                    <my-application/>
                  </v-tabs-window-item>
                  <v-tabs-window-item value="sent-application">
                    <sent-applications/>
                  </v-tabs-window-item>
                  <v-tabs-window-item value="applications_to_me">
                    <applications-to-me/>
                  </v-tabs-window-item>
                  <v-tabs-window-item value="recommended-application">
                    <recommended-applications/>
                  </v-tabs-window-item>
                  <v-tabs-window-item value="all-application">
                    <all-applications/>
                  </v-tabs-window-item>
                </v-tabs-window>
              </v-card-item>
            </v-card>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-main>

</template>
<script setup lang="ts">
import MyApplication from "~/components/relocation/MyApplication.vue";
import RecommendedApplications from "~/components/relocation/RecommendedApplications.vue";
import AllApplications from "~/components/relocation/AllApplications.vue";
import SentApplications from "~/components/relocation/SentApplications.vue";
import ApplicationsToMe from "~/components/relocation/ApplicationsToMe.vue";

const route = useRoute()
const tab = ref<string>('my-application')
const relocation = ref<student_relocation | null>(null)
onMounted(async () => {
  const result = await $fetch<student_relocation>(`/api/relocation/${route.params.id}`);
  if (result) {
    relocation.value = result[0];
  }
  console.log(relocation);
});
</script>
<style scoped>

</style>