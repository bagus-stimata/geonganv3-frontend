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
                  @click="save"
                  :disabled="!valid || isItemModified === false"
                  class="hidden-md-and-up"
              >
                Simpan
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>

          <v-card-title>
            <v-container class="pa-4">
              <v-row>
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
                variant="flat"
                @click="save"
                :disabled="!valid || isItemModified === false"
                class="hidden-sm-and-down"
            >
              Simpan
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

      itemsDatasetType: EnumDataSpaTypeList

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
    async cekTampilanPeta(){
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
            this.itemModified.hasGeojson = true;

            // Setelah geojson tersedia, render peta untuk cek tampilan
            this.$nextTick(() => {
              try {
                this.cekTampilanPeta();
              } catch (mapErr) {
                console.error("Gagal menampilkan peta:", mapErr);
              }
            });
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


    completeUploadSuccess: function (val) {
      if (
        this.itemModified.avatarImage !== undefined &&
        this.itemModified.avatarImage !== ""
      ) {
        FileService.deleteImage(this.itemModified.avatarImage).then(
          () => {
            console.log(`Delete Image ${this.itemModified.avatarImage}`);
          },
          (error) => {
            console.log(error.response);
          }
        );
      }

      if (val.fileName !== "") {
        this.$refs.refUploadDialog.closeDialog();
        this.itemModified.avatarImage = val.fileName;
        this.saveUpdateOnly();
      }
    },

    showDialog(selectedIndex, item) {
      this.dialogShow = !this.dialogShow;
      if (selectedIndex > -1) {
        this.selectedIndex = selectedIndex;
        this.initializeEditMode(item);

      } else {
        (this.itemDefault = new FtDataset(0, "", "")),
          (this.itemModified = new FtDataset(0, "", "")),
          this.itemModified.fileType = "geojson-gzip",
          (this.selectedIndex = -1)
      }
    },
    setDialogState(value) {
      this.dialogShow = value;
    },
    buildPayload() {
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

      return payload;
    },
    save() {
      if (this.isItemModified === false) {
        //Close aja
        this.dialogShow = false;
        this.$emit("eventFromFormDialog1", this.itemModified);
        return;
      }
      if (this.$refs.form.validate()) {
        const payload = this.buildPayload();

        if (this.formMode === FormMode.EDIT_FORM) {
          FtDatasetService.updateFtDataset(payload).then(
              () => {
                console.log("=== masuk update dataset ===");

                this.$emit("eventFromFormDialogEdit", this.itemModified);
              },
              (error) => {
                this.formDialogOptions.errorMessage =
                    error.response?.data?.message || "Gagal update FtDataset";
              }
          );
        } else {
          console.log("=== masuk create dataset ===");

          FtDatasetService.createFtDataset(payload).then(
              (response) => {
                this.$emit("eventFromFormDialogNew", response.data);
                console.log("oke masuk");
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
.card-hover-opacity {
  opacity: 0.4;
}
.card-not-hover-opacity {
  opacity: 1;
  transition: opacity 0.4s ease-in-out;
}

.show-btns {
  color: blue !important;
  opacity: 1;
}
</style>