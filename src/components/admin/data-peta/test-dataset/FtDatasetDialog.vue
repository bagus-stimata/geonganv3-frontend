<template>
  <div>
    <v-dialog
      v-model="dialogShow"
      :max-width="formDialogOptions.width"
      :style="{ zIndex: formDialogOptions.zIndex }"
      @keydown.esc.prevent="closeForm"
      persistent
      fullscreen
      :hide-overlay="$vuetify.display.smAndDown"
    >
      <v-card>
        <v-form v-model="valid" ref="form">
          <v-toolbar class="color-bg-second text-white" density="compact">
            <v-btn icon dark @click="closeForm">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title class="text-subtitle-2 text-red">{{title}}
              <span v-if="formMode === 'EDIT_FORM'" class="text-caption ml-1"><v-icon color="orange" size="small">mdi-pencil</v-icon></span>
              <span v-if="formMode === 'NEW_FORM'" class="text-caption ml-1"><v-icon color="success" size="small">mdi-plus-circle</v-icon></span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn
                  dark
                  variant="text"
                  @click="applyChanges"
                  :disabled="!valid || isItemModified === false"
                  class="hidden-md-and-up"
                  style="text-transform: none;"
              >
                Apply
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>

          <v-card-title>
            <v-container>
              <v-row class="align-center">
                <v-col cols="12" sm="12" md="5">
                  <v-row no-gutters align="end" justify="center" class="ga-4">
                      <v-hover>
                        <template v-slot:default="{ isHovering, props }">
                          <div class="d-flex flex-column">
                            <v-card
                                v-bind="props"
                                class="align-self-end"
                                :elevation="isHovering ? 10 : 1"
                                :class="[{ 'on-hover': isHovering }, isHovering?'card-hover-opacity':'card-not-hover-opacity']"
                            >
                              <v-img
                                  :lazy-src="lookupImageUrlLazy(itemModified)"
                                  :src="lookupImageUrl(itemModified)"
                                  width="270"
                                  height="270"
                                  cover
                              >
                                <v-row
                                    class="fill-height flex-column"
                                    justify="space-between"
                                >
                                  <v-spacer/>
                                  <div class="align-self-center">
                                    <v-btn
                                        :class="{ 'show-btns': isHovering }"
                                        :color="transparent"
                                        icon
                                        size="large"
                                        dark
                                        variant="outlined"
                                        @click="showDialogUpload"
                                    >
                                      <v-icon
                                          :class="{ 'show-btns': isHovering }"
                                          :color="transparent"
                                          size="large"
                                      >
                                        mdi-upload
                                      </v-icon>
                                    </v-btn>
                                  </div>
                                </v-row>
                              </v-img>
                            </v-card>
                            <div class="text-center font-weight-regular text-grey text-caption mt-2">Cover Dataset</div>
                          </div>
                        </template>
                      </v-hover>
                      <v-hover v-if="isMapTypePoint(itemModified.tipePeta)">
                        <template v-slot:default="{ isHovering, props }">
                          <div class="d-flex flex-column">
                            <v-card
                                v-bind="props"
                                class="align-self-end"
                                :elevation="isHovering ? 10 : 1"
                                :class="[{ 'on-hover': isHovering }, isHovering?'card-hover-opacity':'card-not-hover-opacity']"
                            >
                              <v-img
                                  :src="lookupImageMarkerUrl(itemModified.markerImage)"
                                  width="140"
                                  height="140"
                                  cover
                              >
                                <v-row
                                    class="fill-height flex-column"
                                    justify="space-between"
                                >
                                  <v-spacer/>
                                  <div class="align-self-center">
                                    <v-btn
                                        :class="{ 'show-btns': isHovering }"
                                        :color="transparent"
                                        icon
                                        size="large"
                                        dark
                                        variant="outlined"
                                        @click="showDialogUploadMarker1"
                                    >
                                      <v-icon
                                          :class="{ 'show-btns': isHovering }"
                                          :color="transparent"
                                          size="large"
                                      >
                                        mdi-upload
                                      </v-icon>
                                    </v-btn>
                                  </div>
                                </v-row>
                              </v-img>
                            </v-card>
                            <div class="text-center font-weight-regular text-grey text-caption mt-2">Gambar Marker</div>
                          </div>
                        </template>
                      </v-hover>
                    </v-row>
                </v-col>

                <v-col cols="12" sm="12" md="7">
                  <v-row no-gutters>
                    <v-col cols="12" sm="12" md="6">
                      <v-text-field
                        v-model="itemModified.kode1"
                        label="Kode"
                        :rules="rulesNotEmpty"
                        variant="outlined"
                        density="compact"
                        class="mr-2"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="6" class="align-center flex-column">
                      <v-switch
                          v-model="itemModified.statusActive"
                          :label="itemModified.statusActive ? 'Aktif' : 'Non-Aktif'"
                          class="pa-3"
                          density="compact"
                          hide-details
                          color="primary"
                      ></v-switch>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12">
                      <v-text-field
                          v-model="itemModified.description"
                          :rules="rulesNotEmpty"
                          label="Judul Peta"
                          variant="outlined"
                          density="compact"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12">
                      <v-textarea
                          rows="3"
                          auto-grow
                          v-model="itemModified.notes"
                          label="Keterangan"
                          variant="outlined"
                          density="compact"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12" sm="12" md="3">
                      <v-text-field
                        v-model="itemModified.tahun"
                        label="Tahun "
                        variant="outlined"
                        density="compact"
                        class="mr-1"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="9">
                      <v-text-field
                          v-model="itemModified.sumberData"
                          label="Sumber Data"
                          variant="outlined"
                          density="compact"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row no-gutters class="ga-4">
                    <v-col cols="12" sm="12" md="6">
                      <v-autocomplete
                          v-model="itemModified.fdivisionBean"
                          :items="itemsFDivision"
                          :rules="rulesNotEmpty"
                          item-value="id"
                          item-title="description"
                          auto-select-first
                          small-chips
                          deletable-chips
                          color="blue-grey-lighten-2"
                          label="Pemilik Data"
                          persistent-hint
                          variant="outlined"
                          density="compact"
                      ></v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="5">
                      <v-switch
                          v-model="itemModified.showOnHome"
                          label="Tandai Sebagai Konten Popular"
                          density="compact"
                          hide-details
                          color="primary"
                      ></v-switch>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-container>
          </v-card-title>

          <div v-if="isGeoJsonDeleted" class="text-caption text-orange ml-6">Batal untuk membatalkan dan Save and Close untuk menerapkan penghapusan</div>
          <v-card-text class="mt-0" v-if="! isGeoJsonDeleted">
            <!-- Mode: pilih file baru (belum ada geojson tersimpan ATAU user sudah pilih file baru) -->
            <v-row v-if="!hasStoredGeojson || geojsonFileName">
              <v-col cols="12" sm="8" md="8">
                <v-file-input
                    v-model="geojsonFile"
                    label="Pilih File GeoJSON (.geojson) atau Excell (.xlsx)"
                    accept=".geojson,.json,.xlsx,.xls"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-file-upload"
                    @change="onGeojsonFileSelected"
                    hide-details
                ></v-file-input>
                <div class="text-caption mt-2"  v-if="geojsonFileName">
                  File terpilih:
                  <strong>{{ geojsonFileName }}</strong>
                </div>
              </v-col>
              <v-col cols="12" sm="12" md="4">
                <v-autocomplete
                    v-model="itemModified.tipePeta"
                    :items="itemsTipePeta"
                    item-value="id"
                    item-title="description"
                    auto-select-first
                    variant="outlined"
                    density="compact"
                    small-chips
                    deletable-chips
                    color="blue-grey lighten-2"
                    label="Tipe Peta"
                    hide-details
                ></v-autocomplete>
              </v-col>
            </v-row>
            <!-- Mode: sudah ada GeoJSON tersimpan dari backend, tampilkan tombol download & hapus -->
            <v-row v-else>
              <v-col cols="12" sm="4" md="6" class="d-flex align-center">
                <v-btn
                    color="primary"
                    variant="flat"
                    class="mr-2 rounded-lg"
                    @click="downloadInlineGeojson"
                >
                  Download GeoJSON
                </v-btn>
                <v-btn
                    color="error"
                    variant="outlined"
                    class="rounded-lg"
                    @click="hapusGeoJsonRef"
                >
                  Hapus GeoJSON
                </v-btn>
              </v-col>
              <v-col cols="12" sm="12" md="6">
                <v-autocomplete
                    v-model="itemModified.tipePeta"
                    :items="itemsTipePeta"
                    item-value="id"
                    item-title="description"
                    auto-select-first
                    variant="outlined"
                    density="compact"
                    small-chips
                    deletable-chips
                    color="blue-grey lighten-2"
                    label="Tipe Peta"
                    hide-details
                ></v-autocomplete>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-text >
            <v-row>
              <v-col cols="12" sm="12" md="6" v-if="false">
                <v-autocomplete
                    v-model="itemModified.datasetType"
                    :items="itemsDatasetType"
                    :rules="rulesNotEmpty"
                    item-value="code"
                    item-title="description"
                    auto-select-first
                    variant="outlined"
                    density="compact"
                    small-chips
                    deletable-chips
                    color="blue-grey lighten-2"
                    label="Jenis Data Spasial"
                    hide-details
                ></v-autocomplete>
              </v-col>

            </v-row>
          </v-card-text>


          <v-divider></v-divider>

          <v-card-text v-if="false">
            <div class="text-subtitle-2">Metadata Atribut GeoJSON</div>
            <v-table density="compact">
              <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Nama Field</th>
                <th>Tipe (dari sample)</th>
                <th>Alias Tampilan (opsional)</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(row, idx) in propertyMetaRows" :key="row.name">
                <td>{{ idx + 1 }}</td>
                <td>{{ row.name }}</td>
                <td>{{ row.type }}</td>
                <td>
                  <v-text-field
                      v-model="row.alias"
                      density="compact"
                      variant="underlined"
                      hide-details
                      placeholder="Mis. 'Nama Desa', 'Kode Jembatan'"
                  ></v-text-field>
                </td>
              </tr>
              </tbody>
            </v-table>

          </v-card-text>

          <!-- Tabel metadata atribut GeoJSON: nama field, tipe, dan alias tampilan -->
          <v-card-text v-if="propertyMetaRows && propertyMetaRows.length">
            <div class="d-flex align-center mb-1">
              <v-btn
                  small
                  variant="elevated"
                  color="primary"
                  class="rounded-lg font-weight-bold"
                  @click="openPropertyGroupDialog"
                  style="text-transform: none;"
              >
                Kolom Yang ditampilkan pada Peta
              </v-btn>
            </div>
            <div v-if="propertyGroupChips && propertyGroupChips.length" class="mt-4 mb-4">
              <v-chip
                  v-for="col in propertyGroupChips"
                  :key="col"
                  class="ma-1"
                  color="primary"
                  variant="outlined"
                  size="small"
              >
                {{ col }}
              </v-chip>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-text v-if="itemModified.hasGeojson">
            <v-btn-toggle
                v-model="togglePetaDanEditMode"
                rounded="lg"
                divided
                border
                color="primary"
                class="ml-4"
            >
              <v-btn
                  value="LOAD_PETA_GEOJSON"
                  color="green-darken-1"
                  @click="loadTampilanPeta"
                  style="text-transform: none;"
              >
                <span class="d-flex align-center">
                  Load Peta GeoJSON
                  <v-icon class="ml-1">mdi-map</v-icon>
                </span>
              </v-btn>

              <v-btn
                  value="EDIT_DATA_GEOJSON"
                  color="orange-darken-1"
                  @click="loadTableFeatures"
                  style="text-transform: none;"
              >
                <span class="d-flex align-center">
                  Load & Edit Data
                  <v-icon class="ml-1">mdi-pen</v-icon>
                </span>
              </v-btn>
            </v-btn-toggle>
          </v-card-text>



          <v-card-text v-if="togglePetaDanEditMode==='LOAD_PETA_GEOJSON'">
              <PetaPostgis
                  ref="refDatasetMap"
                  class="pl-10"
                  :datasetIds="datasetIds"
              >
              </PetaPostgis>
          </v-card-text>

          <!-- Load & Edit Data -->
          <v-card-text  v-if="togglePetaDanEditMode==='EDIT_DATA_GEOJSON'">
            <FtDatasetDialogFeatures
                ref="refFtDatasetDialogFeatures"
                :ftDataset="itemModified"
                @geoUpdated="setGeoUpdated"
            ></FtDatasetDialogFeatures>

          </v-card-text>


          <v-card-actions class="bg-amber-lighten-4">
            <v-chip
                class="ml-4"
                color="error"
                variant="outlined"
                close
                size="small"
                v-show="formDialogOptions.errorMessage"
            >
              {{ formDialogOptions.errorMessage }}
            </v-chip>
            <v-spacer></v-spacer>
            <v-btn
                color="red-darken-1"
                variant="outlined"
                @click="closeForm"
                :disabled="isItemModified === false"
                class="hidden-sm-and-down"
            >
              Batal
            </v-btn>
            <v-btn
                color="blue-darken-1"
                variant="outlined"
                @click="applyChanges"
                :disabled="(!valid || isItemModified === false) && !isGeoUpdated"
                class="hidden-sm-and-down mr-2"
            >
              Apply
            </v-btn>
            <v-btn
                color="blue-darken-1"
                variant="flat"
                @click="saveAndClose"
                :disabled="(!valid || isItemModified === false) && !isGeoUpdated"
                class="hidden-sm-and-down mr-4"
            >
              Save & Close
            </v-btn>
          </v-card-actions>
        </v-form>

      </v-card>

      <CloseConfirmDialog
        ref="refCloseConfirmDialog"
        @eventFromCloseConfirm="passingEventFromCloseConfirm"
      ></CloseConfirmDialog>

      <UploadImageDialog
        ref="refUploadDialog"
        @eventUploadSuccess="completeUploadSuccess"
      ></UploadImageDialog>


      <v-dialog v-model="dialogLoading" hide-overlay persistent width="300">
        <v-card color="primary" dark>
          <v-card-text>
            Please Wait...
            <v-progress-linear
                indeterminate
                color="white"
                class="mb-0"
            ></v-progress-linear>
          </v-card-text>
        </v-card>

      </v-dialog>

      <UploadMarkerWebp
          ref="refUploadDialogMerker1"
          @eventUploadSuccess="completeUploadSuccessMarker1"
      ></UploadMarkerWebp>

      <v-snackbar v-model="snackbar">
        {{ snackBarMessage }}
        <template v-slot:actions="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar = false"> Close </v-btn>
        </template>
      </v-snackbar>
    </v-dialog>

    <!-- Dialog pilih kolom tampil di peta (propertiesShow) -->
    <v-dialog v-model="dialogPropertyGroupShow" max-width="500">
      <v-card>
        <v-card-title class="text-subtitle-2">
          Kolom Yang ditampilkan pada Peta
        </v-card-title>

        <v-card-text>
          <div class="text-caption mb-2">
            Centang kolom yang ingin ditampilkan pada peta. Default: semua kolom aktif—silakan nonaktifkan yang tidak perlu.
          </div>

          <v-container class="pa-0" fluid>
            <v-card elevation="0" class="property-group-scroll">
              <v-row
                  v-for="(row, index) in propertyMetaRows"
                  :key="row.name"
                  no-gutters
              >
                <v-divider></v-divider>
                <v-col cols="1" class="align-baseline">
                  <div>
                    {{ index + 1 }}
                  </div>
                </v-col>
                <v-col
                    cols="9"
                    class="align-baseline"
                >
                  <div>{{ row.name }}</div>
                </v-col>
                <v-col cols="2">
                  <v-checkbox
                      v-model="localPropertiesShow"
                      :value="row.name"
                      density="compact"
                      hide-details
                  />
                </v-col>
              </v-row>
            </v-card>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialogPropertyGroupShow = false">Batal</v-btn>
          <v-btn color="primary" variant="flat" @click="applyPropertiesShow">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import FtDatasetExtService from "@/services/apiservices/ft-dataset-ext-service";

