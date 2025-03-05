<template>
  <login-card></login-card>
</template>
<script setup lang="ts">
import LoginCard from "~/components/auth/LoginCard.vue";
import {definePageMeta} from "#imports";

definePageMeta({
  middleware: ['guest']
})
</script>
<style scoped>

</style>