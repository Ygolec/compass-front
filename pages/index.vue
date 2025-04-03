<script setup lang="ts">

</script>

<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12" md="6" lg="4">
          <v-card class="mb-4">
            <v-card-title>
              <v-icon class="mr-2">mdi-file-document</v-icon>
              Файлы переселения
            </v-card-title>
            <v-card-text>
              Просмотр и скачивание документов переселения
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                to="/relocation-files"
                prepend-icon="mdi-download"
              >
                Перейти к файлам
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" lg="4">
          <v-card class="mb-4">
            <v-card-title>
              <v-icon class="mr-2">mdi-swap-horizontal</v-icon>
              Переселения
            </v-card-title>
            <v-card-text>
              Управление процессом переселения студентов
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                to="/relocations"
                prepend-icon="mdi-swap-horizontal"
              >
                Перейти к переселениям
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" lg="4">
          <v-card class="mb-4">
            <v-card-title>
              <v-icon class="mr-2">mdi-clipboard-list</v-icon>
              Анкета
            </v-card-title>
            <v-card-text>
              Заполнение анкеты для переселения
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                to="/anketa"
                prepend-icon="mdi-clipboard-list"
              >
                Заполнить анкету
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>

</style>