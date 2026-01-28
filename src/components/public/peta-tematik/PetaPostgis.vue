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


      <!-- GeoJSON overlay (NON-POINT only; points are rendered via MarkerClusterGroup) -->
      <LGeoJson
          v-for="(g, idx) in geojsonDataNonPoint"
          :key="g?.properties?.id ?? idx"
          :geojson="g"
          :options="options"
          :options-style="styleOption"
      />

      <LControl v-if="isVisibleHomeButton && showZoomButton && !isFullscreen" position="topright">
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
      <l-control v-if="isVisibleSsButton" position="bottomright" class="control-offset-br">
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

      <l-control v-if="isVisibleFullScreenButton" position="bottomright" class="control-offset-br">
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

      <l-control v-if="isVisibleCenterButton" position="bottomright" class="control-offset-br">
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


      <!-- Drawn shapes layer for Leaflet.Draw (mounted always; enabled via props) -->
      <LFeatureGroup v-if="isVisibleFeatureGroup" ref="drawGroupRef" />

      <!-- Bottom-left host to force Leaflet.Draw toolbar to be horizontal and aligned with attribution -->
      <l-control v-if="isVisibleDrawTools" position="bottomleft" class="draw-host">
        <div ref="drawHostRef" class="draw-host-inner"></div>
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
import { LMap, LTileLayer, LGeoJson, LControl, LControlZoom as LControlZoomComp, LControlLayers, LFeatureGroup } from '@vue-leaflet/vue-leaflet'
import L, {Icon} from 'leaflet'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import FtDatasetExtService from "@/services/apiservices/ft-dataset-ext-service";
import FileService from "@/services/apiservices/file-service";
import ZonaColorMapper from "@/helpers/zona-color-mapper";
import router from "@/router";

import 'leaflet/dist/leaflet.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.js'
import 'leaflet-draw/dist/leaflet.draw.css'
import * as turf from '@turf/turf'
import ETipePeta from "@/models/e-tipe-peta";

delete Icon.Default.prototype.Default;
Icon.Default.mergeOptions({
  iconRetinaUrl: require("@/assets/images/my-marker.webp"),
  iconUrl: require("@/assets/images/my-marker.webp"),
  shadowUrl: require("@/assets/images/my-marker.webp"),
});