import CloseConfirmDialog from "@/components/utils/CloseConfirmDialog";
import FormMode from "@/models/form-mode";
import FtDataset from "@/models/ft-dataset";
import FileService from "@/services/apiservices/file-service";
import UploadImageDialog from "@/components/utils/UploadImageDialog";
import {EnumDataSpaTypeList} from "@/models/e-data-spa-type";
import ETipePeta, {ETipePetas} from "@/models/e-tipe-peta";
import * as XLSX from "xlsx";
import PetaPostgis from "@/components/public/peta-tematik/PetaPostgis.vue";
import FtDatasetDialogFeatures from "@/components/admin/data-peta/test-dataset/FtDatasetDialogFeatures.vue";
import UploadMarkerWebp from "@/components/utils/UploadMarkerWebpDialog.vue";

export default {
  components: {
    UploadMarkerWebp,
    FtDatasetDialogFeatures,
    PetaPostgis,
    CloseConfirmDialog,
    UploadImageDialog,
  },
  props: {
    formMode: String,
    itemsFDivision: Array,
    itemsFArea: Array,
  },
  data() {

    return {
      title: "TEST DATASET",
      snackBarMessage: "",
      snackbar: false,

      dialogLoading: false,
      loading: false,

      imageOverlay: false,

      dialogShow: false,
      formDialogOptions: {
        title1: "",
        title2: "",
        message1: "",
        message2: "",
        errorMessage: "",
        color: "grey lighten-3",
        width: 800,
        zIndex: 200,
        noconfirm: false,
      },

      selectedItemIndex: -1,
      itemDefault: "",
      itemModified: new FtDataset(0, "", ""),
      selectFDivision: { id: 0, kode1: "", description: "" },

      valid: false,
      rulesLength: [
        (v) => !!v || " Tidak Boleh Kosong",
        (v) => v.length <= 255 || "Maksimal 255 Karakter",
        (v) => v.length > 1 || "Harus lebih besar dari 1 karakter",
      ],
      rulesNotEmpty: [(v) => !!v || "Tidak boleh kosong"],

      transparent: "rgba(255, 255, 255, 0)",

      geojsonFile: null,
      geojsonFileName: "",

      itemsDatasetType: EnumDataSpaTypeList,
      itemsTipePeta: ETipePetas,

      // Baris-baris metadata atribut GeoJSON (nama field, tipe, alias tampilan)
      propertyMetaRows: [],
      // Dialog pilih kolom grouping (propertiesShow)
      dialogPropertyGroupShow: false,
      localPropertiesShow: [],

      /**
       *  Variable untuk Table
       */
      featureColumns: [],
      featureColumnsView: [],
      featureRows: [],
      maxFeatureTableGeojsonChars: 30 * 1024 * 1024, // ~30 MB (perkiraan dari panjang string)
      maxFeatureTableRows: 8000,
      featureShowOnlyMapColumns: true,
      featureFilterInput: "",
      featureFilterText: "",
      featureItemsPerPage: 15,
      featureCurrentPage: 1,

      featureColWidths: {},
      featureResizeCtx: null,
      togglePetaDanEditMode: null,

// ✅ GeoJSON khusus untuk tabel (full). Map tetap pakai viewport dari server.
      geojsonForTableLocal: null,
      hasGeojsonForTableLocal: false,

      /**
       * Untuk peta Map Postgis cuma buatuh ini
       */
      datasetIds: [],

      isGeoUpdated: false,
      isGeoJsonDeleted: false

    };
  },
  computed: {

    isItemModified() {
      const defaultItem = JSON.stringify(this.itemDefault);
      const modifiedItem = JSON.stringify(this.itemModified);
      return defaultItem !== modifiedItem;
    },

    hasStoredGeojson() {
      // lightweight flag dari backend (misal hasGeojson = featureCount>0)
      const hasFlag = !!(this.itemModified && this.itemModified.hasGeojson);

      const hasLocalSelectedFile =
          typeof this.geojsonFileName === "string" &&
          this.geojsonFileName.trim() !== "";

      // kalau user pilih file baru, balik ke mode pilih file
      return hasFlag && !hasLocalSelectedFile;
    },
    propertyGroupChips() {
      // Ambil propertiesShow tersimpan; jika kosong, fallback ke semua propertyMetaRows
      const groups = this.parsePropertiesShowFromItem(this.itemModified);
      if (groups && groups.length) {
        return groups;
      }
      if (this.propertyMetaRows && this.propertyMetaRows.length) {
        return this.propertyMetaRows.map((r) => r.name);
      }
      return [];
    },

  },

  watch: {
  },

  methods: {
    setGeoUpdated(value){
      if(value.status === 'ok'){
        this.isGeoUpdated = true
      }
    },
    isMapTypePoint(item){
      return item === ETipePeta.POINT
    },


    async refreshFeatureRowsFromGeojson() {
      this.featureRows = [];
      this.featureColumns = [];

      const src = this.geojsonForTableLocal;
      if (!src) return;

      // Guard 1: batasi berdasarkan ukuran string GeoJSON
      if (typeof src === "string") {
        const approxMb = src.length / (1024 * 1024);
        if (approxMb > 10) {
          console.warn("[FtTematikDialog] skip build feature table: geojson string too large (~" + approxMb.toFixed(1) + " MB)");
          this.snackBarMessage = "GeoJSON terlalu besar untuk ditampilkan sebagai tabel.";
          this.snackbar = true;
          return;
        }
      }

      let geoObj;
      try {
        if (typeof this.itemModified.geojson === "string") {
          const trimmed = this.itemModified.geojson.trim();
          if (!trimmed || trimmed === "{}") return;
          geoObj = JSON.parse(trimmed);
        } else {
          geoObj = this.itemModified.geojson;
        }
      } catch (e) {
        console.warn("[FtTematikDialog] gagal parse geojson saat sync dari feature table", e);
        return;
      }

      if (!geoObj || !Array.isArray(geoObj.features) || !geoObj.features.length) return;

      const totalFeatures = geoObj.features.length;
      // Guard 2: batasi jumlah feature yang diizinkan untuk mode edit tabel
      if (this.maxFeatureTableRows && totalFeatures > this.maxFeatureTableRows) {
        console.warn(
          "[FtTematikDialog] skip build feature table: too many features for table view",
          totalFeatures
        );
        this.snackBarMessage =
          "Dataset GeoJSON memiliki " +
          totalFeatures +
          " fitur. Tabel edit dinonaktifkan untuk menjaga performa. " +
          "Silakan filter/pecah data terlebih dahulu jika ingin diedit melalui tabel.";
        this.snackbar = true;
        return;
      }

      // Kolom prefer dari propertyMetaRows biar urutan konsisten
      let cols = [];
      if (this.propertyMetaRows && this.propertyMetaRows.length) {
        cols = this.propertyMetaRows.map((row) => row.name);
      } else {
        const firstProps = geoObj.features[0].properties || {};
        cols = Object.keys(firstProps);
      }

      this.featureColumns = cols;
      this.ensureFeatureColWidthDefaults();

      this.featureRows = geoObj.features.map((f) => {
        const props = (f && f.properties) ? f.properties : {};
        const row = {};
        cols.forEach((name) => {
          const val = props[name];
          row[name] = val === undefined || val === null ? "" : val;
        });
        return row;
      });
    },

    ensureTableGeojsonSyncedFromServer() {
      if (!this.featureRows || !this.featureRows.length) return;
      if (!this.itemModified || !this.itemModified.geojson) return;

      let geo;
      try {
        if (typeof this.itemModified.geojson === "string") {
          const trimmed = this.itemModified.geojson.trim();
          if (!trimmed || trimmed === "{}") return;
          geo = JSON.parse(trimmed);
        } else {
          geo = this.itemModified.geojson;
        }
      } catch (e) {
        console.warn("[FtTematikDialog] gagal parse geojson saat sync dari feature table", e);
        return;
      }

      if (!geo || !Array.isArray(geo.features) || !geo.features.length) return;

      if (geo.features.length !== this.featureRows.length) {
        console.warn(
            "[FtTematikDialog] jumlah features dan featureRows tidak sama, skip sync",
            geo.features.length,
            this.featureRows.length
        );
        return;
      }

      const cols = this.featureColumns || [];

      geo.features.forEach((feat, idx) => {
        const props = (feat && feat.properties) ? feat.properties : {};
        const row = this.featureRows[idx] || {};

        cols.forEach((name) => {
          if (!name) return;
          props[name] = row[name];
        });

        feat.properties = props;
      });

      try {
        this.itemModified.geojson = JSON.stringify(geo);
        this.itemModified.withGeojson = true;
        this.itemModified.hasGeojson = true;
      } catch (e) {
        console.warn("[FtTematikDialog] gagal stringify geojson setelah sync feature table", e);
      }
    },

    showDialogUpload(){
      if (this.itemModified.kode1 !==undefined &&
          this.itemModified.description !==undefined &&
          this.itemModified.fdivisionBean !==undefined){
        if (this.itemModified.id===0){
          this.saveCreateOnly()
        }
        this.$refs.refUploadDialog.showDialog()
      }else{
        this.snackBarMessage = 'Kode, Deskripsi dan Divisi harus diisi dahulu'
        this.snackbar = true
      }
    },
    completeUploadSuccess: function (val){
      if (this.itemModified.avatarImage !==undefined && this.itemModified.avatarImage !== '' ) {
        FileService.deleteImage(this.itemModified.avatarImage).then(
            () => {
            },
            (error) => {
              console.log(error.response)
            }
        )
      }
      if (val.fileName !==""){
        this.$refs.refUploadDialog.closeDialog()
        this.itemModified.avatarImage = val.fileName
        this.saveUpdateOnly()
      }
    },

    async loadTableFeatures(){
      this.togglePetaDanEditMode = "EDIT_DATA_GEOJSON";
      const id = this.itemModified?.id ? Number(this.itemModified.id) : 0;
      if (!id) {
        this.snackBarMessage = "Dataset belum punya ID";
        this.snackbar = true;
        return;
      }
      // 2) update props
      this.datasetIds = [id];
      await this.$nextTick();
    },
    async loadTampilanPeta() {
      try {
        // 1) pastiin komponen peta ter-render
        this.togglePetaDanEditMode = "LOAD_PETA_GEOJSON";

        const id = this.itemModified?.id ? Number(this.itemModified.id) : 0;
        if (!id) {
          this.snackBarMessage = "Dataset belum punya ID";
          this.snackbar = true;
          return;
        }

        // 2) update props
        this.datasetIds = [id];

        // 3) tunggu render
        await this.$nextTick();

      } catch (e) {
        console.error(e);
        this.snackBarMessage = "Gagal menampilkan peta";
        this.snackbar = true;
      }
    },


    refreshPropertyMetaFromItem(item) {
      const rows = [];
      if (!item) {
        this.propertyMetaRows = rows;
        return;
      }

      // Parse daftar nama property (propertyKeys bisa berupa string JSON atau array)
      let keys = [];
      if (Array.isArray(item.propertyKeys)) {
        keys = item.propertyKeys;
      } else if (typeof item.propertyKeys === "string" && item.propertyKeys.trim() !== "") {
        try {
          keys = JSON.parse(item.propertyKeys);
        } catch (e) {
          console.warn("[FtTematikDialog] gagal parse propertyKeys string", e);
        }
      }

      // Parse propertiesMeta (string JSON atau object)
      let meta = item.propertiesMeta;
      if (typeof meta === "string" && meta.trim() !== "") {
        try {
          meta = JSON.parse(meta);
        } catch (e) {
          console.warn("[FtTematikDialog] gagal parse propertiesMeta string", e);
          meta = {};
        }
      } else if (!meta || typeof meta !== "object") {
        meta = {};
      }

      const propertyTypes = meta.propertyTypes || {};
      const aliasMap = meta.alias || {};

      keys.forEach((name) => {
        rows.push({
          name,
          type: (propertyTypes[name] || []).join(" | "),
          alias: aliasMap[name] || "",
        });
      });

      this.propertyMetaRows = rows;
    },
    parsePropertiesShowFromItem(item) {
      if (!item || !item.propertiesShow) return [];

      const raw = item.propertiesShow;

      if (Array.isArray(raw)) return raw;

      if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (!trimmed) return [];
        try {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.warn("[FtTematikDialog] gagal parse propertiesShow", e);
          return [];
        }
      }

      return [];
    },

    stringifyPropertiesShow(groups) {
      try {
        return JSON.stringify(groups || []);
      } catch (e) {
        console.warn("[FtTematikDialog] gagal stringify propertiesShow", e);
        return "[]";
      }
    },

    openPropertyGroupDialog() {
      this.localPropertiesShow = this.parsePropertiesShowFromItem(this.itemModified);
      // Default: semua kolom tampil pada peta
      if ((!this.localPropertiesShow || this.localPropertiesShow.length === 0) && this.propertyMetaRows && this.propertyMetaRows.length) {
        this.localPropertiesShow = this.propertyMetaRows.map((r) => r.name);
      }
      this.dialogPropertyGroupShow = true;
    },

    applyPropertiesShow() {
      const groups = Array.isArray(this.localPropertiesShow)
          ? this.localPropertiesShow.slice()
          : [];

      // Simpan sebagai JSON string biar konsisten dengan propertyKeys/propertiesMeta
      this.itemModified.propertiesShow = this.stringifyPropertiesShow(groups);

      this.dialogPropertyGroupShow = false;
      // this.syncFeatureColumnsView();
    },
    reinitAfterApply() {
      // snapshot ulang biar isItemModified jadi false setelah Apply
      try {
        this.itemDefault = JSON.parse(JSON.stringify(this.itemModified));
      } catch (e) {
        this.itemDefault = Object.assign({}, this.itemModified);
      }

      // reset “mode pilih file” (penting setelah Hapus GeoJSON)
      this.geojsonFile = null;
      this.geojsonFileName = "";

      // reset UI table/filter
      this.featureFilterInput = "";
      this.featureFilterText = "";
      this.featureShowOnlyMapColumns = false;

      // reset resize drag state
      this.featureResizeCtx = null;
      document.body.style.cursor = "";

      // rebuild meta + rows dari itemModified (kayak baru load dialog)
      this.refreshPropertyMetaFromItem(this.itemModified);
      this.refreshFeatureRowsFromGeojson();
      // this.syncFeatureColumnsView();
      this.featureCurrentPage = 1;

      // kalau geojson sudah dihapus, pastikan heavy UI bener-bener drop
      if (!this.itemModified || !this.itemModified.hasGeojson) {
        this.itemModified.geojson = "{}";
        this.itemModified.withGeojson = false;

        this.featureRows = [];
        this.featureColumns = [];
        this.featureColumnsView = [];
      }
    },

    toNumberSafe(val) {
      if (val === null || val === undefined) return null;
      if (typeof val === "number" && Number.isFinite(val)) return val;
      const s = String(val).trim().replace(",", ".");
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    },

    findHeaderKey(headers, candidates) {
      const lower = (headers || []).map((h) => String(h).toLowerCase());

      // exact match
      for (const c of candidates) {
        const idx = lower.indexOf(String(c).toLowerCase());
        if (idx >= 0) return headers[idx];
      }

      // contains match (mis: "koordinat_lat")
      for (const c of candidates) {
        const cc = String(c).toLowerCase();
        const idx = lower.findIndex((h) => h.includes(cc));
        if (idx >= 0) return headers[idx];
      }

      return "";
    },

    async convertExcelToGeojsonText(blob) {
      const buffer = await blob.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });

      const sheetName = wb.SheetNames && wb.SheetNames.length ? wb.SheetNames[0] : null;
      if (!sheetName) throw new Error("Sheet tidak ditemukan di file Excel");

      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });

      if (!rows || !rows.length) {
        throw new Error("Data Excel kosong. Pastikan ada header dan minimal 1 baris data");
      }

      const headers = Object.keys(rows[0] || {}).filter(Boolean);

      // auto-detect lat/lon
      const latKey = this.findHeaderKey(headers, ["lat", "latitude", "y", "y_lat", "ycoord"]);
      const lonKey = this.findHeaderKey(headers, ["lon", "lng", "longitude", "x", "x_lon", "xcoord"]);

      if (!latKey || !lonKey) {
        throw new Error(
            "Kolom Latitude/Longitude tidak ditemukan. Rename kolom jadi lat/lon (atau latitude/longitude) lalu upload ulang."
        );
      }

      const features = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] || {};
        const lat = this.toNumberSafe(row[latKey]);
        const lon = this.toNumberSafe(row[lonKey]);

        // skip invalid
        if (lat === null || lon === null) continue;
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;

        const props = {};
        Object.entries(row).forEach(([k, v]) => {
          if (k === latKey || k === lonKey) return;
          props[k] = v; // keep apa adanya
        });

        features.push({
          type: "Feature",
          properties: props,
          geometry: { type: "Point", coordinates: [lon, lat] },
        });
      }

      if (!features.length) {
        throw new Error("Tidak ada point valid terbentuk dari Excel. Pastikan lat/lon numeric dan dalam range.");
      }

      return JSON.stringify({ type: "FeatureCollection", features });
    },
    async onGeojsonFileSelected() {
      const file = Array.isArray(this.geojsonFile) ? this.geojsonFile[0] : this.geojsonFile;

      if (!file) {
        this.geojsonFile = null;
        this.geojsonFileName = "";
        if (this.itemModified && Object.prototype.hasOwnProperty.call(this.itemModified, "geojson")) {
          this.itemModified.geojson = "{}";
        }
        return;
      }

      if (!(file instanceof Blob)) {
        console.error("File yang dipilih bukan Blob/File:", file);
        this.snackBarMessage = "Format file tidak dikenali browser sebagai File";
        this.snackbar = true;
        return;
      }

      this.geojsonFileName = file.name || "";
      const nameLower = (this.geojsonFileName || "").toLowerCase();

      try {
        let text;

        // ✅ Excel: convert dulu ke GeoJSON
        if (nameLower.endsWith(".xlsx") || nameLower.endsWith(".xls")) {
          text = await this.convertExcelToGeojsonText(file);
        } else {
          // ✅ GeoJSON/JSON: tetap seperti sebelumnya
          text = await file.text();
        }

        const safeText = (text || "").toString();

        if (this.itemModified) {
          this.itemModified.geojson = safeText;
          this.itemModified.fileNameLow = this.geojsonFileName;
          this.itemModified.withGeojson = true;

          // Belum tersimpan di server; hasGeojson akan diset oleh backend
          this.itemModified.hasGeojson = false;

          // tetap tidak refreshPropertyMetaFromItem / refreshFeatureRowsFromGeojson di sini (sesuai logic kamu)
        }
      } catch (err) {
        console.error(err);
        this.snackBarMessage = "Gagal membaca/konversi file (GeoJSON/Excel)";
        this.snackbar = true;
      }
    },



    showDialog(selectedIndex, item) {
      this.dialogShow = !this.dialogShow;
      if (selectedIndex > -1) {
        this.selectedIndex = selectedIndex;
        this.initializeEditMode(item);

      } else {
          this.itemDefault = new FtDataset(0, "", "");
          this.itemModified = new FtDataset(0, "", "");
          this.itemModified.fileType = "geojson-gzip";
          this.selectedIndex = -1;
          this.itemModified.propertiesShow = "[]"
          this.propertyMetaRows = []

          this.featureColumns = [];
          this.featureRows = [];
      }
      this.isGeoJsonDeleted =false
    },
    setDialogState(value) {
      this.dialogShow = value;
    },
    buildPayload() {
      this.ensureTableGeojsonSyncedFromServer();
      // Deep clone supaya nggak ngacak reactive object
      const payload = JSON.parse(JSON.stringify(this.itemModified || {}));

      // Pastikan datasetType dikirim sebagai string enum simpel
      if (payload && typeof payload.datasetType === "object" && payload.datasetType !== null) {
        payload.datasetType =
          payload.datasetType.strCode ||
          payload.datasetType.code ||
          payload.datasetType.name ||
          "GEOJSON";
      }

      // Bersihkan field tanggal & audit yang seharusnya di-maintain backend
      if (payload && typeof payload.trDate === "object") {
        // biarkan backend yang mengisi default trDate kalau perlu
        delete payload.trDate;
      }
      delete payload.created;
      delete payload.modified;
      delete payload.modifiedBy;

      // Semantik GeoJSON:
      // - Jika withGeojson === true → kirim geojson apa adanya (backend yang putuskan clear/update)
      // - Jika withGeojson falsy/undefined → jangan kirim field geojson supaya backend pakai geojson existing.
      if (!payload.withGeojson) {
        // User tidak mengubah geojson di form → jangan kirim ke backend
        delete payload.geojson;
      } else {
        // User eksplisit mengubah atau menghapus geojson
        if (payload.geojson == null) {
          // anggap sebagai clear request
          payload.geojson = "{}";
        } else if (typeof payload.geojson !== "string") {
          payload.geojson = String(payload.geojson);
        }
      }

      // Sinkronkan alias dari tabel metadata ke propertiesMeta (JSON)
      this.syncAliasToPropertiesMeta(payload);

      return payload;
    },
    syncAliasToPropertiesMeta(payload) {
      if (!this.propertyMetaRows || !this.propertyMetaRows.length) {
        return;
      }

      // Ambil meta mentah dari itemModified atau dari payload
      let rawMeta = (this.itemModified && this.itemModified.propertiesMeta) || payload.propertiesMeta;
      let meta;

      if (typeof rawMeta === "string" && rawMeta.trim() !== "") {
        try {
          meta = JSON.parse(rawMeta);
        } catch (e) {
          console.warn("[FtTematikDialog] gagal parse propertiesMeta saat sync alias", e);
          meta = {};
        }
      } else if (rawMeta && typeof rawMeta === "object") {
        meta = rawMeta;
      } else {
        meta = {};
      }

      if (!meta.alias) {
        meta.alias = {};
      }

      this.propertyMetaRows.forEach((row) => {
        const key = row.name;
        const alias = (row.alias || "").trim();

        if (alias) {
          meta.alias[key] = alias;
        } else if (meta.alias[key]) {
          // Jika alias dikosongkan di UI, hapus dari meta
          delete meta.alias[key];
        }
      });

      // Pastikan payload.propertiesMeta dikirim sebagai string JSON
      payload.propertiesMeta = JSON.stringify(meta);
    },

    async applyChanges() {
      try {
        if (this.$refs.form && typeof this.$refs.form.validate === "function") {
          const ok = await this.$refs.form.validate();
          if (ok === false) return;
        }
        if (!this.valid) return;

        // kalau user edit table, sync balik ke geojson sebelum save
        this.ensureTableGeojsonSyncedFromServer();

        this.dialogLoading = true;

        if (this.formMode === "NEW_FORM" || !this.itemModified || !this.itemModified.id) {
          await this.saveCreateOnly();
        } else {
          await this.saveUpdateOnly();
        }
        await this.reloadLightDatasetById(); //
        // IMPORTANT: reset state like freshly opened dialog, but do NOT close
        this.reinitAfterApply();

        this.snackBarMessage = "Tersimpan (Apply)";
        this.snackbar = true;
        this.isGeoUpdated = false;
      } catch (e) {
        console.error(e);
        this.snackBarMessage = "Gagal Apply";
        this.snackbar = true;
      } finally {
        this.dialogLoading = false;
      }
    },

    async saveAndClose() {
      await this.applyChanges();
      if (this.isItemModified === false) {
        this.closeForm();
      }
    },

    saveCreateOnly() {
      const payload = this.buildPayload();
      return new Promise((resolve, reject) => {
        FtDatasetExtService.createFtDataset(payload).then(
            (response) => {
              this.$emit("update:formMode", FormMode.EDIT_FORM);
              if (response?.data?.id) this.itemModified.id = response.data.id;
              resolve(response);
            },
            (error) => {
              this.formDialogOptions.errorMessage =
                  error.response?.data?.message || "Gagal create FtDataset";
              reject(error);
            }
        );
      });
    },

    saveUpdateOnly() {
      const payload = this.buildPayload();
      let includeGeojson = !!payload.withGeojson;
      if (this.isGeoUpdated===true){
        includeGeojson = true
      }


      return new Promise((resolve, reject) => {
        FtDatasetExtService.updateFtDataset(payload, includeGeojson).then(
            (resp) => resolve(resp),
            (error) => {
              this.formDialogOptions.errorMessage =
                  error.response?.data?.message || "Gagal update FtDataset";
              reject(error);
            }
        );
      });
    },

    closeForm() {
      if (!this.isItemModified) {
        this.dialogShow = false;
        this.$emit("eventFromFormDialog1", this.itemModified);
      } else {
        this.$refs.refCloseConfirmDialog.showDialog(
          " Sudah terdapat modifikasi data",
          "Tetap tutup dan reset perubahan?"
        );
      }
      this.$emit('fetchDataset')
    },
    passingEventFromCloseConfirm(value) {
      if (value === "OKE") this.dialogShow = false;
    },
    initializeEditMode(item) {
      this.formDialogOptions.errorMessage = "";

      // Saat edit, ambil data TANPA geojson dulu (ringan)
      FtDatasetExtService.getFtDatasetById(item.id, false).then(
          (response) => {
            // Ambil data ringan dari server
            this.itemModified = response.data || {};

            // console.log(JSON.stringify(this.itemModified));

            // Normalisasi datasetType: pastikan selalu string (enum code)
            if (
                this.itemModified &&
                this.itemModified.datasetType &&
                typeof this.itemModified.datasetType === "object"
            ) {
              this.itemModified.datasetType =
                  this.itemModified.datasetType.strCode ||
                  this.itemModified.datasetType.code ||
                  this.itemModified.datasetType.name ||
                  "GEOJSON";
            }

            // Normalisasi trDate: backend kadang kirim {} → jangan dikirim balik apa adanya
            if (
                this.itemModified &&
                this.itemModified.trDate &&
                typeof this.itemModified.trDate === "object"
            ) {
              // biarkan kosong; backend boleh isi default sendiri kalau null/absen
              delete this.itemModified.trDate;
            }

            // Normalisasi nilai default agar computed & UI stabil
            if (
                this.itemModified.geojson === undefined ||
                this.itemModified.geojson === null
            ) {
              this.itemModified.geojson = "{}";
            }
            if (
                this.itemModified.hasGeojson === undefined ||
                this.itemModified.hasGeojson === null
            ) {
              this.itemModified.hasGeojson =
                  (this.itemModified.featureCount || 0) > 0;
            }

            // Refresh tabel metadata atribut berdasarkan data awal
            this.refreshPropertyMetaFromItem(this.itemModified);

            this.featureColumns = [];
            this.featureRows = [];

            // Snapshot default setelah normalisasi untuk tracking modified
            this.itemDefault = JSON.parse(JSON.stringify(this.itemModified));

            try {
              if (this.$refs.refDatasetMap) {
                // this.$refs.refDatasetMap.resetTampilanPeta();
                this.$refs.refDatasetMap.geojsonData = []
              }
            } catch (e) {
              console.warn("resetTampilanPeta failed:", e);
            }
          },

          (error) => {
            console.log(error);
          }
      );
    },
    lookupFDivision(fdivisionBean) {
      const str = this.itemsFDivision.filter((x) => x.id === fdivisionBean);
      if (str.length > 0) {
        return str[0];
      } else {
        return "-";
      }
    },

    lookupImageUrl(item) {
      if (item.avatarImage === undefined || item.avatarImage === "") {
        return require('@/assets/images/no_image_available.jpeg')
      } else {
        return FileService.image_url_medium(item.avatarImage);
      }
    },
    lookupImageUrlLazy(item) {
      if (item.avatarImage === undefined || item.avatarImage === "") {
        return require('@/assets/images/no_image_available.jpeg')
      } else {
        return FileService.image_url_verylow(item.avatarImage);
      }
    },
    lookupImageMarkerUrl(markerImage) {
      if (markerImage === undefined || markerImage === "") {
        return require('@/assets/images/no_image_available.jpeg')
      } else {
        // console.log(FileService.file_url(markerImage))
        return FileService.image_url_ori(markerImage);
      }
    },
    showDialogUploadMarker1() {
      if (
        this.itemModified.kode1 !== "" &&
        this.itemModified.description !== "" &&
        this.itemModified.fdivisionBean !== 0 &&
        this.itemModified.tipePeta !== 0
      ) {
        if (this.itemModified.id === 0) {
          // this.$emit('eventSaveItemWithoutClose', false)
          this.saveCreateOnly();
        }
        this.$refs.refUploadDialogMerker1.showDialog();
      } else {
        this.snackBarMessage =
          "Kode, Deskripsi, Divisi dan Jenis Peta harus diisi dahulu";
        this.snackbar = true;
      }
    },

    completeUploadSuccessMarker1: function (val) {
      console.log(val);

      if (
          this.itemModified.markerImage !== undefined &&
          this.itemModified.markerImage !== ""
      ) {
        FileService.deleteFile(this.itemModified.markerImage).then(
            () => {
              // console.log(response.data);
            },
            (error) => {
              console.log(error.response);
            }
        );
      }

      if (val.fileName !== "") {
        this.$refs.refUploadDialogMerker1.closeDialog();
        this.itemModified.markerImage = val.fileName;
        this.saveUpdateOnly();
      }
    },

    async downloadInlineGeojson() {
      /**
       * Gunakan  inline download GeoJSON ini hanya kalau dataset sudah
       */
      const resp = await FtDatasetExtService.getFtDatasetById(this.itemModified.id, true);
      const respGeo = resp && resp.data ? resp.data.geojson : null;


      // 1) Kalau belum ada geojson sama sekali
      if (!respGeo) {
        console.warn('[FtTematikDialog] downloadInlineGeojson: geojson is null/undefined');
        this.$root.$emit('show-snackbar', 'GeoJSON belum dimuat / tidak tersedia');
        return;
      }

      let geoString;

      // 2) Jika dari backend berupa STRING (kasus paling umum)
      if (typeof respGeo === 'string') {
        const trimmed = respGeo.trim();
        if (trimmed === '' || trimmed === '{}') {
          console.warn('[FtTematikDialog] downloadInlineGeojson: geojson string kosong / {}');
          this.$root.$emit('show-snackbar', 'GeoJSON belum dimuat / tidak tersedia');
          return;
        }
        geoString = trimmed;
      } else {
        // 3) Kalau somehow sudah berupa OBJECT (misal sudah di-parse di tempat lain)
        try {
          geoString = JSON.stringify(respGeo, null, 2);
        } catch (e) {
          console.error('[FtTematikDialog] downloadInlineGeojson: gagal stringify geojson object', e);
          this.$root.$emit('show-snackbar', 'Gagal memproses GeoJSON untuk diunduh');
          return;
        }
      }

      // 4) Trigger download file .geojson
      try {
        const blob = new Blob([geoString], { type: 'application/geo+json' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = (this.itemModified.kode1 || 'dataset') + '.geojson';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
        console.log('[FtTematikDialog] downloadInlineGeojson.after, file triggered');
      } catch (e) {
        console.error('[FtTematikDialog] downloadInlineGeojson: error creating download blob', e);
        this.$root.$emit('show-snackbar', 'Gagal membuat file GeoJSON untuk diunduh');
      }

    },

    hapusGeoJsonRef(){
      this.isGeoJsonDeleted = true
      this.clearStoredGeojson()
    },
    clearStoredGeojson() {
      if (this.itemModified) {
        // Mark clear
        this.itemModified.geojson = "{}";
        this.itemModified.withGeojson = true;
        this.itemModified.hasGeojson = false;

        // Reset lightweight meta biar UI nggak terasa masih ada data
        this.itemModified.featureCount = 0;
        this.itemModified.propertyKeys = "[]";
        this.itemModified.propertiesMeta = "{}";
        if (typeof this.itemModified.fileNameLow !== "undefined") {
          this.itemModified.fileNameLow = "";
        }
      }

      // clear mode file
      this.geojsonFile = null;
      this.geojsonFileName = "";

      // drop all heavy UI
      this.featureColumns = [];
      this.featureColumnsView = [];
      this.featureRows = [];
      this.featureFilterInput = "";
      this.featureFilterText = "";
      this.featureShowOnlyMapColumns = false;

      this.featureColWidths = {};
      this.featureResizeCtx = null;
      document.body.style.cursor = "";

      try {
        if (this.$refs.refDatasetMap) {
          // this.$refs.refDatasetMap.resetTampilanPeta();
          this.$refs.refDatasetMap.geojsonData = []
        }
      } catch (e) {
        console.error(e);
      }
    },
    async reloadLightDatasetById() {
      if (!this.itemModified?.id) return;

      const resp = await FtDatasetExtService.getFtDatasetById(this.itemModified.id, false);
      const incoming = resp?.data;
      if (!incoming) return;

      this.itemModified = incoming;

      // normalize
      if (this.itemModified.datasetType && typeof this.itemModified.datasetType === "object") {
        this.itemModified.datasetType =
            this.itemModified.datasetType.strCode ||
            this.itemModified.datasetType.code ||
            this.itemModified.datasetType.name ||
            "GEOJSON";
      }

      // keep geojson unloaded (light)
      this.itemModified.geojson = "{}";
      this.itemModified.withGeojson = false;
      if (this.itemModified.hasGeojson == null) {
        this.itemModified.hasGeojson = (this.itemModified.featureCount || 0) > 0;
      }

      this.refreshPropertyMetaFromItem(this.itemModified);

      // drop heavy parts
      this.featureColumns = [];
      this.featureColumnsView = [];
      this.featureRows = [];
      this.featureFilterInput = "";
      this.featureFilterText = "";
      this.featureShowOnlyMapColumns = false;
      this.featureColWidths = {};
      this.featureResizeCtx = null;

      this.itemDefault = JSON.parse(JSON.stringify(this.itemModified));

      try {
        // this.$refs.refDatasetMap?.resetTampilanPeta();
        this.$refs.refDatasetMap.geojsonData = []
      } catch (e) {
        console.warn(e);
      }
    },
  },

  beforeUnmount() {
    document.body.style.cursor = "";
    document.removeEventListener("mousemove", this.onResizeFeatureColMove);
    document.removeEventListener("mouseup", this.onResizeFeatureColUp);
  },

};
</script>

