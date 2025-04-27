<template>
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
    <v-col class="d-flex justify-center">
      <v-img src="/logo.svg"
             max-width="300"
             max-height="300"
      >
      </v-img>
    </v-col>
  </v-row>
</template>
<script setup lang="ts">

</script>
<style scoped>
.main-logo-text {
  font-family: "Inter", sans-serif;
  color: white;
}


</style>