// ---- component sizing (container-based, reusable across pages) ----
const props = defineProps({
  height: { type: String, default: '60vh' },
  minHeight: { type: String, default: '420px' },
  width: { type: String, default: '100%' },

  // IDs dataset yang mau ditampilkan (di-drive dari parent)
  datasetIds: { type: Array, default: () => [] },
  itemsMapsetSelected: { type: Array, default: () => [] },
  showZoomButton: { type: Boolean, default: true },
  drawEnabled: { type: Boolean, default: true },

  isVisibleHomeButton: { type: Boolean, default: true },
  isVisibleSsButton: { type: Boolean, default: true },
  isVisibleFullScreenButton: { type: Boolean, default: true },
  isVisibleCenterButton: { type: Boolean, default: true },
  isVisibleFeatureGroup: { type: Boolean, default: true },
  isVisibleDrawTools: { type: Boolean, default: true },

  // --- highlight/search (client-side) ---
  keywordHighlight: { type: String, default: '' },               // filter/highlight by text
  highlightFeatureKey: { type: String, default: '' },    // highlight by feature key/id
  // --- tooltip on hover (popup-like) ---
  mapToolTipOn: { type: Boolean, default: false }
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

const drawGroupRef = ref(null)
const drawHostRef = ref(null)
let drawHostObserver = null

let drawControl = null
let drawnItems = null
let onDrawCreatedHandler = null
let onDrawEditedHandler = null
const DRAW_EVT_EDITED = (L?.Draw?.Event?.EDITED) || 'draw:edited'

// state peta
const mapRef = ref(null)

// Leaflet.Draw event names (string fallbacks so we don't rely on L.Draw.Event existing)
const DRAW_EVT_CREATED = (L?.Draw?.Event?.CREATED) || 'draw:created'


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

// template visibility flags (computed aliases)
const isVisibleHomeButton = computed(() => props.isVisibleHomeButton !== false)
const isVisibleSsButton = computed(() => props.isVisibleSsButton !== false)
const isVisibleFullScreenButton = computed(() => props.isVisibleFullScreenButton !== false)
const isVisibleCenterButton = computed(() => props.isVisibleCenterButton !== false)
const isVisibleFeatureGroup = computed(() => props.isVisibleFeatureGroup !== false)
const isVisibleDrawTools = computed(() => props.isVisibleDrawTools !== false)
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

// =======================
// Highlight + Indexing (client-side)
// =======================
const featureIndex = ref(new Map()) // layerId -> Leaflet layer
const textIndex = ref([])           // { text, layerId }
const highlighted = ref(new Set())  // Set<layerId>

function cleanupHighlightIndices() {
  try {
    clearHighlights()
    featureIndex.value = new Map()
    textIndex.value = []
  } catch (e) {
    console.warn('[PetaPostgis][highlight] cleanupHighlightIndices failed', e)
  }
}

function normalizeText(v) {
  return String(v ?? '').toLowerCase().trim()
}

function buildSearchTextForFeatureProps(props = {}) {
  try {
    const parts = []

    // include zona desc candidate if available
    try {
      const desc = ZonaColorMapper.getDescCandidate(props)
      if (desc) parts.push(String(desc))
    } catch (e) {
      console.warn('[PetaPostgis][highlight] ZonaColorMapper.getDescCandidate failed (ignored)', e)
    }

    // include stable-ish keys
    const fk = props.featureKey ?? props.feature_key ?? props.FEATURE_KEY ?? ''
    if (fk) parts.push(String(fk))

    const id = props.id ?? props.ID ?? ''
    if (id) parts.push(String(id))

    for (const [k, val] of Object.entries(props)) {
      if (val == null) continue
      if (typeof val === 'string') {
        const s = val.trim()
        if (s) parts.push(s)
      } else if (typeof val === 'number' && Number.isFinite(val)) {
        parts.push(String(val))
      } else if (typeof val === 'boolean') {
        parts.push(`${k}:${val}`)
      }
    }

    return parts.join(' ').toLowerCase()
  } catch (e) {
    console.warn('[PetaPostgis][highlight] buildSearchTextForFeatureProps failed', e)
    return ''
  }
}

function resetLayerStyle(layer) {
  try {
    if (layer && typeof layer.setStyle === 'function') {
      const style = styleOption(layer?.feature)
      layer.setStyle(style)
    }
  } catch (e) {
    console.warn('[PetaPostgis][highlight] resetLayerStyle failed', e)
  }
}

function setMarkerDomHighlight(marker, on) {
  try {
    const el = marker?._icon
    if (!el || !el.classList) return
    if (on) el.classList.add('marker-highlight')
    else el.classList.remove('marker-highlight')
  } catch (e) {
    console.warn('[PetaPostgis][highlight] setMarkerDomHighlight failed', e)
  }
}

function applyLayerHighlight(layer) {
  try {
    // polygons/lines
    if (layer && typeof layer.setStyle === 'function') {
      layer.setStyle({
        weight: 6,
        opacity: 1,
        fillOpacity: 0.65
      })
    }

    // markers
    setMarkerDomHighlight(layer, true)
  } catch (e) {
    console.warn('[PetaPostgis][highlight] applyLayerHighlight failed', e)
  }
}

function clearHighlights() {
  try {
    for (const id of highlighted.value) {
      const lyr = featureIndex.value.get(id)
      if (!lyr) continue

      if (typeof lyr.setStyle === 'function') resetLayerStyle(lyr)
      setMarkerDomHighlight(lyr, false)
    }
    highlighted.value.clear()
  } catch (e) {
    console.warn('[PetaPostgis][highlight] clearHighlights failed', e)
  }
}

function highlightByKeyword(keywordRaw) {
  const q = normalizeText(keywordRaw)
  if (!q) {
    clearHighlights()
    return
  }

  clearHighlights()

  try {
    const matches = textIndex.value
      .filter(x => x?.text && x.text.includes(q))
      .slice(0, 250)

    for (const m of matches) {
      const lyr = featureIndex.value.get(m.layerId)
      if (!lyr) continue
      highlighted.value.add(m.layerId)
      applyLayerHighlight(lyr)
    }
  } catch (e) {
    console.warn('[PetaPostgis][highlight] highlightByKeyword failed', e)
  }
}

function highlightByFeatureKey(featureKeyRaw) {
  const key = normalizeText(featureKeyRaw)
  if (!key) {
    clearHighlights()
    return
  }

  clearHighlights()

  try {
    for (const [id, lyr] of featureIndex.value.entries()) {
      const props = lyr?.feature?.properties || {}
      const fk = normalizeText(
        props.featureKey ??
        props.feature_key ??
        props.FEATURE_KEY ??
        props.id ??
        props.ID ??
        ''
      )

      if (fk && fk.includes(key)) {
        highlighted.value.add(id)
        applyLayerHighlight(lyr)
      }
    }
  } catch (e) {
    console.warn('[PetaPostgis][highlight] highlightByFeatureKey failed', e)
  }
}
// Split GeoJSON: NON-POINT rendered by <LGeoJson>, POINT/MultiPoint rendered by MarkerClusterGroup
const geojsonDataNonPoint = computed(() => {
  const src = Array.isArray(geojsonData.value) ? geojsonData.value : []

  const isPointGeom = (geom) => {
    const t = geom?.type
    return t === 'Point' || t === 'MultiPoint'
  }

  return src
      .map(g => {
        if (!g || typeof g !== 'object') return null

        if (g.type === 'Feature') {
          return isPointGeom(g.geometry) ? null : g
        }

        if (g.type === 'FeatureCollection' && Array.isArray(g.features)) {
          const nonPoint = g.features.filter(f => {
            if (!f || f.type !== 'Feature') return false
            return !isPointGeom(f.geometry)
          })
          if (!nonPoint.length) return null
          return { type: 'FeatureCollection', features: nonPoint }
        }

        return null
      })
      .filter(Boolean)
})

const geojsonDataPoint = computed(() => {
  const src = Array.isArray(geojsonData.value) ? geojsonData.value : []

  const isPointGeom = (geom) => {
    const t = geom?.type
    return t === 'Point' || t === 'MultiPoint'
  }

  return src
      .map(g => {
        if (!g || typeof g !== 'object') return null

        if (g.type === 'Feature') {
          return isPointGeom(g.geometry) ? g : null
        }

        if (g.type === 'FeatureCollection' && Array.isArray(g.features)) {
          const onlyPoint = g.features.filter(f => {
            if (!f || f.type !== 'Feature') return false
            return isPointGeom(f.geometry)
          })
          if (!onlyPoint.length) return null
          return { type: 'FeatureCollection', features: onlyPoint }
        }

        return null
      })
      .filter(Boolean)
})

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

// NOTE: Leaflet GeoJSON pointToLayer signature: (feature, latlng) => Layer
function pointToLayerOption(feature, latlng) {
  try {
    const icon = getMarkerIconForFeature(feature)

    return icon ? L.marker(latlng, { icon }) : L.marker(latlng)
  } catch (e) {
    console.warn('[PetaPostgis][pointToLayer] fallback default marker', e)
    return L.marker(latlng)
  }
}

// cache icon biar gak recreate terus
const markerIconCache = ref(new Map())

// --- Marker clustering layer for POINT/MultiPoint ---
let markerClusterGroup = null
let markerClusterGeojsonLayer = null

let markerPlainGeojsonLayer = null // normal points (no cluster) when zoom >= 13
const CLUSTER_OFF_AT_ZOOM = 13

let markerClusterPluginPromise = null

async function ensureMarkerClusterPluginLoaded() {
  // already available
  if (typeof L?.markerClusterGroup === 'function') return true

  // cached inflight
  if (markerClusterPluginPromise) return markerClusterPluginPromise

  markerClusterPluginPromise = (async () => {
    try {
      // Some builds of markercluster rely on global L
      if (typeof window !== 'undefined' && window && !window.L) {
        window.L = L
      }

      // Import the actual dist file to ensure side-effects run
      await import('leaflet.markercluster/dist/leaflet.markercluster.js')

      const ok = typeof L?.markerClusterGroup === 'function'
      if (!ok) {
        console.warn('[PetaPostgis][cluster] markercluster loaded but L.markerClusterGroup is still missing')
      }
      return ok
    } catch (e) {
      console.warn('[PetaPostgis][cluster] failed to load markercluster plugin', e)
      return false
    } finally {
      // allow retry if failed
      if (typeof L?.markerClusterGroup !== 'function') {
        markerClusterPluginPromise = null
      }
    }
  })()

  return markerClusterPluginPromise
}

function clearPlainPoints() {
  try {
    const map = mapRef.value?.leafletObject
    if (map && markerPlainGeojsonLayer && map.hasLayer(markerPlainGeojsonLayer)) {
      map.removeLayer(markerPlainGeojsonLayer)
    }
    markerPlainGeojsonLayer = null
  } catch (e) {
    console.warn('[PetaPostgis][plainPoints] clear failed', e)
  }
}

function rebuildPlainPointsFromGeojson() {
  const map = mapRef.value?.leafletObject
  if (!map) return

  clearPlainPoints()

  try {
    markerPlainGeojsonLayer = L.geoJSON(geojsonDataPoint.value, {
      pointToLayer: pointToLayerOption,
      onEachFeature: onEachFeatureOption
    })
    markerPlainGeojsonLayer.addTo(map)
  } catch (e) {
    console.warn('[PetaPostgis][plainPoints] rebuild failed', e)
  }
}

async function ensureMarkerClusterLayer() {
  try {
    const map = mapRef.value?.leafletObject
    if (!map) return null

    const ok = await ensureMarkerClusterPluginLoaded()
    if (!ok || typeof L?.markerClusterGroup !== 'function') {
      console.warn('[PetaPostgis][cluster] markerCluster plugin not loaded (L.markerClusterGroup missing)')
      return null
    }

    if (markerClusterGroup) return markerClusterGroup

    markerClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 18,
      chunkedLoading: true,
      removeOutsideVisibleBounds: true
    })

    if (!map.hasLayer(markerClusterGroup)) {
      map.addLayer(markerClusterGroup)
    }

    return markerClusterGroup
  } catch (e) {
    console.warn('[PetaPostgis][cluster] ensureMarkerClusterLayer failed', e)
    return null
  }
}

