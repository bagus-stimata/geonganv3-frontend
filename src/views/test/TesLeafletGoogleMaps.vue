<template>
  <div class="map-wrap" :style="{ height: height }">
    <l-map
      :zoom="zoom"
      :center="center"
      :max-zoom="maxZoom"
      style="width: 100%; height: 100%;"
      @ready="onMapReady"
    >
      <l-marker v-if="showMarker" :lat-lng="center" />
    </l-map>
  </div>
</template>

<script setup>
/* eslint-env vue/setup-compiler-macros */
import { computed, onBeforeUnmount, watch, ref } from 'vue'
import { LMap, LMarker } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import icon2xUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import { useStore } from 'vuex'

function ensureGoogleMutantPlugin() {
  if (L?.gridLayer?.googleMutant) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const exist = document.getElementById('leaflet-googlemutant-js')
    if (exist) {
      exist.addEventListener('load', resolve, { once: true })
      exist.addEventListener('error', (e) => { console.error('GoogleMutant load failed (existing)', e); reject(e) }, { once: true })
      return
    }
    const s = document.createElement('script')
    s.id = 'leaflet-googlemutant-js'
    s.src = 'https://unpkg.com/leaflet.gridlayer.googlemutant/dist/Leaflet.GoogleMutant.js'
    s.async = true
    s.defer = true
    s.onload = resolve
    s.onerror = (e) => { console.error('Failed to load Leaflet.GoogleMutant', e); reject(e) }
    document.head.appendChild(s)
  })
}

// Fix icon URL agar muncul di bundler
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon2xUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
})

// === PROPS (INLINE literal; no external var) ===
const props = defineProps({
  lat: { type: Number, default: -7.8717 },
  lng: { type: Number, default: 112.5241 },
  zoom: { type: Number, default: 16 },
  mapType: { type: String, default: 'hybrid' }, // roadmap|satellite|hybrid|terrain
  height: { type: String, default: '70vh' },
  maxZoom: { type: Number, default: 22 },
  maxNativeZoom: { type: Number, default: 21 },
  showMarker: { type: Boolean, default: true },
})

// Wrap semua props dalam computed biar reaktif & lolos lint
const lat = computed(() => props.lat)
const lng = computed(() => props.lng)
const zoom = computed(() => props.zoom)
const mapType = computed(() => props.mapType)
const height = computed(() => props.height)
const maxZoom = computed(() => props.maxZoom)
const maxNativeZoom = computed(() => props.maxNativeZoom)
const showMarker = computed(() => props.showMarker)

const center = computed(() => [lat.value, lng.value])

const store = useStore()
const googleApiKey = computed(() => store.state?.secretKey?.googleApiKey ?? '')

// Refs untuk layer
const mapRef = ref(null)
let gMutantLayer = null
let fallbackTileLayer = null
let googleJsLoading = null

const typeMap = { roadmap: 'roadmap', satellite: 'satellite', hybrid: 'hybrid', terrain: 'terrain' }

function ensureGoogleJs(key) {
  if (typeof window !== 'undefined' && window.google && window.google.maps) return Promise.resolve()
  if (googleJsLoading) return googleJsLoading
  googleJsLoading = new Promise((resolve, reject) => {
    const existing = document.getElementById('google-maps-js')
    if (existing) {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', (e) => { console.error('Google JS failed (existing tag)', e); reject(e) }, { once: true })
      return
    }
    const s = document.createElement('script')
    s.id = 'google-maps-js'
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`
    s.async = true
    s.defer = true
    s.onload = resolve
    s.onerror = (e) => { console.error('Failed to load Google Maps JS', e); reject(e) }
    document.head.appendChild(s)
  })
  return googleJsLoading
}

function removeBaseLayers(map) {
  if (gMutantLayer) {
    try { map.removeLayer(gMutantLayer) } catch (e) { console.warn('Remove googleMutant failed', e) }
    gMutantLayer = null
  }
  if (fallbackTileLayer) {
    try { map.removeLayer(fallbackTileLayer) } catch (e) { console.warn('Remove fallback tile failed', e) }
    fallbackTileLayer = null
  }
}

async function applyBaseLayer(map = mapRef.value) {
  if (!map) return
  removeBaseLayers(map)
  const type = typeMap[mapType.value] || 'hybrid'
  const key = googleApiKey.value
  if (key) {
    await ensureGoogleJs(key)
    await ensureGoogleMutantPlugin()
    gMutantLayer = L.gridLayer.googleMutant({
      type,
      maxZoom: maxZoom.value,
      maxNativeZoom: maxNativeZoom.value,
      styles: [],
    })
    gMutantLayer.addTo(map)
  } else {
    const lyrsByType = { roadmap: 'm', satellite: 's', hybrid: 'y', terrain: 'p' }
    const lyrs = lyrsByType[type] || 'y'
    fallbackTileLayer = L.tileLayer(`https://{s}.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}`,
      { subdomains: ['mt0','mt1','mt2','mt3'], maxZoom: maxZoom.value, maxNativeZoom: maxNativeZoom.value, attribution: 'Map data © Google', crossOrigin: true })
    fallbackTileLayer.addTo(map)
  }
}

function onMapReady(map) {
  mapRef.value = map
  applyBaseLayer(map)
}

watch(mapType, () => { applyBaseLayer() })
watch(googleApiKey, () => { applyBaseLayer() })

onBeforeUnmount(() => { if (mapRef.value) removeBaseLayers(mapRef.value) })
</script>

<style scoped>
.map-wrap { width: 100%; }
</style>