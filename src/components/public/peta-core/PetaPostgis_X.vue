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

<script>
import {
  LMap,
  LTileLayer,
  LGeoJson,
  LControl,
  LControlZoom as LControlZoomComp,
  LControlLayers,
  LFeatureGroup,
} from '@vue-leaflet/vue-leaflet'

import L, { Icon } from 'leaflet'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import FtDatasetExtService from '@/services/apiservices/ft-dataset-ext-service'
import FileService from '@/services/apiservices/file-service'
import ZonaColorMapper from '@/helpers/zona-color-mapper'
import router from '@/router'

import 'leaflet/dist/leaflet.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.js'
import 'leaflet-draw/dist/leaflet.draw.css'
import * as turf from '@turf/turf'
import ETipePeta from '@/models/e-tipe-peta'

// ===== Leaflet Icon default override =====
delete Icon.Default.prototype.Default
Icon.Default.mergeOptions({
  iconRetinaUrl: require('@/assets/images/my-marker.webp'),
  iconUrl: require('@/assets/images/my-marker.webp'),
  shadowUrl: require('@/assets/images/my-marker.webp')
})

const DEFAULT_MARKER_IMG = require('@/assets/images/my-marker.webp')
const defaultMarkerIcon = L.icon({
  iconUrl: DEFAULT_MARKER_IMG,
  iconRetinaUrl: DEFAULT_MARKER_IMG,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})

// ===== Basemaps =====
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

const CLUSTER_OFF_AT_ZOOM = 13
const DEBOUNCE_DELAY = 150
const MAX_VP_RETRY = 6

const DRAW_EVT_CREATED = (L?.Draw?.Event?.CREATED) || 'draw:created'
const DRAW_EVT_EDITED = (L?.Draw?.Event?.EDITED) || 'draw:edited'

