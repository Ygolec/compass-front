<template>
  <v-dialog
      :model-value="dialog"
      @update:model-value="update_dialog"
      max-width="500"
  >
    <v-card>
      <v-card-title>
        {{ details.title }}
      </v-card-title>
      <v-card-text>
        {{ details.text }}
      </v-card-text>
      <v-card-actions>
        <v-btn
            color="gray"
            variant="flat"
            @click="update_dialog(false)">
          Отмена
        </v-btn>
        <v-btn
            :color="details.button_confirm_color"
            @click="confirm_action">
          {{ details.button_confirm_text }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
const props = defineProps({
  dialog: Boolean,
  details: {
    type: Object,
    default: () => {
      return {
        title: '',
        text: '',
        button_confirm_text: '',
        button_confirm_color: '',
      };
    }
  }
});
const emit = defineEmits(["update:dialog","confirm"]);

const confirm_action = () => {
  emit('confirm');
  update_dialog(false);
};

const update_dialog = (value: boolean) => {
  emit('update:dialog', value);
};
</script>
<style scoped>

</style>