<style scoped>

.show-btns {
  color: blue !important;
  opacity: 1;
}
</style>
<style scoped>
.property-group-scroll {
  max-height: 340px;
  overflow-y: auto;
}
.feature-table-scroll {
  max-height: 360px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
}

.feature-attr-table {
  table-layout: fixed;
  width: 100%;
}

.feature-attr-table th,
.feature-attr-table td {
  vertical-align: top;
}

.feature-attr-table .col-idx {
  width: 40px;
  min-width: 40px;
  text-align: center;
  white-space: nowrap;
}

.feature-attr-table .resizable-th {
  position: relative;
  padding-right: 10px; /* ruang handle */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feature-attr-table .th-wrap {
  display: flex;
  align-items: center;
}

.feature-attr-table .th-text {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feature-attr-table .col-resizer {
  flex: 0 0 auto;
  width: 10px;
  height: 26px;
  margin-left: 2px;
  cursor: col-resize;
  user-select: none;
  position: relative;
}

.feature-attr-table .col-resizer::after {
  content: "";
  position: absolute;
  left: 4px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(0, 0, 0, 0.22);
}

/* biar drag nggak kebaca sebagai text selection */
.feature-attr-table * {
  -webkit-user-select: none;
  user-select: none;
}

/* tapi input tetap bisa select text */
.feature-attr-table .v-field__input,
.feature-attr-table input {
  -webkit-user-select: text;
  user-select: text;
}
</style>
