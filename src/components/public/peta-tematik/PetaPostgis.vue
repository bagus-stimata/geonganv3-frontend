<template>
  <div ref="wrapperRef" class="map-wrapper" :style="wrapperStyle">
    <LMap
        ref="mapRef"
        :style="{ height: '100%', width: '100%' }"
        :zoom="zoom"
        :center="center"
        @ready="onMapReady"
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
          :options="options"
          :options-style="styleOption"
      />

      <LControl position="topleft" v-if="showZoomButton && !isFullscreen">
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
import L from 'leaflet'

import FtDatasetExtService from "@/services/apiservices/ft-dataset-ext-service";
import ZonaColorMapper from "@/helpers/zona-color-mapper";
import router from "@/router";

// ---- component sizing (container-based, reusable across pages) ----
const props = defineProps({
  height: { type: String, default: '60vh' },
  minHeight: { type: String, default: '420px' },
  width: { type: String, default: '100%' },

  // IDs dataset yang mau ditampilkan (di-drive dari parent)
  datasetIds: { type: Array, default: () => [] },
  showZoomButton: { type: Boolean, default: true }
})

const isFullscreen = ref(false)
const onFsChange = () => {
  isFullscreen.value = !!document.fullscreenElement
  requestAnimationFrame(() => invalidateMapSize())
}

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

const zoom = ref(11)
const center = ref([-7.6024, 111.9011]) // [lat, lon]
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

// --- GeoJSON styling (match PetaInteraktif styleFunction) ---
// NOTE: vue-leaflet `LGeoJson` supports `:options-style` which can be a function(feature) => style

// keep canonical->hex mapping (optional, useful for legend / debugging)
const colorMap = {}

function styleOption(feature) {
  let weight = 1.2
  let fillOpacity = 0.35

  const props = feature?.properties || {}
  const geomType = feature?.geometry?.type || ''

  // lines: thicker stroke, no fill
  if (geomType === 'MultiLineString' || geomType === 'LineString') {
    weight = 4.5
    fillOpacity = 0
  }

  const desc = ZonaColorMapper.getDescCandidate(props)
  const { canonical, hex } = ZonaColorMapper.findZoneHexByIncludes(desc)

  if (canonical && !colorMap[canonical]) {
    colorMap[canonical] = hex
  }

  return {
    color: hex,
    weight,
    opacity: 0.9,
    fillColor: hex,
    fillOpacity
  }
}
// --- GeoJSON options (match PetaInteraktif: onEachFeature + pointToLayer) ---
// dipakai untuk click/popup & render point features
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function pointToLayerOption(feature, latlng) {
  // Points: pakai circleMarker biar consistent & ringan (canvas-friendly)
  return L.circleMarker(latlng, {
    radius: 6,
    weight: 1.2,
    opacity: 0.9,
    fillOpacity: 0.85
  })
}

function onEachFeatureOption(feature, layer) {
  try {
    const props = feature?.properties || {}
    // ringan & aman: render JSON props dalam <pre>
    // const pretty = JSON.stringify(props, null, 2)
    // const html = `<pre style="max-height:260px; overflow:auto; min-width:260px; white-space:pre-wrap; margin:0">${escapeHtml(pretty)}</pre>`
    const html = `<div style="max-height:260px; overflow:auto;">${popupHtmlForProps(props)}</div>`
    if (layer && typeof layer.bindPopup === 'function') {
      layer.bindPopup(html, {
        autoPan: false, // <- ini biang geser
        closeButton: true,
      })
    }
  } catch (e) {
    console.warn('[PetaPostgis][onEachFeatureOption] failed', e)
  }
}

// vue-leaflet LGeoJson: :options expects { onEachFeature, pointToLayer }
const options = {
  onEachFeature: onEachFeatureOption,
  pointToLayer: pointToLayerOption
}
// --- end GeoJSON options ---

// Global snackbar (biar error/info selalu kelihatan)
const snackbar = ref({ show: false, color: '', text: '', timeout: 1500 })

