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
            <v-toolbar-title class="text-subtitle-2">{{title}}
              <span class="ml-2 mr-2 font-weight-medium text-grey"> | </span>
              <span v-if="formMode === 'EDIT_FORM'">EDIT </span>
              <span class="font-weight-light ml-1 mr-1">ITEM</span>
              <span v-if="formMode === 'NEW_FORM'"> BARU</span>
              <span class="ml-2 mr-2 font-weight-medium text-grey" v-show="isItemModified">|</span>
              <v-chip
                  class="ma-2"
                  color="warning"
                  variant="outlined"
                  size="x-small"
                  v-show="isItemModified"
              >
                <v-icon left> mdi-pencil </v-icon>
                modified
              </v-chip>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn
                  dark
                  variant="text"
                  @click="applyChanges"
                  :disabled="!valid || isItemModified === false"
                  class="hidden-md-and-up"
              >
                Apply
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>

          <v-card-title>
            <v-container class="pa-4">
              <v-row>
                <v-container class="pa-4 text-center">
                  <v-row align="center" justify="center">
                    <v-hover>
                      <template v-slot:default="{ isHovering, props }">
                        <v-card
                            v-bind="props"
                            class="align-self-center"
                            :elevation="isHovering ? 10 : 1"
                            :class="[{ 'on-hover': isHovering }, isHovering?'card-hover-opacity':'card-not-hover-opacity']"
                        >
                          <v-img
                              :lazy-src="lookupImageUrlLazy(itemModified)"
                              :src="lookupImageUrl(itemModified)"
                              width="220"
                              height="220"
                              cover

                          >
                            <v-card-title class="text-h6 fill-height">
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

                            </v-card-title>
                          </v-img>
                        </v-card>
                      </template>
                    </v-hover>
                  </v-row>
                </v-container>

                <v-col cols="12" md="12" sm="6">
                  <v-row>
                    <v-col cols="12" sm="6" md="3">
                      <v-text-field
                        v-model="itemModified.kode1"
                        label="Kode"
                        :rules="rulesNotEmpty"
                        variant="outlined"
                        density="compact"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="9">
                      <v-text-field
                        v-model="itemModified.description"
                        :rules="rulesNotEmpty"
                        label="Nama PETA "
                        variant="outlined"
                        density="compact"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="4" md="3">
                      <v-text-field
                        v-model="itemModified.tahun"
                        label="Tahun "
                        variant="outlined"
                        density="compact"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="8" md="8" v-if="true">
                      <v-text-field
                          v-model="itemModified.sumberData"
                          label="Catatan/Sumber Data"
                          variant="outlined"
                          density="compact"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="6" md="3">
                      <v-switch
                          v-model="itemModified.statusActive"
                          :label="itemModified.statusActive ? 'Aktif' : 'Non-Aktif'"
                          class="pa-3"
                          density="compact"
                          hide-details
                          color="primary"
                      ></v-switch>
                    </v-col>
                    <v-col cols="12" sm="6" md="5" v-if="false">
                      <v-switch
                          v-model="itemModified.showToPublic"
                          :label="itemModified.showToPublic? 'Tampilkan pada Halaman Public': 'Jangan Tampilkan pada Halaman Public'"
                          class="pa-3"
                          density="compact"
                          hide-details
                          color="primary"
                      ></v-switch>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-switch
                          v-model="itemModified.showToMap"
                          :label="itemModified.showToMap? 'Tampilkan Pada Peta Beranda': 'Jangan Tampilkan Pada Peta Beranda'"
                          class="pa-3"
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

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="4">
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
                    hint="Pemilik Data"
                    persistent-hint
                    single-line
                    variant="outlined"
                    density="compact"
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12" sm="6" md="4">
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
                      hint="Jenis Data Spasial (GEOJSON, POSTGIS, CSV POINT, RASTER)"
                      persistent-hint
                      single-line
                      hide-details
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12" sm="6" md="4" v-if="false">
                  <v-autocomplete
                      v-model="itemModified.fareaBean"
                      :items="itemsFArea"
                      :rules="rulesNotEmpty"
                      item-value="id"
                      item-title="description"
                      auto-select-first
                      small-chips
                      deletable-chips
                      color="blue-grey-lighten-2"
                      label="Kecamatan"
                      hint="Kecamatan"
                      persistent-hint
                      single-line
                      variant="outlined"
                      density="compact"
                  ></v-autocomplete>
                </v-col>
              </v-row>


            </v-container>
          </v-card-text>

          <v-card-text>
            <v-container>
              <!-- Mode: pilih file baru (belum ada geojson tersimpan ATAU user sudah pilih file baru) -->
              <v-row v-if="!hasStoredGeojson || geojsonFileName">
                <v-col cols="12" sm="8" md="6">
                  <v-file-input
                    v-model="geojsonFile"
                    label="Pilih File GeoJSON (.geojson)"
                    accept=".geojson,.json"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-file-upload"
                    @change="onGeojsonFileSelected"
                    hide-details
                  ></v-file-input>
                </v-col>
                <v-col cols="12" sm="4" md="6" v-if="geojsonFileName">
                  <div class="text-caption mt-2">
                    File terpilih:
                    <strong>{{ geojsonFileName }}</strong>
                  </div>
                </v-col>
              </v-row>
              <!-- Mode: sudah ada GeoJSON tersimpan dari backend, tampilkan tombol download & hapus -->
              <v-row v-else>
                <v-col cols="12" sm="4" md="6" class="d-flex align-center">
                  <v-btn
                      v-if="!hasGeojsonLoaded"
                      color="blue-darken-1"
                      variant="outlined"
                      class="mr-2 rounded-lg"
                      @click="loadGeojsonFromServer"
                  >
                    Load GeoJSON
                  </v-btn>
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
                      @click="clearStoredGeojson"
                  >
                    Hapus GeoJSON
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-text v-if="hasGeojsonForPreview">
            <v-btn color="primary" @click="cekTampilanPeta" class="mb-2 rounded-lg" variant="flat">Cek Tampilan pada Peta</v-btn>
            <FDayaDukungPetaMap
                ref="refFDayaDukungPetaMap">
            </FDayaDukungPetaMap>
          </v-card-text>

          <!-- Tabel metadata atribut GeoJSON: nama field, tipe, dan alias tampilan -->
          <v-card-text v-if="propertyMetaRows && propertyMetaRows.length">
            <div class="align-center mb-2">
              <v-btn
                  v-if="propertyMetaRows && propertyMetaRows.length"
                  small
                  variant="elevated"
                  color="primary"
                  class="rounded-lg font-weight-bold"
                  @click="openPropertyGroupDialog"
                  style="text-transform: none;"
              >
                Atur Kolom Grouping
              </v-btn>
            </div>
            <div v-if="itemModified.propertyGroups" class="mt-1 mb-4">
              <v-chip
                  v-for="col in parsePropertyGroupsFromItem(itemModified)"
                  :key="col"
                  class="ma-1"
                  color="primary"
                  variant="outlined"
                  size="small"
              >
                {{ col }}
              </v-chip>
            </div>
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

          <!-- Tabel data per feature (editable seperti QGIS attribute table) -->
          <v-card-text v-if="featureRows && featureRows.length">
            <div class="text-subtitle-2 mb-1">Data Per Feature</div>
            <div class="text-caption mb-2">
              Tabel ini menampilkan nilai properti tiap feature dari GeoJSON yang sudah dimuat dan bisa diedit.
            </div>

            <v-table density="compact">
              <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th v-for="col in featureColumns" :key="col">{{ col }}</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(row, idx) in featureRows" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td v-for="col in featureColumns" :key="col">
                  <v-text-field
                      v-model="row[col]"
                      variant="underlined"
                      density="compact"
                      hide-details
                  ></v-text-field>
                </td>
              </tr>
              </tbody>
            </v-table>
          </v-card-text>

          <v-card-actions>
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
                class="hidden-sm-and-down"
            >
              Batal
            </v-btn>
            <v-btn
                color="blue-darken-1"
                variant="outlined"
                @click="applyChanges"
                :disabled="!valid || isItemModified === false"
                class="hidden-sm-and-down mr-2"
            >
              Apply
            </v-btn>
            <v-btn
                color="blue-darken-1"
                variant="flat"
                @click="saveAndClose"
                :disabled="!valid || isItemModified === false"
                class="hidden-sm-and-down"
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

      <UploadImageOriDialog
          ref="refUploadDialogMerker1"
          :parent-id="itemModified.id || 0"
          @eventUploadSuccess="completeUploadSuccessMarker1"
      >
      </UploadImageOriDialog>

      <v-snackbar v-model="snackbar">
        {{ snackBarMessage }}
        <template v-slot:actions="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar = false"> Close </v-btn>
        </template>
      </v-snackbar>
    </v-dialog>

    <!-- Dialog pilih kolom grouping (propertyGroups) -->
    <v-dialog v-model="dialogPropertyGroupShow" max-width="500">
      <v-card>
        <v-card-title class="text-subtitle-2">
          Pilih Kolom Grouping
        </v-card-title>

        <v-card-text>
          <div class="text-caption mb-2">
            Pilih kolom yang akan dijadikan acuan grouping / kategori utama (mis. Nama Desa, Kecamatan, dsb).
          </div>

          <v-container class="pa-0" fluid>
            <div class="property-group-scroll">
              <v-row>
                <v-col
                    v-for="row in propertyMetaRows"
                    :key="row.name"
                    cols="12"
                >
                  <v-checkbox
                      v-model="localPropertyGroups"
                      :label="row.name"
                      :value="row.name"
                      density="compact"
                      hide-details
                  />
                </v-col>
              </v-row>
            </div>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialogPropertyGroupShow = false">Batal</v-btn>
          <v-btn color="primary" variant="flat" @click="applyPropertyGroups">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import FtDatasetService from "@/services/apiservices/ft-dataset-service";

