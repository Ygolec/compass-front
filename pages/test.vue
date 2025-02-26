<template>
  <profile-dialog :dialog="dialog" @update:dialog="dialog = $event"/>

  <v-btn @click="dialog = true">Открыть диалог</v-btn>
  <v-btn @click="testsent()"></v-btn>
  <v-btn @click="logout()">logout</v-btn>
  <v-btn @click="refresh()">refresh</v-btn>
  <v-btn @click="me()">me</v-btn>
  <v-btn @click="login()">login</v-btn>
  <v-btn @click="match()">match</v-btn>
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

async function login(){
  const config = useRuntimeConfig();
  const backendResponse = await $fetch(`${config.AUTH_BACKEND_URL}/api/v1/users/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email:'dachistobaev@edu.hse.ru',
      password:'1234'
    }),
  })
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

async function match() {
  await $fetch('/api/student_relocation_applications_match/all', {
    method: 'POST',
    body: '',
  })
}
</script>
<style scoped lang="scss">


</style>