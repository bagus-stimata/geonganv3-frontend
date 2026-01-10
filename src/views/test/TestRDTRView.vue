<template>
  <div class="rdtr-wrap">
    <div id="rdtr-map" class="rdtr-map"></div>

    <!-- Info panel -->
    <div v-if="popupInfo" class="rdtr-info">
      <div class="title">Info Zona RDTR</div>
      <div v-if="popupInfo.namobj"><strong>Nama</strong>: {{ popupInfo.namobj }}</div>
      <div v-if="popupInfo.kodszn"><strong>Kode</strong>: {{ popupInfo.kodszn }}</div>
      <div v-if="popupInfo.kodszntext"><strong>Zonasi</strong>: {{ popupInfo.kodszntext }}</div>
      <div v-if="popupInfo.kdb"><strong>KDB</strong>: {{ popupInfo.kdb }}</div>
      <div v-if="popupInfo.klb"><strong>KLB</strong>: {{ popupInfo.klb }}</div>
      <div class="hint">*Data dari ArcGIS REST (ATR/BPN)</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import * as EsriLeaflet from 'esri-leaflet'

// (Optional) Jika butuh style bawaan server, install & import ini:
// import 'esri-leaflet-renderers'

// Perbaikan path icon default Leaflet ketika bundling (webpack/vite)
// Referensi issue umum: default marker 404 / object Module
// Hanya diperlukan jika Anda memakai Marker; aman untuk dibiarkan di sini.
try {
  // eslint-disable-next-line no-underscore-dangle
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString()
  })
} catch (e) {
  // Jangan blok kosong: log agar tracing gampang
  console.warn('Leaflet default icon patch warning:', e)
}

const popupInfo = ref(null)
let map
let rdtrLayer // L.GeoJSON untuk highlight hasil query

// Ganti URL layer sesuai target (contoh RDTR 2022)
const RDTR_LAYER_URL = 'https://dki-siap.atrbpn.go.id/server/rest/services/RDTR_2022/MapServer/0'

onMounted(() => {
  // 1) Init peta
  map = L.map('rdtr-map', {
    center: [-7.868, 112.523], // default ke Kota Batu biar relatable
    zoom: 12,
    preferCanvas: true
  })

  // 2) Base layer
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  // 3) FeatureLayer dari ArcGIS (render langsung dari service)
  EsriLeaflet.featureLayer({
    url: RDTR_LAYER_URL,
    fields: ['namobj','kodszn','kodszntext','kdb','klb'],
    // Jika tidak gunakan esri-leaflet-renderers, kasih style fallback
    style: () => ({ color: '#1976d2', weight: 1, fillOpacity: 0.15 })
  }).addTo(map)

  // 4) Layer untuk highlight hasil query titik
  rdtrLayer = L.geoJSON(null, {
    style: () => ({ color: '#ff6b00', weight: 2, fillOpacity: 0.25 })
  }).addTo(map)

  // 5) Klik peta => query fitur terdekat (5m) untuk ambil atribut zona
  map.on('click', onMapClick)
})

onBeforeUnmount(() => {
  if (map) {
    map.off('click', onMapClick)
    map.remove()
    map = undefined
  }
})

function onMapClick(e) {
  popupInfo.value = null

  const query = EsriLeaflet.query({ url: RDTR_LAYER_URL })
  query
    .nearby(e.latlng, 5) // radius 5 meter; sesuaikan jika perlu
    .returnGeometry(true)
    .fields(['namobj','kodszn','kodszntext','kdb','klb'])
    .run((err, featureCollection) => {
      if (err) {
        console.error('RDTR query error:', err)
        popupInfo.value = { namobj: 'Gagal mengambil zonasi (lihat konsol).' }
        return
      }

      // Bersihkan highlight lama
      if (rdtrLayer) rdtrLayer.clearLayers()

      const feats = featureCollection?.features || []
      if (feats.length > 0) {
        const f = feats[0]
        rdtrLayer.addData(f)
        const p = f.properties || {}
        popupInfo.value = {
          namobj: p.namobj,
          kodszn: p.kodszn,
          kodszntext: p.kodszntext,
          kdb: p.kdb,
          klb: p.klb
        }
      } else {
        popupInfo.value = { namobj: 'Tidak ada zonasi terdeteksi di titik ini.' }
      }
    })
}
</script>

<style scoped>
.rdtr-wrap { position: relative; height: calc(100vh - 128px); }
.rdtr-map { height: 100%; width: 100%; }
.rdtr-info {
  position: absolute;
  left: 16px;
  bottom: 16px;
  background: rgba(255,255,255,0.9);
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  max-width: min(90vw, 420px);
  font-size: 13px;
}
.rdtr-info .title { font-weight: 600; margin-bottom: 6px; }
.rdtr-info .hint { opacity: .7; margin-top: 6px; font-size: 11px; }
</style>