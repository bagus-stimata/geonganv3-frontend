<template>
  <div>
    <l-map
        :zoom="zoom"
        :max-zoom="maxZoom"
        :center="currentMarker.coordinates"
        ref="map"
        @update:zoom="zoomUpdated"
        @update:center="centerUpdated"
        :options="{ scrollWheelZoom: false }"
        @ready="initializeFullscreen"
        style="z-index: 0;  min-height: 800px; "
        @click="setSingleMarker"
    >
      <l-tile-layer :url="url" :attribution="attribution" />

      <l-control position="topleft">
        <v-btn
            color="primary"
            icon
            elevation="4"
            class="rounded-lg"
            title="Tengahkan Pointer Peta"
            size="small"
            @click="setCenterPosition"
        >
          <v-icon>mdi-crosshairs-gps</v-icon>
        </v-btn>
      </l-control>
      <l-marker
          :lat-lng="currentMarker.coordinates"
          v-if="false"
      />

      <l-control position="topleft">
        <v-menu
            v-model="showSearchMenu"
            :close-on-content-click="false"
            offset-x
        >
          <template v-slot:activator="{ props }">
            <v-btn
                color="orange"
                icon
                elevation="4"
                class="rounded-lg"
                title="Cari Zonasi"
                size="small"
                v-bind="props"
            >
              <v-icon size="large">mdi-map</v-icon>
            </v-btn>
          </template>

          <v-card width="320" elevation="12" class="rounded-lg pa-2">
            <div class="d-flex align-center" style="gap:8px">
              <v-combobox
                  v-model="searchText"
                  :items="paletteOptions"
                  label="Cari Zona"
                  density="compact"
                  hide-details
                  hide-no-data
                  clearable
                  :open-on-click="false"
                  :open-on-clear="false"
                  auto-select-first
                  style="flex:1"
                  :menu-props="{ offset: [0, 12] }"
                  @keyup.enter="searchAndHighlight(searchText)"
              />
              <v-btn size="small" @click="searchAndHighlight(searchText)" icon>
                <v-icon>mdi-magnify</v-icon>
              </v-btn>
              <v-btn size="small" color="default" @click="clearSearch" icon>
                <v-icon color="red">mdi-close</v-icon>
              </v-btn>
            </div>
          </v-card>
        </v-menu>
      </l-control>

      <l-control-layers position="topright"></l-control-layers>

      <l-tile-layer
          v-for="tileProvider in tileProviders"
          :key="tileProvider.name"
          :name="tileProvider.name"
          :visible="tileProvider.visible"
          :url="tileProvider.url"
          :attribution="tileProvider.attribution"
          layer-type="base"
      />

      <l-control>
        <div class="text-center">
          <v-menu
              v-model="showLayers1"
              :close-on-content-click="false"
              :nudge-width="300"
              offset-x
          >
            <template v-slot:activator="{ props }">
              <v-btn
                  color="indigo"
                  dark
                  v-bind="props"
                  class="rounded-lg"
                  icon
                  size="small"
                  outlined
                  elevation="10"
              >
                <v-icon>mdi-layers</v-icon>
              </v-btn>
            </template>

            <v-card>
              <v-toolbar density="compact">
                <v-btn variant="text" icon @click="showLayers1 = !showLayers1">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-toolbar>
              <v-card-text>
                <div v-for="(item, index) in itemsFDayaDukung" :key="index" class="mt-n2">
                  <v-checkbox
                    v-model="item.selected"
                    input-value="true"
                    density="compact"
                    hide-details
                    :label="item.description.trim()"
                    @change="valueChangedSpaMainGeoJson(item)"
                  ></v-checkbox>
                </div>

              </v-card-text>
            </v-card>

          </v-menu>
        </div>
      </l-control>

      <l-marker
          ref="marker"
          v-if="singleMarker"
          :lat-lng="singleMarker.coords"
          :icon="customIcon"
      >
        <l-popup>
          <div>
            <h4>Koordinat</h4>
            <div>
              [ {{ singleMarker.coords[0] }}, {{ singleMarker.coords[1] }} ]
            </div>
          </div>
        </l-popup>
      </l-marker>

      <l-control position="topleft">
        <v-btn
            color="teal"
            icon
            elevation="4"
            class="rounded-lg"
            title="Cari Alamat"
            size="small"
            @click="showGooglePlaces"
        >
          <v-icon>mdi-map-marker-radius</v-icon>
        </v-btn>
      </l-control>

      <l-control position="topright">
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


      <l-geo-json
          v-for="(item, index) in itemSpaDayaDukungGeojson"
          :key="index"
          :geojson="item.data"
          :options="options"
          :options-style="styleFunction"
      >
      </l-geo-json>


      <l-control position="topright" v-if="isFullScreen">
        <div v-if="showLayers1">
          <v-card elevation="16" class="rounded-lg">
            <v-toolbar density="compact">
              <v-btn icon @click="showLayers1 = !showLayers1">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-toolbar>

            <v-divider></v-divider>
            <v-card-text>
              <v-row class="ml-4" no-gutters>
                <v-col
                    cols="12"
                    md="6"
                    sm="6"
                    v-for="(item, index) in itemsFDayaDukung"
                    :key="index"
                >
                  <v-checkbox
                      v-model="item.selected"
                      input-value="true"
                      density="compact"
                      hide-details
                      :label="item.description.trim()"
                      @change="valueChangedSpaMainGeoJson(item)"
                  ></v-checkbox>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>
      </l-control>

      <l-control position="topleft"  v-if="isFullScreen">
        <div  v-if="showSearchMenu">
          <v-card width="320" elevation="12" class="rounded-lg pa-3">
            <div class="d-flex align-center" style="gap:8px">
              <v-combobox
                  v-model="searchText"
                  :items="paletteOptions"
                  label="Cari Zona"
                  density="compact"
                  hide-details
                  hide-no-data
                  clearable
                  :open-on-click="false"
                  :open-on-clear="false"
                  auto-select-first
                  style="flex:1"
                  :menu-props="{ offset: [0, 12] }"
                  @keyup.enter="searchAndHighlight(searchText)"
              />

              <v-btn size="small" @click="searchAndHighlight(searchText)" icon>
                <v-icon>mdi-map</v-icon>
              </v-btn>
              <v-btn size="small" color="default" @click="clearSearch" icon>
                <v-icon color="red">mdi-close</v-icon>
              </v-btn>
            </div>
          </v-card>
        </div>
      </l-control>
    </l-map>

    <GooglePlacesDialog
        ref="refGooglePlacesDialog"
        @eventGooglePlacesSelect="googlePlacesSelect"
        @closed="onPlacesClosed"
    ></GooglePlacesDialog>

    <v-snackbar v-model="snackbar.show"
                :color="snackbar.color? snackbar.color : 'info'"
                :timeout="snackbar.timeout? snackbar.timeout : 1500"
                location="bottom">
      <span class="snackbar-center">{{ snackbar.text }}</span>
      <!--      <template v-slot:actions="{ attrs }">-->
      <!--        <v-btn text v-bind="attrs" @click="snackBarShow = false"> Close </v-btn>-->
      <!--      </template>-->
    </v-snackbar>

  </div>
