<template>
  <div ref="wrapperRef" class="map-wrapper" :style="wrapperStyle">
    <LMap
        ref="mapRef"
        :style="{ height: '100%', width: '100%' }"
        :zoom="zoom"
        :center="center"
        @moveend="onMapUpdate"
        @zoomend="onMapUpdate"
        style="z-index: 7"
        :options="{ scrollWheelZoom: false, preferCanvas: true, zoomControl: false }"
    >
      <!-- basemaps registered as base layers for LControlLayers -->
      <LTileLayer
          v-for="bm in basemapList"
          :key="bm.id"
          layer-type="base"
          :name="bm.name"
          :url="bm.url"
          :attribution="bm.attribution"
          :maxZoom="bm.maxZoom"
          :visible="bm.id === activeBasemapId"
      />

      <!-- GeoJSON overlay -->
      <LGeoJson
          v-for="(g, idx) in geojsonData"
          :key="g?.properties?.id ?? idx"
          :geojson="g"
      />

      <LControl position="topleft">
        <v-btn
            variant="elevated"
            class="rounded-lg text-white ma-1 color-bg-second"
            density="default"
            color="orange-darken-2"
            style="text-transform: none"
            @click="goHome"
        >
          <div class="d-flex align-content-md-stretch">
            <v-icon color="white" size="default" >mdi-home</v-icon><span class="ml-1 hidden-sm-and-down font-weight-bold">Beranda</span>
          </div>
        </v-btn>
      </LControl>

      <LControlLayers position="topright"></LControlLayers>

      <LControlZoomComp position="bottomright"></LControlZoomComp>
      <l-control position="bottomright" class="control-offset-br">
        <v-btn
            color="pink-lighten-2"
            icon
            elevation="4"
            class="rounded-lg"
            title="Screen Shot Peta"
            size="small"
            @click="ssPhotoDownload"
        >
          <v-icon>mdi-camera</v-icon>
        </v-btn>
      </l-control>

      <l-control position="bottomright" class="control-offset-br">
        <v-btn
            color="indigo"
            icon
            elevation="4"
            class="rounded-lg"
            title="Full Screen Peta"
            size="small"
            @click="toggleFullscreen"
        >
          <v-icon>mdi-fullscreen</v-icon>
        </v-btn>
      </l-control>

      <l-control position="bottomright" class="control-offset-br">
        <v-btn
            color="primary"
            icon
            elevation="4"
            class="rounded-lg"
            title="Tengahkan Pointer Peta"
            size="small"
            @click="centerToUser"
        >
          <v-icon>mdi-crosshairs-gps</v-icon>
        </v-btn>
      </l-control>



    </LMap>

    <div class="basemap-toolbar" v-if="false">
      <button
          v-for="bm in basemapList"
          :key="bm.id"
          type="button"
          class="layer-button"
          :class="{ active: bm.id === activeBasemapId }"
          @click="setBasemap(bm.id)"
      >
        {{ bm.name }}
      </button>
    </div>


    <transition name="zoom-info-fade">
      <div
          v-if="showZoomInfo"
          class="zoom-info text-h6"
      >
        {{ zoomInfoMessage }}
      </div>
    </transition>

    <!-- Global snackbar (so errors/info are visible) -->
    <v-snackbar
      v-model="snackbar.show"
      :timeout="snackbar.timeout"
      :color="snackbar.color"
      location="bottom"
      rounded="lg"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
/* global defineProps */
import { ref, onMounted, nextTick, onBeforeUnmount, computed, watch } from 'vue'
import { LMap, LTileLayer, LGeoJson, LControl, LControlZoom as LControlZoomComp, LControlLayers } from '@vue-leaflet/vue-leaflet'
import axios from 'axios'

// ---- component sizing (container-based, reusable across pages) ----
const props = defineProps({
  height: { type: String, default: '60vh' },
  minHeight: { type: String, default: '420px' },
  width: { type: String, default: '100%' }
})

