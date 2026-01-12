<template>
  <div>
    <l-map
        :zoom="zoom"
        :max-zoom="maxZoom"
        :center="currentMarker.coordinates"
        ref="map"
        @update:zoom="zoomUpdated"
        @update:center="centerUpdated"
        :options="{ scrollWheelZoom: false, preferCanvas: true, zoomControl: false }"
        @ready="initializeFullscreen"
        :style="{ zIndex: 0, minHeight: mapMinHeight, maxHeight: mapMaxHeight, width: '100%', position: 'relative' }"
        @click="setSingleMarker"
    >
      <l-tile-layer v-if="false" :url="url" :attribution="attribution" :options="{ crossOrigin: true }" />
      <!-- Zoom +/- control moved to bottom-right -->
      <l-control-layers position="topright"></l-control-layers>
      <l-control-zoom  position="topright" />

      <l-tile-layer
          v-for="tileProvider in computedTileProviders"
          :key="tileProvider.name"
          :name="tileProvider.name"
          :visible="tileProvider.visible"
          :url="tileProvider.url"
          :attribution="tileProvider.attribution"
          :subdomains="tileProvider.subdomains"
          :max-native-zoom="tileProvider.maxNativeZoom"
          :options="{ crossOrigin: true }"
          layer-type="base"
      />
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
    </v-snackbar>
    <PickMapsetDialog ref="refPickMapsetDialog"></PickMapsetDialog>

  </div>
</template>

<script>
import { LControlLayers, LControlZoom, LGeoJson, LMap, LMarker, LPopup, LTileLayer } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import L, {Icon} from 'leaflet';
import 'leaflet-fullscreen';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';

import FileService from "@/services/apiservices/file-service";
import {db} from '@/db/db.js'
import zonaMapper from '@/helpers/zona-color-mapper';
import GooglePlacesAutoCompleteDialog from "@/components/util-ext/GooglePlacesAutoCompleteDialog.vue";

import RBush from 'rbush'
import * as turf from '@turf/turf'
import FDayadukungService from "@/services/apiservices/f-dayadukung-service";
import PickMapsetDialog from "@/components/public/peta-interaktif/PickMapsetDialog.vue";

delete Icon.Default.prototype.Default;
// Icon.Default.mergeOptions({
//   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: require('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: require('leaflet/dist/images/marker-shadow.png')
// });
Icon.Default.mergeOptions({
  iconRetinaUrl: require("@/assets/images/my-marker.png"),
  iconUrl: require("@/assets/images/my-marker.png"),
  shadowUrl: require("@/assets/images/my-marker.png"),
});