</template>

<script>
import {LControl, LControlLayers, LGeoJson, LMap, LMarker, LPopup, LTileLayer,} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
// import FDayadukungService from "@/services/apiservices-sippoin/sippoin-daya-dukung-service";
// import FileService from "@/services/apiservices-sippoin/sippoin-file-service";
import L, {Icon} from 'leaflet';
import 'leaflet-fullscreen';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';

import FDayadukungService from "@/services/apiservices/f-dayadukung-service";
import FileService from "@/services/apiservices/file-service";
import {db} from '@/db/db.js'

delete Icon.Default.prototype.Default;
// Icon.Default.mergeOptions({
//   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: require('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: require('leaflet/dist/images/marker-shadow.png')
// });
Icon.Default.mergeOptions({
  iconRetinaUrl: require("@/assets/images/my-marker.webp"),
  iconUrl: require("@/assets/images/my-marker.webp"),
  shadowUrl: require("@/assets/images/my-marker.webp"),
});

// import {valueChangedSpaMainGeoJson, syncDayaDukungGeojson } from "@/helpers/daya-dukung-helper"
import zonaMapper from '@/helpers/zona-color-mapper';
import GooglePlacesAutoCompleteDialog from "@/components/util-ext/GooglePlacesAutoCompleteDialog.vue";

