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

              <v-row class="bg-green-lighten-4 rounded">
                <v-col cols="12">
                  <v-row>
                    <v-col cols="12" sm="6" md="4">
                      <v-autocomplete
                        variant="outlined"
                        density="compact"
                        small="true"
                        label="Tipe Kompresi"
                        v-model="itemModified.fileType"
                        :rules="rulesNotEmpty"
                        :items=itemsJenisKompresi
                        item-value="id"
                        item-title="description"
                        hint="Harus dipilih dulu sebelum upload spasial"
                        persistent-hint
                      ></v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="3" md="3" v-if="false">
                      <v-text-field
                        v-model="itemModified.color1"
                        label="Color1"
                        variant="outlined"
                        density="compact"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="3" md="3" v-if="false">
                      <v-text-field
                        v-model="itemModified.color2"
                        label="Color2"
                        variant="outlined"
                        density="compact"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="3" md="3">
                      <v-switch
                          v-model="itemModified.selected"
                          :label="itemModified.selected ? 'Selected' : 'Selected'"
                          class="pa-3"
                          density="compact"
                          hide-details
                          color="primary"
                      ></v-switch>
                    </v-col>
                  </v-row>

                  <v-row v-if="itemModified.fileType === 'geojson-only' ">
                    <v-col cols="12" sm="6" md="6">
                      <div class="mb-n2 text-right text-caption font-weight-bold">
                        LOW RES
                      </div>
                      <div class="bg-blue-lighten-4 rounded elevation-1">
                        <v-btn
                          :disabled="!itemModified.fileType"
                          @click="showDialogUploadSpasial('lowres')"
                          class="ma-1"
                          icon
                          color="amber-darken-1"
                          size="x-small"
                        >
                          <v-icon color="white">mdi-upload</v-icon>
                        </v-btn>
                        <span v-if="itemModified.fileNameLow === ''">No File (Low Res)</span>
                        <a
                          v-else
                          :href="`${downloadFile(itemModified.fileNameLow)}`"
                          target="_blank"
                        >
                          {{ itemModified.fileNameLow }}
                          <v-icon color="green" size="x-small">mdi-download</v-icon>
                        </a>
                      </div>
                    </v-col>

                    <v-col cols="12" sm="6" md="6">
                      <div class="mb-n2 text-right text-caption font-weight-bold">
                        HIGH RES
                      </div>
                      <div class="bg-blue-lighten-4 rounded elevation-1">
                        <v-btn
                          :disabled="!itemModified.fileType"
                          @click="showDialogUploadSpasial('highres')"
                          icon
                          color="primary"
                          class="ma-1"
                          size="x-small"
                        >
                          <v-icon color="white">mdi-upload</v-icon>
                        </v-btn>
                        <span v-if="itemModified.fileNameHigh === ''"
                          >No File (High Res)</span
                        >
                        <a
                          v-else
                          :href="`${downloadFile(itemModified.fileNameHigh)}`"
                          target="_blank"
                        >
                          {{ itemModified.fileNameHigh }}
                          <v-icon color="green" size="x-small">mdi-download</v-icon>
                        </a>
                      </div>
                    </v-col>

                  </v-row>

                  <v-row v-if="itemModified.fileType === 'geojson-gzip' ">
                    <v-col cols="12" sm="6" md="6">
                      <div class="mb-n2 text-right text-caption font-weight-bold">
                        GEO JSON (akan di Konvert ke Gzip)
                      </div>
                      <div class="bg-blue-lighten-4 rounded elevation-1">
                        <v-btn
                            :disabled="!itemModified.fileType"
                            class="ma-1"
                            @click="showDialogUploadSpasial('geojson-gzip')"
                            icon
                            color="amber-darken-1"
                            size="x-small"
                        >
                          <v-icon color="white">mdi-upload</v-icon>
                        </v-btn>
                        <span v-if="itemModified.fileNameLow === ''">No File (GeoJSON)</span>
                        <span  v-else>
                          <v-btn
                              color="primary"
                              @click="downloadFileGeojsonGzipManual(itemModified.fileNameLow)"
                              variant="flat"
                              size="small"
                              class="mr-2"
                          >
                              Download GeoJSON Gzip <v-icon color="green">mdi-download</v-icon>
                            </v-btn>
                            <span>{{ itemModified.fileNameLow }}</span>
                        </span>

                      </div>
                    </v-col>
                    <v-col cols="12" sm="6" md="3" align="center" justify="center">
                      <div>Pilih Marker</div>
                      <v-hover v-slot="{ hover }">
                        <v-card
                            :elevation="hover ? 10 : 1"
                            :class="[
                          { 'on-hover': hover },
                          hover
                            ? 'card-hover-opacity'
                            : 'card-not-hover-opacity',
                        ]"
                            height="150px"
                            width="150px"
                        >
                          <v-img
                              :src="lookupImageMarkerUrl(itemModified.markerImage1)"
                              height="150px"
                              width="150px"
                          >
                            <v-card-title class="text-h6 white--text fill-height">
                              <v-row
                                  class="fill-height flex-column"
                                  justify="space-between"
                              >
                                <v-spacer />
                                <div class="align-self-center">
                                  <v-btn
                                      :class="{ 'show-btns': hover }"
                                      icon
                                      large
                                      dark
                                      outlined
                                      @click="showDialogUploadMarker1"
                                  >
                                    <v-icon
                                        :class="{ 'show-btns': hover }"
                                        color="blue"
                                    >
                                      mdi-upload
                                    </v-icon>
                                  </v-btn>
                                </div>
                              </v-row>
                            </v-card-title>
                          </v-img>
                        </v-card>
                      </v-hover>
                      <div>
                        <v-btn
                            density="compact"
                            size="small"
                            plain
                            color="primary"
                            @click="downloadFileImage(lookupImageMarkerUrl(itemModified.markerImage1))"
                            style="text-transform: none;"
                        >
                          Download
                        </v-btn>
                      </div>
                    </v-col>
                  </v-row>

                  <v-row v-if="itemModified.fileType ==='arcgis-gzip' ">
                    <v-col cols="12" sm="6" md="4">
                      <div class="mb-n2 text-right text-caption font-weight-bold">
                        SHP
                      </div>
                      <div class="bg-blue-lighten-4 rounded elevation-1">
                        <v-file-input
                            v-model="fileShp"
                            show-size
                            counter
                            label="Pilih File SHP"
                            accept=".shp"
                            density="compact"
                        ></v-file-input>
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <div class="mb-n2 text-right text-caption font-weight-bold">
                        SHX
                      </div>
                      <div class="bg-blue-lighten-4 rounded elevation-1">
                        <v-file-input
                            v-model="fileShx"
                            show-size
                            counter
                            label="Pilih SHX"
                            accept=".shx"
                            density="compact"
                        ></v-file-input>
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <div class="mb-n2 text-right text-caption font-weight-bold">
                        DBF
                      </div>
                      <div class="bg-blue-lighten-4 rounded elevation-1">
                        <v-file-input
                            v-model="fileDbf"
                            show-size
                            counter
                            label="Pilih DBF"
                            accept=".dbf"
                            density="compact"
                        ></v-file-input>
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <div class="mb-n2 text-right text-caption font-weight-bold">
                        PRJ
                      </div>
                      <div class="teal-lighten-4 rounded elevation-1">
                        <v-file-input
                            v-model="filePrj"
                            show-size
                            counter
                            label="Pilih PRJ"
                            accept=".prj"
                            density="compact"
                        ></v-file-input>
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-btn
                          color="primary"
                          variant="flat"
                          @click="processConvertToGeojsonGzip"
                      >Convert to Gzip dan Upload</v-btn>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <span>
                          <a :href="`${downloadFileGeojsonGzip(itemModified.fileNameLow)}`"
                             target="_blank">
                          {{ itemModified.fileNameLow }}
                          <v-icon color="white" size="small">mdi-download</v-icon>
                        </a>
                        </span>
                    </v-col>
                  </v-row>

                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-text  v-if="itemModified.fileNameLow">
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
import axios from "axios";
import UploadService from "@/services/apiservices/file-upload-service";
import FDayaDukungPetaMap from "@/components/admin/data-peta/daya-dukung-peta/FDayaDukungPetaMap.vue";
import UploadImageOriDialog from "@/components/utils/UploadImageOriDialog.vue";