export default {
  name: "BaseMap",
  components: {
    PickMapsetDialog,
    GooglePlacesDialog: GooglePlacesAutoCompleteDialog,
    LMap,
    LTileLayer,
    LControlLayers,
    LControlZoom,
    // LIcon,
    // LTooltip,
    // LControlPolylineMeasure,

  },
  props: {
    autoSelectRDTR: {
      type: Boolean,
      default: true,
    },
    mapMinHeight: {
      type: String,
      default: "100vh",
    },
    mapMaxHeight: {
      type: String,
      default: "100vh",
    },
  },
  watch: {
  },
  data()  {
    return {
      showMapsetController:true,
      snackbar: {
        show: false,
        text: "",
        color: "info",
        timeout: 1500,
      },
      filterFDayaDukung: '',
      markerPopupVisible: false,
      mobilePanel: {
        gone: false,     // sticky bar hilang
        visible: false,     // sticky bar terlihat (collapsed)
        expanded: false,    // expanded (sheet tinggi)
        title: '',          // judul singkat
        props: null,        // object feature.properties
      },

      isFullScreen: false,
      showCenterMarker: false,
      singleMarker: {
        coords: this.$store.state.potensi.centerMap.coordinates,
      },
      customIcon: L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png",
        iconSize: [50, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -30]
      }),

      enableTooltip: true,
      zoom: 13,
      maxZoom: 21, // cap global; providers will overzoom above their native (OSM 19)
      currentMarker: {
        id: 0,
        coordinates: this.$store.state.potensi.centerMap.coordinates,
      },

      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',

      tileProviders: [
        {
          name: "OpenStreetMap",
          visible: true,
          maxNativeZoom: 19,
          attribution:
              '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        },
        {
          name: "OpenTopoMap",
          visible: false,
          maxNativeZoom: 17,
          url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          attribution:
              'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        },
        {
          name: "OpenSatelite",
          visible: false,
          maxNativeZoom: 19,
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution:
              '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        },
        // Google Maps tile providers (without API key, public endpoint, like TesLeafletGoogleMaps.vue)
        {
          name: "Google Maps",
          visible: false,
          maxNativeZoom: 21,
          url: "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
          attribution: "© Google",
          subdomains: ["mt0", "mt1", "mt2", "mt3"]
        },
        {
          name: "Google Satellite",
          visible: false,
          maxNativeZoom: 21,
          url: "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
          attribution: "© Google",
          subdomains: ["mt0", "mt1", "mt2", "mt3"]
        },
        {
          name: "Google Hybrid",
          visible: false,
          maxNativeZoom: 21,
          url: "https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
          attribution: "© Google",
          subdomains: ["mt0", "mt1", "mt2", "mt3"]
        }
      ],

      showLayers1: false,

      mapFullScreen: false,

      listFtMonev: [],

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
      layerBBoxes: new Map(),   // layerId -> bboxRef yg dimasukkan ke RBush
      datasetIndex: new Map(),  // dsid -> Set<layerId>
      winWidth:  typeof window !== 'undefined' ? window.innerWidth : 1024,
      isBulkCleanup: false,
      hasTouch:  typeof window !== 'undefined' ? ('ontouchstart' in window || navigator.maxTouchPoints > 0) : false,

      // DISPLAY FILTER ONLY (cache tetap full)
      useRadiusFilter: false,        // tampilkan hanya fitur di radius tertentu (default: Full mode)
      filterRadiusMeters: 2000,     // default 2 km
      //Untuk singleMarker berada di koordinat atau tidak
      lastFullGeoJson: null,
      lastSelectedValue: null,

      markerDataInfo: ''

    };
  },
  computed: {
    computedTileProviders(){
      const base = Array.isArray(this.tileProviders) ? this.tileProviders.slice() : [];
      if (this.currentUser && this.googleApiKey) {
        const extras = [

          {
            name: "Google Satellite",
            visible: false,
            url: `https://maps.googleapis.com/maps/vt?lyrs=s&x={x}&y={y}&z={z}&key=${this.googleApiKey}`,
            attribution: '&copy; Google',
            subdomains: undefined,
            maxNativeZoom: 21,
          },
        ];
        const merged = [...base];
        for (const p of extras) {
          if (!merged.some(x => x && x.name === p.name)) merged.push(p);
        }
        return merged;
      }
      return base;
    },
    googleApiKey(){
      return this.$store.state.secretKey.googleApiKey?? '';
    },
    isMobileDevice() {
      const sm = this.winWidth <= 600;
      const md = this.winWidth <= 960;
      const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
      return (this.hasTouch || coarse) && (sm || md);
    },
    markerProps() {
      const lat = this.singleMarker?.coords?.[0];
      const lng = this.singleMarker?.coords?.[1];
      if (lat == null || lng == null) return null;
      return this.getFastPropsAtFromFeatureIndex(lat, lng);
    },
    options() {
      return {
        onEachFeature: this.onEachFeatureFunction,
      };
    },
    onEachFeatureFunction() {
      return (feature, layer) => {
        const props = feature?.properties || {};
        const text = this.buildSearchTextForIndex(props);
        const id = L.stamp(layer);
        this.featureIndex.set(id, layer);
        if (text) this.textIndex.push({ text, layerId: id });
        const dsid = props.__dsid;
        if (dsid != null) {
          if (!this.datasetIndex.has(dsid)) this.datasetIndex.set(dsid, new Set());
          this.datasetIndex.get(dsid).add(id);
        }
        if (layer.getBounds) {
          const b = layer.getBounds();
          if (b?.isValid && b.isValid()) {
            const bbox = {
              minX: b.getWest(),
              minY: b.getSouth(),
              maxX: b.getEast(),
              maxY: b.getNorth(),
              id
            };
            this.layerBBoxes.set(id, bbox);
            this.spatialIndex.insert(bbox);
          }
        } else if (layer.getLatLng) {
          const p = layer.getLatLng();
          const bbox = { minX: p.lng, minY: p.lat, maxX: p.lng, maxY: p.lat, id };
          this.layerBBoxes.set(id, bbox);
          this.spatialIndex.insert(bbox);
        }

        // 4) Auto-clean indices jika layer dihapus oleh Leaflet (mis. v-if / re-render)
        layer.on('remove', () => {
          if (!this.isBulkCleanup) this.cleanupByLayerId(id);
        });

        // 5) Popup pada klik hanya untuk desktop (biarkan seperti semula)
        if (!this.isMobileDevice) {
          layer.on('click', (e) => {
            const latlng = e.latlng;
            layer.bindPopup(
              `<div style='max-height: 350px; overflow-y: auto; min-width: 300px; overflow-x: auto;' >
                 ${this.jsonToHtmlTable(feature.properties)}
               </div><div><strong>${latlng.lat}, ${latlng.lng}</strong></div>`
            ).openPopup();
          });
        }
      };
    },
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  methods: {
    routeToHome(){
      this.$router.push("/home")
    },
    showDialogPickMapset(){
      this.$refs.refPickMapsetDialog.showDialog()
    },
    buildSearchTextForIndex(props = {}) {
      try {
        const parts = [];
        // Utamakan deskripsi zona dari mapper (jika ada)
        const main = zonaMapper.getDescCandidate(props);
        if (main && typeof main === 'string') {
          parts.push(main);
        }

        // Gabungkan semua properti string/number lain sebagai kata kunci
        for (const value of Object.values(props)) {
          if (value == null) continue;
          if (typeof value === 'string') {
            const v = value.trim();
            if (v) parts.push(v);
          } else if (typeof value === 'number') {
            parts.push(String(value));
          }
        }

        return parts.join(' ').toLowerCase();
      } catch (e) {
        console.warn('buildSearchTextForIndex error', e);
        return '';
      }
    },

    closeAllLeafletPopups() {
      try {
        const map = this.$refs.map?.leafletObject || this.$refs.map?.mapObject;
        if (map && typeof map.closePopup === 'function') {
          map.closePopup();
        }
      } catch (e) {
        console.warn('closeAllLeafletPopups error', e);
      }
    },

    reopenSingleMarkerPopup() {
      // vue-leaflet + v-model:visible bisa "stuck" ketika popup ditutup otomatis oleh Leaflet.
      // Jadi kita paksa toggle agar popup bisa kebuka lagi dengan content terbaru.
      try {
        this.markerPopupVisible = false;
        this.$nextTick(() => {
          this.markerPopupVisible = true;
        });
      } catch (e) {
        console.warn('reopenSingleMarkerPopup error', e);
      }
    },

    openGMapsAt(lat, lng, zoom = 20) {
      try {
        if (lat == null || lng == null) {
          this.snackbar = { show: true, color: 'warning', text: 'Koordinat tidak valid', timeout: 1500 };
          return;
        }
        const z = Math.max(0, Math.min(22, Number(zoom) || 20));
        // Format URL Google Maps dengan zoom tinggi
        const url = `https://www.google.com/maps/@${lat},${lng},${z}z`;
        window.open(url, '_blank', 'noopener');
      } catch (e) {
        console.error('openGMapsAt error', e);
        this.snackbar = { show: true, color: 'error', text: 'Gagal membuka Google Maps', timeout: 1800 };
      }
    },
    openGMapsCurrentMarker() {
      const coords = (this.singleMarker && this.singleMarker.coords) || (this.currentMarker && this.currentMarker.coordinates);
      if (coords && coords.length >= 2) {
        const [lat, lng] = coords;
        this.openGMapsAt(lat, lng, 20); // gunakan zoom tinggi
      } else {
        this.snackbar = { show: true, color: 'warning', text: 'Koordinat marker belum tersedia', timeout: 1800 };
      }
    },

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

        // Ensure UI is settled before screenshot
        await this.$nextTick();

        // 4) Render ke canvas (pakai useCORS untuk tile yang support CORS)
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
        });

        // 5) Kembalikan style
        mapEl.style.overflow = prevOverflow || '';

        // 6) Download sebagai JPEG
        const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.9));
        if (!blob) {
          this.snackbar = { show: true, color: 'error', text: 'Gagal membuat gambar', timeout: 1800 };
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const ts = new Date().toISOString().replace(/[:.]/g,'-');
        a.href = url;
        a.download = `snapshot-map-${ts}.jpg`;
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
        if (!lyr) continue;
        if (typeof lyr.setStyle === 'function') {
          this._resetStyle(lyr);
        }
        if (lyr._icon) {
          lyr._icon.classList.remove('marker-highlighted');
        }
      }
      this.highlighted.clear();
    },
    _highlightStyle(layer) {
      const geomType = layer?.feature?.geometry?.type || '';
      if (geomType === 'LineString' || geomType === 'MultiLineString') {
        layer.setStyle({
          color: '#ff1744',
          weight: 7,
          opacity: 1,
          dashArray: null,
        });
      } else {
        layer.setStyle({
          color: '#ff4081',
          weight: 3,
          opacity: 1,
          fillColor: '#ff4081',
          fillOpacity: 0.55,
        });
      }
      if (layer.bringToFront) layer.bringToFront();
    },
    minDistanceToVertices(pt, coords, units = 'meters') {
      if (!Array.isArray(coords)) return Infinity;
      let minD = Infinity;
      for (const c of coords) {
        if (!Array.isArray(c) || c.length < 2) continue;
        const [x, y] = c;
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        try {
          const d = turf.distance(pt, turf.point([x, y]), { units });
          if (Number.isFinite(d) && d < minD) minD = d;
        } catch (e) {
          // skip invalid vertex
        }
      }
      return minD;
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
        this.snackbar = {
          show: true,
          color: 'warning',
          text: `Tidak ditemukan: ${term}`,
          timeout: 1500
        };
        this._clearHighlights();
        return;
      }

      this._clearHighlights();
      const bounds = L.latLngBounds();

      for (const lyr of matches) {
        const id = L.stamp(lyr);

        // 1) Highlight untuk layer yang mendukung setStyle (Polygon/Line/CircleMarker)
        if (typeof lyr.setStyle === 'function') {
          this._highlightStyle(lyr);
          this.highlighted.add(id);
        }
        // 2) Highlight untuk marker (Point) dengan icon DOM
        else if (typeof lyr.getLatLng === 'function' && lyr._icon) {
          lyr._icon.classList.add('marker-highlighted');
          this.highlighted.add(id);
        }

        // 3) Kumpulkan bounds:
        //    - Polygon/Line → pakai getBounds()
        //    - Point (Marker / CircleMarker) → pakai getLatLng()
        if (typeof lyr.getBounds === 'function') {
          const b = lyr.getBounds();
          if (b && b.isValid && b.isValid()) {
            bounds.extend(b);
          }
        } else if (typeof lyr.getLatLng === 'function') {
          const p = lyr.getLatLng();
          if (p) bounds.extend(p);
        }
      }

      const map = this.$refs.map?.leafletObject || this.$refs.map?.mapObject;
      if (map && bounds.isValid && bounds.isValid()) {
        if (matches.length === 1) {
          // Kalau cuma 1 hasil, fokus ke titik / area itu
          const center = bounds.getCenter();
          const targetZoom = map.getZoom() < 17 ? 17 : map.getZoom();
          map.setView(center, targetZoom, { animate: true });
        } else {
          // Kalau banyak hasil, fit semua
          map.fitBounds(bounds.pad(0.1), { animate: true });
        }
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
        // Fullscreen button moved to bottom-right (will stack with zoom control)
        if (!this._fsControl) {
          this._fsControl = L.control.fullscreen({ position: 'bottomright' });
          this._fsControl.addTo(map);
        }

        // Sync state saat popup ditutup otomatis (mis. klik marker lain / autoClose)
        // supaya popup marker utama tidak "nyangkut" dan menghalangi klik marker lain.
        this._onPopupClose = () => {
          if (this.markerPopupVisible) this.markerPopupVisible = false;
        };
        map.off('popupclose', this._onPopupClose);
        map.on('popupclose', this._onPopupClose);
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

      // Tutup popup yang sedang terbuka dulu, biar klik marker lain tidak ketahan overlay popup
      this.closeAllLeafletPopups();

      this.singleMarker = { coords: [lat, lng] };
      //Untuk Siapa saja Pemanggilnya maka akan diberi ini
      this.$emit('markerLatLngUpdate', this.singleMarker);

      const props = this.getFastPropsAtFromFeatureIndex(lat, lng);

      if (this.isMobileDevice) {
        // On mobile: show sticky bar, no Leaflet popup
        this.markerPopupVisible = false;
        if (props) {
          this.openMobilePanel(props, null, true, false);
        } else {
          this.openMobilePanel(null, 'Tidak ada Zona', true, false);
          this.snackbar = { show: true, color: 'warning', text: 'Tidak ada feature di titik ini', timeout: 1200 };
        }
        return;
      }

      // Desktop: auto-open popup marker utama
      this.reopenSingleMarkerPopup();
    },

    singleMarkerClick() {
      // Pastikan popup lain tertutup dulu
      this.closeAllLeafletPopups();

      const props = this.getFastPropsAtFromFeatureIndex(this.singleMarker.coords[0], this.singleMarker.coords[1]);

      this.$emit('markerLatLngUpdate', this.singleMarker);

      if (this.isMobileDevice) {
        this.markerPopupVisible = false;
        if (props) {
          this.openMobilePanel(props, null, true, true);
        } else {
          this.openMobilePanel(null, 'Tidak ada Zona', true, false);
          this.snackbar = { show: true, color: 'warning', text: 'Tidak ada feature di titik ini', timeout: 1200 };
        }
        return;
      }

      // Desktop: paksa popup marker utama kebuka lagi
      this.reopenSingleMarkerPopup();
    },
    openMobilePanel(props, title = '', isVisible, isExpanded) {
      this.mobilePanel.props = props || null;
      this.mobilePanel.title = title || (props?.DESC || props?.NAM || props?.name || 'Detail Zona/Lokasi');
      this.mobilePanel.visible = isVisible;
      this.mobilePanel.expanded = isExpanded;
      this.mobilePanel.gone =false
    },
    zoomUpdated(zoom) {
      this.zoom = zoom;
    },
    centerUpdated(center) {
      this.center = center;
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
        this.colorMap[canonical] = hex;
      }
      return {
        color: hex,
        weight,
        opacity: 0.9,
        fillColor: hex,
        fillOpacity
      };
    },
    async syncDayaDukungGeojson({ id, fileNameLow, restApiFetch }) {
      // 1. Cek di Dexie
      this.snackbar.text = `mencoba mencari dari data local...`;
      this.snackbar.color = "success";
      this.snackbar.show = true;
      this.snackbar.timeout = 700;
      try {
        const local = await db.daya_dukung_peta.get(id);

        if (local && local.fileNameLow === fileNameLow && local.dataGeoJson) {
          this.snackbar.text = `Data GeoJSON ditemukan di lokal database!`;
          this.snackbar.color = "primary";
          this.snackbar.show = true;
          this.snackbar.timeout = 3000;

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

    onRadiusToggle(val) {
      this.useRadiusFilter = !!val;

      const mode = this.useRadiusFilter ? 'Radius 2 km' : 'Full';
      this.snackbar = {
        show: true,
        color: 'info',
        text: `Mode tampilan: ${mode}. Silakan klik/Check Peta, agar dapat memperbarui tampilan peta`,
        timeout: 3500,
      };
    },
    _filterGeoJSONByRadius(geojson, centerLatLng, radiusMeters = 2000) {
      if (!geojson || !Array.isArray(geojson.features) || !centerLatLng || centerLatLng.length < 2) return geojson;
      const [lat, lng] = centerLatLng;
      if (lat == null || lng == null) return geojson;

      const circle = turf.circle([lng, lat], radiusMeters / 1000, { steps: 64, units: 'kilometers' });
      const cbox = turf.bbox(circle);
      const boxHit = (fb) => !(fb[0] > cbox[2] || fb[2] < cbox[0] || fb[1] > cbox[3] || fb[3] < cbox[1]);

      const features = [];
      for (const f of geojson.features) {
        if (!f || !f.geometry) continue;
        try {
          const fb = turf.bbox(f);
          if (!boxHit(fb)) continue;
          if (turf.booleanIntersects(circle, f)) { features.push(f); continue; }
        } catch (e) { /* fallthrough */ }
        try {
          const centroid = turf.centroid(f);
          const d = turf.distance(centroid, [lng, lat], { units: 'kilometers' }) * 1000;
          if (d <= radiusMeters) features.push(f);
        } catch (e) { /* ignore */ }
      }
      return { type: 'FeatureCollection', features, crs: geojson.crs };
    },

    async valueChangedSpaMainGeoJson(value) {

      if (!value.fileNameLow) return;
      if (value.selected !== true) {
        this.isBulkCleanup = true;

        const index = this.itemSpaDayaDukungGeojson.findIndex((item) => item.id === value.id);
        if (index !== -1) this.itemSpaDayaDukungGeojson.splice(index, 1);

        // bersihkan semua indeks terkait dataset ini
        this.cleanupByDataset(value.id);
        // Leave bulk mode
        this.isBulkCleanup = false;

        // optional: refresh panel jika titik aktif tidak lagi mengenai feature
        const lat = this.singleMarker?.coords?.[0];
        const lng = this.singleMarker?.coords?.[1];
        if (this.isMobileDevice && lat != null && lng != null) {
          const cur = this.getFastPropsAtFromFeatureIndex(lat, lng);
          if (!cur) this.openMobilePanel(null, 'Tidak ada Zona', true, this.mobilePanel.expanded);
        }
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
        // Prevent duplicate entry (optional: replace by id)
        const existIndex = this.itemSpaDayaDukungGeojson.findIndex(item => item.id === value.id);
        if (existIndex !== -1) {
          this.itemSpaDayaDukungGeojson.splice(existIndex, 1);
        }

        // Keep FULL in Dexie, but only SHOW features within radius from marker
        const centerForRadius = (this.singleMarker?.coords && this.singleMarker.coords.length === 2)
          ? this.singleMarker.coords
          : this.currentMarker.coordinates;

        const toShow = (this.useRadiusFilter && centerForRadius)
          ? this._filterGeoJSONByRadius(geojsonResponse, centerForRadius, this.filterRadiusMeters)
          : geojsonResponse;

        this.itemSpaDayaDukungGeojson.push({
          id: value.id,
          data: {
            ...toShow,
            features: (toShow.features || []).map(f => ({
              ...f,
              properties: {
                ...f.properties,
                "__dsid": value.id,
                "Sumber Data": value.notes,
              }
            }))
          },
          lineColor: value.remark1,
          fillColor: value.remark2
        });

        // Optional UX: info jumlah fitur yang dirender vs total penuh
        if (this.useRadiusFilter) {
          const fullCount = (geojsonResponse.features || []).length;
          const showCount = (toShow.features || []).length;
          this.snackbar = { show: true, color: 'info', text: `Render ${showCount}/${fullCount} fitur dalam radius ${(this.filterRadiusMeters/1000).toFixed(1)} km`, timeout: 1600 };
        }
      }
    },


    // --- Index cleanup helpers ---
    cleanupByLayerId(id) {
      // RBush remove requires the same object reference used on insert
      const bbox = this.layerBBoxes && this.layerBBoxes.get ? this.layerBBoxes.get(id) : null;
      if (bbox && this.spatialIndex && this.spatialIndex.remove) {
        try { this.spatialIndex.remove(bbox); } catch (e) { /* ignore */ }
        this.layerBBoxes.delete(id);
      }

      // feature + text index
      if (this.featureIndex && this.featureIndex.delete) this.featureIndex.delete(id);
      if (Array.isArray(this.textIndex)) {
        this.textIndex = this.textIndex.filter(x => x.layerId !== id);
      }

      // highlighted state
      if (this.highlighted && this.highlighted.delete) this.highlighted.delete(id);
    },
    rebuildSpatialIndex() {
      // Build a fresh RBush dari sisa bboxes; jauh lebih cepat untuk penghapusan massal
      const items = Array.from(this.layerBBoxes.values());
      this.spatialIndex = new RBush();
      if (items.length) this.spatialIndex.load(items);
    },
    cleanupByDataset(dsid) {
      const ids = this.datasetIndex && this.datasetIndex.get ? this.datasetIndex.get(dsid) : null;
      if (!ids || !ids.size) return;

      // Bulk mode: tahan cleanup per-layer dari hook remove
      this.isBulkCleanup = true;

      // 1) Prune textIndex sekali jalan
      this.textIndex = Array.isArray(this.textIndex)
          ? this.textIndex.filter(x => !ids.has(x.layerId))
          : [];

      // 2) Hapus dari featureIndex & highlighted, dan buang bbox ref yang terkait
      for (const lid of ids) {
        if (this.featureIndex && this.featureIndex.delete) this.featureIndex.delete(lid);
        if (this.highlighted && this.highlighted.delete) this.highlighted.delete(lid);
        if (this.layerBBoxes && this.layerBBoxes.has && this.layerBBoxes.has(lid)) {
          this.layerBBoxes.delete(lid);
        }
      }

      // 3) Lepas mapping dataset
      this.datasetIndex.delete(dsid);

      // 4) Rebuild RBush sekali (lebih cepat dari .remove berulang)
      this.rebuildSpatialIndex();

      // 5) Keluar dari bulk mode
      this.isBulkCleanup = false;
    },

    jsonToHtmlTable_Mobile(jsonValue) {
      const myObj = jsonValue;

      let text = "<table style='width: 180px'>"

      for (const meta in myObj) {
        // if (/^(OBJ|NAM|WAD|SHAPE|LUAS|Ket|KET|Fung|FUNG|Sumber|PENGGUNAAN|DESC|KRB|REMARK)/.test(meta)) {
        if (/^(OBJ|desc|DESC)/.test(meta)) {
          text +=
              "  <tr>\n" +
              myObj[meta] +
              "  </tr>\n";
        }
      }

      text += "</table>";

      return text;
    },


    jsonToHtmlTable(jsonValue) {
      const myObj = jsonValue || {};

      const escapeHtml = (v) => String(v)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');

      let rows = '';
      for (const meta in myObj) {
        if (!Object.prototype.hasOwnProperty.call(myObj, meta)) continue;
        const val = myObj[meta];
        // Normalize value: treat null, undefined, "<Null>", "<null>", and empty string as empty string
        const displayVal = (
          val === null ||
          val === undefined ||
          (typeof val === 'string' && val.trim().toLowerCase() === '<null>')
        ) ? '' : val;
        rows += `
      <tr>
        <td class="key">${escapeHtml(meta)}</td>
        <td class="sep">:</td>
        <td class="val">${escapeHtml(displayVal)}</td>
      </tr>`;
      }

      return `<table class="kv-table"><tbody>${rows}</tbody></table>`;
    },
    fetchDayaDukungPeta(){
      FDayadukungService.getAllFDayaDukungByTypePetaPublic().then(
          response => {
            this.itemsFDayaDukung = response.data.filter(item => item.fileNameLow && item.showToMap).map(item => {
              let selected = false;
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
        } else if (g.type === 'LineString') {
          const coords = g.coordinates || [];
          const cleaned = Array.isArray(coords)
            ? coords.filter(c =>
                Array.isArray(c) &&
                c.length >= 2 &&
                Number.isFinite(c[0]) &&
                Number.isFinite(c[1])
              )
            : [];
          if (cleaned.length < 2) continue;

          const d = this.minDistanceToVertices(pt, cleaned, 'meters');
          if (Number.isFinite(d) && d <= lineTolMeters) return f.properties || {};
        } else if (g.type === 'MultiLineString') {
          const lines = g.coordinates || [];
          let minD = Infinity;
          for (const lineCoords of lines) {
            const cleaned = Array.isArray(lineCoords)
              ? lineCoords.filter(c =>
                  Array.isArray(c) &&
                  c.length >= 2 &&
                  Number.isFinite(c[0]) &&
                  Number.isFinite(c[1])
                )
              : [];
            if (cleaned.length < 2) continue;

            const d = this.minDistanceToVertices(pt, cleaned, 'meters');
            if (Number.isFinite(d) && d < minD) minD = d;
          }
          if (Number.isFinite(minD) && minD <= lineTolMeters) return f.properties || {};
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
    if(this.$vuetify.display.smAndDown){
      this.showMapsetController = false
    }
    this.currentMarker = this.$store.state.potensi.centerMap
    this.singleMarker = {
      coords: this.currentMarker.coordinates,
    }
    this.fetchDayaDukungPeta();
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    this._onResize = () => (this.winWidth = window.innerWidth);
    window.addEventListener('resize', this._onResize, { passive: true });
    window.addEventListener('orientationchange', this._onResize, { passive: true });
    const props = this.getFastPropsAtFromFeatureIndex(this.singleMarker.coords[0], this.singleMarker.coords[1]);
    if (this.isMobileDevice) {
      if (props) {
        this.openMobilePanel(props, null, true, false);
      } else {
        this.openMobilePanel(null, 'Tidak ada Zona', true, false);
        this.snackbar = { show: true, color: 'warning', text: 'Tidak ada feature di titik ini', timeout: 1200 };
      }
    }
  },
  beforeUnmount() {
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('orientationchange', this._onResize);
    try {
      const map = this.$refs.map?.leafletObject || this.$refs.map?.mapObject;
      if (map && this._onPopupClose) {
        map.off('popupclose', this._onPopupClose);
      }
    } catch (e) {
      console.warn('beforeUnmount popupclose cleanup error', e);
    }
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


/* Mobile Sticky Bottom Bar / Bottom Sheet (Glow Up) */
.mobile-sticky {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  transform: translateY(calc(100% - 64px)); /* collapsed height */
  transition: transform 220ms ease, box-shadow 220ms ease;
  background: #ffffff; /* solid to avoid text ghosting */
  /* remove blur from container to prevent text stacking artifacts */
  box-shadow: 0 -6px 22px rgba(0,0,0,0.18);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  pointer-events: auto;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
  overflow: hidden; /* contain inner scroll */
}
.mobile-sticky.visible { transform: translateY(0); }
.mobile-sticky.expanded { transform: translateY(0); }

.mobile-sticky.expanded {
  height: 80vh;               /* fixed height when expanded */
  max-height: none;
  display: flex;
  flex-direction: column;     /* allow content to size relative to container */
}

.mobile-sticky__header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px 8px 12px;
  min-height: 64px;
  user-select: none;
}
.mobile-sticky__header.glossy {
  background: linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  backdrop-filter: saturate(1.1) blur(8px);
  -webkit-backdrop-filter: saturate(1.1) blur(8px);
}
.mobile-sticky__handle {
  width: 44px;
  height: 5px;
  border-radius: 3px;
  background: rgba(0,0,0,0.22);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 8px;
}
.mobile-sticky__title {
  flex: 1;
  text-align: center;
  font-weight: 700;
  letter-spacing: .2px;
}
.mobile-sticky__title-text {
  max-width: 80vw;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mobile-sticky__close-btn {
  position: absolute;
  right: 6px;
  top: 8px;
}
.mobile-sticky__content {
  height: calc(100% - 64px - env(safe-area-inset-bottom)); /* relative to container height */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* smooth iOS scroll */
  overscroll-behavior: contain;      /* prevent body scroll hijack */
  touch-action: pan-y;               /* allow vertical scroll gestures */
  padding: 8px 12px 16px 12px;
  border-top: 1px solid rgba(0,0,0,0.06);
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}
.mobile-sticky__summary {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.mobile-sticky__table table { width: 100%; }
.mobile-sticky__footer-spacer { height: max(6px, env(safe-area-inset-bottom)); }

:deep(.control-offset-br) {
  margin-right: 16px;
}
:deep(.leaflet-top.leaflet-right .leaflet-control-layers) {
  margin-right: 16px; /* kira-kira setara mr-6 */
}

/* Optional: di mobile, naikin lebih jauh biar gak ketutup bottom sheet */

:deep(.kv-table) {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* biar wrapping stabil */
}
:deep(.kv-table td) {
  padding: 2px 4px;
  vertical-align: top;
  line-height: 1.1;
}
:deep(.kv-table td.key) {
  color: #777777;
  width: 50%;
  white-space: wrap;
  text-align: right; /* key rata kanan */
  padding-right: 4px;
}
:deep(.kv-table td.sep) {
  width: 14px;
  text-align: center; /* ':' center */
  white-space: wrap;
}
:deep(.kv-table td.val) {
  width: 50%;
  white-space: normal;        /* reset */
  word-break: normal;         /* reset */
  overflow-wrap: anywhere;    /* paksa wrap kalau panjang */
  line-break: auto;
  display: table-cell;        /* pastikan tetap behave sebagai cell */
}
:deep(.marker-highlighted) {
  transform: scale(1.3);
  filter: drop-shadow(0 0 6px #ff4081);
  z-index: 1000 !important;
}
.chev-rotate {
  transition: transform 180ms ease;
  transform: rotate(0deg);           /* default: left */
  transform-origin: 50% 50%;
  will-change: transform;
}

.chev-rotate--open {
  transform: rotate(-90deg);         /* jadi down */
}
:deep(.leaflet-bottom.leaflet-right .leaflet-control-zoom) {
  margin-right: 16px !important;
}
:deep(.leaflet-bottom.leaflet-right .leaflet-control-fullscreen) {
  margin-right: 16px !important;
}
</style>

