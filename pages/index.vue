<template>
  <v-main
      class="main-container">
    <v-container>
      <TitleLogoUpperCont/>
      <v-divider :thickness="20" opacity="0"/>
      <News/>
    </v-container>
    <v-container
    >
      <Map/>
    </v-container>
  </v-main>


</template>

<script setup lang="ts">


import News from "~/components/main/News.vue";
import TitleLogoUpperCont from "~/components/main/TitleLogoUpperCont.vue";
import Map from "~/components/main/Map.vue";


</script>

<style scoped>
.main-container {
  background-color: #031545;
}

.slider-with-news-and-guides {
  background-color: #031545;
}

.v-slide-group__next {
  color: white !important;
}

</style>