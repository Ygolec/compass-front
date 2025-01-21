<template>
  <v-menu
      v-model="menu"
      :close-on-content-click="false"
      location="bottom"
      transition="slide-y-transition"
  >
    <template v-slot:activator="{ props }">
      <v-avatar
          color="surface-variant"
          size="50"
          v-bind="props"
      >
      </v-avatar>
    </template>

    <v-card
        class="mt-2"
        min-width="200">

      <v-card-actions>
        <v-btn
            href="/login"
            block
        >
          Войти
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
<script setup lang="ts">
const menu = ref<boolean>(false);

</script>

<style scoped>

</style>