export default {
  components: {
    UploadImageOriDialog,
    FDayaDukungPetaMap,
    // FDayaDukungPetaMap,
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
  },
  watch: {
  },

  methods: {
    cekTampilanPeta(){
      // this.$refs.refFDayaDukungPetaMap.tampilkanPeta(this.itemModified);
      this.$refs.refFDayaDukungPetaMap.tampilkanPeta(this.itemModified);
    },
    processConvertToGeojsonGzip() {
        const formData = new FormData();
        formData.append("fileSHP", this.fileShp);
        formData.append("fileSHX", this.fileShx);
        formData.append("fileDBF", this.fileDbf);
        formData.append("filePRJ", this.filePrj);

      this.dialogLoading = true

      axios.post("https://desgreentools.des-green.org/desgreen/tools/convert-shapefile-to-geojsongzip", formData, {
          headers: {
            "Authorization": "Basic 123Welcome123",
            "Content-Type": "multipart/form-data"
          },
          responseType: 'blob' // kalau server kirim file gzip
        })
            .then(response => {
              const disposition = response.headers['content-disposition'];
              const fileName = this.fileShp.name || this.fileShp; // handle File object atau string
              const baseName = fileName.replace(/\.shp$/i, '');
              let filename = `${baseName}.geojson.gz`;

              if (disposition && disposition.includes('filename=')) {
                const match = disposition.match(/filename="?(.+)"?/);
                if (match && match[1]) {
                  filename = match[1];
                }
              }

              const blob = new Blob([response.data], { type: 'application/gzip' });
              const file = new File([blob], filename, { type: "application/gzip" });

              // const newFormData = new FormData();
              // newFormData.append("file", file);

              // Kirim ke endpoint REST kedua
              UploadService.uploadGeoJsonGzip(file, (event) => {
                this.progress = Math.round((100 * event.loaded) / event.total);
              })
                  .then((response) => {
                    const messageFileName = response.data.message;
                    /**
                     * Mendapat response nama file
                     */

                    const messageToParent = {
                      fileName: messageFileName,
                      description: this.description,
                      senderMessage: "arcgis-gzip",
                    };
                    this.completeUploadSuccessSpasial(messageToParent);

                    this.dialogLoading = false;
                  })
                  .catch((err) => {
                    this.progress = 0;
                    this.message = "Could not upload the image! " + err;
                    this.currentFile = undefined;

                    this.dialogLoading = false;
                  });

            })
          .catch(error => {
            console.error("❌ Upload ke Flask gagal:", error);
            this.dialogLoading = false;
          });

    },

    downloadFile(item) {
      return FileService.file_url(item);
    },
    downloadFileGeojsonGzip(item) {
      return FileService.fileGeojsonGzip(item);
    },

    downloadFileGeojsonGzipManual(filename) {
      const url = this.downloadFileGeojsonGzip(filename);
      fetch(url, { method: 'GET' })
          .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.blob();
          })
          .then(blob => {
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            // Ganti ekstensi hasil download menjadi .geojson
            link.href = downloadUrl;
            link.download = filename.replace(/\.geojson\.gz$/i, '.geojson');
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(link);
          })
          .catch(error => {
            alert('Gagal download: ' + error);
          });
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