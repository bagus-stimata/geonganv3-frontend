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
                <v-col cols="12" sm="8" md="6">
                  <div class="text-caption mt-2">
                    GeoJSON sudah tersimpan pada dataset.
                  </div>
                </v-col>
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

      geojsonFile: [],
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

      const hasFileNameLow =
        this.itemModified &&
        typeof this.itemModified.fileNameLow === "string" &&
        this.itemModified.fileNameLow.trim() !== "";

      const hasLocalSelectedFile =
        typeof this.geojsonFileName === "string" &&
        this.geojsonFileName.trim() !== "";

      return hasGeojsonContent || hasFileNameLow || hasLocalSelectedFile;
    },
    hasStoredGeojson() {
      // GeoJSON tersimpan di dataset (bukan hanya file baru yang dipilih)
      const hasGeojsonContent =
        this.itemModified &&
        typeof this.itemModified.geojson === "string" &&
        this.itemModified.geojson.trim() !== "" &&
        this.itemModified.geojson.trim() !== "{}";

      // Jika user sudah memilih file baru (geojsonFileName), kita anggap mode "pilih file"
      const hasLocalSelectedFile =
        typeof this.geojsonFileName === "string" &&
        this.geojsonFileName.trim() !== "";

      return hasGeojsonContent && !hasLocalSelectedFile;
    },
  },
  watch: {
  },

  methods: {
    cekTampilanPeta(){
      // this.$refs.refFDayaDukungPetaMap.tampilkanPeta(this.itemModified);
      this.$refs.refFDayaDukungPetaMap.tampilkanPeta(this.itemModified);
    },

    onGeojsonFileSelected() {
      const files = this.geojsonFile;
      const file = Array.isArray(files) ? files[0] : files;

      if (!file) {
        this.geojsonFile = [];
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
    save() {
      if (this.isItemModified === false) {
        //Close aja
        this.dialogShow = false;
        this.$emit("eventFromFormDialog1", this.itemModified);
        return;
      }
      if (this.$refs.form.validate()) {
        if (this.formMode === FormMode.EDIT_FORM) {
          FtDatasetService.updateFtDataset(this.itemModified).then(
            () => {
              // console.log(response.data)
              this.$emit("eventFromFormDialogEdit", this.itemModified);
            },
            (error) => {
              // console.log(error);
              this.formDialogOptions.errorMessage = error.response.data.message;
            }
          );
        } else {
          console.log(JSON.stringify(this.itemModified))
          FtDatasetService.createFtDataset(this.itemModified).then(
            (response) => {
              this.$emit("eventFromFormDialogNew", response.data);
              console.log('oke masuk');
            },
            (error) => {
              this.formDialogOptions.errorMessage = error.response.data.message;
            }
          );
        }
      }
    },
    saveCreateOnly() {
      FtDatasetService.createFtDataset(this.itemModified).then(
        (response) => {
          /**
           * dipaksa Save dan Update Dahulu
           */
          // this.initializeEditMode(response.data)
          this.$emit("update:formMode", FormMode.EDIT_FORM);
          this.itemModified.id = response.data.id;
        },
        (error) => {
          this.formDialogOptions.errorMessage = error.response.data.message;
        }
      );
    },
    saveUpdateOnly() {
      FtDatasetService.updateFtDataset(this.itemModified).then(
        () => {},
        (error) => {
          // console.log(error);
          this.formDialogOptions.errorMessage = error.response.data.message;
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

      FtDatasetService.getFtDatasetById(item.id).then(
        (response) => {
          // console.log(response.data)
          this.itemDefault = Object.assign({}, response.data);
          this.itemModified = response.data;
          try{
            this.$refs.refFDayaDukungPetaMap.resetTampilanPeta ()
          }catch (e) {
            e.toString()
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

    downloadFileImage(url){
      const link = document.createElement('a');
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    downloadInlineGeojson() {
      try {
        if (
          !this.itemModified ||
          typeof this.itemModified.geojson !== "string" ||
          this.itemModified.geojson.trim() === "" ||
          this.itemModified.geojson.trim() === "{}"
        ) {
          this.snackBarMessage = "Tidak ada GeoJSON tersimpan untuk di-download";
          this.snackbar = true;
          return;
        }

        const content = this.itemModified.geojson;
        const baseName =
          (this.itemModified.fileNameLow &&
            this.itemModified.fileNameLow.replace(/\.geojson(\.gz)?$/i, "")) ||
          this.itemModified.kode1 ||
          "dataset-geojson";

        const blob = new Blob([content], { type: "application/geo+json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${baseName}.geojson`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (e) {
        console.error(e);
        this.snackBarMessage = "Gagal membuat file GeoJSON untuk di-download";
        this.snackbar = true;
      }
    },

    clearStoredGeojson() {
      if (this.itemModified) {
        this.itemModified.geojson = "{}";
        this.itemModified.withGeojson = false;
      }
      this.geojsonFile = [];
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