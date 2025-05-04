<template>
  <yandex-map
      v-model="map"
      :settings="{
        location: {
          center: [37.617644, 55.755819],
          zoom: 11,
        },
      }"
      width="100%"
      height="500px"
  >
    <yandex-map-default-scheme-layer/>
    <yandex-map-default-features-layer/>
    <yandex-map-default-marker
        v-for="marker in markersGeoJsonSource"
        :key="marker.title"
        :settings="marker"
    />

  </yandex-map>
</template>
<script setup lang="ts">
import {
  YandexMap,
  YandexMapDefaultFeaturesLayer,
  YandexMapDefaultMarker,
  YandexMapDefaultSchemeLayer
} from "vue-yandex-maps";
import {shallowRef} from "vue";
import type {YMap} from "@yandex/ymaps3-types";

const map = shallowRef<null | YMap>(null);
const accommodations = ref([]);
const markersGeoJsonSource = ref();
onMounted(async () => {
  accommodations.value = await $fetch('/api/student_accommodation/points-for-map');
  markersGeoJsonSource.value = accommodations.value.flatMap(accommodation =>
      accommodation.addresses.map((address, index) => ({
        coordinates: address.coordinate.coordinates as [number, number],
        title: accommodation.name,
        subtitle: `Адрес ${index + 1}`, // можешь написать что-то более красивое здесь
        color: '#627BC1', // например, синий цвет для всех общежитий, можно задать разный если надо
      }))
  );
})

</script>

<style scoped>

</style>