function clearMarkerClusters() {
  try {
    if (markerClusterGeojsonLayer && markerClusterGroup) {
      markerClusterGroup.removeLayer(markerClusterGeojsonLayer)
      markerClusterGeojsonLayer = null
    }
    if (markerClusterGroup && typeof markerClusterGroup.clearLayers === 'function') {
      markerClusterGroup.clearLayers()
    }
  } catch (e) {
    console.warn('[PetaPostgis][cluster] clear failed', e)
  }
}

async function rebuildMarkerClustersFromGeojson() {
  const map = mapRef.value?.leafletObject
  if (!map) return
  try {
    const z = Number(map.getZoom?.())
    const zoomIsClusterOff = Number.isFinite(z) ? (z >= CLUSTER_OFF_AT_ZOOM) : false

    // zoom >= 13 => normal markers; cluster OFF
    if (zoomIsClusterOff) {
      try {
        clearMarkerClusters()
        if (markerClusterGroup && map.hasLayer(markerClusterGroup)) {
          map.removeLayer(markerClusterGroup)
        }
      } catch (e) {
        console.warn('[PetaPostgis][cluster] detach failed', e)
      }

      rebuildPlainPointsFromGeojson()
      return
    }

    // zoom < 13 => cluster ON; normal OFF
    clearPlainPoints()

    const grp = await ensureMarkerClusterLayer()
    if (!grp) {
      // fallback: plugin cluster gak ada -> tetap tampilkan point normal
      rebuildPlainPointsFromGeojson()
      return
    }

    try {
      if (!map.hasLayer(grp)) map.addLayer(grp)
    } catch (e) {
      console.warn('[PetaPostgis][cluster] attach failed', e)
    }

    clearMarkerClusters()

    try {
      markerClusterGeojsonLayer = L.geoJSON(geojsonDataPoint.value, {
        pointToLayer: pointToLayerOption,
        onEachFeature: onEachFeatureOption
      })
      grp.addLayer(markerClusterGeojsonLayer)
    } catch (e) {
      console.warn('[PetaPostgis][cluster] rebuild failed', e)
    }
  } catch (e) {
    console.warn('[PetaPostgis][cluster] rebuildMarkerClustersFromGeojson failed', e)
  }
}