export default {
  name: 'PetaPostgis',

  components: {
    LMap,
    LTileLayer,
    LGeoJson,
    LControl,
    LControlZoomComp,
    LControlLayers,
    LFeatureGroup,
  },

  props: {
    height: { type: String, default: '60vh' },
    minHeight: { type: String, default: '420px' },
    width: { type: String, default: '100%' },

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

    keywordHighlight: { type: String, default: '' },
    highlightFeatureKey: { type: String, default: '' },

    mapToolTipOn: { type: Boolean, default: false }
  },

  data() {
    return {
      // state peta
      zoom: 11,
      center: [-7.6024, 111.9011],
      userLocation: null,

      activeBasemapId: 'googleHybrid',

      // GeoJSON backend
      geojsonData: [],

      // snackbar
      snackbar: { show: false, color: '', text: '', timeout: 1500 },

      // popup column whitelist
      propertiesShowKeys: [],

      // ui state
      isFullscreen: false,
      lastZoom: 11,
      showZoomInfo: false,
      zoomInfoMessage: '',

      // cache response viewport terakhir
      responseBefore: { hash: null, sizeBytes: 0 },

      // internal flags
      isMapReady: false,
      pendingRefresh: false
    }
  },

  computed: {
    wrapperStyle() {
      return {
        width: this.width || '100%',
        height: this.height || '60vh',
        minHeight: this.minHeight || '420px'
      }
    },

    basemapList() {
      return Object.values(basemaps)
    },

    // template visibility flags
    _isVisibleHomeButton() { return this.isVisibleHomeButton !== false },
    _isVisibleSsButton() { return this.isVisibleSsButton !== false },
    _isVisibleFullScreenButton() { return this.isVisibleFullScreenButton !== false },
    _isVisibleCenterButton() { return this.isVisibleCenterButton !== false },
    _isVisibleFeatureGroup() { return this.isVisibleFeatureGroup !== false },
    _isVisibleDrawTools() { return this.isVisibleDrawTools !== false },

    datasetIdsNorm() {
      if (!Array.isArray(this.datasetIds)) return []
      const ids = this.datasetIds
          .map(v => Number(v))
          .filter(v => Number.isFinite(v))
          .map(v => Math.trunc(v))
          .filter(v => v > 0)
      return Array.from(new Set(ids))
    },

    geojsonDataNonPoint() {
      const src = Array.isArray(this.geojsonData) ? this.geojsonData : []
      const isPointGeom = (geom) => {
        const t = geom?.type
        return t === 'Point' || t === 'MultiPoint'
      }

      return src
          .map(g => {
            if (!g || typeof g !== 'object') return null
            if (g.type === 'Feature') return isPointGeom(g.geometry) ? null : g

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
    },

    geojsonDataPoint() {
      const src = Array.isArray(this.geojsonData) ? this.geojsonData : []
      const isPointGeom = (geom) => {
        const t = geom?.type
        return t === 'Point' || t === 'MultiPoint'
      }

      return src
          .map(g => {
            if (!g || typeof g !== 'object') return null
            if (g.type === 'Feature') return isPointGeom(g.geometry) ? g : null

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
    },
    
    // vue-leaflet LGeoJson options
    options() {
      return {
        onEachFeature: this.onEachFeatureOption,
        pointToLayer: this.pointToLayerOption
      }
    }
  },

  watch: {
    keywordHighlight: {
      immediate: true,
      handler(v) { this.highlightByKeyword(v) }
    },

    highlightFeatureKey: {
      immediate: true,
      handler(v) { this.highlightByFeatureKey(v) }
    },

    mapToolTipOn: {
      immediate: true,
      handler(on) {
        try {
          for (const lyr of this._featureIndex.values()) {
            if (!lyr) continue
            const html = `<div style="max-height:260px; overflow:auto;">${this.popupHtmlForFeature(lyr?.feature, lyr)}</div>`

            if (on === true) {
              if (typeof lyr.bindTooltip === 'function') {
                lyr.bindTooltip(
                    `<div style="max-height:350px; overflow:auto; min-width:300px;">${html}</div>`,
                    { permanent: false, sticky: true, direction: 'top', opacity: 0.95 }
                )
              }
            } else {
              if (typeof lyr.unbindTooltip === 'function') lyr.unbindTooltip()
            }
          }
        } catch (e) {
          console.warn('[PetaPostgis][tooltip] toggle update failed', e)
        }
      }
    },

    datasetIdsNorm: {
      immediate: true,
      async handler(nextIds, prevIds) {
        if (this.sameIntArray(nextIds, prevIds)) return

        if (!Array.isArray(nextIds) || nextIds.length === 0) {
          this.geojsonData = []
          this.propertiesShowKeys = []
          this.responseBefore = { hash: null, sizeBytes: 0 }
          this.pendingRefresh = false
          this._vpRetryCount = 0
          clearTimeout(this._debounceTimer)

          this.clearMarkerClusters()
          this.clearPlainPoints()
          return
        }

        await this.$nextTick()
        this.triggerViewportFetch('datasetIds-change', { debounce: false })
      }
    },

    geojsonData: {
      deep: true,
      async handler() {
        await this.$nextTick()
        this.rebuildMarkerClustersFromGeojson()
      }
    },

    // if parent changes size via props, reflow
    height: async function () { await this.$nextTick(); this.invalidateMapSize() },
    minHeight: async function () { await this.$nextTick(); this.invalidateMapSize() },
    width: async function () { await this.$nextTick(); this.invalidateMapSize() },

    drawEnabled: {
      immediate: true,
      async handler(enabled) {
        await this.$nextTick()
        const map = this.getLeafletMap()
        if (!map) return

        requestAnimationFrame(() => {
          this.invalidateMapSize()
          this.setDrawEnabled(!!enabled)
        })
      }
    }
  },

  created() {
    // non-reactive-ish instance fields (biar Leaflet objects gak bikin overhead)
    this._resizeObserver = null

    this._drawControl = null
    this._drawnItems = null
    this._onDrawCreatedHandler = null
    this._onDrawEditedHandler = null
    this._drawHostObserver = null

    this._markerClusterGroup = null
    this._markerClusterGeojsonLayer = null
    this._markerPlainGeojsonLayer = null
    this._pointsRebuildToken = 0
    this._markerClusterPluginPromise = null

    this._markerIconCache = new Map()

    this._featureIndex = new Map() // layerId -> layer
    this._textIndex = []           // {text, layerId}
    this._highlighted = new Set()  // layerId set

    this._colorMap = {}

    this._debounceTimer = null
    this._vpRetryCount = 0
  },

  mounted: async function () {
    await this.$nextTick()

    window.openInGmap = this.openInGmap

    this.invalidateMapSize()
    this.onMapUpdate()

    document.addEventListener('fullscreenchange', this.onFsChange)

    // observe wrapper size changes
    const wrapper = this.$refs.wrapperRef
    if (wrapper && typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => this.invalidateMapSize())
      })
      try {
        this._resizeObserver.observe(wrapper)
      } catch (e) {
        console.warn('[PetaPostgis][ResizeObserver] observe failed', e)
      }
    }
  },

  beforeUnmount() {
    delete window.openInGmap
    document.removeEventListener('fullscreenchange', this.onFsChange)

    this.clearMarkerClusters()
    this.clearPlainPoints()

    if (this._resizeObserver) {
      try { this._resizeObserver.disconnect() } catch (e) { console.warn('[PetaPostgis][ResizeObserver] disconnect failed', e) }
      this._resizeObserver = null
    }

    const map = this.getLeafletMap()
    if (map && this._onDrawCreatedHandler) {
      try { map.off(DRAW_EVT_CREATED, this._onDrawCreatedHandler) } catch (e) { console.warn('[draw] off created failed', e) }
      this._onDrawCreatedHandler = null
    }
    if (this._drawHostObserver) {
      try { this._drawHostObserver.disconnect() } catch (e) { console.warn('[draw] host observer disconnect failed', e) }
      this._drawHostObserver = null
    }
    if (map && this._onDrawEditedHandler) {
      try { map.off(DRAW_EVT_EDITED, this._onDrawEditedHandler) } catch (e) { console.warn('[draw] off edited failed', e) }
      this._onDrawEditedHandler = null
    }

    try { this._markerIconCache.clear() } catch (e) { console.warn('[markerIcon] cache clear failed', e) }

    try {
      if (map && this._markerClusterGroup) {
        map.removeLayer(this._markerClusterGroup)
      }
      this._markerClusterGroup = null
      this._markerClusterGeojsonLayer = null
    } catch (e) {
      console.warn('[PetaPostgis][cluster] cleanup failed', e)
    }
  },

  methods: {
    // ====== Refs helpers ======
    getLeafletMap() {
      const r = this.$refs.mapRef
      return r?.leafletObject || r?.mapObject || null
    },

    invalidateMapSize() {
      const map = this.getLeafletMap()
      if (map && typeof map.invalidateSize === 'function') {
        map.invalidateSize(true)
      }
    },

    // ===== fullscreen =====
    onFsChange() {
      this.isFullscreen = !!document.fullscreenElement
      requestAnimationFrame(() => this.invalidateMapSize())
    },

    toggleFullscreen() {
      try {
        const mapInstance = this.getLeafletMap()
        const container =
            mapInstance?.getContainer?.() ||
            this.$refs.mapRef?.$el ||
            document.querySelector('.map-wrapper')

        if (mapInstance && typeof mapInstance.toggleFullscreen === 'function') {
          mapInstance.toggleFullscreen()
          return
        }
        if (container && container.requestFullscreen) {
          container.requestFullscreen()
          return
        }
        this.snackbar = { show: true, color: 'warning', text: 'Fullscreen tidak didukung di browser ini', timeout: 1500 }
      } catch (e) {
        console.error('toggleFullscreen error', e)
        this.snackbar = { show: true, color: 'error', text: 'Gagal mengaktifkan fullscreen', timeout: 1800 }
      }
    },

    // ===== basemap =====
    setBasemap(id) {
      if (!basemaps[id]) return
      this.activeBasemapId = id

      const map = this.getLeafletMap()
      if (map) {
        const newMax = basemaps[id].maxZoom || 19
        const currentZoom = map.getZoom()
        if (currentZoom > newMax) map.setZoom(newMax)
      }
    },

    // ===== highlight/indexing =====
    cleanupHighlightIndices() {
      try {
        this.clearHighlights()
        this._featureIndex = new Map()
        this._textIndex = []
      } catch (e) {
        console.warn('[PetaPostgis][highlight] cleanupHighlightIndices failed', e)
      }
    },

    normalizeText(v) {
      return String(v ?? '').toLowerCase().trim()
    },

    buildSearchTextForFeatureProps(props = {}) {
      try {
        const parts = []
        try {
          const desc = ZonaColorMapper.getDescCandidate(props)
          if (desc) parts.push(String(desc))
        } catch (e) {
          console.warn('[PetaPostgis][highlight] ZonaColorMapper.getDescCandidate failed (ignored)', e)
        }

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
    },

    resetLayerStyle(layer) {
      try {
        if (layer && typeof layer.setStyle === 'function') {
          const style = this.styleOption(layer?.feature)
          layer.setStyle(style)
        }
      } catch (e) {
        console.warn('[PetaPostgis][highlight] resetLayerStyle failed', e)
      }
    },

    setMarkerDomHighlight(marker, on) {
      try {
        const el = marker?._icon
        if (!el || !el.classList) return
        if (on) {
          el.classList.add('marker-highlight')
          el.style.filter = 'drop-shadow(0 0 8px rgba(255,0,204,0.95))'
        } else {
          el.classList.remove('marker-highlight')
          if (el.style && el.style.filter) el.style.filter = ''
        }
      } catch (e) {
        console.warn('[PetaPostgis][highlight] setMarkerDomHighlight failed', e)
      }
    },

    applyLayerHighlight(layer) {
      try {
        const hl = '#ff00cc'
        if (layer && typeof layer.setStyle === 'function') {
          layer.setStyle({ color: hl, weight: 6, opacity: 1, fillColor: hl, fillOpacity: 0.65 })
        }
        this.setMarkerDomHighlight(layer, true)
        const el = layer?._icon
        if (el && el.style) el.style.filter = 'drop-shadow(0 0 8px rgba(255,0,204,0.95))'
      } catch (e) {
        console.warn('[PetaPostgis][highlight] applyLayerHighlight failed', e)
      }
    },

    clearHighlights() {
      try {
        for (const id of this._highlighted) {
          const lyr = this._featureIndex.get(id)
          if (!lyr) continue
          if (typeof lyr.setStyle === 'function') this.resetLayerStyle(lyr)
          this.setMarkerDomHighlight(lyr, false)
        }
        this._highlighted.clear()
      } catch (e) {
        console.warn('[PetaPostgis][highlight] clearHighlights failed', e)
      }
    },

    highlightByKeyword(keywordRaw) {
      const q = this.normalizeText(keywordRaw)
      if (!q) {
        this.clearHighlights()
        return
      }
      this.clearHighlights()
      try {
        const matches = this._textIndex
            .filter(x => x?.text && x.text.includes(q))
            .slice(0, 250)

        for (const m of matches) {
          const lyr = this._featureIndex.get(m.layerId)
          if (!lyr) continue
          this._highlighted.add(m.layerId)
          this.applyLayerHighlight(lyr)
        }
      } catch (e) {
        console.warn('[PetaPostgis][highlight] highlightByKeyword failed', e)
      }
    },

    highlightByFeatureKey(featureKeyRaw) {
      const key = this.normalizeText(featureKeyRaw)
      if (!key) {
        this.clearHighlights()
        return
      }
      this.clearHighlights()
      try {
        for (const [id, lyr] of this._featureIndex.entries()) {
          const props = lyr?.feature?.properties || {}
          const fk = this.normalizeText(
              props.featureKey ?? props.feature_key ?? props.FEATURE_KEY ?? props.id ?? props.ID ?? ''
          )
          if (fk && fk.includes(key)) {
            this._highlighted.add(id)
            this.applyLayerHighlight(lyr)
          }
        }
      } catch (e) {
        console.warn('[PetaPostgis][highlight] highlightByFeatureKey failed', e)
      }
    },

    // ===== styling =====
    styleOption(feature) {
      let weight = 1.2
      let fillOpacity = 0.35

      const props = feature?.properties || {}
      const geomType = feature?.geometry?.type || ''

      if (geomType === 'MultiLineString' || geomType === 'LineString') {
        weight = 4.5
        fillOpacity = 0
      }

      const desc = ZonaColorMapper.getDescCandidate(props)
      const { canonical, hex } = ZonaColorMapper.findZoneHexByIncludes(desc)

      if (canonical && !this._colorMap[canonical]) {
        this._colorMap[canonical] = hex
      }

      return { color: hex, weight, opacity: 0.9, fillColor: hex, fillOpacity }
    },

    // ===== GeoJSON injectors =====
    injectDatasetIdIntoGeojson(gj, dsId) {
      try {
        const did = Number(dsId)
        if (!Number.isFinite(did) || did <= 0) return gj
        if (!gj || typeof gj !== 'object') return gj

        let clone = null
        try {
          if (typeof structuredClone === 'function') clone = structuredClone(gj)
        } catch (err) {
          console.warn('[PetaPostgis][injectDatasetIdIntoGeojson] structuredClone failed, fallback JSON', err)
        }
        if (!clone) clone = JSON.parse(JSON.stringify(gj))

        try { clone.__datasetId = did } catch (e) { console.warn('[PetaPostgis][injectDatasetIdIntoGeojson] set root tag failed', e) }

        if (clone.type === 'Feature') {
          clone.properties = clone.properties || {}
          clone.properties.__datasetId = did
          return clone
        }

        if (clone.type === 'FeatureCollection' && Array.isArray(clone.features)) {
          clone.features.forEach((f) => {
            if (!f || f.type !== 'Feature') return
            f.properties = f.properties || {}
            f.properties.__datasetId = did
          })
          return clone
        }
        return clone
      } catch (e) {
        console.warn('[PetaPostgis][injectDatasetIdIntoGeojson] failed', e)
        return gj
      }
    },

    normalizeMarkerImage(v) {
      const s = String(v ?? '').trim()
      return s ? s : null
    },

    injectMarkerImageIntoGeojson(geojson, markerImageRaw) {
      try {
        const mi = this.normalizeMarkerImage(markerImageRaw)
        if (!mi) return geojson
        if (!geojson || typeof geojson !== 'object') return geojson

        const t = geojson.type
        if (t === 'FeatureCollection' && Array.isArray(geojson.features)) {
          for (const f of geojson.features) {
            if (!f || typeof f !== 'object') continue
            if (f.type !== 'Feature') continue
            if (!f.properties || typeof f.properties !== 'object') f.properties = {}
            if (f.properties.markerImage == null || String(f.properties.markerImage).trim() === '') f.properties.markerImage = mi
            if (f.properties.marker_image == null || String(f.properties.marker_image).trim() === '') f.properties.marker_image = mi
          }
          return geojson
        }

        if (t === 'Feature') {
          if (!geojson.properties || typeof geojson.properties !== 'object') geojson.properties = {}
          if (geojson.properties.markerImage == null || String(geojson.properties.markerImage).trim() === '') geojson.properties.markerImage = mi
          if (geojson.properties.marker_image == null || String(geojson.properties.marker_image).trim() === '') geojson.properties.marker_image = mi
          return geojson
        }

        return geojson
      } catch (e) {
        console.warn('[PetaPostgis][markerImage] inject failed', e)
        return geojson
      }
    },

    // ===== marker icons =====
    resolveMarkerImageUrl(markerImage) {
      const v = (markerImage == null) ? '' : String(markerImage).trim()
      if (!v) return ''
      if (/^https?:\/\//i.test(v)) return v
      try {
        return FileService.fileMarker(v)
      } catch (e) {
        console.warn('[PetaPostgis][resolveMarkerImageUrl] fallback raw value', e)
        return v
      }
    },

    isPointTipePeta(tipePeta) {
      try {
        if (ETipePeta?.POINT != null && tipePeta === ETipePeta.POINT) return true
        const s = String(tipePeta ?? '').trim().toUpperCase()
        if (s === 'POINT') return true
        const n = Number(tipePeta)
        return Number.isFinite(n) && n === 1
      } catch (e) {
        console.warn('[PetaPostgis][isPointTipePeta] failed', e)
        return true
      }
    },

    getMarkerIconForFeature(feature) {
      try {
        const debugOn = (this.$props?.debugMarkerIcon === true)
        const debugMarker = (...args) => {
          if (!debugOn) return
          try { console.log('[PetaPostgis][markerIcon]', ...args) } catch (e) { console.warn('[markerIcon] debug log failed', e) }
        }

        const propsFeature = feature?.properties || {}
        const dsIdRaw = (
            propsFeature.__datasetId ??
            propsFeature.__datasetBean ??
            propsFeature.ftDatasetBean ??
            propsFeature.ft_dataset_bean ??
            propsFeature.datasetId ??
            propsFeature.dataset_id ??
            propsFeature.ftDatasetId ??
            propsFeature.datasetBean ??
            propsFeature.idDataset ??
            propsFeature.id_dataset
        )

        let dsId = (dsIdRaw == null || String(dsIdRaw).trim() === '') ? null : Number(dsIdRaw)

        if ((!Number.isFinite(dsId) || dsId == null || dsId <= 0) && Number.isFinite(feature?.__datasetId)) {
          dsId = Number(feature.__datasetId)
        }

        if (!Number.isFinite(dsId) || dsId == null || dsId <= 0) {
          debugMarker('checkpoint: dsId missing/invalid', { dsIdRaw, dsId, featureId: feature?.id, markerKey: propsFeature?.__markerKey })
          dsId = null
        } else {
          debugMarker('checkpoint: dsId ok', { dsId })
        }

        const list = Array.isArray(this.itemsMapsetSelected) ? this.itemsMapsetSelected : []
        let ds = null

        if (dsId == null && list.length === 1) {
          ds = list[0]
          debugMarker('checkpoint: ds fallback single selected', { dsId: null, selectedCount: list.length })
        }

        if (!ds && dsId != null && list.length > 0) {
          ds = list.find(x => {
            const xid = Number(
                x?.id ?? x?.datasetId ?? x?.dataset_id ?? x?.ftDatasetBean ?? x?.ft_dataset_bean ?? x?.ftDatasetId ?? x?.datasetBean
            )
            return Number.isFinite(xid) && xid === dsId
          })
          debugMarker('checkpoint: ds match by dsId', { dsId, found: Boolean(ds), selectedCount: list.length })
        }

        if (!ds) {
          debugMarker('checkpoint: ds not found -> default marker', { dsId, selectedCount: list.length })
          return null
        }

        const tipePeta = ds?.tipePeta ?? ds?.tipe_peta
        if (tipePeta != null && !this.isPointTipePeta(tipePeta)) {
          debugMarker('checkpoint: tipePeta not POINT -> skip custom icon', { tipePeta, dsId: ds?.id ?? dsId })
          return null
        }

        const markerImageFromFeature = (propsFeature?.markerImage ?? propsFeature?.marker_image ?? null)
        const markerImageFromDataset = (ds?.markerImage ?? ds?.marker_image ?? null)

        const markerImageRaw = (markerImageFromFeature != null && String(markerImageFromFeature).trim() !== '')
            ? markerImageFromFeature
            : markerImageFromDataset

        if (markerImageRaw == null || String(markerImageRaw).trim() === '') {
          debugMarker('checkpoint: markerImage missing -> default marker', { dsId: ds?.id ?? dsId })
          return null
        }

        const markerImageUrl = this.resolveMarkerImageUrl(markerImageRaw)
        if (!markerImageUrl) {
          debugMarker('checkpoint: resolveMarkerImageUrl failed -> default marker', { dsId: ds?.id ?? dsId })
          return null
        }

        const iconSize = [32, 32]
        const cacheKey = `${markerImageUrl}|${iconSize[0]}x${iconSize[1]}`
        const cached = this._markerIconCache.get(cacheKey)
        if (cached) {
          debugMarker('checkpoint: icon cache hit', { cacheKey })
          return cached
        }

        const icon = L.icon({
          iconUrl: markerImageUrl,
          iconSize,
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
          shadowUrl: undefined,
          shadowSize: undefined,
          shadowAnchor: undefined
        })

        this._markerIconCache.set(cacheKey, icon)
        debugMarker('checkpoint: icon created', { cacheKey })
        return icon
      } catch (e) {
        console.warn('[PetaPostgis][getMarkerIconForFeature] failed, fallback default marker', e)
        return null
      }
    },

    markerIconByFeature(feature) {
      try {
        return this.getMarkerIconForFeature(feature) || defaultMarkerIcon
      } catch (e) {
        console.warn('[PetaPostgis][markerIconByFeature] failed', e)
        return defaultMarkerIcon
      }
    },

    // Leaflet GeoJSON pointToLayer
    pointToLayerOption(feature, latlng) {
      try {
        const icon = this.markerIconByFeature(feature)
        const mk = feature?.properties?.__markerKey
        const marker = L.marker(latlng, { icon })
        if (mk) marker.options.__markerKey = mk
        return marker
      } catch (e) {
        console.warn('[PetaPostgis][pointToLayer] fallback default marker', e)
        return L.marker(latlng, { icon: defaultMarkerIcon })
      }
    },

    // ===== popup html =====
    escapeHtml(str) {
      return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;')
    },

    jsonToHtmlTable_Mobile(jsonValue, keys = [], ll = null) {
      const myObj = jsonValue || {}
      const allow = Array.isArray(keys) ? keys : []
      const keyList = allow.length ? allow : Object.keys(myObj).sort((a, b) => String(a).localeCompare(String(b)))

      if (!keyList.length) return `<div style="font-size:12px; opacity:0.75; padding:2px 0;">Tidak ada data.</div>`

      let rows = ''
      for (const meta of keyList) {
        if (!Object.prototype.hasOwnProperty.call(myObj, meta)) continue
        const v = myObj[meta]
        if (v === undefined || v === null) continue
        if (!this.escapeHtml(meta).includes('__datasetId') && !this.escapeHtml(meta).includes('__propertiesShow')) {
          rows += `
          <tr>
            <td style="padding:4px 0; word-break:break-word;">
              <b>${this.escapeHtml(meta)}</b>: ${this.escapeHtml(v)}
            </td>
          </tr>`
        }
      }

      if (!rows) return `<div style="font-size:12px; opacity:0.75; padding:2px 0;">Tidak ada data.</div>`

      const lat = ll?.lat
      const lng = ll?.lng
      const disabled = !(Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)))

      const btnHtml = `
        <div style="margin-bottom:10px; display:flex; justify-content:flex-end;">
          <button type="button" class="btn-open-streetview"
            data-lat="${disabled ? '' : lat}" data-lng="${disabled ? '' : lng}" data-zoom="20"
            ${disabled ? 'disabled' : ''}
            title="${disabled ? 'Koordinat tidak ditemukan' : 'Buka StreetView di Google Maps'}"
            style="padding:4px 8px; border:1px solid #bbb; background:#f5f5f5; color:#222; border-radius:4px; cursor:pointer; font-size:11px; line-height:1.1;">
            Cek Street View
          </button>
          <span style="display:inline-block; width:12px;"></span>
          <button type="button" class="btn-open-gmap"
            data-lat="${disabled ? '' : lat}" data-lng="${disabled ? '' : lng}" data-zoom="20"
            ${disabled ? 'disabled' : ''}
            title="${disabled ? 'Koordinat tidak ditemukan' : 'Buka lokasi di Google Maps'}"
            style="padding:4px 8px; border:1px solid #bbb; background:#f5f5f5; color:#222; border-radius:4px; cursor:pointer; font-size:11px; line-height:1.1;">
            Open in Gmap
          </button>
        </div>`

      return `${btnHtml}<table style="width: 240px; font-size:12px"><tbody>${rows}</tbody></table>`
    },

    jsonToHtmlTable(jsonValue, keys = [], ll = null) {
      const myObj = jsonValue || {}
      const allow = Array.isArray(keys) ? keys : []
      const keyList = allow.length ? allow : Object.keys(myObj).sort((a, b) => String(a).localeCompare(String(b)))

      if (!keyList.length) return `<div style="font-size:12px; opacity:0.75; padding:2px 0;">Tidak ada data.</div>`

      let rows = ''
      for (const meta of keyList) {
        if (!Object.prototype.hasOwnProperty.call(myObj, meta)) continue
        const val = myObj[meta]
        if (val === undefined || val === null) continue
        if (!this.escapeHtml(meta).includes('__datasetId') && !this.escapeHtml(meta).includes('__propertiesShow')) {
          rows += `
          <tr>
            <td style="font-weight:600; padding:2px 6px 2px 0; vertical-align:top;">${this.escapeHtml(meta)}</td>
            <td style="padding:2px 6px; vertical-align:top;">:</td>
            <td style="padding:2px 0; word-break:break-word;">${this.escapeHtml(val)}</td>
          </tr>`
        }
      }

      if (!rows) return `<div style="font-size:12px; opacity:0.75; padding:2px 0;">Tidak ada data.</div>`

      const lat = ll?.lat
      const lng = ll?.lng
      const disabled = !(Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)))

      const btnHtml = `
        <div style="margin-bottom:10px; display:flex; justify-content:flex-end;">
          <button type="button" class="btn-open-streetview"
            data-lat="${disabled ? '' : lat}" data-lng="${disabled ? '' : lng}" data-zoom="20"
            ${disabled ? 'disabled' : ''}
            title="${disabled ? 'Koordinat tidak ditemukan' : 'Buka StreetView di Google Maps'}"
            style="padding:4px 8px; border:1px solid #bbb; background:#f5f5f5; color:#222; border-radius:4px; cursor:pointer; font-size:11px; line-height:1.1;">
            Cek Street View
          </button>
          <span style="display:inline-block; width:12px;"></span>
          <button type="button" class="btn-open-gmap"
            data-lat="${disabled ? '' : lat}" data-lng="${disabled ? '' : lng}" data-zoom="20"
            ${disabled ? 'disabled' : ''}
            title="${disabled ? 'Koordinat tidak ditemukan' : 'Buka lokasi di Google Maps'}"
            style="padding:4px 8px; border:1px solid #bbb; background:#f5f5f5; color:#222; border-radius:4px; cursor:pointer; font-size:11px; line-height:1.1;">
            Open in Gmap
          </button>
        </div>`

      return `${btnHtml}<table style="min-width:240px; max-width:340px; font-size:12px;"><tbody>${rows}</tbody></table>`
    },

    popupHtmlForFeature(feature, layer) {
      const props = feature?.properties || {}
      const isMobile = typeof window !== 'undefined'
          && window.matchMedia
          && window.matchMedia('(max-width: 480px)').matches

      const keys = this.propertiesShowKeys || []
      const ll = this.pickLatLngForPopup(feature, layer)

      return isMobile
          ? this.jsonToHtmlTable_Mobile(props, keys, ll)
          : this.jsonToHtmlTable(props, keys, ll)
    },

    pickLatLngForPopup(feature, layer) {
      try {
        const geom = feature?.geometry
        if (geom?.type === 'Point' && Array.isArray(geom.coordinates)) {
          const lng = Number(geom.coordinates[0])
          const lat = Number(geom.coordinates[1])
          if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
        }

        if (layer?.getBounds && typeof layer.getBounds === 'function') {
          const c = layer.getBounds().getCenter()
          const lat = Number(c?.lat)
          const lng = Number(c?.lng)
          if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
        }

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
    },

    openGMapsAt(lat, lng, zoom = 20) {
      try {
        const latNum = Number(lat)
        const lngNum = Number(lng)
        if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
          this.snackbar = { show: true, color: 'warning', text: 'Koordinat tidak valid', timeout: 1500 }
          return
        }
        const z = Math.max(0, Math.min(22, Number(zoom) || 20))
        const url = `https://www.google.com/maps/@${latNum},${lngNum},${z}z`
        window.open(url, '_blank', 'noopener')
      } catch (e) {
        console.error('openGMapsAt error', e)
        this.snackbar = { show: true, color: 'error', text: 'Gagal membuka Google Maps', timeout: 1800 }
      }
    },

    openGMapsStreetViewAt(lat, lng, radiusMeters = 55) {
      try {
        const latNum = Number(lat)
        const lngNum = Number(lng)
        if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
          this.snackbar = { show: true, color: 'warning', text: 'Koordinat tidak valid', timeout: 1500 }
          return
        }
        const r = Math.max(5, Math.min(200, Number(radiusMeters) || 50))
        const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latNum},${lngNum}&radius=${r}`
        window.open(url, '_blank', 'noopener')
      } catch (e) {
        console.error('openGMapsStreetViewAt error', e)
        this.snackbar = { show: true, color: 'error', text: 'Gagal membuka Street View', timeout: 1800 }
      }
    },

    openInGmap() {
      const url = `https://www.google.com/maps/search/?api=1&query=$`
      window.open(url, '_blank')
    },

    // ===== onEachFeature hook =====
    onEachFeatureOption(feature, layer) {
      try {
        const layerId = L.stamp(layer)
        this._featureIndex.set(layerId, layer)

        const propsFeature = feature?.properties || {}
        const text = this.buildSearchTextForFeatureProps(propsFeature)
        if (text) this._textIndex.push({ text, layerId })

        if (layer && typeof layer.on === 'function') {
          layer.on('remove', () => {
            try {
              this.setMarkerDomHighlight(layer, false)
              this._highlighted.delete(layerId)
              this._featureIndex.delete(layerId)
            } catch (e) {
              console.warn('[PetaPostgis][highlight] layer remove cleanup failed', e)
            }
          })
        }

        const html = `<div style="max-height:260px; overflow:auto;">${this.popupHtmlForFeature(feature, layer)}</div>`

        if (layer && typeof layer.bindPopup === 'function') {
          layer.bindPopup(html, { autoPan: false, closeButton: true })

          layer.on('popupopen', (e) => {
            try {
              const el = e?.popup?.getElement?.()
              if (!el) return

              const btnGmap = el.querySelector('.btn-open-gmap')
              const btnStreetview = el.querySelector('.btn-open-streetview')
              if (!btnGmap && !btnStreetview) return

              const parseLatLng = (btn) => {
                const latRaw = (btn?.getAttribute('data-lat') ?? '').trim()
                const lngRaw = (btn?.getAttribute('data-lng') ?? '').trim()
                if (!latRaw || !lngRaw) return null
                const lat = Number(latRaw)
                const lng = Number(lngRaw)
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
                return { lat, lng }
              }

              if (btnGmap) {
                btnGmap.onclick = (ev) => {
                  ev.preventDefault()
                  ev.stopPropagation()
                  const ll = parseLatLng(btnGmap)
                  if (!ll) return
                  const z = Number(btnGmap.getAttribute('data-zoom')) || 20
                  this.openGMapsAt(ll.lat, ll.lng, z)
                }
              }

              if (btnStreetview) {
                btnStreetview.onclick = (ev) => {
                  ev.preventDefault()
                  ev.stopPropagation()
                  const ll = parseLatLng(btnStreetview)
                  if (!ll) return
                  this.openGMapsStreetViewAt(ll.lat, ll.lng)
                }
              }
            } catch (err) {
              console.warn('[PetaPostgis][popup] popupopen handler error', err)
            }
          })

          if (this.mapToolTipOn === true) {
            layer.bindTooltip(
                `<div style="max-height:350px; overflow:auto; min-width:300px;">${html}</div>`,
                { permanent: false, sticky: true, direction: 'top', opacity: 0.95 }
            )
          } else {
            if (typeof layer.unbindTooltip === 'function') layer.unbindTooltip()
          }
        }

        // polygon click highlight (single active)
        try {
          const geomType = feature?.geometry?.type || ''
          const isPolygon = (geomType === 'Polygon' || geomType === 'MultiPolygon')
          if (isPolygon && layer && typeof layer.on === 'function') {
            layer.on('click', () => {
              try {
                this.clearHighlights()
                this._highlighted.add(layerId)
                this.applyLayerHighlight(layer)
              } catch (e) {
                console.warn('[PetaPostgis][highlight] click highlight failed', e)
              }
            })
          }
        } catch (e) {
          console.warn('[PetaPostgis][highlight] setup click highlight failed', e)
        }
      } catch (e) {
        console.warn('[PetaPostgis][onEachFeatureOption] failed', e)
      }
    },

    // ===== map lifecycle =====
    onMapReady() {
      this.isMapReady = true
      this.ensureMarkerClusterPluginLoaded()
      this.rebuildMarkerClustersFromGeojson()

      requestAnimationFrame(() => this.invalidateMapSize())

      const map = this.getLeafletMap()
      requestAnimationFrame(() => { if (map) this.rehomeDrawToolbar(map) })

      this.$nextTick(() => {
        const m = this.getLeafletMap()
        if (this.drawEnabled) {
          this.initDrawTools(m)
          if (this._drawControl && !this._drawControl._map) {
            try { m.addControl(this._drawControl) } catch (e) { console.warn('[draw] addControl failed', e) }
          }
        }
      })

      this.$nextTick(() => {
        requestAnimationFrame(() => {
          if (this.pendingRefresh) {
            this.pendingRefresh = false
            this.triggerViewportFetch('pending-refresh', { debounce: false })
          } else {
            this.triggerViewportFetch('map-ready', { debounce: false })
          }
        })
      })
    },

    onMapUpdate() {
      const map = this.getLeafletMap()
      if (!map) return

      const z = map.getZoom()
      this.rebuildMarkerClustersFromGeojson()

      if (z !== this.lastZoom) {
        const delta = z - this.lastZoom
        const direction = delta > 0 ? 'Perbesar' : 'Perkecil'
        this.zoomInfoMessage = `${direction} zoom: ${z}`
        this.lastZoom = z
        this.showZoomInfo = true
        setTimeout(() => { this.showZoomInfo = false }, 800)
      }

      if (z < 9) return
      this.triggerViewportFetch('map-update', { debounce: true })
    },

    // ===== viewport fetch =====
    sameIntArray(a = [], b = []) {
      if (a === b) return true
      if (!Array.isArray(a) || !Array.isArray(b)) return false
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
      return true
    },

    getViewportFromMap() {
      const map = this.getLeafletMap()
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
    },

    safeByteSizeOf(v) {
      try {
        if (v == null) return 0
        if (typeof v === 'string') return new Blob([v]).size
        return new Blob([JSON.stringify(v)]).size
      } catch (e) {
        try { return String(v).length } catch (err) { console.warn('[byteSize] fallback failed', err); return 0 }
      }
    },

    hashStringFNV1a(str) {
      const s = typeof str === 'string' ? str : String(str ?? '')
      let h = 0x811c9dc5
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i)
        h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0
      }
      return h.toString(16)
    },

    safeParseGeojson(v, idForLog) {
      if (!v) return null
      if (typeof v === 'object') return v
      if (typeof v !== 'string') return null
      try {
        return JSON.parse(v)
      } catch (e) {
        console.error('[viewport] geojsonForMap JSON.parse failed', { id: idForLog, err: e, sample: String(v).slice(0, 160) })
        return null
      }
    },

    normalizePropertiesShowKeys(v) {
      if (v == null) return []
      if (Array.isArray(v)) {
        return v.map(x => String(x ?? '').trim()).filter(Boolean)
      }
      if (typeof v === 'string') {
        const s = v.trim()
        if (!s) return []
        try {
          const parsed = JSON.parse(s)
          if (Array.isArray(parsed)) {
            return parsed.map(x => String(x ?? '').trim()).filter(Boolean)
          }
        } catch (e) {
          // ignore JSON parse error, fallback comma
        }
        return s.split(',').map(x => x.trim()).filter(Boolean)
      }
      if (typeof v === 'object') {
        return Object.keys(v).map(x => String(x ?? '').trim()).filter(Boolean)
      }
      return []
    },

    triggerViewportFetch(reason = 'unknown', { debounce = false } = {}) {
      if (!this.datasetIdsNorm.length) {
        this.geojsonData = []
        this.propertiesShowKeys = []
        this.responseBefore = { hash: null, sizeBytes: 0 }
        return
      }

      const vp = this.getViewportFromMap()
      if (!vp) {
        this.pendingRefresh = true
        if (this.isMapReady && this._vpRetryCount < MAX_VP_RETRY) {
          this._vpRetryCount++
          clearTimeout(this._debounceTimer)
          this._debounceTimer = setTimeout(() => {
            this.triggerViewportFetch(`${reason}-retry-${this._vpRetryCount}`, { debounce: false })
          }, 60)
        }
        return
      }

      this._vpRetryCount = 0

      const doFetch = () => {
        const startedAt = (typeof performance !== 'undefined' && typeof performance.now === 'function')
            ? performance.now()
            : Date.now()

        this.fetchViewportData({
          minX: vp.minX, minY: vp.minY, maxX: vp.maxX, maxY: vp.maxY, z: vp.z,
          reason, startedAt
        })
      }

      if (!debounce) {
        clearTimeout(this._debounceTimer)
        doFetch()
        return
      }

      clearTimeout(this._debounceTimer)
      this._debounceTimer = setTimeout(doFetch, DEBOUNCE_DELAY)
    },

    async fetchViewportData({ minX, minY, maxX, maxY, z, reason, startedAt }) {
      if (!this.datasetIdsNorm.length) {
        this.geojsonData = []
        return
      }

      try {
        const reqViewport = {
          minLon: minX,
          minLat: minY,
          maxLon: maxX,
          maxLat: maxY,
          zoom: z,
          ids: this.datasetIdsNorm
        }

        const res = await FtDatasetExtService.getPostViewportClippedPublic(reqViewport)

        let psRaw = res?.data?.propertiesShow
        if (psRaw == null && Array.isArray(res?.data) && res.data.length > 0) psRaw = res.data?.[0]?.propertiesShow
        if (psRaw == null && (res?.data?.items || res?.data?.data)) {
          const first = (res.data.items || res.data.data)?.[0]
          psRaw = first?.propertiesShow
        }
        this.propertiesShowKeys = this.normalizePropertiesShowKeys(psRaw)

        const rawText = (typeof res?.data === 'string') ? res.data : JSON.stringify(res?.data ?? null)
        const rawSizeBytes = this.safeByteSizeOf(rawText)
        const rawHash = this.hashStringFNV1a(rawText)
        this.responseBefore = { hash: rawHash, sizeBytes: rawSizeBytes }

        // reset indices (viewport refresh)
        this.cleanupHighlightIndices()

        let payload = res?.data
        if (typeof payload === 'string') {
          const parsed = this.safeParseGeojson(payload, 'res.data')
          payload = parsed ?? payload
        }

        // A: Array of rows (geojsonForMap)
        if (Array.isArray(payload)) {
          this.geojsonData = payload
              .map(item => {
                const parsed = this.safeParseGeojson(item?.geojsonForMap, item?.id)
                if (!parsed) return null

                const dsIdRaw = (
                    parsed?.datasetId ?? parsed?.dataset_id ?? parsed?.ftDatasetBean ?? parsed?.ft_dataset_bean ??
                    item?.datasetId ?? item?.ftDatasetBean ?? item?.ft_dataset_bean ?? item?.ftDatasetId ?? item?.datasetBean ?? null
                )

                const markerImageRaw = (
                    item?.markerImage ?? item?.marker_image ?? parsed?.markerImage ?? parsed?.marker_image ?? null
                )

                const out = this.injectDatasetIdIntoGeojson(parsed, dsIdRaw)
                this.injectMarkerImageIntoGeojson(out, markerImageRaw)
                return out
              })
              .filter(Boolean)
          return
        }

        // B: wrapper {items:[]}/{data:[]}
        const maybeArr = payload?.items || payload?.data
        if (Array.isArray(maybeArr)) {
          this.geojsonData = maybeArr
              .map(item => {
                const parsed = this.safeParseGeojson(item?.geojsonForMap, item?.id)
                if (!parsed) return null

                const dsIdRaw = (
                    parsed?.datasetId ?? parsed?.dataset_id ?? parsed?.ftDatasetBean ?? parsed?.ft_dataset_bean ??
                    item?.datasetId ?? item?.dataset_id ?? item?.ftDatasetBean ?? item?.ft_dataset_bean ??
                    item?.ftDatasetId ?? item?.datasetBean ?? item?.idDataset ?? item?.id_dataset
                )

                const markerImageRaw = (
                    item?.markerImage ?? item?.marker_image ?? parsed?.markerImage ?? parsed?.marker_image ?? null
                )

                const out = this.injectDatasetIdIntoGeojson(parsed, dsIdRaw)
                this.injectMarkerImageIntoGeojson(out, markerImageRaw)
                return out
              })
              .filter(Boolean)
          return
        }

        // C: GeoJSON direct
        if (payload && typeof payload === 'object') {
          const t = payload.type
          if (t === 'FeatureCollection' || t === 'Feature') {
            const dsIdRootRaw = payload?.datasetId ?? payload?.dataset_id ?? payload?.ftDatasetBean ?? payload?.ft_dataset_bean
            const dsIdRoot = Number(dsIdRootRaw)
            if (Number.isFinite(dsIdRoot) && dsIdRoot > 0) {
              this.injectDatasetIdIntoGeojson(payload, dsIdRoot)
            }
            this.geojsonData = [payload]
            return
          }
        }

        console.warn('[viewport] unexpected response shape', {
          reason,
          type: typeof payload,
          keys: payload && typeof payload === 'object' ? Object.keys(payload) : null,
          sample: typeof res?.data === 'string' ? res.data.slice(0, 160) : null
        })
        this.geojsonData = []
      } catch (err) {
        const endedAt = (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now()
        const elapsedMs = (Number.isFinite(Number(endedAt)) && Number.isFinite(Number(startedAt))) ? (endedAt - startedAt) : null

        console.error('Error fetch viewport data:', err, {
          reason,
          elapsedMs: elapsedMs != null ? Number(elapsedMs.toFixed(1)) : null,
          ids: this.datasetIdsNorm
        })

        this.snackbar = {
          show: true,
          color: 'error',
          text: 'Gagal memuat data peta (viewport). Cek API/Network & parameter ids.',
          timeout: 2500
        }
      }
    },

    // ===== cluster plugin =====
    async ensureMarkerClusterPluginLoaded() {
      if (typeof L?.markerClusterGroup === 'function') return true
      if (this._markerClusterPluginPromise) return this._markerClusterPluginPromise

      this._markerClusterPluginPromise = (async () => {
        try {
          if (typeof window !== 'undefined' && window && !window.L) window.L = L
          await import('leaflet.markercluster/dist/leaflet.markercluster.js')
          const ok = typeof L?.markerClusterGroup === 'function'
          if (!ok) console.warn('[PetaPostgis][cluster] loaded but L.markerClusterGroup missing')
          return ok
        } catch (e) {
          console.warn('[PetaPostgis][cluster] failed to load markercluster plugin', e)
          return false
        } finally {
          if (typeof L?.markerClusterGroup !== 'function') this._markerClusterPluginPromise = null
        }
      })()

      return this._markerClusterPluginPromise
    },

    clearPlainPoints() {
      try {
        const map = this.getLeafletMap()
        if (map && this._markerPlainGeojsonLayer && map.hasLayer(this._markerPlainGeojsonLayer)) {
          map.removeLayer(this._markerPlainGeojsonLayer)
        }
        this._markerPlainGeojsonLayer = null
      } catch (e) {
        console.warn('[PetaPostgis][plainPoints] clear failed', e)
      }
    },

    rebuildPlainPointsFromGeojson(token = null) {
      const map = this.getLeafletMap()
      if (!map) return
      this.clearPlainPoints()

      try {
        const newLayer = L.geoJSON(this.geojsonDataPoint, {
          pointToLayer: this.pointToLayerOption,
          onEachFeature: this.onEachFeatureOption
        })

        if (token != null && token !== this._pointsRebuildToken) return

        newLayer.addTo(map)

        if (token != null && token !== this._pointsRebuildToken) {
          try { if (map.hasLayer(newLayer)) map.removeLayer(newLayer) } catch (err) { console.warn('[plainPoints] remove stale layer failed', err) }
          return
        }

        this._markerPlainGeojsonLayer = newLayer
      } catch (e) {
        console.warn('[PetaPostgis][plainPoints] rebuild failed', e)
      }
    },

    async ensureMarkerClusterLayer() {
      try {
        const map = this.getLeafletMap()
        if (!map) return null

        const ok = await this.ensureMarkerClusterPluginLoaded()
        if (!ok || typeof L?.markerClusterGroup !== 'function') {
          console.warn('[PetaPostgis][cluster] markerCluster plugin not loaded')
          return null
        }

        if (this._markerClusterGroup) return this._markerClusterGroup

        this._markerClusterGroup = L.markerClusterGroup({
          showCoverageOnHover: false,
          spiderfyOnMaxZoom: true,
          disableClusteringAtZoom: 18,
          chunkedLoading: true,
          removeOutsideVisibleBounds: true
        })

        if (!map.hasLayer(this._markerClusterGroup)) map.addLayer(this._markerClusterGroup)
        return this._markerClusterGroup
      } catch (e) {
        console.warn('[PetaPostgis][cluster] ensureMarkerClusterLayer failed', e)
        return null
      }
    },

    clearMarkerClusters() {
      try {
        if (this._markerClusterGeojsonLayer && this._markerClusterGroup) {
          this._markerClusterGroup.removeLayer(this._markerClusterGeojsonLayer)
          this._markerClusterGeojsonLayer = null
        }
        if (this._markerClusterGroup && typeof this._markerClusterGroup.clearLayers === 'function') {
          this._markerClusterGroup.clearLayers()
        }
      } catch (e) {
        console.warn('[PetaPostgis][cluster] clear failed', e)
      }
    },

    async rebuildMarkerClustersFromGeojson() {
      const map = this.getLeafletMap()
      if (!map) return

      const token = ++this._pointsRebuildToken

      try {
        const z = Number(map.getZoom?.())
        const zoomIsClusterOff = Number.isFinite(z) ? (z >= CLUSTER_OFF_AT_ZOOM) : false

        if (zoomIsClusterOff) {
          try {
            this.clearMarkerClusters()
            if (this._markerClusterGroup && map.hasLayer(this._markerClusterGroup)) {
              map.removeLayer(this._markerClusterGroup)
            }
          } catch (e) {
            console.warn('[PetaPostgis][cluster] detach failed', e)
          }

          if (token !== this._pointsRebuildToken) return
          this.rebuildPlainPointsFromGeojson(token)
          return
        }

        this.clearPlainPoints()
        if (token !== this._pointsRebuildToken) return

        const grp = await this.ensureMarkerClusterLayer()
        if (token !== this._pointsRebuildToken) return

        if (!grp) {
          this.rebuildPlainPointsFromGeojson(token)
          return
        }

        try { if (!map.hasLayer(grp)) map.addLayer(grp) } catch (e) { console.warn('[cluster] attach failed', e) }

        this.clearMarkerClusters()
        if (token !== this._pointsRebuildToken) return

        try {
          const newLayer = L.geoJSON(this.geojsonDataPoint, {
            pointToLayer: this.pointToLayerOption,
            onEachFeature: this.onEachFeatureOption
          })

          grp.addLayer(newLayer)

          if (token !== this._pointsRebuildToken) {
            try { grp.removeLayer(newLayer) } catch (err) { console.warn('[cluster] remove stale layer failed', err) }
            return
          }

          this._markerClusterGeojsonLayer = newLayer
        } catch (e) {
          console.warn('[PetaPostgis][cluster] rebuild failed', e)
        }
      } catch (e) {
        console.warn('[PetaPostgis][cluster] rebuildMarkerClustersFromGeojson failed', e)
      }
    },

    // ===== draw tools =====
    rehomeDrawToolbar(map) {
      try {
        const host = this.$refs.drawHostRef
        if (!map || !host) return
        const container = map.getContainer?.()
        if (!container) return
        const drawEl = container.querySelector('.leaflet-draw')
        if (!drawEl) return
        if (host.contains(drawEl)) return
        host.appendChild(drawEl)
      } catch (e) {
        console.warn('[draw] rehomeDrawToolbar failed', e)
      }
    },

    setupDrawHostObserver(map) {
      try {
        if (this._drawHostObserver) return
        const container = map?.getContainer?.()
        if (!container) return
        this._drawHostObserver = new MutationObserver(() => this.rehomeDrawToolbar(map))
        this._drawHostObserver.observe(container, { childList: true, subtree: true })
      } catch (e) {
        console.warn('[draw] setupDrawHostObserver failed', e)
      }
    },

    formatHectares(valueHa) {
      if (!Number.isFinite(valueHa)) return ''
      return Number(valueHa.toFixed(4))
    },

    setDrawnAreaTooltip(layer) {
      try {
        if (!layer) return
        let areaM2 = null

        if (layer instanceof L.Circle && typeof layer.getRadius === 'function') {
          const r = layer.getRadius()
          if (Number.isFinite(r)) areaM2 = Math.PI * r * r
        } else if (typeof layer.toGeoJSON === 'function') {
          const gj = layer.toGeoJSON()
          const t = gj?.geometry?.type
          if (t === 'Polygon' || t === 'MultiPolygon') areaM2 = turf.area(gj)
        }

        if (!Number.isFinite(areaM2)) return

        const areaHa = areaM2 / 10000
        const haText = this.formatHectares(areaHa)
        if (haText === '') return

        const html = `<div style='font-weight:700'>Luas: ${haText} ha</div>`
        if (typeof layer.unbindTooltip === 'function') layer.unbindTooltip()
        if (typeof layer.bindTooltip === 'function') {
          layer.bindTooltip(html, { permanent: false, sticky: true, direction: 'top', opacity: 0.95 })
        }
      } catch (e) {
        console.warn('[PetaPostgis][setDrawnAreaTooltip] error', e)
      }
    },

    initDrawTools(map) {
      if (!map) return

      if (!L?.Control?.Draw) {
        this.snackbar = { show: true, color: 'warning', text: 'Draw tools belum tersedia (Leaflet.Draw belum ter-load).', timeout: 2200 }
        return
      }

      const fg = this.$refs.drawGroupRef?.leafletObject || this.$refs.drawGroupRef?.mapObject

      if (this._drawControl && this._drawnItems) {
        if (!map.hasLayer(this._drawnItems)) {
          try { map.addLayer(this._drawnItems) } catch (e) { console.warn('[draw] addLayer existing failed', e) }
        }
        return
      }

      this._drawnItems = fg || new L.FeatureGroup()
      if (!map.hasLayer(this._drawnItems)) {
        try { map.addLayer(this._drawnItems) } catch (e) { console.warn('[draw] addLayer failed', e) }
      }

      this._drawControl = new L.Control.Draw({
        position: 'bottomleft',
        edit: { featureGroup: this._drawnItems, remove: true },
        draw: {
          polygon: true,
          polyline: true,
          rectangle: true,
          circle: true,
          marker: true,
          circlemarker: false
        }
      })

      this.setupDrawHostObserver(map)
      requestAnimationFrame(() => this.rehomeDrawToolbar(map))

      if (!this._onDrawCreatedHandler) {
        this._onDrawCreatedHandler = (e) => {
          const layer = e?.layer
          if (!layer) return
          if (this._drawnItems && typeof this._drawnItems.addLayer === 'function') {
            this._drawnItems.addLayer(layer)
            this.setDrawnAreaTooltip(layer)
          }
        }
        map.on(DRAW_EVT_CREATED, this._onDrawCreatedHandler)
      }

      if (!this._onDrawEditedHandler) {
        this._onDrawEditedHandler = (e) => {
          try {
            const layers = e?.layers
            if (!layers || typeof layers.eachLayer !== 'function') return
            layers.eachLayer((ly) => this.setDrawnAreaTooltip(ly))
          } catch (err) {
            console.warn('[PetaPostgis][draw:edited] handler error', err)
          }
        }
        map.on(DRAW_EVT_EDITED, this._onDrawEditedHandler)
      }
    },

    setDrawEnabled(enabled) {
      const map = this.getLeafletMap()
      if (!map) return

      if (!enabled) {
        if (this._drawControl) {
          try { map.removeControl(this._drawControl) } catch (e) { console.warn('[draw] removeControl failed', e) }
        }
        if (this._drawnItems && map.hasLayer(this._drawnItems)) {
          try { map.removeLayer(this._drawnItems) } catch (e) { console.warn('[draw] removeLayer failed', e) }
        }
        if (this._drawHostObserver) {
          try { this._drawHostObserver.disconnect() } catch (e) { console.warn('[draw] host observer disconnect failed', e) }
          this._drawHostObserver = null
        }
        return
      }

      this.initDrawTools(map)

      if (this._drawnItems && !map.hasLayer(this._drawnItems)) {
        try { map.addLayer(this._drawnItems) } catch (e) { console.warn('[draw] addLayer enable failed', e) }
      }

      if (this._drawControl && !this._drawControl._map) {
        try { map.addControl(this._drawControl) } catch (e) { console.warn('[draw] addControl enable failed', e) }
      }

      requestAnimationFrame(() => this.rehomeDrawToolbar(map))
    },

    // ===== center to user =====
    centerToUser() {
      const map = this.getLeafletMap()
      if (this.userLocation && map) {
        const z = Number.isFinite(Number(this.zoom)) ? Number(this.zoom) : 19
        map.setView(this.userLocation, z)
        return
      }

      if (!('geolocation' in navigator)) {
        this.snackbar = { show: true, color: 'warning', text: 'Geolocation tidak tersedia di browser ini', timeout: 1800 }
        return
      }

      this.snackbar = { show: true, color: 'info', text: 'Mencari lokasi GPS...', timeout: 1200 }

      navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude
            const lon = pos.coords.longitude
            const loc = [lat, lon]

            this.userLocation = loc
            this.center = loc
            this.zoom = 19

            const m = this.getLeafletMap()
            if (m && typeof m.setView === 'function') m.setView(loc, 19)

            this.snackbar = { show: true, color: 'primary', text: 'Lokasi ditemukan — peta di-center', timeout: 1400 }
          },
          (err) => {
            console.warn('Geolocation error (centerToUser):', err)
            let msg = 'Gagal mengambil lokasi.'
            if (err?.code === 1) msg = 'Izin lokasi ditolak. Aktifkan Location Permission di browser.'
            else if (err?.code === 2) msg = 'Lokasi tidak tersedia (Location Services off / GPS tidak aktif / tidak ada fix). Coba nyalakan Location Services & GPS, lalu refresh.'
            else if (err?.code === 3) msg = 'Timeout ambil lokasi. Coba lagi.'

            this.snackbar = { show: true, color: 'warning', text: msg, timeout: 2600 }
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 15_000 }
      )
    },

    // ===== home =====
    goHome() {
      router.push('/')
    }
  }
}
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
