<template>
  <LMap
      ref="mapRef"
      style="height: 100vh; width: 100vw;"
      :zoom="zoom"
      :center="center"
      @moveend="onMapUpdate"
      @zoomend="onMapUpdate"
  >
    <!-- basemap -->
    <LTileLayer
        :url="basemapUrl"
        :attribution="basemapAttrib"
        :maxZoom="22"
    />

    <!-- GeoJSON overlay -->
    <LGeoJson
        v-for="(g, idx) in geojsonData"
        :key="idx"
        :geojson="g"
    />
  </LMap>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { LMap, LTileLayer, LGeoJson } from '@vue-leaflet/vue-leaflet'
import axios from 'axios'

// state peta
const mapRef = ref(null)
const zoom = ref(13)
const center = ref([-7.46, 112.23]) // [lat, lon]

// basemap
const basemapUrl =
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const basemapAttrib = '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'

// GeoJSON dari backend
const geojsonData = ref([])

// buat debounce biar nggak kebanyakan request
let debounceTimer = null
const DEBOUNCE_DELAY = 300 // ms

function onMapUpdate() {
  const map = mapRef.value?.leafletObject
  if (!map) return

  const bounds = map.getBounds()
  const z = map.getZoom()

  const minX = bounds.getWest()   // lon kiri
  const minY = bounds.getSouth()  // lat bawah
  const maxX = bounds.getEast()   // lon kanan
  const maxY = bounds.getNorth()  // lat atas

  console.log('[Leaflet bbox]', { minX, minY, maxX, maxY, z })

  // debounce panggilan API
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchViewportData({ minX, minY, maxX, maxY, z })
  }, DEBOUNCE_DELAY)
}

async function fetchViewportData({ minX, minY, maxX, maxY, z }) {
  try {
    const res = await axios.get('/api/datasets/viewport', {
      params: { minX, minY, maxX, maxY, z }
    })

    console.log('[Backend viewport response]', res.data)

    // asumsi: res.data = array item, tiap item punya geojsonForMap (Feature / FeatureCollection)
    geojsonData.value = (res.data || [])
        .map(item => item.geojsonForMap)
        .filter(Boolean)
  } catch (err) {
    console.error('Error fetch viewport data:', err)
  }
}

// optional: trigger sekali ketika map sudah render pertama kali
onMounted(async () => {
  await nextTick()
  // kadang @moveend/@zoomend nggak kepanggil di load awal, jadi kita panggil manual
  onMapUpdate()
})
</script>

<style scoped>
/* styling optional */
</style>