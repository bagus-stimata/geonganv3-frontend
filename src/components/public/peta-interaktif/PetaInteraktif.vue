<template>
  <div class="map-wrapper">
    <PetaPostgis
      ref="refPetaPostgis"
      :min-height="`100vh`"
      :height="`100vh`"
      :dataset-ids="visibleDatasetGeojsonIds"
      :items-mapset-selected="itemsMapsetSelected"
      :draw-enabled="drawToolsOn"
      :uploaded-geojson="uploadedGeojson"
      :uploaded-geojson-visible="uploadedGeojsonVisible"
    />
    <v-card elevation="0" width="280" class="map-overlay-card bg-transparent ma-md-2 ma-1">
      <v-card-title class="bg-white py-4 rounded-lg">
        <div class="d-flex flex-row">
          <div class="d-flex flex-row align-center justify-center">
            <v-img
                lazy
                height="45"
                width="45"
                :src="require('@/assets/logo.webp')"
            ></v-img>
            <div>
              <div class="text-subtitle-1 my-0 py-0 font-weight-black">GEO PORTAL</div>
              <div class="text-subtitle-2 mt-n1 my-0 py-0 font-weight-light text-grey-darken-2">Kab.Nganjuk</div>
            </div>
          </div>
          <v-spacer></v-spacer>
          <v-btn @click="showMapsetController = !showMapsetController" variant="text" icon>
            <v-icon
                class="chev-rotate"
                :class="{ 'chev-rotate--open': showMapsetController }"
            >
              mdi-chevron-left-box-outline
            </v-icon>
          </v-btn>
        </div>
        <v-expand-transition v-show="showMapsetController === true">
          <v-text-field
              v-model="searchText"
              @keyup.enter="searchAndHighlight(searchText)"
              @blur="searchAndHighlight(searchText)"
              append-inner-icon="mdi-magnify"
              density="compact"
              label="Cari pada peta (highlight)"
              hide-details
              class="rounded-lg text-caption border-opacity-25 mt-2 mx-2"
              variant="outlined"
          ></v-text-field>
        </v-expand-transition>
      </v-card-title>
      <v-expand-transition v-show="showMapsetController === true">
        <v-card class="bg-white mt-2 py-2 rounded-lg" height="46vh" style="overflow-y: auto;">
          <v-card-text>
            <div class="text-subtitle-1 mb-1 font-weight-bold d-flex flex-row align-center">
              <div>Mapset Selected</div>
              <span v-if="itemsMapsetSelected.length > 0" class="ml-2 bg-orange rounded-lg py-1 px-3 text-caption font-weight-bold text-white">{{itemsMapsetSelected.length}}</span>
              <v-spacer></v-spacer>
              <v-btn @click="deleteAllList" v-if="itemsMapsetSelected.length > 0" icon density="comfortable" variant="text" color="red"><v-icon>mdi-delete</v-icon></v-btn>
            </div>
            <v-divider></v-divider>
            <v-card v-if="itemsMapsetSelected.length > 0" elevation="0" class="mt-2">
              <v-card elevation="0" class="overflow-y-auto ma-0 pa-0" height="25vh">
                <v-card-text class="ma-0 pa-0">
                  <v-row no-gutters class="ga-2">
                    <v-col cols="12" v-for="(itemSelected) in itemsMapsetSelected" :key="itemSelected.id">
                      <v-card elevation="0" class="d-flex rounded-lg flex-row align-center pa-1 border-opacity-25 border-thin">
                        <v-icon size="small" class="mx-1" color="grey">mdi-dots-vertical</v-icon>
                        <div class="ml-2 text-caption font-weight-bold text-black">{{itemSelected.description}}</div>
                        <v-spacer></v-spacer>
                        <v-btn
                            @click.stop="toggleMapsetVisibility(itemSelected)"
                            icon
                            density="comfortable"
                            variant="text"
                            :color="itemSelected.hasGeojson === false ? 'grey' : 'black'"
                            :title="itemSelected.hasGeojson === false ? 'Tampilkan di peta' : 'Sembunyikan dari peta'"
                        >
                          <v-icon>{{ itemSelected.hasGeojson === false ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                        </v-btn>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
              <v-card-text class="text-center ma-0 py-1">
                <v-btn @click="showDialogPickMapset" color="green" class="text-white text-subtitle-2 mt-6 rounded-lg font-weight-bold" density="comfortable" variant="elevated">Tambah Mapset</v-btn>
              </v-card-text>
            </v-card>
            <v-card v-else elevation="0" class="mt-2">
              <v-card elevation="0"  class="mt-2 overflow-y-auto d-flex flex-row justify-center align-center bg-grey-lighten-5" height="33vh">
                <v-card-text class="text-center">
                  <v-btn readonly color="grey" class="mb-6" icon variant="flat" size="small"><v-icon class="text-white">mdi-map</v-icon></v-btn>
                  <div class="font-weight-black text-subtitle-2 text-center">Belum ada mapset yang dipilih</div>
                  <div class="text-caption font-weight-light text-grey-darken-2 text-center">Silahkan pilih terlebih dahulu mapset untuk melihat data secara detail</div>
                  <v-btn @click="showDialogPickMapset" color="indigo" class="text-white text-subtitle-2 rounded-lg mt-6 font-weight-bold" density="comfortable" variant="elevated">Pilih Mapset</v-btn>
                </v-card-text>
              </v-card>
            </v-card>
          </v-card-text>
        </v-card>
      </v-expand-transition>

      <v-expand-transition v-show="showMapsetController === true">
        <v-card-text class="bg-white mt-3 py-4 rounded-lg">
          <div class="text-subtitle-1 mb-1 font-weight-bold d-flex flex-row align-center">
            <div>Alat Peta</div>
            <v-spacer></v-spacer>
            <v-btn
                v-if="uploadedGeojson"
                @click="showUploadedGeojson"
                icon
                density="comfortable"
                variant="text"
                :color="uploadedGeojsonVisible ? 'blue' : 'grey'"
            >
              <v-icon>{{ uploadedGeojsonVisible ? 'mdi-eye' : 'mdi-eye-off' }}</v-icon>
              <v-tooltip
                  class="text-caption"
                  activator="parent"
                  location="top"
              >Peta Terupload</v-tooltip>
            </v-btn>
          </div>
          <div class="text-subtitle-1 mb-2 font-weight-bold"></div>
          <v-row no-gutters>
            <v-col cols="4" md="4" class="px-1">
              <v-hover v-slot="{ isHovering, props }">
                <v-btn
                    v-bind="props"
                    block
                    :variant="mapToolTipOn ? 'flat' : (isHovering ? 'flat' : 'outlined')"
                    :class="{ 'color-bg-primary': isHovering || mapToolTipOn }"
                    @click="setMapToolTip"
                >
                  <v-tooltip
                      activator="parent"
                      location="bottom"
                  >Aktifkan Tooltip pada Peta</v-tooltip>
                  <v-icon size="large" :class="{ 'text-white': isHovering || mapToolTipOn }">mdi-tooltip-outline</v-icon>
                </v-btn>
              </v-hover>
            </v-col>
            <v-col cols="4" md="4" class="px-1">
              <v-hover v-slot="{ isHovering, props }">
                <v-btn
                    v-bind="props"
                    block
                    @click="toggleDrawTools"
                    :variant="drawToolsOn ? 'flat' : (isHovering ? 'flat' : 'outlined')"
                    :class="{ 'color-bg-primary': isHovering || drawToolsOn }"
                >
                  <v-tooltip
                      activator="parent"
                      location="bottom"
                  >Menggambar pada Peta</v-tooltip>
                  <v-icon size="large" :class="{ 'text-white': isHovering || drawToolsOn }">mdi-vector-polygon</v-icon>
                </v-btn>
              </v-hover>
            </v-col>
            <v-col cols="4" md="4" class="px-1">
              <v-hover v-slot="{ isHovering, props }">
                <v-btn
                    @click="downloadOrFilledFormGeojson"
                    v-bind="props"
                    block
                    :variant="isHovering ? 'flat' : 'outlined'"
                    :class="{ 'color-bg-primary': isHovering }"
                >
                  <v-tooltip
                      activator="parent"
                      location="bottom"
                  >Download Data Geojson</v-tooltip>
                  <v-icon size="large" :class="{ 'text-white': isHovering }">mdi-download-outline</v-icon>
                </v-btn>
              </v-hover>
            </v-col>
          </v-row>
          <v-btn @click="showUploadGeojsonDialog" density="comfortable" block variant="elevated" class="mx-1 mt-2 text-subtitle-2 font-weight-bold" color="blue-darken-1">Upload Peta</v-btn>
        </v-card-text>
      </v-expand-transition>
    </v-card>
    <GooglePlacesDialog
        ref="refGooglePlacesDialog"
        @eventGooglePlacesSelect="googlePlacesSelect"
        @closed="onPlacesClosed"
    ></GooglePlacesDialog>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color? snackbar.color : 'info'"
      :timeout="snackbar.timeout? snackbar.timeout : 1500"
      location="bottom">
        <span class="snackbar-center">{{ snackbar.text }}</span>
    </v-snackbar>
    <PickMapsetDialog @applyPeta="applyPeta" ref="refPickMapsetDialog"></PickMapsetDialog>
    <DownloadFormDialog :itemsFDivision="itemsFDivision" @downloadGeojsonZip="downloadGeojsonZip" ref="refDownloadFormDialog"></DownloadFormDialog>
    <UploadGeojsonDialog
        ref="refUploadGeojsonDialog"
        @geojsonUploaded="onGeojsonUploaded"
    />
    <v-dialog v-model="loadingSync" persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          Please wait
          <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-card
        v-if="ftTematik"
        class="rounded ma-2 overflow-hidden"
        elevation="1"
    >
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="12" md="4">
            <v-img
                :src="lookupImageMediumUrl(ftTematik)"
                :lazy-src="lookupImageLazyUrl(ftTematik)"
                height="220"
                cover
            >
            </v-img>
          </v-col>
          <v-col cols="12" sm="12" md="8">
            <div>
              <span class="font-weight-bold text-subtitle-1">{{ ftTematik.description }}</span>
              <v-chip size="small" color="pink" density="compact" class="ml-2 text-caption text-orange ">{{ ftTematik.categ }}</v-chip>
            </div>
            <div class="mt-3 text-caption">{{ ftTematik.notes }}</div>
          </v-col>
        </v-row>

      </v-card-text>
    </v-card>

  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L, {Icon} from 'leaflet';
import 'leaflet-fullscreen';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import zonaMapper from '@/helpers/zona-color-mapper';
import GooglePlacesAutoCompleteDialog from "@/components/util-ext/GooglePlacesAutoCompleteDialog.vue";

import RBush from 'rbush'
import * as turf from '@turf/turf'
import PickMapsetDialog from "@/components/public/peta-interaktif/PickMapsetDialog.vue";
import FtDatasetService from "@/services/apiservices/ft-dataset-service";
import FtTematikDatasetService from "@/services/apiservices/ft-tematik-dataset-service";
import {lookupImageUrl} from "@/helpers/lookup-file-helper";
import FileService from "@/services/apiservices/file-service";
import DownloadFormDialog from "@/components/public/peta-interaktif/DownloadFormDialog.vue";
import FGeoDownload from "@/models/f-geo-download";
import FDivisionService from "@/services/apiservices/f-division-service";
import FGeoDownloadService from "@/services/apiservices/f-geo-download-service";
import UploadGeojsonDialog from "@/components/public/peta-interaktif/UploadGeojsonDialog.vue";
import ETipePeta from "@/models/e-tipe-peta";
import PetaPostgis from "@/components/public/peta-tematik/PetaPostgis.vue";

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

export default {
  name: "PetaInteraktif",
  components: {
    PetaPostgis,
    UploadGeojsonDialog,
    DownloadFormDialog,
    PickMapsetDialog,
    GooglePlacesDialog: GooglePlacesAutoCompleteDialog,

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
      drawToolsOn: false,
      drawnItems: null,
      drawControl: null,
      lastDrawnGeojson: null,
      markerIconCache: new Map(),
      ftTematik: undefined,
      loadingSync:false,
      mapToolTipOn: false,

      isApply: false,
      itemsMapsetSelected:[],
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
      drawHandlers: { created: null, edited: null, deleted: null },
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
      zoom: 11,
      maxZoom: 19, // cap global; providers will overzoom above their native (OSM 19)
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


      geojson: null,
      itemsDatasetGeojson: [],
      uploadedGeojson: null,
      uploadedGeojsonVisible: true,

      colorMap: {},
      itemsFDivision : [],
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
    visibleDatasetGeojsonItems() {
      const selected = Array.isArray(this.itemsMapsetSelected) ? this.itemsMapsetSelected : [];
      const visibleIds = new Set(
        selected
          .filter(x => x && x.id != null && x.hasGeojson !== false)
          .map(x => x.id)
      );
      // console.log(this.itemsDatasetGeojson)
      const cache = Array.isArray(this.itemsDatasetGeojson) ? this.itemsDatasetGeojson : [];
      return cache.filter(ds => ds && ds.id != null && visibleIds.has(ds.id));
    },
    visibleDatasetGeojsonIds() {
      const selected = Array.isArray(this.itemsMapsetSelected) ? this.itemsMapsetSelected : [];
      return selected
          .filter(x => x && x.id != null && x.hasGeojson !== false)
          .map(x => x.id);
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
        pointToLayer: this.pointToLayerFunction,
      };
    },
    pointToLayerFunction() {
      return (feature, latlng) => {
        try {
          const icon = this.getMarkerIconForFeature(feature);
          return icon ? L.marker(latlng, { icon }) : L.marker(latlng);
        } catch (e) {
          console.warn('[PetaInteraktif][pointToLayer] fallback default marker', e);
          return L.marker(latlng);
        }
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

          if (this.mapToolTipOn) {
            layer.bindTooltip(
                `<div style='max-height: 350px; overflow-y: auto; min-width: 300px; overflow-x: auto;' >
                    ${this.jsonToHtmlTable(feature.properties)}
                </div>`,
                { permanent: false, sticky: true }
            );
          }

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
    formatHectares(valueHa) {
      if (!Number.isFinite(valueHa)) return '';
      // 4 decimals is usually enough for map drawing
      return Number(valueHa.toFixed(4));
    },

    setDrawnAreaTooltip(layer) {
      try {
        if (!layer) return;

        // Only show area tooltip for shapes that have area: Polygon/Rectangle/Circle
        let areaM2 = null;

        if (layer instanceof L.Circle && typeof layer.getRadius === 'function') {
          const r = layer.getRadius();
          if (Number.isFinite(r)) areaM2 = Math.PI * r * r;
        } else if (typeof layer.toGeoJSON === 'function') {
          const gj = layer.toGeoJSON();
          const t = gj && gj.geometry ? gj.geometry.type : '';
          if (t === 'Polygon' || t === 'MultiPolygon') {
            areaM2 = turf.area(gj);
          }
        }

        if (!Number.isFinite(areaM2)) return;
        const areaHa = areaM2 / 10000;
        const haText = this.formatHectares(areaHa);
        if (haText === '') return;

        const html = `<div style='font-weight:700'>Luas: ${haText} ha</div>`;

        // Re-bind to keep tooltip updated
        if (typeof layer.unbindTooltip === 'function') {
          layer.unbindTooltip();
        }
        if (typeof layer.bindTooltip === 'function') {
          layer.bindTooltip(html, {
            permanent: false,
            sticky: true,
            direction: 'top',
            opacity: 0.95,
          });
        }
      } catch (e) {
        console.warn('[PetaInteraktif][setDrawnAreaTooltip] error', e);
      }
    },
    initDrawTools(map) {
      try {
        if (!map) return;
        if (this.drawnItems) return; // already init

        this.drawnItems = new L.FeatureGroup();
        map.addLayer(this.drawnItems);

        this.drawControl = new L.Control.Draw({
          position: 'bottomright',
          edit: {
            featureGroup: this.drawnItems,
            remove: true,
          },
          draw: {
            polygon: true,
            polyline: true,
            rectangle: true,
            circle: true,
            marker: true,
            circlemarker: false,
          }
        });

        if (!this.drawHandlers.created) this.drawHandlers.created = (ev) => this.onDrawCreated(ev);
        if (!this.drawHandlers.edited) this.drawHandlers.edited = (ev) => this.onDrawEdited(ev);
        if (!this.drawHandlers.deleted) this.drawHandlers.deleted = (ev) => this.onDrawDeleted(ev);

        map.on(L.Draw.Event.CREATED, this.drawHandlers.created);
        map.on(L.Draw.Event.EDITED, this.drawHandlers.edited);
        map.on(L.Draw.Event.DELETED, this.drawHandlers.deleted);
      } catch (e) {
        console.error('[PetaInteraktif][initDrawTools] error', e);
      }
    },

    toggleDrawTools() {
      // Draw tools are handled inside PetaPostgis (Leaflet control)
      this.drawToolsOn = !this.drawToolsOn;
      this.snackbar = {
        show: true,
        color: this.drawToolsOn ? 'teal' : 'info',
        text: this.drawToolsOn
          ? 'Mode gambar aktif (di Peta)'
          : 'Mode gambar dimatikan',
        timeout: 1500,
      };
    },

    onDrawCreated(e) {
      try {
        const layer = e?.layer;
        if (!layer) return;

        if (this.drawnItems && this.drawnItems.addLayer) {
          this.drawnItems.addLayer(layer);
        }
        // Tooltip luas (ha) untuk shape yang punya area
        this.setDrawnAreaTooltip(layer);

        const gj = layer.toGeoJSON ? layer.toGeoJSON() : null;

        // circle: simpen radius biar kepake
        if (gj) {
          if (!gj.properties) gj.properties = {};
          if (layer instanceof L.Circle && typeof layer.getRadius === 'function') {
            gj.properties.radiusMeters = layer.getRadius();
          }
          this.lastDrawnGeojson = gj;

          // optional: emit ke parent
          this.$emit('shapeDrawn', gj);
        }

        this.snackbar = { show: true, color: 'success', text: 'Shape berhasil digambar', timeout: 1500 };
      } catch (err) {
        console.error('[PetaInteraktif][onDrawCreated] error', err);
        this.snackbar = { show: true, color: 'error', text: 'Gagal menggambar shape', timeout: 1800 };
      }
    },

    onDrawEdited(e) {
      try {
        const layers = e && e.layers && typeof e.layers.eachLayer === 'function' ? e.layers : null;
        if (layers) {
          layers.eachLayer((layer) => {
            this.setDrawnAreaTooltip(layer);
          });
        }

        this.$emit('shapesEdited', this.exportDrawnGeojson());
        this.snackbar = { show: true, color: 'info', text: 'Shape diperbarui', timeout: 1200 };
      } catch (err) {
        console.warn('[PetaInteraktif][onDrawEdited] error', err);
      }
    },

    onDrawDeleted() {
      try {
        this.$emit('shapesDeleted', this.exportDrawnGeojson());
        this.snackbar = { show: true, color: 'info', text: 'Shape dihapus', timeout: 1200 };
      } catch (err) {
        console.warn('[PetaInteraktif][onDrawDeleted] error', err);
      }
    },

    exportDrawnGeojson() {
      try {
        if (!this.drawnItems) return { type: 'FeatureCollection', features: [] };
        const fc = this.drawnItems.toGeoJSON ? this.drawnItems.toGeoJSON() : null;
        if (fc && fc.type === 'FeatureCollection') return fc;
        return { type: 'FeatureCollection', features: [] };
      } catch (e) {
        console.warn('[PetaInteraktif][exportDrawnGeojson] error', e);
        return { type: 'FeatureCollection', features: [] };
      }
    },
    isPointTipePeta(tipePeta) {
      return tipePeta === ETipePeta.POINT
    },

    resolveMarkerImageUrl(markerImage) {
      const v = (markerImage == null) ? '' : String(markerImage).trim();
      if (!v) return '';
      if (/^https?:\/\//i.test(v)) return v;

      try {
        // kalau markerImage itu key/filename dari backend
        return FileService.image_url_medium(v);
      } catch (e) {
        console.warn('[PetaInteraktif][resolveMarkerImageUrl] fallback raw value', e);
        return v;
      }
    },

    getMarkerIconForFeature(feature) {
      const props = feature?.properties || {};
      const dsid = props.__dsid;
      if (dsid == null) return null;

      const list = Array.isArray(this.itemsMapsetSelected) ? this.itemsMapsetSelected : [];
      const ds = list.find(x => x && x.id === dsid);
      if (!ds) return null;
      // only POINT dataset + markerImage not empty
      if (!this.isPointTipePeta(ds.tipePeta)) return null;

      const url = this.resolveMarkerImageUrl(ds.markerImage);
      if (!url) return null;

      // cache icon biar gak recreate terus
      if (!this._markerIconCache) this._markerIconCache = new Map();
      const key = `${dsid}::${url}`;
      if (this._markerIconCache.has(key)) return this._markerIconCache.get(key);

      const icon = L.icon({
        iconUrl: url,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -28],
        shadowUrl: undefined,
      });

      this._markerIconCache.set(key, icon);
      return icon;
    },
    lookupImageUrl,
    showUploadGeojsonDialog() {
      if (this.$refs.refUploadGeojsonDialog) {
        this.$refs.refUploadGeojsonDialog.showDialog();
      }
    },
    onGeojsonUploaded(geo) {
      try {
        if (!geo || geo.type !== 'FeatureCollection') {
          this.snackbar = {
            show: true,
            color: 'error',
            text: 'GeoJSON tidak valid',
            timeout: 1800,
          };
          return;
        }
        this.uploadedGeojson = geo;
        this.uploadedGeojsonVisible = true;
        this.snackbar = {
          show: true,
          color: 'primary',
          text: 'Peta GeoJSON upload berhasil ditampilkan',
          timeout: 1800,
        };
      } catch (e) {
        console.error('onGeojsonUploaded error', e);
        this.snackbar = {
          show: true,
          color: 'error',
          text: 'Gagal menampilkan GeoJSON upload',
          timeout: 2000,
        };
      }
    },
    showUploadedGeojson() {
      if (!this.uploadedGeojson) {
        this.snackbar = {
          show: true,
          color: 'warning',
          text: 'Belum ada GeoJSON hasil upload',
          timeout: 1500,
        };
        return;
      }

      this.uploadedGeojsonVisible = !this.uploadedGeojsonVisible;

      this.snackbar = {
        show: true,
        color: this.uploadedGeojsonVisible ? 'primary' : 'info',
        text: this.uploadedGeojsonVisible
            ? 'Layer GeoJSON upload ditampilkan'
            : 'Layer GeoJSON upload disembunyikan',
        timeout: 1500,
      };
    },
    showDialogDownloadGeojson(){
      const ids = Array.isArray(this.itemsMapsetSelected)
          ? this.itemsMapsetSelected.map(x => x && x.id).filter(v => Number.isFinite(v))
          : [];
      if (ids.length === 0) {
        this.snackbar = {
          show: true,
          color: "warning",
          text: "Belum ada dataset yang dipilih",
          timeout: 1500,
        };
        return;
      }
      this.$refs.refDownloadFormDialog.showDialog(this.itemsMapsetSelected)
    },
    downloadOrFilledFormGeojson() {
      // Pastikan ada dataset yang dipilih dulu
      const ids = Array.isArray(this.itemsMapsetSelected)
          ? this.itemsMapsetSelected.map(x => x && x.id).filter(v => Number.isFinite(v))
          : [];
      if (ids.length === 0) {
        this.snackbar = {
          show: true,
          color: "warning",
          text: "Belum ada dataset yang dipilih",
          timeout: 1500,
        };
        return;
      }

      // Baca currentDownloader dari localStorage
      const raw = localStorage.getItem("currentDownloader");
      let currentDownloader = null;

      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          // Kalau salah satu wajib kosong, anggap belum lengkap → buka form
          if (
              !parsed ||
              !parsed.description ||
              !parsed.email ||
              !parsed.instansi
          ) {
            this.showDialogDownloadGeojson();
            return;
          }
          currentDownloader = parsed;
        } catch (e) {
          console.error("Gagal parse currentDownloader:", e);
          localStorage.removeItem("currentDownloader");
          this.showDialogDownloadGeojson();
          return;
        }
      } else {
        // Tidak ada currentDownloader sama sekali → buka form
        this.showDialogDownloadGeojson();
        return;
      }
        // Isi fdivisionBean default (KOMINFO) jika ketemu
        const fdivision = this.itemsFDivision.filter(
            (x) => x.description && x.description.toUpperCase().includes("DISKOMINFO")
        );
        if (fdivision.length > 0) {
          currentDownloader.fdivisionBean = fdivision[0].id;
        }

        // Build payload FGeoDownload per dataset terpilih
        const payload = (this.itemsMapsetSelected || []).map((item) => {
          const entry = new FGeoDownload();
          entry.description = currentDownloader.description;
          entry.email = currentDownloader.email;
          entry.instansi = currentDownloader.instansi;
          entry.notes = item && item.description ? item.description : "";
          entry.ftDatasetBean = item && item.id ? item.id : 0;
          entry.fdivisionBean = currentDownloader.fdivisionBean;
          entry.statusActive = true;
          return entry;
        });

        if (payload.length === 0) {
          this.snackbar = {
            show: true,
            color: "warning",
            text: "Belum ada dataset yang valid untuk di-download",
            timeout: 1500,
          };
          return;
        }

        // Kirim log download dulu, lalu jalankan export ZIP
        FGeoDownloadService.createFGeoDownloadMultiple(payload)
            .then(() => {
              this.downloadGeojsonZip();
            })
            .catch((err) => {
              console.error("createFGeoDownloadMultiple error", err);
              this.snackbar = {
                show: true,
                color: "error",
                text: "Gagal menyimpan info download",
                timeout: 2000,
              };
            });
    },
    downloadGeojsonZip() {
      const ids = Array.isArray(this.itemsMapsetSelected)
          ? this.itemsMapsetSelected.map(x => x && x.id).filter(v => Number.isFinite(v))
          : [];
      if (ids.length === 0) {
        this.snackbar = {
          show: true,
          color: "warning",
          text: "Belum ada dataset yang dipilih",
          timeout: 1500,
        };
        return;
      }

      this.loadingSync = true
      FtDatasetService.exportGeojsonFtDatasetZip(ids)
          .then((res) => {
            const blob = new Blob([res.data], {type: "application/zip"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "datasets_geojson.zip";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.loadingSync = false
            this.snackbar = {
              show: true,
              color: "primary",
              text: "Download dimulai",
              timeout: 1500,
            };
          })
          .catch((e) => {
            console.error("downloadGeojsonZip error", e);
            this.loadingSync = false
            this.snackbar = {
              show: true,
              color: "error",
              text: "Gagal membuat file ZIP",
              timeout: 1800,
            };
          });
    },
    setMapToolTip() {
      this.mapToolTipOn = !this.mapToolTipOn;

      // Setelah flag di-toggle, update semua layer yang sudah ada
      this.updateLayerTooltips();

      this.snackbar = {
        show: true,
        color: this.mapToolTipOn ? 'primary' : 'info',
        text: this.mapToolTipOn ? 'Tooltip peta diaktifkan' : 'Tooltip peta dimatikan',
        timeout: 1500,
      };
    },
    fetchParent(){
      FDivisionService.getAllFDivisionPublic().then(
          (response) => {
            this.itemsFDivision = response.data
          }
      )
    },
    updateLayerTooltips() {
      try {
        const enable = this.mapToolTipOn && !this.isMobileDevice;
        if (!this.featureIndex || typeof this.featureIndex.forEach !== 'function') return;

        this.featureIndex.forEach((layer) => {
          if (!layer || typeof layer.bindTooltip !== 'function') return;

          // Bersihkan dulu supaya nggak dobel
          if (typeof layer.unbindTooltip === 'function') {
            layer.unbindTooltip();
          }

          if (enable) {
            const props = layer.feature && layer.feature.properties ? layer.feature.properties : {};
            const html = `
          <div style="max-height: 350px; overflow-y: auto; min-width: 300px; overflow-x: auto;">
            ${this.jsonToHtmlTable(props)}
          </div>
        `;
            layer.bindTooltip(html, { permanent: false, sticky: true });
          }
        });
      } catch (e) {
        console.warn('updateLayerTooltips error', e);
      }
    },

    async toggleMapsetVisibility(itemSelected) {
      const id = itemSelected && itemSelected.id;
      if (id == null) return;

      // default: kalau undefined/null, anggap sedang tampil
      const currentlyVisible = (itemSelected.hasGeojson !== false);
      const nextVisible = !currentlyVisible;
      itemSelected.hasGeojson = nextVisible;

      // OFF -> JANGAN hapus cache.
      // Layer hilang karena computed `visibleDatasetGeojsonItems` ngefilter.
      // Index dibersihkan otomatis via layer.on('remove') yang sudah lo pasang.
      if (!nextVisible) {
        this.isApply = true;
        return;
      }

      // ON -> fetch hanya kalau belum pernah di-cache
      const alreadyCached = Array.isArray(this.itemsDatasetGeojson)
          ? this.itemsDatasetGeojson.some(x => x && x.id === id)
          : false;

      if (!alreadyCached) {
        try {
          await this.valueChangedSpaMainGeoJson(itemSelected);
        } catch (e) {
          itemSelected.hasGeojson = false; // rollback
          console.error('toggleMapsetVisibility load error', e);
          this.snackbar = { show: true, color: 'error', text: 'Gagal memuat GeoJSON untuk ditampilkan', timeout: 2000 };
        }
      }

      this.isApply = true;
    },

    deleteAllList(){
      this.itemsMapsetSelected = []
      if (this.markerIconCache && this.markerIconCache.clear) this.markerIconCache.clear();
    },

    async applyPeta(itemsMapsetSelected) {
      this.itemsMapsetSelected = Array.isArray(itemsMapsetSelected) ? itemsMapsetSelected : [];
      this.isApply = true;
      if (this.markerIconCache && this.markerIconCache.clear) this.markerIconCache.clear();

      // Load only missing datasets that are marked visible (hasGeojson !== false)
      const cacheIds = new Set(
        Array.isArray(this.itemsDatasetGeojson)
          ? this.itemsDatasetGeojson.map(x => x && x.id).filter(v => v != null)
          : []
      );

      for (const item of this.itemsMapsetSelected) {
        if (!item || item.id == null) continue;
        if (item.hasGeojson === false) continue; // hidden on map -> no fetch
        if (cacheIds.has(item.id)) continue;     // already cached -> no fetch

        try {
          await this.valueChangedSpaMainGeoJson(item);
          cacheIds.add(item.id);
        } catch (e) {
          console.error('[PetaInteraktif][applyPeta] load error', e);
          this.snackbar = { show: true, color: 'error', text: 'Gagal memuat GeoJSON', timeout: 2000 };
        }
      }
    },

    routeToHome(){
      this.$router.push("/home")
    },

    showDialogPickMapset(){
      this.$refs.refPickMapsetDialog.showDialog(this.itemsMapsetSelected)
      this.isApply = false
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
          const targetZoom = map.getZoom() < 16 ? 16 : map.getZoom();
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
    },

    setSingleMarker(event) {
      if (this.drawToolsOn) return;
      const { lat, lng } = event.latlng;
      this.closeAllLeafletPopups();

      this.singleMarker = { coords: [lat, lng] };
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
      this.reopenSingleMarkerPopup();
    },

    singleMarkerClick() {
      if (this.drawToolsOn) return;
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

    async getFromServerDatasetGeojson({ idDataset, restApiFetch }) {
      try {
        this.snackbar = {
          show: true,
          color: 'warning',
          text: 'Mengambil data GeoJSON dari server... (Harap Sabar Menunggu)',
          timeout: 2000,
        };

        const geoJsonObject = await restApiFetch(idDataset);
        this.snackbar = {
          show: true,
          color: 'primary',
          text: 'Data GeoJSON berhasil dimuat dari server',
          timeout: 1500,
        };

        return geoJsonObject;
      } catch (e) {
        console.error('error', e);
        this.snackbar = {
          show: true,
          color: 'error',
          text: 'Gagal mengambil data GeoJSON dari server',
          timeout: 2500,
        };
        throw e;
      }
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
      if (value.hasGeojson !== true) {
        this.isBulkCleanup = true;

        const index = this.itemsDatasetGeojson.findIndex((item) => item.id === value.id);
        if (index !== -1) this.itemsDatasetGeojson.splice(index, 1);

        this.cleanupByDataset(value.id);
        this.isBulkCleanup = false;

        const lat = this.singleMarker?.coords?.[0];
        const lng = this.singleMarker?.coords?.[1];
        if (this.isMobileDevice && lat != null && lng != null) {
          const cur = this.getFastPropsAtFromFeatureIndex(lat, lng);
          if (!cur) this.openMobilePanel(null, 'Tidak ada Zona', true, this.mobilePanel.expanded);
        }
        return;
      }

      const geojsonResponse = await this.getFromServerDatasetGeojson({
        idDataset: value.id,
        restApiFetch: async (idDataset) => {
          const resp = await FtDatasetService.getFtDatasetByIdPublic(idDataset, true);
          const payload = resp?.data ?? resp;

          const g = (payload && payload.geojson != null) ? payload.geojson : payload;

          if (typeof g === 'string') {
            const s = g.trim();
            if (!s) return { type: 'FeatureCollection', features: [] };
            return JSON.parse(s);
          }

          return g;
        }
      });

      // Proses hasil geojson (tambah ke itemsDatasetGeojson)
      if (geojsonResponse && geojsonResponse.features) {
        // Prevent duplicate entry (optional: replace by id)
        const existIndex = this.itemsDatasetGeojson.findIndex(item => item.id === value.id);
        if (existIndex !== -1) {
          this.itemsDatasetGeojson.splice(existIndex, 1);
        }

        // Keep full GeoJSON di memori, tapi hanya TAMPILKAN fitur dalam radius dari marker
        const centerForRadius = (this.singleMarker?.coords && this.singleMarker.coords.length === 2)
          ? this.singleMarker.coords
          : this.currentMarker.coordinates;

        const toShow = (this.useRadiusFilter && centerForRadius)
          ? this._filterGeoJSONByRadius(geojsonResponse, centerForRadius, this.filterRadiusMeters)
          : geojsonResponse;

        this.itemsDatasetGeojson.push({
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

    lookupImageMediumUrl(item){
      if (item.avatarImage===undefined || item.avatarImage===""){
        return require('@/assets/images/peta-tematik.png')
      }else {
        return FileService.image_url_medium(item.avatarImage)
      }
    },
    lookupImageLazyUrl(item){
      if (item.avatarImage===undefined || item.avatarImage===""){
        return require('@/assets/images/peta-tematik.png')
      }else {
        return FileService.image_url_verylow(item.avatarImage)
      }
    },

  },
  async mounted() {

    this.fetchParent()
    /**
     * Jika mendapatkan parameter yang berisi Array Id Dataset maka
     * ambil nilai array tersebut
     */
    const qIds = this.$route && this.$route.query ? this.$route.query.itemIds : null;
    const qTematikId = this.$route && this.$route.query ? this.$route.query.tematikId : null;

    const mapsetIds = (qIds == null)
      ? []
      : (Array.isArray(qIds) ? qIds.join(',') : String(qIds))
          .split(',')
          .map(s => Number(s))
          .filter(n => Number.isFinite(n));

    if (mapsetIds.length > 0) {
      FtDatasetService.getFtDatasetByIdsPublic(mapsetIds)
        .then((response) => {
          const data = Array.isArray(response.data) ? response.data : [];
          this.itemsMapsetSelected = data;
          this.applyPeta(this.itemsMapsetSelected);
          this.ftTematik = undefined
        })
        .catch((error) => {
          console.error('Gagal mengambil data dataset peta: ', error);
        });
    }


    const mapsetTemaId = (qTematikId != null && Number.isFinite(Number(qTematikId)))
      ? Number(qTematikId)
      : null;

    if (mapsetTemaId != null) {
      FtTematikDatasetService.getAllFtTematikDatasetByFtTematikForDatasetsPublic(mapsetTemaId)
        .then((response) => {
          const {ftTematik, listFtDataset} = response.data ? response.data : [];
          const data = Array.isArray(listFtDataset) ? listFtDataset : [];
          this.itemsMapsetSelected = data.map(d => ({
            ...d,
            hasGeojson: true
          }))
          this.applyPeta(this.itemsMapsetSelected);
          this.ftTematik = ftTematik
        })
        .catch((error) => {
          console.error('Gagal mengambil data dataset peta berdasarkan tema: ', error);
        });
    }




    if(this.$vuetify.display.smAndDown){
      this.showMapsetController = false
    }
    this.currentMarker = this.$store.state.potensi.centerMap
    this.singleMarker = {
      coords: this.currentMarker.coordinates,
    }

    /**
     * Tidak perlu dinyalakan karena dataset peta diambil saat user menagktikna dialog Datase
     */
    // this.fetchDatasetPeta();


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
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
}

/* Card overlay di atas peta */
.map-overlay-card {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10; /* > leaflet controls */
  background: transparent;
}
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
    :deep(.leaflet-bottom.leaflet-right .leaflet-draw) {
      margin-right: 8px !important;
    }



</style>