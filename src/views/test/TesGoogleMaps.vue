<script setup>
/* eslint-env vue/setup-compiler-macros */
import { onMounted, ref, computed } from 'vue'
import { useStore } from 'vuex'

// Runtime props (no TS generics)
const props = defineProps({
  googleApiKey: { type: String, default: '' },
  lat: { type: Number, default: -7.8651101 },
  lng: { type: Number, default: 112.5194216 },
  zoom: { type: Number, default: 21 },
  // 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
  mapType: { type: String, default: 'hybrid' }
})

const store = useStore()
const computedKey = computed(() => props.googleApiKey || (store.state?.secretKey?.googleApiKey ?? ''))

const el = ref(null)

function loadGoogleScript (key) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) return resolve()
    const id = 'gmap-sdk'
    if (document.getElementById(id)) {
      const check = () => (window.google && window.google.maps) ? resolve() : setTimeout(check, 100)
      return check()
    }
    const s = document.createElement('script')
    s.id = id
    s.async = true
    s.defer = true
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(key)
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Google Maps JS API'))
    document.head.appendChild(s)
  })
}

onMounted(async () => {
  const key = computedKey.value
  if (!key) {
    console.error('[TesGoogleMaps] googleApiKey is required')
    return
  }
  await loadGoogleScript(key)
  const center = { lat: props.lat, lng: props.lng }
  const map = new window.google.maps.Map(el.value, {
    center,
    zoom: props.zoom,      // start close
    maxZoom: 24,           // allow deeper zoom when imagery available
    mapTypeId: props.mapType, // satellite + labels (hybrid)
    tilt: 0,
    gestureHandling: 'greedy',
    disableDefaultUI: false
  })

  new window.google.maps.Marker({ position: center, map })
})
</script>

<template>
  <div class="tes-google-maps">
    <div ref="el" class="mapbox"></div>
  </div>
</template>

<style scoped>
.tes-google-maps { width: 100%; }
.mapbox { width: 100%; height: 520px; border-radius: 8px; overflow: hidden; }
</style>