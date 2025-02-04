<template>
  <profile-dialog :dialog="dialog" @update:dialog="dialog = $event"/>

  <v-btn @click="dialog = true">Открыть диалог</v-btn>
  <v-btn @click="testsent()"></v-btn>
  <v-btn @click="logout()">logout</v-btn>
  <v-btn @click="refresh()">refresh</v-btn>
  <v-btn @click="me()">me</v-btn>
</template>
<script setup lang="ts">
import {useAuthStore} from "~/stores/auth_store";

const dialog = ref<boolean>(false)
const authStore = useAuthStore();


async function logout() {
  await $fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
}
async function refresh()  {
  await authStore.refreshAccessToken();
}
async function me() {
 await authStore.fetchCurrentUser();
}

async function testsent() {
  await fetch('http://thekevindit.zapto.org:8055/users/register', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "newuser@example.com",
      password: "securepassword123",
    })
  })
}
</script>
<style scoped lang="scss">


</style>