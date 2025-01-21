<script setup lang="ts">

import Login_card from "~/components/base/login_card.vue";
const {data} =
await useFetch('/api/hse_api/search_by_name', {
  method: 'POST',
  body: ({
    q: 'Чистобаев'
  })
})
console.log(data.value);
</script>

<template>
  <login_card></login_card>
</template>

<style scoped>

</style>