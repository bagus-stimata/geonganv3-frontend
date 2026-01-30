<template>
  <div class="map-wrapper">
    <PetaPostgis
      ref="refPetaPostgis"
      :min-height="`100vh`"
      :height="`100vh`"
      :dataset-ids="visibleDatasetGeojsonIds"
      :items-mapset-selected="itemsMapsetSelected"
      :draw-enabled="drawToolsOn"
      :is-visible-full-screen-button="false"
      :uploaded-geojson="uploadedGeojson"
      :uploaded-geojson-visible="uploadedGeojsonVisible"
      :mapToolTipOn="mapToolTipOn"
      :keywordHighlight="keywordHighlight"
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
        <v-expand-transition v-show="showMapsetController === true && itemsMapsetSelected.length > 0">
          <v-text-field
              v-model="searchText"
              @keyup.enter="searchAndHighlight(searchText)"
              @blur="searchAndHighlight(searchText)"
              append-inner-icon="mdi-magnify"
              density="compact"
              label="Cari peta tampil"
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
          <v-btn v-if="false" @click="showUploadGeojsonDialog" density="comfortable" block variant="elevated" class="mx-1 mt-2 text-subtitle-2 font-weight-bold" color="blue-darken-1">Upload Peta</v-btn>
        </v-card-text>
      </v-expand-transition>
    </v-card>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color? snackbar.color : 'info'"
      :timeout="snackbar.timeout? snackbar.timeout : 1500"
      location="bottom">
        <span class="snackbar-center">{{ snackbar.text }}</span>
    </v-snackbar>
    <PickMapsetDialog @applyPeta="applyPeta" ref="refPickMapsetDialog"></PickMapsetDialog>
    <DownloadFormDialog :itemsFDivision="itemsFDivision" @showDialogDownloadChoice="showDialogDownloadChoice" ref="refDownloadFormDialog"></DownloadFormDialog>
    <DownloadChoiceDialog :itemsFDivision="itemsFDivision" @downloadGeojsonZip="downloadGeojsonZip" ref="refDownloadChoiceDialog"></DownloadChoiceDialog>
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
import {Icon} from 'leaflet';
import 'leaflet-fullscreen';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import zonaMapper from '@/helpers/zona-color-mapper';

import RBush from 'rbush'
import * as turf from '@turf/turf'
import PickMapsetDialog from "@/components/public/peta-interaktif/PickMapsetDialog.vue";
import FtDatasetService from "@/services/apiservices/ft-dataset-service";
import FtTematikDatasetService from "@/services/apiservices/ft-tematik-dataset-service";
import FileService from "@/services/apiservices/file-service";
import DownloadFormDialog from "@/components/public/peta-interaktif/DownloadFormDialog.vue";
import FDivisionService from "@/services/apiservices/f-division-service";
import UploadGeojsonDialog from "@/components/public/peta-interaktif/UploadGeojsonDialog.vue";
import PetaPostgis from "@/components/public/peta-tematik/PetaPostgis.vue";
import DownloadChoiceDialog from "@/components/public/peta-interaktif/DownloadChoiceDialog.vue";

delete Icon.Default.prototype.Default;
Icon.Default.mergeOptions({
  iconRetinaUrl: require("@/assets/images/my-marker.webp"),
  iconUrl: require("@/assets/images/my-marker.webp"),
  shadowUrl: require("@/assets/images/my-marker.webp"),
});