const wrapperRef = ref(null)

const wrapperStyle = computed(() => ({
  width: props.width || '100%',
  height: props.height || '60vh',
  minHeight: props.minHeight || '420px'
}))

const googleSatellite = {
  id: 'googleSatellite',
  name: 'Google Sat',
  url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
  attribution: '&copy; Google',
  maxZoom: 22
}

const googleHybrid = {
  id: 'googleHybrid',
  name: 'Google Hybrid',
  url: 'https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
  attribution: '&copy; Google',
  maxZoom: 22
}

const googleRoadmap = {
  id: 'googleRoadmap',
  name: 'Google Roadmap',
  url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
  attribution: '&copy; Google',
  maxZoom: 22
}

const googleTerrain = {
  id: 'googleTerrain',
  name: 'Google Terrain',
  url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
  attribution: '&copy; Google',
  maxZoom: 22
}

// state peta
const mapRef = ref(null)

// Leaflet needs invalidateSize() when its container changes (dialog/tab/sidebar/resize)
let resizeObserver = null

function invalidateMapSize() {
  const map = mapRef.value?.leafletObject
  if (map && typeof map.invalidateSize === 'function') {
    map.invalidateSize(true)
  }
}

// basemap options
const basemaps = {
  osm: {
    id: 'osm',
    name: 'OSM',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  },
  esriWorldImagery: {
    id: 'esriWorldImagery',
    name: 'Esri Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 18
  },
  googleSatellite,
  googleHybrid,
  googleRoadmap,
  googleTerrain
}

const zoom = ref(20)
const center = ref([-7.46, 112.23]) // [lat, lon]
const userLocation = ref(null)

const activeBasemapId = ref('googleHybrid')
const basemapList = Object.values(basemaps)


function setBasemap(id) {
  if (basemaps[id]) {
    activeBasemapId.value = id

    // --- NEW FIX ---
    const map = mapRef.value?.leafletObject
    if (map) {
      const newMax = basemaps[id].maxZoom || 19
      const currentZoom = map.getZoom()

      if (currentZoom > newMax) {
        map.setZoom(newMax)
      }
    }
    // --- END FIX ---
  }
}
// GeoJSON dari backend
const geojsonData = ref([])
// daftar dataset yang ingin ditampilkan (isi dari UI / parent / route). Wajib untuk request viewport.
const datasetIds = ref([])

const lastZoom = ref(zoom.value)
const showZoomInfo = ref(false)
const zoomInfoMessage = ref('')

// buat debounce biar nggak kebanyakan request
let debounceTimer = null
const DEBOUNCE_DELAY = 300 // ms

function onMapUpdate() {
  const map = mapRef.value?.leafletObject
  if (!map) return

  const bounds = map.getBounds()
  const z = map.getZoom()

  // Zoom info overlay logic
  if (z !== lastZoom.value) {
    const delta = z - lastZoom.value
    const direction = delta > 0 ? 'Perbesar' : 'Perkecil'
    const steps = Math.abs(delta)
    // faktor skala 2^delta (Leaflet default)
    const factor = Math.pow(2, delta).toFixed(2)
    zoomInfoMessage.value = `${direction} zoom: level ${z} (${delta > 0 ? '+' : '-'}${steps} step, faktor ${factor}x)`
    lastZoom.value = z
    showZoomInfo.value = true

    // auto-hide setelah 800ms
    setTimeout(() => {
      showZoomInfo.value = false
    }, 800)
  }

  const minX = bounds.getWest()   // lon kiri
  const minY = bounds.getSouth()  // lat bawah
  const maxX = bounds.getEast()   // lon kanan
  const maxY = bounds.getNorth()  // lat atas

  console.log('[Leaflet bbox]', { minX, minY, maxX, maxY, z })

  // debounce panggilan API
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    console.log(`${minX}x${minY}y dan ${maxX}x${maxY}y di zoom ${z} - fetching data...`)

    fetchViewportData({ minX, minY, maxX, maxY, z })
  }, DEBOUNCE_DELAY)
}

