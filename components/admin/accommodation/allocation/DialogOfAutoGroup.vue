<template>
  <v-dialog
      :model-value="dialog"
      @update:model-value="updateDialog"
      max-width="900"
  >
    <v-card>
      <v-card-title>
        Рекомендации по заполнению комнаты
      </v-card-title>
      <v-card-text>
        <v-switch label="Заполнять иностранцев?" v-model="isForeign" inset/>
        <p>Вариант рекомендации</p>
        <v-btn-toggle
            v-model="toggle"
            divided
            class="mb-3"
        >
          <v-btn >Вариант 1</v-btn>
          <v-btn >Вариант 2</v-btn>
        </v-btn-toggle>
        <v-card>
          <v-card-title>Рекомендованная группа</v-card-title>
          <v-card-text>
            <v-progress-linear
                v-if="loading"
                indeterminate
                color="primary"
                class="mb-3"
            ></v-progress-linear>

            <div v-else>
              <v-card v-for="recommendation in recommendations" class="mb-2">
                <v-card-title>
                  {{ recommendation.user_id.first_name }} {{ recommendation.user_id.last_name }}
                </v-card-title>
                <v-card-text>
                  Группа: {{ recommendation.user_id.study_group }}, Почта: {{ recommendation.user_id.email }}
                </v-card-text>
                <v-card-actions>
                  <v-btn
                      @click="seeQuestionnaire(recommendation.id)"
                  >
                    Просмотреть анкету
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn
                @click="fillRoom()"
            >
              Заполнить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-card-text>
      <v-card-actions>
        <v-btn
            color="primary"
            @click="updateDialog(false)"
        >
          Закрыть
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <DialogOfQuestionnaire :dialog="dialogOfQuestionnaire" v-model:questionnaire_id="questionnaire_id"
                         @update:dialog="dialogOfQuestionnaire = $event"/>
</template>
<script setup lang="ts">
import DialogOfQuestionnaire from "~/components/admin/accommodation/allocation/DialogOfQuestionnaire.vue";

const toggle = ref(0);
const props = defineProps<{
  dialog: boolean,
  room_id: number | null
}>()
const isForeign = ref(false)
const questionnaire_id = ref<number | null>(null)
const recommendations = ref<{
  user_id: { first_name: string; last_name: string; study_group: string; email: string }
}[]>([])
const dialogOfQuestionnaire = ref(false)
const loading = ref(false)
const emit = defineEmits(['update:dialog','filled'])


function seeQuestionnaire(id: number) {
  questionnaire_id.value = id
  dialogOfQuestionnaire.value = true
}

function updateDialog(value: boolean) {
  emit('update:dialog', value)
}

const roomId = computed({
  get: () => props.room_id,
  set: (val) => {
    emit('update:dialog', val)
  }
})

async function getRecommendations() {
  if (roomId.value != null) {
    loading.value = true
    try {
      recommendations.value = await $fetch('/api/admin/allocation/recommendation_for_room?room_id=' + roomId.value + '&is_foreign=' + isForeign.value + '&variant=' + toggle.value, {
        method: 'GET',
      });
    } catch (error) {
      console.error('Ошибка при получении рекомендаций:', error);
    } finally {
      loading.value = false
    }
  }
}

async function fillRoom() {
  if (recommendations.value.length){
    await $fetch('/api/admin/allocation/fill-room-by-recommendation', {
      method: 'POST',
      body: {
        room_id: roomId.value,
        recommendations: recommendations.value,
      }
    })
    emit('filled')
    emit('update:dialog', false)
  }
}

watch(roomId, async (value) => {
  if (value != null) {
    await getRecommendations()
  }
}, {immediate: true})

watch(() => props.dialog, async (isOpen) => {
  if (isOpen && props.room_id != null) {
    await getRecommendations()
  }
});

watch(isForeign, async () => {
  if (roomId.value != null) {
    await getRecommendations()
  }
}, {
  immediate: true
})

watch(toggle, async () => {
  if (roomId.value != null) {
    await getRecommendations()
  }
}, {
  immediate: true
})
</script>
<style scoped>

</style>