// Props -> normalized IDs (source of truth)
// NOTE: hasilnya murni Array<number> (int), sudah unique + >0
const datasetIdsNorm = computed(() => {
  if (!Array.isArray(props.datasetIds)) return []

  const ids = props.datasetIds
    .map(v => Number(v))
    .filter(v => Number.isFinite(v))
    .map(v => Math.trunc(v))
    .filter(v => v > 0)

  // unique (preserve order)
  return Array.from(new Set(ids))
})

const lastZoom = ref(zoom.value)
const showZoomInfo = ref(false)
const zoomInfoMessage = ref('')

// buat debounce biar nggak kebanyakan request
// buat debounce biar nggak kebanyakan request
let debounceTimer = null
const DEBOUNCE_DELAY = 150 // ms

let vpRetryCount = 0
const MAX_VP_RETRY = 6

const isMapReady = ref(false)
const pendingRefresh = ref(false)

function onMapReady() {
  isMapReady.value = true

  // reflow biar ukuran leaflet bener (flex layout / dialog)
  requestAnimationFrame(() => invalidateMapSize())

  // Leaflet ref/bounds kadang belum siap tepat di event `ready` (terutama setelah setView/center/resize).
  // Jadi fetch viewport kita delay 1 tick + 1 frame biar `mapRef.value.leafletObject` dan bounds sudah valid.
  nextTick(() => {
    requestAnimationFrame(() => {
      if (pendingRefresh.value) {
        pendingRefresh.value = false
        triggerViewportFetch('pending-refresh', { debounce: false })
      } else {
        // initial fetch ketika map baru ready
        triggerViewportFetch('map-ready', { debounce: false })
      }
    })
  })
}

function onMapUpdate() {
  const map = mapRef.value?.leafletObject
  if (!map) return

  const z = map.getZoom()

  // Zoom info overlay logic
  if (z !== lastZoom.value) {
    const delta = z - lastZoom.value
    const direction = delta > 0 ? 'Perbesar' : 'Perkecil'
    // const steps = Math.abs(delta)
    // const factor = Math.pow(2, delta).toFixed(2)

    // zoomInfoMessage.value = `${direction} zoom: level ${z} (${delta > 0 ? '+' : '-'}${steps} step, faktor ${factor}x)`
    zoomInfoMessage.value = `${direction} zoom: ${z}`
    lastZoom.value = z
    showZoomInfo.value = true

    setTimeout(() => {
      showZoomInfo.value = false
    }, 800)

  }

  //Tidak usah dikerjakan fetch kalau zoom level masih di bawah 9
  if (z < 9) return;
  // Debounce fetch agar tidak spam API
  triggerViewportFetch('map-update', { debounce: true })
}


function sameIntArray(a = [], b = []) {
  if (a === b) return true
  if (!Array.isArray(a) || !Array.isArray(b)) return false
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

// auto-refresh when parent changes datasetIds
watch(
  datasetIdsNorm,
  async (nextIds, prevIds) => {
    // avoid redundant refresh if content identical
    if (sameIntArray(nextIds, prevIds)) return

    await nextTick()
    triggerViewportFetch('datasetIds-change', { debounce: false })
  },
  { immediate: true }
)


function getViewportFromMap() {
  const map = mapRef.value?.leafletObject
  if (!map) return null

  const bounds = map.getBounds()
  const z = map.getZoom()

  return {
    minX: bounds.getWest(),
    minY: bounds.getSouth(),
    maxX: bounds.getEast(),
    maxY: bounds.getNorth(),
    z
  }
}

// --- Helper: formatBytes and safeByteSizeOf ---
function formatBytes(bytes = 0) {
  const b = Number(bytes)
  if (!Number.isFinite(b) || b <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(b) / Math.log(1024)), units.length - 1)
  const v = b / Math.pow(1024, i)
  return `${v.toFixed(i === 0 ? 0 : 2)} ${units[i]}`
}

function safeByteSizeOf(v) {
  try {
    if (v == null) return 0
    if (typeof v === 'string') return new Blob([v]).size
    // object/array -> stringify to estimate payload size
    return new Blob([JSON.stringify(v)]).size
  } catch (e) {
    // fallback rough estimate
    try {
      return String(v).length
    } catch (_) {
      return 0
    }
  }
}

