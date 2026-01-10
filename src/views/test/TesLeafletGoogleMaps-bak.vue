<template>
  <div class="map-wrap" :style="{ height: props.height }">
    <l-map
      :zoom="props.zoom"
      :center="center"
      :max-zoom="props.maxZoom"
      style="width: 100%; height: 100%;"
    >
      <l-tile-layer
        :url="tileUrl"
        :subdomains="subdomains"
        :attribution="attribution"
        :max-zoom="props.maxZoom"
        :max-native-zoom="props.maxNativeZoom"
      />
      <l-marker v-if="props.showMarker" :lat-lng="center" />
    </l-map>
  </div>
</template>

<script setup>
/* eslint-env vue/setup-compiler-macros */
import { computed } from 'vue'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import icon2xUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

// Perbaiki icon default Leaflet agar muncul di bundler (Vue CLI/Webpack)
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon2xUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
})

const props = defineProps({
  lat: { type: Number, default: -7.8717 },
  lng: { type: Number, default: 112.5241 },
  zoom: { type: Number, default: 16 },
  // roadmap | satellite | hybrid | terrain
  mapType: { type: String, default: 'hybrid' },
  height: { type: String, default: '70vh' },
  // Set tinggi zoom besar; Google umumnya native 20–21 di banyak area
  maxZoom: { type: Number, default: 22 },
  maxNativeZoom: { type: Number, default: 21 },
  showMarker: { type: Boolean, default: true },
})

const center = computed(() => [props.lat, props.lng])

// Pemetaan tipe peta Google -> parameter `lyrs` pada endpoint tile
const lyrsByType = { roadmap: 'm', satellite: 's', hybrid: 'y', terrain: 'p' }

const tileUrl = computed(() => {
  const lyrs = lyrsByType[props.mapType] || 'y'
  // Catatan: endpoint ini tidak memakai API key dan bersifat tak resmi
  return `https://{s}.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}`
})

const subdomains = ['mt0', 'mt1', 'mt2', 'mt3']
const attribution = 'Map data © Google'

</script>

<style scoped>
.map-wrap { width: 100%; }
</style>