export default {
  name: "PetaInteraktif",
  components: {
    DownloadChoiceDialog,
    PetaPostgis,
    UploadGeojsonDialog,
    DownloadFormDialog,
    PickMapsetDialog,

  },
  data()  {
    return {
      drawToolsOn: false,
      markerIconCache: new Map(),
      ftTematik: undefined,
      loadingSync:false,
      mapToolTipOn: false,
      keywordHighlight: '',

      isApply: false,
      itemsMapsetSelected:[],
      showMapsetController:true,
      snackbar: {
        show: false,
        text: "",
        color: "info",
        timeout: 1500,
      },
      mobilePanel: {
        gone: false,     // sticky bar hilang
        visible: false,     // sticky bar terlihat (collapsed)
        expanded: false,    // expanded (sheet tinggi)
        title: '',          // judul singkat
        props: null,        // object feature.properties
      },
      singleMarker: {
        coords: this.$store.state.potensi.centerMap.coordinates,
      },
      currentMarker: {
        id: 0,
        coordinates: this.$store.state.potensi.centerMap.coordinates,
      },
      itemsDatasetGeojson: [],
      uploadedGeojson: null,
      uploadedGeojsonVisible: true,


      colorMap: {},
      itemsFDivision : [],
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

    };
  },
  computed: {
    visibleDatasetGeojsonIds() {
      const selected = Array.isArray(this.itemsMapsetSelected) ? this.itemsMapsetSelected : [];
      return selected
          .filter(x => x && x.id != null && x.hasGeojson !== false)
          .map(x => x.id);
    },
    isMobileDevice() {
      const sm = this.winWidth <= 600;
      const md = this.winWidth <= 960;
      const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
      return (this.hasTouch || coarse) && (sm || md);
    },
  },
  methods: {
    fetchParent(){
      FDivisionService.getAllFDivisionPublic().then(
          (response) => {
            this.itemsFDivision = response.data
          }
      )
    },
    //DRAW
    toggleDrawTools() {
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

    //UPLOAD GEOJSON
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

    //DOWNLOAD GEOJSON
    showDialogDownloadGeojson(){
      const ids = Array.isArray(this.itemsMapsetSelected)
          ? this.itemsMapsetSelected.map(x => x && x.id).filter(v => Number.isFinite(v))
          : [];
      if (ids.length === 0) {
        this.snackbar = {
          show: true,
          color: "warning",
          text: "Belum ada dataset-old yang dipilih",
          timeout: 1500,
        };
        return;
      }
      this.$refs.refDownloadFormDialog.showDialog(this.itemsMapsetSelected)
    },
    showDialogDownloadChoice(){
      const ids = Array.isArray(this.itemsMapsetSelected)
          ? this.itemsMapsetSelected.map(x => x && x.id).filter(v => Number.isFinite(v))
          : [];
      if (ids.length === 0) {
        this.snackbar = {
          show: true,
          color: "warning",
          text: "Belum ada dataset-old yang dipilih",
          timeout: 1500,
        };
        return;
      }
      this.$refs.refDownloadChoiceDialog.showDialog(this.itemsMapsetSelected)
    },
    downloadOrFilledFormGeojson() {
      // Pastikan ada dataset-old yang dipilih dulu
      const ids = Array.isArray(this.itemsMapsetSelected)
          ? this.itemsMapsetSelected.map(x => x && x.id).filter(v => Number.isFinite(v))
          : [];
      if (ids.length === 0) {
        this.snackbar = {
          show: true,
          color: "warning",
          text: "Belum ada dataset-old yang dipilih",
          timeout: 1500,
        };
        return;
      }
      const raw = localStorage.getItem("currentDownloader");
      let currentDownloader = null;
      console.log(currentDownloader)

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

      this.showDialogDownloadChoice()
    },
    downloadGeojsonZip(choice) {
      const ids = Array.isArray(this.itemsMapsetSelected)
          ? this.itemsMapsetSelected.map(x => x && x.id).filter(v => Number.isFinite(v))
          : [];
      if (ids.length === 0) {
        this.snackbar = {
          show: true,
          color: "warning",
          text: "Belum ada dataset-old yang dipilih",
          timeout: 1500,
        };
        return;
      }

      this.loadingSync = true
      if(choice === 'FULLY GEOJSON'){
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
      } else if(choice === 'POINT TO EXCEL'){
        FtDatasetService.exportMultipleFtDatasetZipMixed(ids)
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
      }


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
    showDialogPickMapset(){
      this.$refs.refPickMapsetDialog.showDialog(this.itemsMapsetSelected)
      this.isApply = false
    },

    //SEARCH
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
      if (!term) return;
      this.keywordHighlight = term
      // const q = String(term || '').toLowerCase().trim();
      // if (!q) {
      //   this._clearHighlights();
      //   return;
      // }
      // const matches = this.textIndex
      //     .filter(x => x.text.includes(q))
      //     .map(x => this.featureIndex.get(x.layerId))
      //     .filter(Boolean);
      //
      // if (matches.length === 0) {
      //   this.snackbar = {
      //     show: true,
      //     color: 'warning',
      //     text: `Tidak ditemukan: ${term}`,
      //     timeout: 1500
      //   };
      //   this._clearHighlights();
      //   return;
      // }
      //
      // this._clearHighlights();
      // const bounds = L.latLngBounds();
      //
      // for (const lyr of matches) {
      //   const id = L.stamp(lyr);
      //
      //   // 1) Highlight untuk layer yang mendukung setStyle (Polygon/Line/CircleMarker)
      //   if (typeof lyr.setStyle === 'function') {
      //     this._highlightStyle(lyr);
      //     this.highlighted.add(id);
      //   }
      //   // 2) Highlight untuk marker (Point) dengan icon DOM
      //   else if (typeof lyr.getLatLng === 'function' && lyr._icon) {
      //     lyr._icon.classList.add('marker-highlighted');
      //     this.highlighted.add(id);
      //   }
      //
      //   // 3) Kumpulkan bounds:
      //   //    - Polygon/Line → pakai getBounds()
      //   //    - Point (Marker / CircleMarker) → pakai getLatLng()
      //   if (typeof lyr.getBounds === 'function') {
      //     const b = lyr.getBounds();
      //     if (b && b.isValid && b.isValid()) {
      //       bounds.extend(b);
      //     }
      //   } else if (typeof lyr.getLatLng === 'function') {
      //     const p = lyr.getLatLng();
      //     if (p) bounds.extend(p);
      //   }
      // }
      //
      // const map = this.$refs.map?.leafletObject || this.$refs.map?.mapObject;
      // if (map && bounds.isValid && bounds.isValid()) {
      //   if (matches.length === 1) {
      //     // Kalau cuma 1 hasil, fokus ke titik / area itu
      //     const center = bounds.getCenter();
      //     const targetZoom = map.getZoom() < 16 ? 16 : map.getZoom();
      //     map.setView(center, targetZoom, { animate: true });
      //   } else {
      //     // Kalau banyak hasil, fit semua
      //     map.fitBounds(bounds.pad(0.1), { animate: true });
      //   }
      // }

      this.showSearchMenu = false;
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

      // 3) Lepas mapping dataset-old
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
          console.error('Gagal mengambil data dataset-old peta: ', error);
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
          console.error('Gagal mengambil data dataset-old peta berdasarkan tema: ', error);
        });
    }
    if(this.$vuetify.display.smAndDown){
      this.showMapsetController = false
    }
    this.currentMarker = this.$store.state.potensi.centerMap
    this.singleMarker = {
      coords: this.currentMarker.coordinates,
    }

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