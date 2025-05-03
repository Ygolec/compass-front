<template>
  <v-main class="bg-grey-lighten-3" height="100%">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-breadcrumbs>
            <v-breadcrumbs-item
                href="/admin"
                title="Панель администрирования"
            />
            <v-breadcrumbs-divider/>
            <v-breadcrumbs-item
                href="/admin/relocation-files"
                title="Файлы переселения"
                :disabled="true"
            />
          </v-breadcrumbs>
          <v-sheet rounded="lg">
            <v-container>
              <div class="d-flex align-center mb-6">
                <v-icon icon="mdi-file-document-multiple" size="32" class="mr-3" color="primary"/>
                <h1 class="text-h4">Файлы переселения</h1>
              </div>

              <RelocationFiles />
            </v-container>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import RelocationFiles from "~/components/relocation/RelocationFiles.vue";


</script>

<style scoped>
.text-h4 {
  color: rgba(0, 0, 0, 0.87);
  font-weight: 400;
}
</style> 