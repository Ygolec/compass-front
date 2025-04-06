<template>
  <v-main
      class="main-container">
    <v-container>
      <v-row>
        <v-col>
          <v-card variant="flat"
          style="background-color: #031545">
            <v-card-title
                class="main-logo-text text-lg-h1"
            >
              HSE-Compass
            </v-card-title>
            <v-card-subtitle
                class="main-logo-text text-lg-h3"
            >
              Сервис для работы с общежитиями
            </v-card-subtitle>
          </v-card>
        </v-col>
        <v-col>
          <v-img>
            картинка
          </v-img>
        </v-col>
      </v-row>
      <v-divider :thickness="20" opacity="0"/>
      <v-card variant="flat"
              class="slider-with-news-and-guides">
        <v-card-title style="color: #dceeff">
          Новости и гайды
        </v-card-title>
        <v-slide-group
            show-arrows
            style="color: white"
        >
          <v-slide-group-item v-for="item in 12">
            <v-card
                class="mx-auto ml-2 mr-2"
                color="surface-variant"
                image="https://cdn.vuetifyjs.com/docs/images/cards/dark-beach.jpg"
                min-width="300"
                max-width="540"
            >
              <v-card-subtitle  style="color: #fff9">
                Дата
              </v-card-subtitle>
              <v-card-title>
                Название
              </v-card-title>
              <template v-slot:actions>
                <v-btn
                    append-icon="mdi-chevron-right"
                    color="white"
                    text="Просмотреть"
                    variant="outlined"
                    block
                ></v-btn>
              </template>
            </v-card>
          </v-slide-group-item>
        </v-slide-group>
      </v-card>
    </v-container>
    <v-container>
      <yandex-map
          v-model="map"
          :settings="{
        location: {
          center: [37.617644, 55.755819],
          zoom: 9,
        },
      }"
          width="100%"
          height="500px"
      >
        <yandex-map-default-scheme-layer/>
        <yandex-map-default-features-layer/>
        <yandex-map-default-marker :settings="{ coordinates: [37.617644, 55.755819] }"/>
      </yandex-map>
    </v-container>
  </v-main>


</template>

<script setup lang="ts">

import { shallowRef } from 'vue';
import type { YMap } from '@yandex/ymaps3-types';
import {
  YandexMap,
  YandexMapDefaultSchemeLayer,
  YandexMapDefaultFeaturesLayer,
  YandexMapDefaultMarker,
} from 'vue-yandex-maps';

//Можно использовать для различных преобразований
const map = shallowRef<null | YMap>(null);
</script>

<style scoped>
.main-container {
  background-color: #031545;
}

.main-logo-text {
  font-family: "Inter", sans-serif;
  color: white;
}

.slider-with-news-and-guides {
  background-color: #031545;
}

.v-slide-group__next {
  color: white !important;
}

</style>