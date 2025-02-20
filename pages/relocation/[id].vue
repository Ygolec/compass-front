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
                    <my_application/>
                  </v-tabs-window-item>
                  <v-tabs-window-item value="sent-application">
                    <sent_application/>
                  </v-tabs-window-item>
                  <v-tabs-window-item value="applications_to_me">
                    <applications_to_me/>
                  </v-tabs-window-item>
                  <v-tabs-window-item value="recommended-application">
                    <recommended_application/>
                  </v-tabs-window-item>
                  <v-tabs-window-item value="all-application">
                    <all_application/>
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
import My_application from "~/components/relocation/my_application.vue";
import Recommended_application from "~/components/relocation/recommended_application.vue";
import All_application from "~/components/relocation/all_application.vue";
import Sent_application from "~/components/relocation/sent_application.vue";
import Applications_to_me from "~/components/relocation/applications_to_me.vue";

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