function triggerViewportFetch(reason = 'unknown', { debounce = false } = {}) {
  // kalau belum ada dataset dipilih, jangan request
  if (!datasetIdsNorm.value.length) {
    // keep last render to avoid flicker; clear only on explicit parent reset if needed
    return
  }

  const vp = getViewportFromMap()
  if (!vp) {
    pendingRefresh.value = true

    // Kadang map sudah ready tapi bounds belum kebentuk (container baru selesai resize / map baru di-setView).
    // Kita retry beberapa kali supaya tidak stuck di pendingRefresh.
    if (isMapReady.value && vpRetryCount < MAX_VP_RETRY) {
      vpRetryCount++
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        triggerViewportFetch(`${reason}-retry-${vpRetryCount}`, { debounce: false })
      }, 60)
    }

    return
  }

  // reset retry counter once we have a valid viewport
  vpRetryCount = 0

  const doFetch = () => {
    const startedAt = (typeof performance !== 'undefined' && typeof performance.now === 'function')
      ? performance.now()
      : Date.now()

    fetchViewportData({
      minX: vp.minX,
      minY: vp.minY,
      maxX: vp.maxX,
      maxY: vp.maxY,
      z: vp.z,
      reason,
      startedAt
    })
  }

  if (!debounce) {
    clearTimeout(debounceTimer)
    doFetch()
    return
  }

  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(doFetch, DEBOUNCE_DELAY)
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

// cache response viewport terakhir (raw-text) biar bisa compare
const responseBefore = ref({
  hash: null,
  sizeBytes: 0
})

function hashStringFNV1a(str) {
  const s = typeof str === 'string' ? str : String(str ?? '')
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0
  }
  return h.toString(16)
}

async function fetchViewportData({ minX, minY, maxX, maxY, z, reason, startedAt }) {
  // kalau belum ada dataset dipilih, jangan spam request
  if (!datasetIdsNorm.value.length) {
    geojsonData.value = []
    return
  }
  try {
    // console.log('[viewport] fetch', { reason, minX, minY, maxX, maxY, z, ids: datasetIdsNorm.value })

    const reqViewport = {
      minLon: minX,
      minLat: minY,
      maxLon: maxX,
      maxLat: maxY,
      zoom: z,
      ids: datasetIdsNorm.value
    }
    const res = await FtDatasetExtService.getPostViewportClippedPublic(reqViewport)
    /**
     * Jika res adalah data yang sama dengan sebelumnya, kita bisa skip update geojsonData.value
     * untuk menghindari re-rendering yang tidak perlu
     * Jika res sama dengan responseBefore.. maka return saja
     */


    // normalize raw-text untuk compare stabil
    const rawText = (typeof res?.data === 'string')
      ? res.data
      : JSON.stringify(res?.data ?? null)

    /**
     * Properti ini untuk mengatur apa yang terlihat di Popup
     */
    // console.log(JSON.stringify(res?.data.propertiesShow))

    const rawSizeBytes = safeByteSizeOf(rawText)
    const rawHash = hashStringFNV1a(rawText)

    if (responseBefore.value.hash === rawHash && responseBefore.value.sizeBytes === rawSizeBytes) {
      console.log('[viewport] same response, skip update', {
        reason,
        z,
        size: formatBytes(rawSizeBytes),
        sizeBytes: rawSizeBytes,
        hash: rawHash
      })
      return
    }

    responseBefore.value = { hash: rawHash, sizeBytes: rawSizeBytes }

    // --- Metrics: measure response time and size ---
    const endedAt = (typeof performance !== 'undefined' && typeof performance.now === 'function')
      ? performance.now()
      : Date.now()

    const elapsedMs = (Number.isFinite(Number(endedAt)) && Number.isFinite(Number(startedAt)))
      ? (endedAt - startedAt)
      : null



    console.log('[viewport] response metrics', {
      reason,
      z,
      elapsedMs: elapsedMs != null ? Number(elapsedMs.toFixed(1)) : null,
      size: formatBytes(rawSizeBytes),
      sizeBytes: rawSizeBytes
    })
    // --- End metrics ---

    // Backend bisa return: Array<row> (punya geojsonForMap), atau langsung GeoJSON (Feature/FeatureCollection)
    // Jadi kita normalisasi dulu biar `.map` tidak meledak.
    let payload = res?.data

    // kalau string JSON, parse dulu
    if (typeof payload === 'string') {
      const parsed = safeParseGeojson(payload, 'res.data')
      payload = parsed ?? payload
    }

    // CASE A: sudah array of rows
    if (Array.isArray(payload)) {
      geojsonData.value = payload
        .map(item => safeParseGeojson(item?.geojsonForMap, item?.id))
        .filter(Boolean)
      return
    }

    // CASE B: backend balikin object wrapper (mis. { items: [...] } atau { data: [...] })
    const maybeArr = payload?.items || payload?.data
    if (Array.isArray(maybeArr)) {
      geojsonData.value = maybeArr
        .map(item => safeParseGeojson(item?.geojsonForMap, item?.id))
        .filter(Boolean)
      return
    }

    // CASE C: backend balikin GeoJSON langsung (FeatureCollection/Feature)
    if (payload && typeof payload === 'object') {
      const t = payload.type
      if (t === 'FeatureCollection' || t === 'Feature') {
        geojsonData.value = [payload]
        return
      }
    }

    // kalau sampai sini, payload bentuknya nggak sesuai ekspektasi
    console.warn('[viewport] unexpected response shape', {
      reason,
      type: typeof payload,
      keys: payload && typeof payload === 'object' ? Object.keys(payload) : null,
      sample: typeof res?.data === 'string' ? res.data.slice(0, 160) : null
    })
    geojsonData.value = []

  // console.log(JSON.stringify(res.data))

  } catch (err) {
    const endedAt = (typeof performance !== 'undefined' && typeof performance.now === 'function')
      ? performance.now()
      : Date.now()
    const elapsedMs = (Number.isFinite(Number(endedAt)) && Number.isFinite(Number(startedAt)))
      ? (endedAt - startedAt)
      : null

    console.error('Error fetch viewport data:', err, {
      reason,
      elapsedMs: elapsedMs != null ? Number(elapsedMs.toFixed(1)) : null,
      ids: datasetIdsNorm.value
    })
    snackbar.value = {
      show: true,
      color: 'error',
      text: 'Gagal memuat data peta (viewport). Cek API/Network & parameter ids.',
      timeout: 2500
    }
  }
}


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
      // status fullscreen akan di-handle oleh event listener fullscreenchange
      return
    }

    // 2) Fallback ke Fullscreen API standar browser
    if (container && container.requestFullscreen) {
      // requestFullscreen async; status diupdate via fullscreenchange
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
  // const map = mapRef.value?.leafletObject
  // if (map) {
  //   map.setView(center.value, zoom.value)
  // }
  router.push("/")
}