function resolveMarkerImageUrl(markerImage) {
  const v = (markerImage == null) ? '' : String(markerImage).trim()
  if (!v) return ''
  if (/^https?:\/\//i.test(v)) return v

  try {
    // kalau markerImage itu key/filename dari backend
    return FileService.fileMarker(v)
  } catch (e) {
    console.warn('[PetaPostgis][resolveMarkerImageUrl] fallback raw value', e)
    return v
  }
}

// Helper: inject datasetId into GeoJSON Feature(s)
function injectDatasetIdIntoGeojson(gj, dsId) {
  try {
    const did = Number(dsId)
    if (!Number.isFinite(did) || did <= 0) return gj
    if (!gj || typeof gj !== 'object') return gj

    if (gj.type === 'Feature') {
      gj.properties = gj.properties || {}
      if (gj.properties.__datasetId == null) gj.properties.__datasetId = did
      return gj
    }

    if (gj.type === 'FeatureCollection' && Array.isArray(gj.features)) {
      gj.features.forEach(f => {
        if (!f || f.type !== 'Feature') return
        f.properties = f.properties || {}
        if (f.properties.__datasetId == null) f.properties.__datasetId = did
      })
      return gj
    }

    return gj
  } catch (e) {
    console.warn('[PetaPostgis][injectDatasetIdIntoGeojson] failed', e)
    return gj
  }
}

/**
 * Marker harus punya dataset __datasetId
 */
function getMarkerIconForFeature(feature) {
  try {
    const propsFeature = feature?.properties || {}

    // dataset id can be injected by fetchViewportData (preferred)
    const dsIdRaw = (
      propsFeature.__datasetId ??
      propsFeature.__datasetBean ??
      // fallback aliases (if backend embeds it per-feature)
      propsFeature.ftDatasetBean ??
      propsFeature.ft_dataset_bean ??
      propsFeature.datasetId ??
      propsFeature.dataset_id ??
      propsFeature.ftDatasetId ??
      propsFeature.datasetBean ??
      propsFeature.idDataset ??
      propsFeature.id_dataset
    )

    const dsId = (dsIdRaw == null || String(dsIdRaw).trim() === '') ? null : Number(dsIdRaw)

    const list = Array.isArray(props.itemsMapsetSelected) ? props.itemsMapsetSelected : []

    // If only one dataset is selected, we can safely use it without dsId
    let ds = null
    if ((!Number.isFinite(dsId) || dsId == null || dsId <= 0) && list.length === 1) {
      ds = list[0]
    }

    // If dsId exists, match it
    if (!ds && dsId != null && Number.isFinite(dsId) && dsId > 0) {
      ds = list.find(x => {
        const xid = Number(
          x?.id ??
          x?.datasetId ??
          x?.dataset_id ??
          x?.ftDatasetBean ??
          x?.ft_dataset_bean ??
          x?.ftDatasetId ??
          x?.datasetBean
        )
        return Number.isFinite(xid) && xid === dsId
      })
    }

    if (!ds) return null


    // Resolve marker image field (support multiple naming styles)
    const markerImageRaw = (
      ds?.markerImage ??
      ds?.marker_image ??
      ds?.markerIcon ??
      ds?.marker_icon ??
      ds?.iconUrl ??
      ds?.icon_url ??
      ds?.icon ??
      ds?.marker
    )

    // console.log(markerImageRaw)

    const markerImageUrl = resolveMarkerImageUrl(markerImageRaw)
    if (!markerImageUrl) return null

    // Only apply custom icon for POINT datasets if tipePeta is provided
    const tipePeta = ds?.tipePeta ?? ds?.tipe_peta
    if (tipePeta != null && !isPointTipePeta(tipePeta)) {
      return null
    }

    // cache by URL + size
    const iconSize = [32, 32]
    const iconAnchor = [16, 32]
    const popupAnchor = [0, -32]
    const cacheKey = `${markerImageUrl}|${iconSize[0]}x${iconSize[1]}`

    const cached = markerIconCache.value.get(cacheKey)
    if (cached) return cached

    const icon = L.icon({
      iconUrl: markerImageUrl,
      iconSize,
      iconAnchor,
      popupAnchor,
      shadowUrl: undefined,
      shadowSize: undefined,
      shadowAnchor: undefined
    })

    markerIconCache.value.set(cacheKey, icon)
    return icon
  } catch (e) {
    console.warn('[PetaPostgis][getMarkerIconForFeature] failed, fallback default marker', e)
    return null
  }
}

function isPointTipePeta(tipePeta) {
  return tipePeta === ETipePeta.POINT
}
function onEachFeatureOption(feature, layer) {
  try {
    // --- indexing for highlight/search ---
    const layerId = L.stamp(layer)
    featureIndex.value.set(layerId, layer)

    const propsFeature = feature?.properties || {}
    const text = buildSearchTextForFeatureProps(propsFeature)
    if (text) textIndex.value.push({ text, layerId })

    // Cleanup when layer removed (viewport refresh / re-render)
    if (layer && typeof layer.on === 'function') {
      layer.on('remove', () => {
        try {
          setMarkerDomHighlight(layer, false)
          highlighted.value.delete(layerId)
          featureIndex.value.delete(layerId)
        } catch (e) {
          console.warn('[PetaPostgis][highlight] layer remove cleanup failed', e)
        }
      })
    }

    // --- popup (existing behavior) ---
    const html = `<div style="max-height:260px; overflow:auto;">${popupHtmlForFeature(feature, layer)}</div>`

    if (layer && typeof layer.bindPopup === 'function') {
      layer.bindPopup(html, {
        autoPan: false,
        closeButton: true,
      })
      layer.on('popupopen', (e) => {
        try {
          const el = e?.popup?.getElement?.()
          if (!el) return

          const btn = el.querySelector('.btn-open-gmap')
          if (!btn) return

          // overwrite handler biar gak dobel kalau popup dibuka berkali-kali
          btn.onclick = (ev) => {
            ev.preventDefault()
            ev.stopPropagation()

            const lat = Number(btn.getAttribute('data-lat'))
            const lng = Number(btn.getAttribute('data-lng'))
            const z = Number(btn.getAttribute('data-zoom')) || 20

            openGMapsAt(lat, lng, z)
          }
        } catch (err) {
          console.warn('[PetaPostgis][popup] popupopen handler error', err)
        }
      })

      // --- Tooltip (hover) driven by parent prop ---
      if (props.mapToolTipOn === true) {
        // Use same popup html, but as tooltip content
        layer.bindTooltip(
          `<div style="max-height:350px; overflow:auto; min-width:300px;">${html}</div>`,
          {
            permanent: false,
            sticky: true,
            direction: 'top',
            opacity: 0.95
          }
        )
      } else {
        // if parent turns it off, ensure old tooltip removed
        if (typeof layer.unbindTooltip === 'function') layer.unbindTooltip()
      }

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

// Whitelist kolom yang boleh tampil di popup (di-drive dari backend: res.data.propertiesShow)
const propertiesShowKeys = ref([])

function normalizePropertiesShowKeys(v) {
  if (v == null) return []

  // already array
  if (Array.isArray(v)) {
    return v
      .map(x => String(x ?? '').trim())
      .filter(Boolean)
  }

  // string: bisa JSON array, atau comma-separated
  if (typeof v === 'string') {
    const s = v.trim()
    if (!s) return []

    // try JSON first
    try {
      const parsed = JSON.parse(s)
      if (Array.isArray(parsed)) {
        return parsed
          .map(x => String(x ?? '').trim())
          .filter(Boolean)
      }
    } catch (_) {
      // ignore
    }

    // fallback: comma separated
    return s
      .split(',')
      .map(x => x.trim())
      .filter(Boolean)
  }

  // object: use keys
  if (typeof v === 'object') {
    return Object.keys(v)
      .map(x => String(x ?? '').trim())
      .filter(Boolean)
  }

  return []
}

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

// highlight watchers (driven by parent props)

watch(
  () => props.keywordHighlight,
  (v) => { highlightByKeyword(v) },
  { immediate: true }
)

watch(
  () => props.highlightFeatureKey,
  (v) => { highlightByFeatureKey(v) },
  { immediate: true }
)

watch(
  () => props.mapToolTipOn,
  (on) => {
    try {
      // Re-bind tooltips for existing layers
      for (const lyr of featureIndex.value.values()) {
        if (!lyr) continue
        const html = `<div style="max-height:260px; overflow:auto;">${popupHtmlForFeature(lyr?.feature, lyr)}</div>`

        if (on === true) {
          if (typeof lyr.bindTooltip === 'function') {
            lyr.bindTooltip(
              `<div style="max-height:350px; overflow:auto; min-width:300px;">${html}</div>`,
              {
                permanent: false,
                sticky: true,
                direction: 'top',
                opacity: 0.95
              }
            )
          }
        } else {
          if (typeof lyr.unbindTooltip === 'function') lyr.unbindTooltip()
        }
      }
    } catch (e) {
      console.warn('[PetaPostgis][tooltip] toggle update failed', e)
    }
  },
  { immediate: true }
)

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
  // preload markercluster plugin (best effort) then build layers
  ensureMarkerClusterPluginLoaded()
  rebuildMarkerClustersFromGeojson()

  // reflow biar ukuran leaflet bener (flex layout / dialog)
  requestAnimationFrame(() => invalidateMapSize())

  // Ensure the draw host exists before init so we can force toolbar placement
  const map = mapRef.value?.leafletObject
  requestAnimationFrame(() => {
    if (map) {
      rehomeDrawToolbar(map)
    }
  })

  // init draw tools once map is ready (so control is guaranteed to appear)
  nextTick(() => {
    const map = mapRef.value?.leafletObject
    if (props.drawEnabled) {
      initDrawTools(map)
      // always add control if enabled
      if (drawControl && !drawControl._map) {
        try { map.addControl(drawControl) } catch (e) { console.warn('[draw] addControl failed', e) }
      }
    }
  })

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
function rehomeDrawToolbar(map) {
  try {
    const host = drawHostRef.value
    if (!map || !host) return

    // Leaflet.Draw adds a control container `.leaflet-draw` (or inside `.leaflet-draw-toolbar`)
    const container = map.getContainer?.()
    if (!container) return

    const drawEl = container.querySelector('.leaflet-draw')
    if (!drawEl) return

    // If already in our host, do nothing
    if (host.contains(drawEl)) return

    // Move draw control DOM into our host
    host.appendChild(drawEl)
  } catch (e) {
    console.warn('[draw] rehomeDrawToolbar failed', e)
  }
}
function formatHectares(valueHa) {
  if (!Number.isFinite(valueHa)) return ''
  return Number(valueHa.toFixed(4))
}

function setDrawnAreaTooltip(layer) {
  try {
    if (!layer) return

    // Only show area tooltip for shapes that have area: Polygon/Rectangle/Circle
    let areaM2 = null

    if (layer instanceof L.Circle && typeof layer.getRadius === 'function') {
      const r = layer.getRadius()
      if (Number.isFinite(r)) areaM2 = Math.PI * r * r
    } else if (typeof layer.toGeoJSON === 'function') {
      const gj = layer.toGeoJSON()
      const t = gj && gj.geometry ? gj.geometry.type : ''
      if (t === 'Polygon' || t === 'MultiPolygon') {
        areaM2 = turf.area(gj)
      }
    }

    if (!Number.isFinite(areaM2)) return

    const areaHa = areaM2 / 10000
    const haText = formatHectares(areaHa)
    if (haText === '') return

    const html = `<div style='font-weight:700'>Luas: ${haText} ha</div>`

    if (typeof layer.unbindTooltip === 'function') layer.unbindTooltip()
    if (typeof layer.bindTooltip === 'function') {
      layer.bindTooltip(html, {
        permanent: false,
        sticky: true,
        direction: 'top',
        opacity: 0.95,
      })
    }
  } catch (e) {
    console.warn('[PetaPostgis][setDrawnAreaTooltip] error', e)
  }
}
function setupDrawHostObserver(map) {
  try {
    if (drawHostObserver) return
    const container = map?.getContainer?.()
    if (!container) return

    // Watch for draw toolbar re-render or fullscreen/layout changes
    drawHostObserver = new MutationObserver(() => {
      rehomeDrawToolbar(map)
    })

    drawHostObserver.observe(container, { childList: true, subtree: true })
  } catch (e) {
    console.warn('[draw] setupDrawHostObserver failed', e)
  }
}
// ---- Drawing tools (leaflet-draw) ----

function onMapUpdate() {
  const map = mapRef.value?.leafletObject
  if (!map) return
  // If Leaflet.Draw didn't register (bundle/import issues), do not cras

  const z = map.getZoom()
  rebuildMarkerClustersFromGeojson()

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

    // If parent clears selection, clear map immediately (no fetch)
    if (!Array.isArray(nextIds) || nextIds.length === 0) {
      geojsonData.value = []
      propertiesShowKeys.value = []
      responseBefore.value = { hash: null, sizeBytes: 0 }
      pendingRefresh.value = false
      vpRetryCount = 0
      clearTimeout(debounceTimer)
      // also clear clustered points
      clearMarkerClusters()
      clearPlainPoints()

      return
    }

    await nextTick()
    triggerViewportFetch('datasetIds-change', { debounce: false })
  },
  { immediate: true }
)
// rebuild clustered points every time viewport data changes
watch(
    geojsonData,
    async () => {
      await nextTick()
      rebuildMarkerClustersFromGeojson()
    },
    { deep: true }
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
    // parent cleared selection -> clear map
    geojsonData.value = []
    propertiesShowKeys.value = []
    responseBefore.value = { hash: null, sizeBytes: 0 }
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

    // ---- propertiesShow (kolom popup) ----
    // backend bisa balikin di root: { propertiesShow: [...] , items: [...] }
    // atau per-row: [{ propertiesShow: "[...]" , ...}, ...]
    let psRaw = res?.data?.propertiesShow
    if (psRaw == null && Array.isArray(res?.data) && res.data.length > 0) {
      psRaw = res.data?.[0]?.propertiesShow
    }
    // also support wrapper payload later (in case res.data is object with `data/items`)
    if (psRaw == null && (res?.data?.items || res?.data?.data)) {
      const first = (res.data.items || res.data.data)?.[0]
      psRaw = first?.propertiesShow
    }

    const psKeys = normalizePropertiesShowKeys(psRaw)
    propertiesShowKeys.value = psKeys
    // ---- end propertiesShow ----
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

    // reset indices before applying new GeoJSON (viewport refresh)
    cleanupHighlightIndices()

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
        .map(item => {
          const parsed = safeParseGeojson(item?.geojsonForMap, item?.id)
          if (!parsed) return null

          // IMPORTANT: when multiple datasets are requested, each row may contain a FeatureCollection
          // that already has datasetId at root. Use that first.
          const dsIdRaw = (
            parsed?.datasetId ??
            parsed?.dataset_id ??
            parsed?.ftDatasetBean ??
            parsed?.ft_dataset_bean ??
            // then wrapper fields
            item?.datasetId ??
            item?.dataset_id ??
            item?.ftDatasetBean ??
            item?.ft_dataset_bean ??
            item?.ftDatasetId ??
            item?.datasetBean ??
            item?.idDataset ??
            item?.id_dataset
          )

          return injectDatasetIdIntoGeojson(parsed, dsIdRaw)
        })
        .filter(Boolean)
      return
    }

    // CASE B: backend balikin object wrapper (mis. { items: [...] } atau { data: [...] })
    const maybeArr = payload?.items || payload?.data
    if (Array.isArray(maybeArr)) {
      geojsonData.value = maybeArr
        .map(item => {
          const parsed = safeParseGeojson(item?.geojsonForMap, item?.id)
          if (!parsed) return null

          const dsIdRaw = (
            parsed?.datasetId ??
            parsed?.dataset_id ??
            parsed?.ftDatasetBean ??
            parsed?.ft_dataset_bean ??
            item?.datasetId ??
            item?.dataset_id ??
            item?.ftDatasetBean ??
            item?.ft_dataset_bean ??
            item?.ftDatasetId ??
            item?.datasetBean ??
            item?.idDataset ??
            item?.id_dataset
          )

          return injectDatasetIdIntoGeojson(parsed, dsIdRaw)
        })
        .filter(Boolean)
      return
    }

    // CASE C: backend balikin GeoJSON langsung (FeatureCollection/Feature)
    // IMPORTANT: some endpoints return datasetId at root (not inside feature.properties)
    if (payload && typeof payload === 'object') {
      const t = payload.type
      if (t === 'FeatureCollection' || t === 'Feature') {
        const dsIdRootRaw = payload?.datasetId ?? payload?.dataset_id ?? payload?.ftDatasetBean ?? payload?.ft_dataset_bean
        const dsIdRoot = Number(dsIdRootRaw)
        const hasDsIdRoot = Number.isFinite(dsIdRoot) && dsIdRoot > 0

        if (hasDsIdRoot) {
          injectDatasetIdIntoGeojson(payload, dsIdRoot)
        }

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

function jsonToHtmlTable_Mobile(jsonValue, keys = []) {
  const myObj = jsonValue || {}
  const allow = Array.isArray(keys) ? keys : []

  // Default behavior: if no columns selected -> show all keys
  const keyList = allow.length
    ? allow
    : Object.keys(myObj).sort((a, b) => String(a).localeCompare(String(b)))

  // If still empty, show a small note
  if (!keyList.length) {
    return `<div style="font-size:12px; opacity:0.75; padding:2px 0;">Tidak ada data.</div>`
  }

  let text = "<table style='width: 240px; font-size:12px'>"

  for (const k of keyList) {
    if (!Object.prototype.hasOwnProperty.call(myObj, k)) continue
    const v = myObj[k]
    if (v === undefined || v === null) continue

    text += `
      <tr>
        <td style="padding:4px 0; word-break:break-word;">
          <b>${escapeHtml(k)}</b>: ${escapeHtml(v)}
        </td>
      </tr>`
  }

  text += "</table>"
  return text
}

function jsonToHtmlTable(jsonValue, keys = [], ll = null) {
  const myObj = jsonValue || {}
  const allow = Array.isArray(keys) ? keys : []

  const keyList = allow.length
      ? allow
      : Object.keys(myObj).sort((a, b) => String(a).localeCompare(String(b)))

  if (!keyList.length) {
    return `<div style="font-size:12px; opacity:0.75; padding:2px 0;">Tidak ada data.</div>`
  }

  let rows = ""
  for (const meta of keyList) {
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

  if (!rows) {
    return `<div style="font-size:12px; opacity:0.75; padding:2px 0;">Tidak ada data.</div>`
  }

  const lat = ll?.lat
  const lng = ll?.lng
  const disabled = !(Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)))

  const btnHtml = `
    <div style="margin-bottom:10px; display:flex; justify-content:flex-end;">
      <button
        type="button"
        class="btn-open-gmap"
        data-lat="${disabled ? '' : lat}"
        data-lng="${disabled ? '' : lng}"
        data-zoom="20"
        ${disabled ? 'disabled' : ''}
        title="${disabled ? 'Koordinat tidak ditemukan' : 'Buka lokasi di Google Maps'}"
        style="padding:6px 10px; border:1px solid #bbb; background:#f5f5f5; color:#222; border-radius:4px; cursor:pointer; font-size:12px;"
      >
        Open in Gmap
      </button>
    </div>
  `

  return `${btnHtml}<table style="min-width:240px; max-width:340px; font-size:12px;"><tbody>${rows}</tbody></table>`
}

function openInGmap() {
  const url = `https://www.google.com/maps/search/?api=1&query=$`
  window.open(url, '_blank')
}

function popupHtmlForFeature(feature, layer) {
  const props = feature?.properties || {}

  const isMobile = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(max-width: 480px)').matches

  const keys = propertiesShowKeys.value || []
  const ll = pickLatLngForPopup(feature, layer)

  return isMobile
      ? jsonToHtmlTable_Mobile(props, keys, ll)
      : jsonToHtmlTable(props, keys, ll)
}

function pickLatLngForPopup(feature, layer) {
  try {
    // 1) Point GeoJSON: geometry.coordinates = [lng, lat]
    const geom = feature?.geometry
    if (geom?.type === 'Point' && Array.isArray(geom.coordinates)) {
      const lng = Number(geom.coordinates[0])
      const lat = Number(geom.coordinates[1])
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
    }

    // 2) Any Leaflet vector layer: use bounds center
    if (layer?.getBounds && typeof layer.getBounds === 'function') {
      const c = layer.getBounds().getCenter()
      const lat = Number(c?.lat)
      const lng = Number(c?.lng)
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
    }

    // 3) Marker layer: getLatLng
    if (layer?.getLatLng && typeof layer.getLatLng === 'function') {
      const c = layer.getLatLng()
      const lat = Number(c?.lat)
      const lng = Number(c?.lng)
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
    }
  } catch (e) {
    console.warn('[PetaPostgis] pickLatLngForPopup failed', e)
  }
  return null
}

function openGMapsAt(lat, lng, zoom = 20) {
  try {
    const latNum = Number(lat)
    const lngNum = Number(lng)
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      snackbar.value = { show: true, color: 'warning', text: 'Koordinat tidak valid', timeout: 1500 }
      return
    }
    const z = Math.max(0, Math.min(22, Number(zoom) || 20))
    const url = `https://www.google.com/maps/@${latNum},${lngNum},${z}z`
    window.open(url, '_blank', 'noopener')
  } catch (e) {
    console.error('openGMapsAt error', e)
    snackbar.value = { show: true, color: 'error', text: 'Gagal membuka Google Maps', timeout: 1800 }
  }
}


// ---- Drawing tools (leaflet-draw) ----
function initDrawTools(map) {
  if (!map) return

  if (!L?.Control?.Draw) {
    // console.warn('[draw] Leaflet.Draw plugin not available (L.Control.Draw missing)')
    snackbar.value = {
      show: true,
      color: 'warning',
      text: 'Draw tools belum tersedia (Leaflet.Draw belum ter-load).',
      timeout: 2200
    }
    return
  }
  // (re)resolve FeatureGroup from vue-leaflet
  const fg = drawGroupRef.value?.leafletObject || drawGroupRef.value?.mapObject

  // If control already exists, just ensure featureGroup is correct
  if (drawControl && drawnItems) {
    // ensure layer exists on map
    if (!map.hasLayer(drawnItems)) {
      try {
        map.addLayer(drawnItems)
      } catch (_) { /* ignore */ }
    }
    return
  }

  // Use vue-leaflet FeatureGroup if available, otherwise create one
  drawnItems = fg || new L.FeatureGroup()

  // Ensure drawnItems is on map
  if (!map.hasLayer(drawnItems)) {
    try { map.addLayer(drawnItems) } catch (e) { console.warn('[draw] addLayer failed', e) }
  }

  drawControl = new L.Control.Draw({
    position: 'bottomleft', // Keep as 'bottomleft', layout is overridden by CSS below
    edit: {
      featureGroup: drawnItems,
      remove: true
    },
    draw: {
      polygon: true,
      polyline: true,
      rectangle: true,
      circle: true,
      marker: true,
      circlemarker: false
    }
  })

  // Force toolbar into our bottom-left host and keep it there
  setupDrawHostObserver(map)
  requestAnimationFrame(() => rehomeDrawToolbar(map))

  // Event minimal (biar shape masuk ke layer) - only add handler once
  if (!onDrawCreatedHandler) {
    onDrawCreatedHandler = (e) => {
      const layer = e?.layer
      if (!layer) return
      if (drawnItems && typeof drawnItems.addLayer === 'function') {
        drawnItems.addLayer(layer)
        setDrawnAreaTooltip(layer)
      }
    }
    map.on(DRAW_EVT_CREATED, onDrawCreatedHandler)
  }
  if (!onDrawEditedHandler) {
    onDrawEditedHandler = (e) => {
      try {
        const layers = e?.layers
        if (!layers || typeof layers.eachLayer !== 'function') return
        layers.eachLayer((ly) => setDrawnAreaTooltip(ly))
      } catch (err) {
        console.warn('[PetaPostgis][draw:edited] handler error', err)
      }
    }
    map.on(DRAW_EVT_EDITED, onDrawEditedHandler)
  }
}

function setDrawEnabled(enabled) {
  const map = mapRef.value?.leafletObject
  if (!map) return

  if (!enabled) {
    // remove control
    if (drawControl) {
      try { map.removeControl(drawControl) } catch (_) { /* ignore */ }
    }
    // keep layer but hide it to avoid dangling references
    if (drawnItems && map.hasLayer(drawnItems)) {
      try { map.removeLayer(drawnItems) } catch (_) { /* ignore */ }
    }
    // also clean observer + host placement
    if (drawHostObserver) {
      try { drawHostObserver.disconnect() } catch (_) { /* ignore */ }
      drawHostObserver = null
    }
    return
  }

  // enabled: ensure layer + control exist
  initDrawTools(map)

  if (drawnItems && !map.hasLayer(drawnItems)) {
    try { map.addLayer(drawnItems) } catch (_) { /* ignore */ }
  }

  if (drawControl && !drawControl._map) {
    try { map.addControl(drawControl) } catch (e) { console.warn('[draw] addControl failed', e) }
  }
  requestAnimationFrame(() => rehomeDrawToolbar(map))
}

// optional: trigger sekali ketika map sudah render pertama kali
onMounted(async () => {
  await nextTick()

  window.openInGmap = openInGmap
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
  delete window.openInGmap
  document.removeEventListener('fullscreenchange', onFsChange)
  clearMarkerClusters()
  clearPlainPoints()

  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  // Cleanup event handler for Leaflet.Draw
  const map = mapRef.value?.leafletObject
  if (map && onDrawCreatedHandler) {
    map.off(DRAW_EVT_CREATED, onDrawCreatedHandler)
    onDrawCreatedHandler = null
  }
  if (drawHostObserver) {
    try { drawHostObserver.disconnect() } catch (_) { /* ignore */ }
    drawHostObserver = null
  }
  if (map && onDrawEditedHandler) {
    map.off(DRAW_EVT_EDITED, onDrawEditedHandler)
    onDrawEditedHandler = null
  }
  try { markerIconCache.value.clear() } catch (_) { /* ignore */ }

  try {
    const map = mapRef.value?.leafletObject
    if (map && markerClusterGroup) {
      map.removeLayer(markerClusterGroup)
    }
    markerClusterGroup = null
    markerClusterGeojsonLayer = null
  } catch (e) {
    console.warn('[PetaPostgis][cluster] cleanup failed', e)
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

// Watch drawEnabled prop to enable/disable draw controls
watch(
  () => props.drawEnabled,
  async (enabled) => {
    await nextTick()
    const map = mapRef.value?.leafletObject
    if (!map) return

    requestAnimationFrame(() => {
      invalidateMapSize()
      setDrawEnabled(!!enabled)
    })
  },
  { immediate: true }
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
/* --- Draw tools host: make Leaflet.Draw toolbar horizontal at bottom-left --- */
.draw-host :deep(.leaflet-draw) {
  margin: 0;
}

.draw-host-inner {
  display: flex;
  align-items: center;
}

/* make the toolbar horizontal */
.draw-host :deep(.leaflet-draw-toolbar) {
  display: flex;
  flex-direction: row;
  gap: 6px;
}

.draw-host :deep(.leaflet-draw-toolbar a) {
  margin: 0 !important;
}

/* keep it close to attribution */
:deep(.leaflet-control-attribution) {
  margin-left: 6px;
}

/* ensure bottom-left is a row so attribution + draw sit side-by-side */
:deep(.leaflet-bottom.leaflet-left) {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 8px;
}

/* remove default margins that cause vertical stacking */
:deep(.leaflet-bottom.leaflet-left .leaflet-control) {
  margin: 0 0 6px 10px;
}

/* do not let draw host add extra padding */
.draw-host {
  padding: 0;
}
</style>

<style scoped>
:deep(.marker-highlight) {
  filter: drop-shadow(0 0 10px rgba(255, 0, 128, 0.9)) drop-shadow(0 0 6px rgba(255, 255, 255, 0.75));
  transform: scale(1.15);
  transition: transform 120ms ease, filter 120ms ease;
}
</style>