import RBush from 'rbush'
import * as turf from '@turf/turf'

export default {
  name: "CekLokasiUsahaMap",
  components: {
    GooglePlacesDialog: GooglePlacesAutoCompleteDialog,
    LMap,
    LTileLayer,
    LControl,
    LControlLayers,
    LMarker,
    // LIcon,
    LPopup,
    // LTooltip,
    LGeoJson,
    // LControlPolylineMeasure,

  },
  props: {
  },
  watch: {
  },
  data()  {
    return {
      snackbar: {
        show: false,
        text: "",
        color: "info",
        timeout: 1500,
      },

      isFullScreen: false,
      showCenterMarker: false,
      singleMarker: {
        coords: [-7.8661377, 112.510727],
      },
      customIcon: L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png",
        iconSize: [50, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -30]
      }),

      enableTooltip: true,
      zoom: 13,
      maxZoom: 18,
      currentMarker: {
        id: 0,
        coordinates: [-7.8661377,112.510727],
      },

      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',

      tileProviders: [
        {
          name: "OpenStreetMap",
          visible: true,
          attribution:
              '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        },
        {
          name: "OpenTopoMap",
          visible: false,
          url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          attribution:
              'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        },
        {
          name: "Satelite",
          visible: false,
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution:
              '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        },
      ],

      showLayers1: false,

      mapFullScreen: false,

      geojson: null,
      itemSpaDayaDukungGeojson: [],


      itemsFDayaDukung: [],
      itemsFDayaDukungType: Array,
      itemsFSubArea: Array,
      itemsFArea: Array,

      colorMap: {},

      showSearchMenu: false,
      searchText: '',
      featureIndex: new Map(),   // id -> layer
      textIndex: [],             // { text, layerId }
      highlighted: new Set(),    // currently highlighted layer ids
      spatialIndex: new RBush(),              // bbox index

      winWidth:  typeof window !== 'undefined' ? window.innerWidth : 1024,
      hasTouch:  typeof window !== 'undefined' ? ('ontouchstart' in window || navigator.maxTouchPoints > 0) : false,

      markerDataInfo: ''
    };
  },
  computed: {
    isMobileDevice() {
      const sm = this.winWidth <= 600;
      const md = this.winWidth <= 960;
      const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
      return (this.hasTouch || coarse) && (sm || md);
    },

    paletteOptions() {
      return Object.keys(zonaMapper.zonaPalette)
          .filter(k => k !== 'default')
          .sort((a, b) => a.localeCompare(b));
    },
    options() {
      return {
        onEachFeature: this.onEachFeatureFunction,
      };
    },
    onEachFeatureFunction() {

      return (feature, layer) => {
        // Index for search
        const props = feature?.properties || {};
        const text = (zonaMapper.getDescCandidate(props) || '').toLowerCase();
        const id = L.stamp(layer);
        this.featureIndex.set(id, layer);
        if (text) this.textIndex.push({ text, layerId: id });

        // --- index spasial (RBush) ---
        // getBounds() cepat untuk Polygon/Line; untuk Point tetap jalan (bounds = point)
        if (layer.getBounds) {
          const b = layer.getBounds();
          if (b?.isValid && b.isValid()) {
            this.spatialIndex.insert({
              minX: b.getWest(),
              minY: b.getSouth(),
              maxX: b.getEast(),
              maxY: b.getNorth(),
              id
            });
          }
        } else if (layer.getLatLng) {
          const p = layer.getLatLng();
          this.spatialIndex.insert({
            minX: p.lng, minY: p.lat, maxX: p.lng, maxY: p.lat, id
          });
        }

        if (!this.isMobileDevice){
          // Popup pada klik, isinya juga sama
          layer.on('click', (e) => {
            const latlng = e.latlng;
            layer.bindPopup(
                `<div style='max-height: 350px; overflow-y: auto;'>
                 ${this.jsonToHtmlTable(feature.properties)}
                 </div><div><strong>${latlng.lat}, ${latlng.lng}</strong></div>`
            ).openPopup();

          });
        }

      };
    },

  },
  methods: {
    async ssPhotoDownload(){
      try {
        // 1) Ambil elemen container Leaflet yang sedang tampil
        const mapRef = this.$refs.map;
        const mapEl = (mapRef && (mapRef.leafletObject?.getContainer?.() || mapRef.mapObject?.getContainer?.() || mapRef.$el?.querySelector?.('.leaflet-container')));
        if (!mapEl) {
          console.warn('Leaflet map container not found');
          this.snackbar = { show: true, color: 'warning', text: 'Map belum siap untuk di-screenshot', timeout: 1800 };
          return;
        }

        // 2) Sembunyikan tooltip/popup sementara supaya tidak berantakan saat render
        const prevOverflow = mapEl.style.overflow;
        mapEl.style.overflow = 'hidden';

        // 3) Lazy import html2canvas agar bundle tetap ringan
        const html2canvas = (await import('html2canvas')).default;

        // 4) Render ke canvas (pakai useCORS untuk tile yang support CORS)
        const canvas = await html2canvas(mapEl, {
          useCORS: true,
          allowTaint: false,
          backgroundColor: null,
          logging: false,
          scale: Math.min(2, (window.devicePixelRatio || 1)),
          windowWidth: mapEl.clientWidth,
          windowHeight: mapEl.clientHeight,
          width: mapEl.clientWidth,
          height: mapEl.clientHeight
        });

        // 5) Kembalikan style
        mapEl.style.overflow = prevOverflow || '';

        // 6) Download sebagai PNG
        const blob = await new Promise(res => canvas.toBlob(res, 'image/png', 0.95));
        if (!blob) {
          this.snackbar = { show: true, color: 'error', text: 'Gagal membuat gambar', timeout: 1800 };
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const ts = new Date().toISOString().replace(/[:.]/g,'-');
        a.href = url;
        a.download = `snapshot-map-${ts}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.snackbar = { show: true, color: 'primary', text: 'Screenshot peta terunduh', timeout: 1500 };
      } catch (e) {
        console.error('ssPhotoDownload error', e);
        this.snackbar = { show: true, color: 'error', text: 'Gagal screenshot. Coba layer lain (yang support CORS).', timeout: 2500 };
      }
    },
    showGooglePlaces() {
      this.$refs.refGooglePlacesDialog.showDialog()
    },
    googlePlacesSelect(payload){
      if (!payload) return;
      const { lat, lng, address, name } = payload;
      if (lat && lng) {
        this.currentMarker.coordinates = [lat, lng];
        this.singleMarker = { coords: [lat, lng] };
        this.centerToMarker();
      }
      const text = address || name || 'Lokasi dipilih';
      this.snackbar = { show: true, color: 'primary', text, timeout: 1800 };

    },

    onPlacesClosed() {
      // Optional: focus back to map control or do nothing
      // console.debug('GooglePlacesAutoCompleteDialog closed');
    },

    clearSearch() {
      this.searchText = '';
      this._clearHighlights();
      this.showSearchMenu = false;
    },
    _resetStyle(layer) {
      try {
        const original = this.styleFunction(layer.feature);
        layer.setStyle(original);
      } catch (e) {
        layer.setStyle({ weight: 1.2, opacity: 0.9 });
      }
    },
    _clearHighlights() {
      for (const id of this.highlighted) {
        const lyr = this.featureIndex.get(id);
        if (lyr) this._resetStyle(lyr);
      }
      this.highlighted.clear();
    },
    _highlightStyle(layer) {
      layer.setStyle({
        color: '#ff4081',
        weight: 3,
        opacity: 1,
        fillColor: '#ff4081',
        fillOpacity: 0.45,
      });
      if (layer.bringToFront) layer.bringToFront();
    },
    searchAndHighlight(term) {
      const q = String(term || '').toLowerCase().trim();
      if (!q) {
        this._clearHighlights();
        return;
      }
      const matches = this.textIndex
          .filter(x => x.text.includes(q))
          .map(x => this.featureIndex.get(x.layerId))
          .filter(Boolean);

      if (matches.length === 0) {
        this.snackbar = { show: true, color: 'warning', text: `Tidak ditemukan: ${term}`, timeout: 1500 };
        this._clearHighlights();
        return;
      }

      this._clearHighlights();
      const bounds = L.latLngBounds();
      for (const lyr of matches) {
        this._highlightStyle(lyr);
        this.highlighted.add(L.stamp(lyr));
        if (lyr.getBounds) bounds.extend(lyr.getBounds());
      }

      const map = this.$refs.map?.leafletObject || this.$refs.map?.mapObject;
      if (map && bounds.isValid()) {
        map.fitBounds(bounds.pad(0.1), { animate: true });
        if (matches.length === 1 && map.getZoom() < 15) map.setZoom(15);
      }

      this.showSearchMenu = false;
    },

    centerToMarker() {
      let map = this.$refs.map?.leafletObject || this.$refs.map?.mapObject;
      if (!map) {
        // Kalau belum ready, skip dulu
        console.warn('Map object belum siap!');
        return;
      }
      const latLng = this.currentMarker.coordinates;
      let targetZoom = map.getZoom() < 15 ? 15 : map.getZoom();
      map.setView(latLng, targetZoom, { animate: true });

      // Toggle marker
      this.showCenterMarker = false;
      this.$nextTick(() => {
        this.showCenterMarker = true;
      });

    },

    setCenterPosition() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
              // Koordinat user
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;
              console.log("User location:", lat, lon);

              // Update marker & center map jika mau
              this.currentMarker.coordinates = [lat, lon];
              this.singleMarker = {
                coords: [lat, lon]
              }

              this.centerToMarker(); // atau setView manual
            },
            (error) => {
              console.error("Gagal dapat lokasi: ", error);
              alert("Tidak bisa mengambil lokasi Anda.");
            }
        );
      } else {
        alert("Browser tidak support Geolocation!");
      }
    },

    initializeFullscreen() {
      // const map = this.$refs.map.mapObject;
      let map = this.$refs.map?.leafletObject || this.$refs.map?.mapObject;
      if (map) {
        L.control.fullscreen().addTo(map);
      } else {
        console.error("Map object not initialized yet.");
      }
    },
    handleFullscreenChange() {
      this.isFullScreen = !!document.fullscreenElement;
      console.log(`fullscreenchange detected: ${this.isFullScreen}`);
    },
    setSingleMarker(event) {
      const { lat, lng } = event.latlng;
      this.singleMarker = {
        coords: [lat, lng]
      }
      // console.log(event);
      // this.$nextTick(() => {
      //   let map = this.$refs.marker?.leafletObject || this.$refs.marker?.mapObject;
      //   map.openPopup()
      // });

      const props = this.getFastPropsAtFromFeatureIndex(lat, lng);

      if (props) {
        console.log(JSON.stringify(props));
        this.snackbar = { show: true, color: 'primary', text: 'Zona ketemu ✨', timeout: 1200 };
      } else {
        this.snackbar = { show: true, color: 'warning', text: 'Tidak ada feature di titik ini', timeout: 1500 };
      }

    },

    zoomUpdated(zoom) {
      this.zoom = zoom;
    },
    centerUpdated(center) {
      this.center = center;
    },

    getRandomColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },

    styleFunction(feature) {
      let weight = 1.2;
      let fillOpacity = 0.35;

      const props = feature?.properties || {};
      const geomType = feature?.geometry?.type || '';

      if (geomType === 'MultiLineString' || geomType === 'LineString') {
        weight = 4.5;
        fillOpacity = 0;
      }

      const desc = zonaMapper.getDescCandidate(props);
      const { canonical, hex } = zonaMapper.findZoneHexByIncludes(desc);
      if (!this.colorMap[canonical]) {
        // this.colorMap[canonical] = zonaMapper.getRandomColor();
        this.colorMap[canonical] = hex;
      }

      return {
        color: this.colorMap[canonical],
        weight,
        opacity: 0.9,
        fillColor: this.colorMap[canonical],
        fillOpacity
      };
    },

    async syncDayaDukungGeojson({ id, fileNameLow, restApiFetch }) {
      // 1. Cek di Dexie
      try {
        this.snackbar.text = `mencoba mencari dari data local...`;
        this.snackbar.color = "success";
        this.snackbar.show = true;

        const local = await db.daya_dukung_peta.get(id);
        if (local && local.fileNameLow === fileNameLow && local.dataGeoJson) {
          this.snackbar.text = `Data GeoJSON ditemukan di lokal database!`;
          this.snackbar.color = "primary";
          this.snackbar.show = true;
          this.snackbar.timeout = 6000;

          // File name sama, pakai data lokal Dexie
          return local.dataGeoJson;
        } else {
          this.snackbar.text = `Mengambil data GeoJSON dari server... (Harap Sabar Menunggu)`;
          this.snackbar.color = "warning";
          this.snackbar.show = true;

          // Either nggak ada, atau file name beda → hapus, fetch ulang, simpan baru
          if (local) {
            await db.daya_dukung_peta.delete(id);
          }

          // Fetch dari REST API (misal pake FileService lo)
          const geoJsonObject = await restApiFetch(fileNameLow);

          // Simpan baru ke Dexie
          await db.daya_dukung_peta.put({
            id, // sama kayak backend
            fileNameLow,
            dataGeoJson: geoJsonObject
          });

          return geoJsonObject;
        }

      }catch (e) {
        this.snackbar.text = `Tidak dapat menggunakan Dexie! Mengambil data GeoJSON dari server Secara Langsung...`;
        this.snackbar.color = "error";
        this.snackbar.show = true;

        return await restApiFetch(fileNameLow);

      }
    },

    async valueChangedSpaMainGeoJson(value) {
      const startTime = new Date();
      console.log(`*** Start: valueChangedSpaMainGeoJson ${startTime.toISOString()}`);

      if (!value.fileNameLow) return;

      // Jika unselect, hapus dari tampilan
      if (value.selected !== true) {
        const index = this.itemSpaDayaDukungGeojson.findIndex(
            (item) => item.id === value.id
        );
        if (index !== -1) this.itemSpaDayaDukungGeojson.splice(index, 1);
        return;
      }

      // Smart cache pake syncDayaDukungGeojson (bisa dari Dexie, bisa fetch & cache)
      const geojsonResponse = await this.syncDayaDukungGeojson({
        id: value.id,
        fileNameLow: value.fileNameLow,
        restApiFetch: async (fileName) => {
          let response;
          if (value.fileType === 'geojson-gzip' || fileName.endsWith('.geojson.gz')) {
            response = await fetch(FileService.fileGeojsonGzip(fileName));
          } else {
            response = await fetch(FileService.file_url(fileName));
          }
          return await response.json();
        }
      });

      // Proses hasil geojson (tambah ke itemSpaDayaDukungGeojson)
      if (geojsonResponse && geojsonResponse.features) {
        console.log(geojsonResponse.features.length + " features loaded");
        console.log(`=== End: valueChangedSpaMainGeoJson ${new Date().toISOString()}: Time taken: ${new Date().getTime() - startTime.getTime()} ms`);

        // Prevent duplicate entry (optional: replace by id)
        const existIndex = this.itemSpaDayaDukungGeojson.findIndex(item => item.id === value.id);
        if (existIndex !== -1) {
          this.itemSpaDayaDukungGeojson.splice(existIndex, 1);
        }

        this.itemSpaDayaDukungGeojson.push({
          id: value.id,
          data: {
            ...geojsonResponse,
            features: geojsonResponse.features.map(f => ({
              ...f,
              properties: {
                ...f.properties,
                "Sumber Data": value.notes,
              }
            }))
          },
          lineColor: value.remark1,
          fillColor: value.remark2
        });
      }
    },


    jsonToHtmlTable_xxx(jsonValue) {
      const myObj = jsonValue;

      let text =
          "<table style='width: 300px'>\n" +
          "  <tr>\n" +
          "    <td style='width:40%'>::</td>\n" +
          "    <th></th>\n" +
          "  </tr>\n";

      for (const meta in myObj) {
        if (/^(OBJ|NAM|WAD|SHAPE|LUAS|Ket|KET|Fung|FUNG|Sumber|PENGGUNAAN|DESC|KRB|REMARK)/.test(meta)) {
          text +=
              "  <tr>\n" +
              "    <td style='color: #777777'>" +
              meta +
              "</td>\n" +
              "    <td>: &nbsp;" +
              myObj[meta] +
              "</td>\n" +
              "  </tr>\n";
        }
      }

      text += "</table>";

      return text;
    },

    jsonToHtmlTable(jsonValue) {
      const myObj = jsonValue;

      let text =
          "<table style='width: 300px'>\n" +
          "         <tr>\n" +
          "            <td style='width:40%'>::</td>\n" +
          "            <th></th>\n" +
          "         </tr>\n";
      for (const meta in myObj) {
        text +=
            "         <tr>\n" +
            "            <td style='color: #777777'>" +
            meta +
            "</td>\n" +
            "            <td>: &nbsp;" +
            myObj[meta] +
            "</td>\n" +
            "         </tr>\n";
      }
      text += "      </table>";

      return text;
    },

    fetchDayaDukungPeta(){

      const startTime = new Date();
      console.log(`Start: fetchDayaDukungPeta ${startTime.toISOString()}`);

      FDayadukungService.getAllFDayaDukungByTypePetaPublic().then(
          response => {
            // console.log(JSON.stringify(response.data, null, 2));
            // console.log(`End: fetchDayaDukungPeta ${new Date().toISOString()}: Time taken: ${new Date().getTime() - startTime.getTime()} ms`);

            this.itemsFDayaDukung = response.data.filter(item => item.fileNameLow && item.showToMap).map(item => {
              const name = item.description || "";
              let selected = false;
              if (name.toUpperCase().includes("RDTR")) {
                selected = true;
              } else if (name.toUpperCase().includes("RTRW")) {
                selected = true;
              }
              return {
                ...item,
                selected,
                fileNameLow: item.fileNameLow || item.fileName,
                fileType: item.fileType || 'geojson',
              };
            });
            if (this.itemsFDayaDukung.length > 0) {
              // 2.  Otomatis load GeoJson yang selected
              this.itemsFDayaDukung
                  .filter(item => item.selected)
                  .forEach(item => this.valueChangedSpaMainGeoJson(item));

              // this.itemsFDayaDukung
              //     .filter(item => item.selected)
              //     .forEach(item => {
              //
              //       valueChangedSpaMainGeoJson({
              //         value: item,
              //         itemSpaDayaDukungGeojson: this.itemSpaDayaDukungGeojson,
              //         syncFn: this.syncDayaDukungGeojson || syncDayaDukungGeojson
              //        })
              //
              //     });


            }


          }
      )
    },

    getFastPropsAtFromFeatureIndex(lat, lng, { lineTolMeters = 5, pointTolMeters = 5 } = {}) {
      // 1) ambil kandidat dari RBush pakai bbox titik
      const cand = this.spatialIndex.search({
        minX: lng, minY: lat, maxX: lng, maxY: lat
      });

      if (!cand.length) return null;

      const pt = turf.point([lng, lat]);

      // 2) refine akurat per kandidat
      for (const c of cand) {
        const layer = this.featureIndex.get(c.id);
        if (!layer?.toGeoJSON) continue;
        const f = layer.toGeoJSON();
        const g = f.geometry; if (!g) continue;

        if (g.type === 'Polygon' || g.type === 'MultiPolygon') {
          if (turf.booleanPointInPolygon(pt, f)) return f.properties || {};
        } else if (g.type === 'LineString' || g.type === 'MultiLineString') {
          const d = turf.pointToLineDistance(pt, f, { units: 'meters' });
          if (d <= lineTolMeters) return f.properties || {};
        } else if (g.type === 'Point') {
          const d = turf.distance(pt, f, { units: 'meters' });
          if (d <= pointTolMeters) return f.properties || {};
        } else if (g.type === 'MultiPoint') {
          const coords = g.coordinates || [];
          for (const c0 of coords) {
            const d = turf.distance(pt, turf.point(c0), { units: 'meters' });
            if (d <= pointTolMeters) return f.properties || {};
          }
        }
      }
      return null;
    },

  },

  mounted() {
    this.currentMarker = this.$store.state.potensi.centerMap
    this.singleMarker = {
      coords: this.currentMarker.coordinates,
    }
    this.fetchDayaDukungPeta();

    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    this._onResize = () => (this.winWidth = window.innerWidth);
    window.addEventListener('resize', this._onResize, { passive: true });
    window.addEventListener('orientationchange', this._onResize, { passive: true });
  },
  beforeUnmount() {
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('orientationchange', this._onResize);

  }

};
</script>

<style scoped>
.snackbar-center {
  width: 100%;
  text-align: center;
  justify-content: center;
  display: block; /* atau flex, tergantung tampilan */
}


</style>