function safeParseGeojson(v, idForLog) {
  if (!v) return null
  if (typeof v === 'object') return v
  if (typeof v !== 'string') return null
  try {
    return JSON.parse(v)
  } catch (e) {
    console.error('[viewport] geojsonForMap JSON.parse failed', { id: idForLog, err: e, sample: String(v).slice(0, 160) })
    return null
  }
}

async function fetchViewportData({ minX, minY, maxX, maxY, z }) {
  // kalau belum ada dataset dipilih, jangan spam request
  if (!Array.isArray(datasetIds.value) || datasetIds.value.length === 0) {
    geojsonData.value = []
    return
  }

  try {
    const res = await axios.get('/api/geoportal/public/getViewportClipped', {
      params: {
        minLon: minX,
        minLat: minY,
        maxLon: maxX,
        maxLat: maxY,
        zoom: z,
        ids: datasetIds.value
      }
    })

    console.log('[Backend viewport response]', res.data)

    // backend mengembalikan list item dengan field `geojsonForMap` (Feature/FeatureCollection as string)
    geojsonData.value = (res.data || [])
      .map(item => safeParseGeojson(item?.geojsonForMap, item?.id))
      .filter(Boolean)
  } catch (err) {
    console.error('Error fetch viewport data:', err)
  }
}

const snackbar = ref({ show: false, color: '', text: '', timeout: 1500 })