function jsonToHtmlTable_Mobile(jsonValue) {
  const myObj = jsonValue || {}

  let text = "<table style='width: 220px; font-size:12px'>"

  for (const meta in myObj) {
    if (!Object.prototype.hasOwnProperty.call(myObj, meta)) continue

    // mirip versi Mas-Win (OBJ + DESC)
    if (/^(OBJ|desc|DESC)/.test(meta)) {
      const v = myObj[meta]
      if (v === undefined || v === null) continue
      text += "<tr><td style='padding:4px 0; word-break:break-word'>" + escapeHtml(v) + "</td></tr>"
    }
  }

  text += "</table>"
  return text
}

function jsonToHtmlTable(jsonValue) {
  const myObj = jsonValue || {}

  let rows = ""
  for (const meta in myObj) {
    if (!Object.prototype.hasOwnProperty.call(myObj, meta)) continue
    const val = myObj[meta]
    if (val === undefined || val === null) continue

    rows += `
      <tr>
        <td style="font-weight:600; padding:2px 6px 2px 0; vertical-align:top;">${escapeHtml(meta)}</td>
        <td style="padding:2px 6px; vertical-align:top;">:</td>
        <td style="padding:2px 0; word-break:break-word;">${escapeHtml(val)}</td>
      </tr>`
  }

  return `<table style="min-width:240px; max-width:340px; font-size:12px;"><tbody>${rows}</tbody></table>`
}

function popupHtmlForProps(props) {
  const isMobile = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(max-width: 480px)').matches

  return isMobile ? jsonToHtmlTable_Mobile(props) : jsonToHtmlTable(props)
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

  document.addEventListener('fullscreenchange', onFsChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFsChange)

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