import CloseConfirmDialog from "@/components/utils/CloseConfirmDialog";
import FormMode from "@/models/form-mode";
import FtDataset from "@/models/ft-dataset";
import FileService from "@/services/apiservices/file-service";
import UploadImageDialog from "@/components/utils/UploadImageDialog";
import FDayaDukungPetaMap from "@/components/admin/data-peta/daya-dukung-peta/FDayaDukungPetaMap.vue";
import UploadImageOriDialog from "@/components/utils/UploadImageOriDialog.vue";
import {EnumDataSpaTypeList} from "@/models/e-data-spa-type";

export default {
  components: {
    UploadImageOriDialog,
    FDayaDukungPetaMap,
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
      title: "Dataset Peta",
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

      // Baris-baris metadata atribut GeoJSON (nama field, tipe, alias tampilan)
      propertyMetaRows: [],
      // Dialog pilih kolom grouping (propertyGroups)
      dialogPropertyGroupShow: false,
      localPropertyGroups: [],
      featureColumns: [],
      featureRows: [],

    };
  },
  computed: {
    isItemModified() {
      const defaultItem = JSON.stringify(this.itemDefault);
      const modifiedItem = JSON.stringify(this.itemModified);
      return defaultItem !== modifiedItem;
    },

    hasGeojsonForPreview() {
      const hasGeojsonContent =
          this.itemModified &&
          typeof this.itemModified.geojson === "string" &&
          this.itemModified.geojson.trim() !== "" &&
          this.itemModified.geojson.trim() !== "{}";

      const hasLocalSelectedFile =
          typeof this.geojsonFileName === "string" &&
          this.geojsonFileName.trim() !== "";

      // Preview cuma kalau ada GeoJSON beneran di memory (dari server atau file lokal)
      return hasGeojsonContent || hasLocalSelectedFile;
    },
    hasGeojsonLoaded() {
      return (
          this.itemModified &&
          typeof this.itemModified.geojson === "string" &&
          this.itemModified.geojson.trim() !== "" &&
          this.itemModified.geojson.trim() !== "{}"
      );
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
  },

  watch: {
  },

  methods: {
    refreshFeatureRowsFromGeojson() {
      this.featureRows = [];
      this.featureColumns = [];

      if (!this.itemModified || !this.itemModified.geojson) {
        return;
      }

      let geo;
      try {
        if (typeof this.itemModified.geojson === "string") {
          const trimmed = this.itemModified.geojson.trim();
          if (!trimmed || trimmed === "{}") {
            return;
          }
          geo = JSON.parse(trimmed);
        } else {
          geo = this.itemModified.geojson;
        }
      } catch (e) {
        console.warn("[FtDatasetDialog] gagal parse geojson untuk feature table", e);
        return;
      }

      if (!geo || !Array.isArray(geo.features) || !geo.features.length) {
        return;
      }

      // Kolom prefer dari propertyMetaRows biar urutan konsisten
      let cols = [];
      if (this.propertyMetaRows && this.propertyMetaRows.length) {
        cols = this.propertyMetaRows.map((row) => row.name);
      } else {
        const firstProps = geo.features[0].properties || {};
        cols = Object.keys(firstProps);
      }

      this.featureColumns = cols;

      this.featureRows = geo.features.map((f) => {
        const props = (f && f.properties) ? f.properties : {};
        const row = {};
        cols.forEach((name) => {
          const val = props[name];
          row[name] = val === undefined || val === null ? "" : val;
        });
        return row;
      });
    },

    ensureGeojsonSyncedFromTable() {
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
        console.warn("[FtDatasetDialog] gagal parse geojson saat sync dari feature table", e);
        return;
      }

      if (!geo || !Array.isArray(geo.features) || !geo.features.length) return;

      if (geo.features.length !== this.featureRows.length) {
        console.warn(
            "[FtDatasetDialog] jumlah features dan featureRows tidak sama, skip sync",
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
        console.warn("[FtDatasetDialog] gagal stringify geojson setelah sync feature table", e);
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

    async cekTampilanPeta(){
      if (!this.itemModified || !this.itemModified.id) {
        this.snackBarMessage = "Simpan dulu dataset sebelum cek tampilan peta";
        this.snackbar = true;
        return;
      }
      try {
        await this.ensureGeojsonLoaded();
        this.$refs.refFDayaDukungPetaMap.tampilkanPeta(this.itemModified);
      } catch (e) {
        console.error(e);
        this.snackBarMessage = "Gagal menampilkan peta";
        this.snackbar = true;
      }
    },
    async ensureGeojsonLoaded() {
      // Kalau dataset sudah ditandai punya GeoJSON di server tetapi konten belum dimuat,
      // baru panggil backend untuk load GeoJSON berat.
      if (this.hasStoredGeojson && !this.hasGeojsonLoaded) {
        await this.loadGeojsonFromServer();
      }
    },

    async loadGeojsonFromServer() {
      if (!this.itemModified || !this.itemModified.id) return;

      try {
        this.dialogLoading = true;

        // Wajib includeGeojson=true supaya backend mengirim field geojson
        const resp = await FtDatasetService.getFtDatasetById(this.itemModified.id, true);
        const incoming = resp && resp.data ? resp.data : null;

        if (!incoming) {
          this.snackBarMessage = "Gagal memuat data dari server";
          this.snackbar = true;
          return;
        }

        // Sinkronkan metadata ringan
        if (typeof incoming.hasGeojson !== "undefined") {
          this.itemModified.hasGeojson = !!incoming.hasGeojson;
        }
        if (typeof incoming.featureCount !== "undefined") {
          this.itemModified.featureCount = incoming.featureCount;
        }
        if (typeof incoming.propertyKeys !== "undefined") {
          this.itemModified.propertyKeys = incoming.propertyKeys;
        }
        if (typeof incoming.propertiesMeta !== "undefined") {
          this.itemModified.propertiesMeta = incoming.propertiesMeta;
        }
        if (typeof incoming.fileNameLow !== "undefined") {
          this.itemModified.fileNameLow = incoming.fileNameLow;
        }

        // Backend bisa kirim geojson sebagai String ATAU sebagai object/JsonNode.
        // Di sini kita normalisasi ke String supaya konsisten di frontend.
        let incomingGeo = incoming.geojson;
        let hasGeoContent = false;

        if (typeof incomingGeo === "string") {
          const trimmed = incomingGeo.trim();
          hasGeoContent = trimmed !== "" && trimmed !== "{}";
          if (hasGeoContent) {
            this.itemModified.geojson = incomingGeo;
          }
        } else if (incomingGeo != null) {
          try {
            const asString = JSON.stringify(incomingGeo);
            const trimmed = asString.trim();
            hasGeoContent = trimmed !== "" && trimmed !== "{}";
            if (hasGeoContent) {
              this.itemModified.geojson = asString;
            }
          } catch (e) {
            console.error("Gagal stringify incoming.geojson", e);
          }
        }

        // Jika ternyata field hasGeojson belum diset oleh backend,
        // turunkan dari konten yang berhasil kita baca atau dari featureCount.
        if (this.itemModified.hasGeojson === undefined || this.itemModified.hasGeojson === null) {
          this.itemModified.hasGeojson = hasGeoContent || (this.itemModified.featureCount || 0) > 0;
        }

        if (hasGeoContent) {
          // Load hanya untuk preview/download; jangan otomatis anggap akan di-save ulang
          this.itemModified.withGeojson = false;
        } else {
          this.snackBarMessage =
            "Server tidak mengirim GeoJSON (pastikan includeGeojson=true dan field geojson tidak di-strip).";
          this.snackbar = true;
        }
      } catch (e) {
        console.error(e);
        this.snackBarMessage = "Gagal memuat GeoJSON dari server";
        this.snackbar = true;
      } finally {
        this.dialogLoading = false;
      }

      // Setelah berhasil load dari server, refresh tabel metadata atribut
      this.refreshPropertyMetaFromItem(this.itemModified);
      this.refreshFeatureRowsFromGeojson();
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
          console.warn("[FtDatasetDialog] gagal parse propertyKeys string", e);
        }
      }

      // Parse propertiesMeta (string JSON atau object)
      let meta = item.propertiesMeta;
      if (typeof meta === "string" && meta.trim() !== "") {
        try {
          meta = JSON.parse(meta);
        } catch (e) {
          console.warn("[FtDatasetDialog] gagal parse propertiesMeta string", e);
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
    parsePropertyGroupsFromItem(item) {
      if (!item || !item.propertyGroups) return [];

      const raw = item.propertyGroups;

      if (Array.isArray(raw)) return raw;

      if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (!trimmed) return [];
        try {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.warn("[FtDatasetDialog] gagal parse propertyGroups", e);
          return [];
        }
      }

      return [];
    },

    stringifyPropertyGroups(groups) {
      try {
        return JSON.stringify(groups || []);
      } catch (e) {
        console.warn("[FtDatasetDialog] gagal stringify propertyGroups", e);
        return "[]";
      }
    },

    openPropertyGroupDialog() {
      this.localPropertyGroups = this.parsePropertyGroupsFromItem(this.itemModified);
      this.dialogPropertyGroupShow = true;
    },

    applyPropertyGroups() {
      const groups = Array.isArray(this.localPropertyGroups)
          ? this.localPropertyGroups.slice()
          : [];

      // Simpan sebagai JSON string biar konsisten dengan propertyKeys/propertiesMeta
      this.itemModified.propertyGroups = this.stringifyPropertyGroups(groups);

      this.dialogPropertyGroupShow = false;
    },
    onGeojsonFileSelected() {
      const file = Array.isArray(this.geojsonFile) ? this.geojsonFile[0] : this.geojsonFile;

      if (!file) {
        this.geojsonFile = null;
        this.geojsonFileName = "";
        if (this.itemModified && Object.prototype.hasOwnProperty.call(this.itemModified, "geojson")) {
          this.itemModified.geojson = "{}";
        }
        return;
      }

      // Pastikan objek yang dibaca adalah File/Blob
      if (!(file instanceof Blob)) {
        console.error("File yang dipilih bukan Blob/File:", file);
        this.snackBarMessage = "Format file tidak dikenali browser sebagai File";
        this.snackbar = true;
        return;
      }

      this.geojsonFileName = file.name || "";

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target && e.target.result ? e.target.result : "";
          const text = typeof result === "string" ? result : result.toString();

          if (this.itemModified) {
            this.itemModified.geojson = text;
            this.itemModified.fileNameLow = this.geojsonFileName;
            this.itemModified.withGeojson = true;
            // Belum tersimpan di server; hasGeojson akan diset oleh backend
            this.itemModified.hasGeojson = false;

            this.refreshPropertyMetaFromItem(this.itemModified);
            this.refreshFeatureRowsFromGeojson();
          }
        } catch (err) {
          console.error(err);
          this.snackBarMessage = "Gagal membaca file GeoJSON";
          this.snackbar = true;
        }
      };
      reader.onerror = () => {
        this.snackBarMessage = "Gagal membaca file GeoJSON";
        this.snackbar = true;
      };
      reader.readAsText(file);
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
          this.itemModified.propertyGroups = "[]"

          this.featureColumns = [];
          this.featureRows = [];
      }
    },
    setDialogState(value) {
      this.dialogShow = value;
    },
    buildPayload() {
      this.ensureGeojsonSyncedFromTable();
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
          console.warn("[FtDatasetDialog] gagal parse propertiesMeta saat sync alias", e);
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
    applyChanges() {
      if (this.isItemModified === false) {
        return;
      }
      if (this.$refs.form.validate()) {
        const payload = this.buildPayload();
        if (this.formMode === FormMode.EDIT_FORM) {
          const includeGeojson = !!payload.withGeojson;
          FtDatasetService.updateFtDataset(payload, includeGeojson).then(
              () => {
                console.log("=== masuk update dataset (applyChanges) ===");
                // Deep clone so computed isItemModified resets
                this.itemDefault = JSON.parse(JSON.stringify(this.itemModified));
                this.$emit("eventFromFormDialogEdit", this.itemModified);
              },
              (error) => {
                this.formDialogOptions.errorMessage =
                    error.response?.data?.message || "Gagal update FtDataset";
              }
          );
        } else {
          console.log("=== masuk create dataset (applyChanges) ===");
          FtDatasetService.createFtDataset(payload).then(
              (response) => {
                this.itemModified = response.data;
                this.itemDefault = JSON.parse(JSON.stringify(this.itemModified));
                this.$emit("eventFromFormDialogNew", response.data);
                this.$emit("update:formMode", FormMode.EDIT_FORM);
              },
              (error) => {
                this.formDialogOptions.errorMessage =
                    error.response?.data?.message || "Gagal create FtDataset";
              }
          );
        }
      }
    },

    saveAndClose() {
      if (this.isItemModified === false) {
        this.dialogShow = false;
        this.$emit("eventFromFormDialog1", this.itemModified);
        return;
      }
      if (this.$refs.form.validate()) {
        const payload = this.buildPayload();
        if (this.formMode === FormMode.EDIT_FORM) {
          const includeGeojson = !!payload.withGeojson;
          FtDatasetService.updateFtDataset(payload, includeGeojson).then(
              () => {
                this.itemDefault = JSON.parse(JSON.stringify(this.itemModified));
                this.$emit("eventFromFormDialogEdit", this.itemModified);
                this.dialogShow = false;
                this.$emit("eventFromFormDialog1", this.itemModified);
              },
              (error) => {
                this.formDialogOptions.errorMessage =
                    error.response?.data?.message || "Gagal update FtDataset";
              }
          );
        } else {
          FtDatasetService.createFtDataset(payload).then(
              (response) => {
                this.itemModified = response.data;
                this.itemDefault = JSON.parse(JSON.stringify(this.itemModified));
                this.$emit("eventFromFormDialogNew", response.data);
                this.dialogShow = false;
                this.$emit("eventFromFormDialog1", this.itemModified);
              },
              (error) => {
                this.formDialogOptions.errorMessage =
                    error.response?.data?.message || "Gagal create FtDataset";
              }
          );
        }
      }
    },

    saveCreateOnly() {
      const payload = this.buildPayload();
      FtDatasetService.createFtDataset(payload).then(
          (response) => {
            console.log("=== masuk saveCreateOnly ===");
            // dipaksa Save dan Update Dahulu
            this.$emit("update:formMode", FormMode.EDIT_FORM);
            this.itemModified.id = response.data.id;
          },
          (error) => {
            this.formDialogOptions.errorMessage =
                error.response?.data?.message || "Gagal create FtDataset";
          }
      );
    },

    saveUpdateOnly() {
      const payload = this.buildPayload();
      FtDatasetService.updateFtDataset(payload).then(
          () => {
            console.log("=== masuk saveUpdateOnly ===");
          },
          (error) => {
            this.formDialogOptions.errorMessage =
                error.response?.data?.message || "Gagal update FtDataset";
          }
      );
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
    },
    passingEventFromCloseConfirm(value) {
      if (value === "OKE") this.dialogShow = false;
    },
    initializeEditMode(item) {
      this.formDialogOptions.errorMessage = "";

      // Saat edit, ambil data TANPA geojson dulu (ringan)
      FtDatasetService.getFtDatasetById(item.id, false).then(
          (response) => {
            // Ambil data ringan dari server
            this.itemModified = response.data || {};

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
              if (this.$refs.refFDayaDukungPetaMap) {
                this.$refs.refFDayaDukungPetaMap.resetTampilanPeta();
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
    lookupFArea(fareaBean) {
      const str = this.itemsFArea.filter((x) => x.id === fareaBean);
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
        this.itemModified.datasetType !== ""
      ) {
        if (this.itemModified.id === 0) {
          // this.$emit('eventSaveItemWithoutClose', false)
          this.saveCreateOnly();
        }
        this.$refs.refUploadDialogMerker1.showDialog();
      } else {
        this.snackBarMessage =
          "Kode, Deskripsi, Divisi dan Jenis Data Spasial harus diisi dahulu";
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
            (response) => {
              console.log(response.data);
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
      const resp = await FtDatasetService.getFtDatasetById(this.itemModified.id, true);
      this.itemModified = resp && resp.data ? resp.data : null;

      if (!this.itemModified) {
        this.$root.$emit('show-snackbar', 'Data FtDataset belum dimuat');
        return;
      }

      const geo = this.itemModified.geojson;

      // 1) Kalau belum ada geojson sama sekali
      if (!geo) {
        console.warn('[FtDatasetDialog] downloadInlineGeojson: geojson is null/undefined');
        this.$root.$emit('show-snackbar', 'GeoJSON belum dimuat / tidak tersedia');
        return;
      }

      let geoString;

      // 2) Jika dari backend berupa STRING (kasus paling umum)
      if (typeof geo === 'string') {
        const trimmed = geo.trim();
        if (trimmed === '' || trimmed === '{}') {
          console.warn('[FtDatasetDialog] downloadInlineGeojson: geojson string kosong / {}');
          this.$root.$emit('show-snackbar', 'GeoJSON belum dimuat / tidak tersedia');
          return;
        }
        geoString = trimmed;
      } else {
        // 3) Kalau somehow sudah berupa OBJECT (misal sudah di-parse di tempat lain)
        try {
          geoString = JSON.stringify(geo, null, 2);
        } catch (e) {
          console.error('[FtDatasetDialog] downloadInlineGeojson: gagal stringify geojson object', e);
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
        console.log('[FtDatasetDialog] downloadInlineGeojson.after, file triggered');
      } catch (e) {
        console.error('[FtDatasetDialog] downloadInlineGeojson: error creating download blob', e);
        this.$root.$emit('show-snackbar', 'Gagal membuat file GeoJSON untuk diunduh');
      }
    },

    clearStoredGeojson() {
      if (this.itemModified) {
        this.itemModified.geojson = "{}";
        this.itemModified.withGeojson = true;
        this.itemModified.hasGeojson = false;
      }
      this.geojsonFile = null;
      this.geojsonFileName = "";

      this.featureColumns = [];
      this.featureRows = [];

      try {
        if (this.$refs.refFDayaDukungPetaMap) {
          this.$refs.refFDayaDukungPetaMap.resetTampilanPeta();
        }
      } catch (e) {
        console.error(e);
      }
    },

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
</style>