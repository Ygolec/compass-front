<template>
  <v-dialog
      :model-value="dialog"
      @update:model-value="updateDialog"
      max-width="800"
  >
    <v-card v-if="studentRelocationApplication">
      <v-card-title>
        Заявка на переселение
      </v-card-title>

      <v-card-text>
        <!-- Фотографии/карусель -->
        <v-carousel
            v-if="!hasPhotos"
            show-arrows="hower"
        >
          <v-empty-state
              headline="Изображения отсутствуют"
              title="У данной заявки не прикреплены изображения"
          />
        </v-carousel>

        <v-carousel
            v-else
            show-arrows="hower"
        >
          <v-carousel-item
              v-for="image in studentRelocationApplication.photos_of_room"
              :key="image.directus_files_id"
              :src="`https://directus.hse-compass.ru/assets/${image.directus_files_id}`"
          />
        </v-carousel>

        <v-divider class="my-3" />

        <!-- Блок с информацией об общежитии -->
        <v-card variant="outlined">
          <v-card-title>Об общежитии</v-card-title>
          <v-card-text>
            <v-col>
              <v-row>
                <v-col>
                  <v-text-field
                      variant="underlined"
                      label="Общежитие откуда"
                      v-model="studentRelocationApplication.student_accommodation_id_from.name"
                      hide-details
                      readonly
                  />
                </v-col>
                <v-col>
                  <v-text-field
                      variant="underlined"
                      label="Общежитие куда"
                      v-model="studentRelocationApplication.student_accommodation_id_to.name"
                      hide-details
                      readonly
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                      label="Адрес откуда"
                      variant="underlined"
                      :model-value="getAddress(studentRelocationApplication.student_accommodation_from_address_id)"
                      readonly
                  />
                </v-col>
                <v-col>
                  <v-text-field
                      label="Адрес куда"
                      variant="underlined"
                      :model-value="getAddress(studentRelocationApplication.student_accommodation_to_address_id)"
                      readonly
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                      prepend-icon="mdi-floor-plan"
                      label="Этаж"
                      variant="underlined"
                      v-model="studentRelocationApplication.floor"
                      readonly
                  />
                </v-col>
                <v-col>
                  <v-text-field
                      prepend-icon="mdi-account-group-outline"
                      label="Кол-во жильцов в комнате"
                      variant="underlined"
                      v-model="studentRelocationApplication.occupancy"
                      readonly
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-card-text>
        </v-card>

        <v-divider class="my-3" />

        <!-- Блок с контактной информацией -->
        <v-card variant="outlined">
          <v-card-title>Контактная информация</v-card-title>
          <v-card-text>
            <v-row>
              <v-col>
                <v-text-field
                    variant="underlined"
                    label="Имя"
                    v-model="studentRelocationApplication.user_created.first_name"
                    hide-details
                    readonly
                />
              </v-col>
              <v-col>
                <v-text-field
                    variant="underlined"
                    label="Почта"
                    v-model="studentRelocationApplication.user_created.email"
                    hide-details
                    readonly
                />
              </v-col>
              <v-col>
                <v-text-field
                    variant="underlined"
                    label="Телеграм"
                    v-model="studentRelocationApplication.telegram"
                    hide-details
                    readonly
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card-text>

      <!-- Кнопки внизу модалки -->
      <v-card-actions>
        <v-btn
            color="gray"
            variant="flat"
            @click="updateDialog(false)"
        >
          Закрыть
        </v-btn>

        <!-- Кнопка "Предложить переселение" будет выводиться только если showSubmitButton = true -->
        <v-btn
            v-if="showSubmitButton"
            variant="flat"
            color="green"
            @click="confirmDialog = true"
            :loading="confirmLoading"
        >
          Предложить переселение
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ConfirmDialog: подключаем только при необходимости -->
  <BaseConfirmDialog
      v-if="showSubmitButton"
      :dialog="confirmDialog"
      @update:dialog="confirmDialog = $event"
      :details="detailsConfirm"
      @confirm="sendApplication"
  />

  <!-- Snackbar: тоже опционально -->
  <BaseSnackbar
      v-if="showSubmitButton"
      @update:snackbar="snackbar = $event"
      :snackbar="snackbar"
      :details="snackbarDetails"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'


const props = defineProps<{
  dialog: boolean
  student_relocation_applications_id: number
  showSubmitButton?: boolean
}>()

const emit = defineEmits(['update:dialog'])

// Основные state-переменные
const studentRelocationApplication = ref<StudentRelocationApplicationDetails>()
const confirmDialog = ref(false)
const confirmLoading = ref(false)
const snackbar = ref(false)

// Детали для Snackbar (если нужно)
const snackbarDetails = ref<{
  text: string
  color: string
  timeout: number
  button_close_color: string
}>({
  text: '',
  color: '',
  timeout: 5000,
  button_close_color: 'green'
})

// Детали для ConfirmDialog (если нужно)
const detailsConfirm = ref({
  title: 'Предложить переселение',
  text: 'Вы уверены, что хотите предложить переселение?',
  button_confirm_text: 'Предложить',
  button_confirm_color: 'green'
})

// Следим за открытием/закрытием диалога
watch(
    () => props.dialog,
    (value) => {
      if (value) {
        fetchData()
      }
    }
)

// Функция закрытия диалога
function updateDialog(value: boolean) {
  emit('update:dialog', value)
}

// Подгрузка данных
async function fetchData() {
  try {
    studentRelocationApplication.value = await $fetch<
        StudentRelocationApplicationDetails
    >(`/api/student_relocation_applications/${props.student_relocation_applications_id}`)
  } catch (error) {
    console.error(error)
  }
}

// Отправка заявки (при нажатии "Предложить переселение")
async function sendApplication() {
  confirmLoading.value = true

  try {
    await $fetch(`/api/student_relocation_applications_match/create_match`, {
      method: 'POST',
      body: studentRelocationApplication.value
    })

    // Можно добавить логику вывода Snackbar по успешному созданию

  } catch (error: any) {
    if (error.response?._data?.message === 'User already have application') {
      snackbarDetails.value = {
        text: 'Вы уже отправили заявку, отмените её, чтобы создать новую',
        timeout: 5000,
        color: 'red',
        button_close_color: 'black'
      }
      snackbar.value = true
    }
    if (error.response?._data?.message === 'User have no application') {
      snackbarDetails.value = {
        text: 'У вас нет заявки на переселение, создайте её',
        timeout: 5000,
        color: 'red',
        button_close_color: 'black'
      }
      snackbar.value = true
    }
    console.error(error)
  } finally {
    confirmLoading.value = false
    updateDialog(false)
  }
}

// Утилита для красивого отображения адреса
function getAddress(address: StudentAccommodationAddresses) {
  if (!address) return ''
  const parts = [address.city, address.street, address.building_number, address.corpus].filter(
      Boolean
  )
  return parts.join(', ')
}

// Геттер, чтобы упростить в шаблоне `v-if="!hasPhotos"` / `v-else`
const hasPhotos = computed(() => {
  return (
      studentRelocationApplication.value &&
      studentRelocationApplication.value.photos_of_room.length > 0
  )
})
</script>

<style scoped>
/* Ваши стили при необходимости */
</style>
