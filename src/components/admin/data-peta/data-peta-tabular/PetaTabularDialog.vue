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
                        label="Nama PETA Daya Dukung "
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
                          v-model="itemModified.notes"
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

                  </v-row>

                  <v-row class="grey lighten-4 mt-n4">
                    <v-col cols="12" sm="12" md="12"  class="d-flex">
                      <v-text-field
                          v-model="itemModified.lat"
                          label="Latitude"
                          outlined
                          dense
                          type="number"
                      ></v-text-field>
                      <v-text-field
                          v-model="itemModified.lon"
                          label="Longitude"
                          outlined
                          dense
                          type="number"
                          class="ml-1"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row no-gutters class="mt-n4">
                    <v-col cols="12">
                      <PetaTabularMarker
                          ref="refMonPaketMarker"
                          :singleMarker="computedCurrentMarker"
                          @updateSingleMarker="updateSingleMarker"
                      ></PetaTabularMarker>
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
                      v-model="itemModified.fdayaDukungTypeBean"
                      :items="itemsFDayaDukungType"
                      :rules="rulesNotEmpty"
                      item-value="id"
                      item-title="description"
                      auto-select-first
                      variant="outlined"
                      density="compact"
                      small-chips
                      deletable-chips
                      color="blue-grey lighten-2"
                      label="Jenis Peta"
                      hint="Jenis Peta"
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

      <UploadSpasialDialog
          ref="refUploadSpasial"
          @eventUploadSuccess="completeUploadSuccessSpasial"
      ></UploadSpasialDialog>
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
import FDayaDukungService from "@/services/apiservices/f-dayadukung-service";

import CloseConfirmDialog from "@/components/utils/CloseConfirmDialog";
import FormMode from "@/models/form-mode";
import FDayaDukung from "@/models/f-dayadukung";
import FileService from "@/services/apiservices/file-service";
import UploadImageDialog from "@/components/utils/UploadImageDialog";
import UploadSpasialDialog from "@/components/utils/UploadSpasialDialog.vue";
import UploadImageOriDialog from "@/components/utils/UploadImageOriDialog.vue";
import PetaTabularMarker from "@/components/admin/data-peta/data-peta-tabular/PetaTabularMarker.vue";

export default {
  components: {
    PetaTabularMarker,
    UploadImageOriDialog,
    UploadSpasialDialog,
    CloseConfirmDialog,
    UploadImageDialog,
  },
  props: {
    formMode: String,
    itemsFDivision: Array,
    itemsFDayaDukungType: Array,
    itemsFArea: Array,
  },
  data() {

    return {
      title: "Data Peta Tabular",
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
      itemModified: new FDayaDukung(0, "", ""),
      selectFDivision: { id: 0, kode1: "", description: "" },

      valid: false,
      rulesLength: [
        (v) => !!v || " Tidak Boleh Kosong",
        (v) => v.length <= 255 || "Maksimal 255 Karakter",
        (v) => v.length > 1 || "Harus lebih besar dari 1 karakter",
      ],
      rulesNotEmpty: [(v) => !!v || "Tidak boleh kosong"],

      transparent: "rgba(255, 255, 255, 0)",

      // selectedJenisKompresi: {id: 1, description: "GeoJSON -> Gzip (Paling cepat untuk file besar)"},
      itemsJenisKompresi: [
        {id: "geojson-only", description: "GeoJSON Tanpa Kompresi"},
        {id: "geojson-gzip", description: "GeoJSON -> Gzip (Paling cepat untuk file besar)"},
        {id: "arcgis-gzip", description: "SHP, SHX, DBF -> Gzip"}
      ],
      fileShp: undefined,
      fileShx: undefined,
      fileDbf: undefined,
      filePrj: undefined,
    };
  },
  computed: {
    isItemModified() {
      const defaultItem = JSON.stringify(this.itemDefault);
      const modifiedItem = JSON.stringify(this.itemModified);
      return defaultItem !== modifiedItem;
    },
    computedCurrentMarker() {
      if (this.itemModified.lat && this.itemModified.lon) {
        return {
          coords: [ this.itemModified.lat, this.itemModified.lon]
        };
      } else {
        return undefined
      }
    },
  },
  watch: {
  },

  methods: {
    updateSingleMarker(valueMarker) {
      this.itemModified.lat = valueMarker.coords[0];
      this.itemModified.lon = valueMarker.coords[1];
    },

    downloadFileGeojsonGzip(item) {
      return FileService.fileGeojsonGzip(item);
    },



    completeUploadSuccessSpasial(val) {
      const isGeoGzip = val.senderMessage === "geojson-gzip" || val.senderMessage === "arcgis-gzip";
      const isLowres = val.senderMessage === "lowres";
      const isHighres = val.senderMessage === "highres";

      const updateFile = (targetKey) => {
        if (val.fileName) {
          this.$refs.refUploadSpasial.closeDialog();
          this.itemModified[targetKey] = val.fileName;
          this.saveUpdateOnly();
        }
      };

      const deleteAndUpdate = (targetKey, deleteFn) => {
        const currentFile = this.itemModified[targetKey];

        if (currentFile) {
          deleteFn(currentFile).then(
              () =>
                  console.log(`Delete File ${currentFile}`
              ),
              (error) => console.log(error?.response)
          );
        }
        updateFile(targetKey);
      };

      if (isGeoGzip) {
        deleteAndUpdate("fileNameLow", FileService.deleteFileGeojsonGzip);
      } else if (isLowres) {
        deleteAndUpdate("fileNameLow", FileService.deleteFile);
      } else if (isHighres) {
        deleteAndUpdate("fileNameHigh", FileService.deleteFile);
      }
    },

    showDialogUploadSpasial(senderMessage) {
      if (
        this.itemModified.kode1 !== "" &&
        this.itemModified.description !== "" &&
        this.itemModified.fdivisionBean !== 0 &&
        this.itemModified.fdayaDukungTypeBean !== 0
        //   &&
        // this.itemModified.fareaBean !== 0
      ) {
        if (this.itemModified.id === 0) {
          this.saveCreateOnly();
        }
        this.$refs.refUploadSpasial.showDialog(senderMessage, true);
      } else {
        this.snackBarMessage =
          "Kode, Deskripsi, Divisi, Jenis dan Kecamatan harus diisi dahulu";
        this.snackbar = true;
      }
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
        (this.itemDefault = new FDayaDukung(0, "", "")),
          (this.itemModified = new FDayaDukung(0, "", "")),
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
          FDayaDukungService.updateFDayaDukung(this.itemModified).then(
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
          FDayaDukungService.createFDayaDukung(this.itemModified).then(
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
      FDayaDukungService.createFDayaDukung(this.itemModified).then(
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
      FDayaDukungService.updateFDayaDukung(this.itemModified).then(
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

      FDayaDukungService.getFDayaDukungById(item.id).then(
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
          this.itemModified.fsectorTypeBean !== 0
      ) {
        if (this.itemModified.id === 0) {
          // this.$emit('eventSaveItemWithoutClose', false)
          this.saveCreateOnly();
        }
        this.$refs.refUploadDialogMerker1.showDialog();
      } else {
        this.snackBarMesage =
            "Kode, Deskripsi, Divisi dan Jenis Sektor harus diisi dahulu";
        this.snackbar = true;
      }
    },

    completeUploadSuccessMarker1: function (val) {
      console.log(val);

      if (
          this.itemModified.markerImage1 !== undefined &&
          this.itemModified.markerImage1 !== ""
      ) {
        FileService.deleteFile(this.itemModified.markerImage1).then(
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
        this.itemModified.markerImage1 = val.fileName;
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