const ssPhotoDownload = async () => {
  try {
    const map = mapRef.value
    const mapEl =
      map?.leafletObject?.getContainer?.() ||
      map?.mapObject?.getContainer?.() ||
      map?.$el?.querySelector?.('.leaflet-container')

    if (!mapEl) {
      console.warn('Leaflet map container not found')
      snackbar.value = { show: true, color: 'warning', text: 'Map belum siap untuk di-screenshot', timeout: 1800 }
      return
    }

    const prevOverflow = mapEl.style.overflow
    mapEl.style.overflow = 'hidden'

    const html2canvas = (await import('html2canvas')).default

    await nextTick()

    const canvas = await html2canvas(mapEl, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      scale: 1,
      windowWidth: mapEl.clientWidth,
      windowHeight: mapEl.clientHeight,
      width: mapEl.clientWidth,
      height: mapEl.clientHeight
    })

    mapEl.style.overflow = prevOverflow || ''

    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.9))
    if (!blob) {
      snackbar.value = { show: true, color: 'error', text: 'Gagal membuat gambar', timeout: 1800 }
      return
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    a.href = url
    a.download = `snapshot-map-${ts}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    snackbar.value = { show: true, color: 'primary', text: 'Screenshot peta terunduh', timeout: 1500 }
  } catch (e) {
    console.error('ssPhotoDownload error', e)
    snackbar.value = { show: true, color: 'error', text: 'Gagal screenshot. Coba layer lain (yang support CORS).', timeout: 2500 }
  }
}

function toggleFullscreen() {
  try {
    const mapInstance = mapRef.value?.leafletObject
    const container =
      mapInstance?.getContainer?.() ||
      mapRef.value?.$el ||
      document.querySelector('.map-wrapper')

    // 1) Coba pakai plugin leaflet-fullscreen jika tersedia
    if (mapInstance && typeof mapInstance.toggleFullscreen === 'function') {
      mapInstance.toggleFullscreen()
      return
    }

    // 2) Fallback ke Fullscreen API standar browser
    if (container && container.requestFullscreen) {
      container.requestFullscreen()
      return
    }

    snackbar.value = {
      show: true,
      color: 'warning',
      text: 'Fullscreen tidak didukung di browser ini',
      timeout: 1500
    }
  } catch (e) {
    console.error('toggleFullscreen error', e)
    snackbar.value = {
      show: true,
      color: 'error',
      text: 'Gagal mengaktifkan fullscreen',
      timeout: 1800
    }
  }
}

function centerToUser() {
  // vue-leaflet versions expose the Leaflet map as either `leafletObject` or `mapObject`
  const map = mapRef.value?.leafletObject || mapRef.value?.mapObject

  // If we already have a location cached, just center instantly
  if (userLocation.value && map) {
    const z = Number.isFinite(Number(zoom.value)) ? Number(zoom.value) : 19
    map.setView(userLocation.value, z)
    return
  }

  if (!('geolocation' in navigator)) {
    snackbar.value = {
      show: true,
      color: 'warning',
      text: 'Geolocation tidak tersedia di browser ini',
      timeout: 1800
    }
    return
  }

  // Give quick feedback so user knows the button is working
  snackbar.value = {
    show: true,
    color: 'info',
    text: 'Mencari lokasi GPS...',
    timeout: 1200
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      const loc = [lat, lon]

      userLocation.value = loc
      center.value = loc
      zoom.value = 19

      const m = mapRef.value?.leafletObject || mapRef.value?.mapObject
      if (m && typeof m.setView === 'function') {
        m.setView(loc, 19)
      }

      snackbar.value = {
        show: true,
        color: 'primary',
        text: 'Lokasi ditemukan — peta di-center',
        timeout: 1400
      }
    },
    (err) => {
      console.warn('Geolocation error (centerToUser):', err)

      // Extra hint for iOS/macOS/Safari/Chrome when location services are disabled
      // NOTE: browser may still return code=2 for multiple root causes.

      // Common cases: permission denied / unavailable / timeout
      let msg = 'Gagal mengambil lokasi.'
      if (err?.code === 1) {
        msg = 'Izin lokasi ditolak. Aktifkan Location Permission di browser.'
      } else if (err?.code === 2) {
        msg = 'Lokasi tidak tersedia (Location Services off / GPS tidak aktif / tidak ada fix). Coba nyalakan Location Services & GPS, lalu refresh.'
      } else if (err?.code === 3) {
        msg = 'Timeout ambil lokasi. Coba lagi.'
      }

      snackbar.value = {
        show: true,
        color: 'warning',
        text: msg,
        timeout: 2600
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 15_000
    }
  )
}

function goHome() {
  const map = mapRef.value?.leafletObject
  if (map) {
    map.setView(center.value, zoom.value)
  }
}

// optional: trigger sekali ketika map sudah render pertama kali
onMounted(async () => {
  await nextTick()

  // invalidate once on first paint
  invalidateMapSize()

  // observe wrapper size changes (flexible layout)
  if (wrapperRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      // avoid spamming; let layout settle
      requestAnimationFrame(() => invalidateMapSize())
    })
    resizeObserver.observe(wrapperRef.value)
  }

  // kadang @moveend/@zoomend nggak kepanggil di load awal, jadi kita panggil manual
  onMapUpdate()
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})

// if parent changes size via props, reflow the map
watch(
  () => [props.height, props.minHeight, props.width],
  async () => {
    await nextTick()
    invalidateMapSize()
  }
)


</script>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.center-button {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 8;
  padding: 6px 10px;
  border-radius: 4px;
  border: none;
  background: #ffffff;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.center-button:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
}

.basemap-toolbar {
  position: absolute;
  right: 16px;
  top: 16px;
  z-index: 8;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.layer-button {
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  background: #ffffff;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}

.layer-button.active {
  font-weight: 600;
  background: #1976d2;
  color: #ffffff;
}

.zoom-info {
  position: absolute;
  bottom: 80px;
  right: 16px;
  z-index: 8;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  pointer-events: none;
  transform: translateY(0);
}

/* transition name: zoom-info-fade */
.zoom-info-fade-enter-active,
.zoom-info-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.zoom-info-fade-enter-from,
.zoom-info-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
