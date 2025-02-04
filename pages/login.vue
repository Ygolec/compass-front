<template>
  <login_card></login_card>
</template>
<script setup lang="ts">
import Login_card from "~/components/base/login_card.vue";
import {definePageMeta} from "#imports";

definePageMeta({
  middleware: ['guest']
})
</script>
<style scoped>

</style>