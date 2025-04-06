<template>
  <v-stepper-window-item
      :value="1"
  >
    <v-select
        label="Выберите общежитие"
        :items="acc"
        :item-title="item => item.name"
        :item-value="item => item.id"
        v-model="accommodationId"
        :rules="[required]"
    >
    </v-select>
    <v-select
        label="Выберите адрес общежития"
        :disabled="!accommodationId"
        :items="getAccommodationAddress(accommodationId)"
        :item-value="item => item.id"
        :item-title="item => `${item.city}, ${item.street}, ${item.building_number}`"
        v-model="addressId"
        :rules="[required]"
    >
    </v-select>
  </v-stepper-window-item>
</template>
<script setup lang="ts">

const acc = ref<student_accommodations_with_addresses[]>([]);
const props = defineProps<{
  selectedAccommodation: {
    accommodation_id: string | null,
    address_id: string | null,
    type_of_accommodation: string | null,
  }
}>();

const emit = defineEmits<{
  (e: 'update:selectedAccommodation', value: {
    accommodation_id: string | null,
    address_id: string | null,
    type_of_accommodation: string | null
  }): void;
}>();

const accommodationId = computed({
  get: () => props.selectedAccommodation.accommodation_id,
  set: (val) => {
    emit('update:selectedAccommodation', {
      ...props.selectedAccommodation,
      accommodation_id: val,
      address_id: null // при смене общаги сбрасываем адрес
    });
  }
});

const addressId = computed({
  get: () => props.selectedAccommodation.address_id,
  set: (val) => {
    emit('update:selectedAccommodation', {
      ...props.selectedAccommodation,
      address_id: val
    });
  }
});

const typeOfAccommodation = computed({
  get: () => props.selectedAccommodation.type_of_accommodation,
  set: (val) => {
    emit('update:selectedAccommodation', {
      ...props.selectedAccommodation,
      type_of_accommodation: val
    });
  }
});

watch(accommodationId, (newVal) => {
  if (newVal) {
    const selectedAccommodation = acc.value.find(acc => acc.id === newVal);
    if (selectedAccommodation) {
      typeOfAccommodation.value = selectedAccommodation.type.name;
    }
  } else {
    typeOfAccommodation.value = null;
  }
})

onMounted(async () => {
  acc.value = await $fetch<student_accommodations_with_addresses[]>('/api/admin/accommodation/list_of_accommodation');
})

const getAccommodationAddress = (id: string | null) => {
  return acc.value.find(acc => acc.id === id)?.addresses || [];
};

</script>
<style scoped>

</style>