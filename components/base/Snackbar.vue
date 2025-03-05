<template>
  <v-snackbar
      :model-value="snackbar"
      @update:model-value="update_snackbar"
      :color="details.color"
      :timeout="details.timeout"
      multi-line
  >
    {{ details.text }}
    <template v-slot:actions>
      <v-btn
          :color="details.button_close_color"
          variant="text"
          @click="update_snackbar(false)"
      >
        Закрыть
      </v-btn>
    </template>
  </v-snackbar>
</template>
<script setup lang="ts">
const props = defineProps({
  snackbar: Boolean,
  details: {
    type: Object,
    default: () => {
      return {
        timeout: 5000,
        title: '',
        text: '',
        color: '',
        button_close_color: '',
      };
    }
  }
});
const emit = defineEmits(["update:snackbar", "confirm"]);
const update_snackbar = (value: boolean) => {
  emit('update:snackbar', value);
};


</script>
<style scoped>

</style>