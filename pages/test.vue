

<template>
  <profile-dialog :dialog="dialog"  @update:dialog="dialog = $event" />
  <v-btn @click="dialog = true">Открыть диалог</v-btn>

</template>

<script setup lang="ts">
const dialog= ref<boolean>(false)
</script>


<style scoped>

</style>