<template>
  <div>
    <v-dialog
      v-model="dialogShow"
      :max-width="formDialogOptions.width"
      :style="{ zIndex: formDialogOptions.zIndex }"
      @keydown.esc.prevent="closeForm"
      persistent
      :fullscreen="$vuetify.display.smAndDown"
      :hide-overlay="$vuetify.display.smAndDown"
    >
      <v-card>
        <v-form v-model="valid" ref="form">
          <v-toolbar class="color-bg-second text-white" density="compact">
            <v-btn icon dark @click="closeForm">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title class="text-subtitle-2">Informasi Downloader
            </v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>

          <v-card-text>
            <v-container>
              <v-row class="my-0 py-0">
                <v-col cols="12" sm="6" md="3" class="my-0 py-0">
                  <div class="text-subtitle-1 font-weight-bold">Nama</div>
                </v-col>
                <v-col cols="12" sm="6" md="9" class="my-0 py-0">
                  <div class="text-subtitle-1 font-weight-regular"><span class="font-weight-bold">: </span> {{itemModified.description}}</div>
                </v-col>
              </v-row>
              <v-row class="my-0 py-0">
                <v-col cols="12" sm="6" md="3" class="my-0 py-0">
                  <div class="text-subtitle-1 font-weight-bold">Email</div>
                </v-col>
                <v-col cols="12" sm="6" md="9" class="my-0 py-0">
                  <div class="text-subtitle-1 font-weight-regular"><span class="font-weight-bold">: </span> {{itemModified.email}}</div>
                </v-col>
              </v-row>
              <v-row class="my-0 py-0">
                <v-col cols="12" sm="6" md="3" class="my-0 py-0">
                  <div class="text-subtitle-1 font-weight-bold">Instansi</div>
                </v-col>
                <v-col cols="12" sm="6" md="9" class="my-0 py-0">
                  <div class="text-subtitle-1 font-weight-regular"><span class="font-weight-bold">: </span> {{itemModified.instansi}}</div>
                </v-col>
              </v-row>
              <v-row class="my-0 py-0">
                <v-col cols="12" sm="6" md="3" class="my-0 py-0">
                  <div class="text-subtitle-1 font-weight-bold">Dataset Terdownload</div>
                </v-col>
                <v-col cols="12" sm="6" md="9" class="my-0 py-0">
                  <div class="text-subtitle-1 font-weight-regular"><span class="font-weight-bold">: </span> {{itemModified.notes}}</div>
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
                v-if="false"
                variant="outlined"
                @click="closeForm"
                class="hidden-sm-and-down"
            >
              Batal
            </v-btn>
            <v-btn
                color="blue-darken-1"
                variant="flat"
                v-if="false"
                @click="save"
                :disabled="!valid || isItemModified === false"
                class="hidden-sm-and-down"
            >
              Simpan
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
      <upload-image-dialog
          ref="refUploadDialog"
          @eventUploadSuccess="completeUploadSuccess"
      >
      </upload-image-dialog>
      <close-confirm-dialog
        ref="refCloseConfirmDialog"
        @eventFromCloseConfirm="passingEventFromCloseConfirm"
      ></close-confirm-dialog>
    </v-dialog>
    <v-snackbar
        v-model="snackbar"
    >
      {{ snackBarMesage }}
      <template v-slot:actions="{ attrs }">
        <v-btn
            variant="text"
            v-bind="attrs"
            @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
  
  <script>
import FGeoDownloadService from "@/services/apiservices/f-geo-download-service";

import CloseConfirmDialog from "@/components/utils/CloseConfirmDialog.vue";
import FormMode from "@/models/form-mode";
import FGeoDownload from "@/models/f-geo-download";
import FileService from "@/services/apiservices/file-service";
import UploadImageDialog from "@/components/utils/UploadImageDialog.vue";

export default {
  name: "FGeoDownloadDialog",
  components: {UploadImageDialog, CloseConfirmDialog },
  props: {
    formMode: String,
  },
  data() {
    return {
      dialogShow: false,
      snackbar: false,
      snackBarMesage: '',
      formDialogOptions: {
        title1: "",
        title2: "",
        message1: "",
        message2: "",
        errorMessage: "",
        color: "grey lighten-3",
        width: 700,
        zIndex: 200,
        noconfirm: false,
      },
      transparent: 'rgba(255, 255, 255, 0)',
      selectedItemIndex: -1,
      itemDefault: "",
      itemModified: new FGeoDownload(0, "", ""),
      selectFDivision: { id: 0, kode1: "", description: "" },
      itemsFDivision: [
        { id: 1, kode1: "", description: "" },
        { id: 2, kode1: "", description: "" },
      ],

      valid: false,
      rulesLength: [
        (v) => !!v || " Tidak Boleh Kosong",
        (v) => v.length <= 255 || "Maksimal 255 Karakter",
        (v) => v.length > 1 || "Harus lebih besar dari 1 karakter",
      ],
      rulesNotEmpty: [(v) => !!v || "Tidak boleh kosong"],
    };
  },
  computed: {
    isItemModified() {
      const defaultItem = JSON.stringify(this.itemDefault);
      const modifiedItem = JSON.stringify(this.itemModified);
      return defaultItem !== modifiedItem;
    },
  },
  watch: {},
  methods: {
    completeUploadSuccess: function (val){
      if (val.fileName !==""){
        FileService.deleteImage(this.itemModified.avatarImage).then(
            ()=>{
            },
            error => {
              console.log(error.response)
            }
        )
        this.itemModified.avatarImage = val.fileName
        this.$refs.refUploadDialog.closeDialog()
        this.$emit("saveUpdateOnly", 'dummy')
      }
    },
    showDialogUpload() {
      if (
          this.itemModified.kode1 !== undefined &&
          this.itemModified.description !== undefined &&
          this.itemModified.fdivisionBean !== undefined
      ) {
        if (this.itemModified.id === 0) {
          this.saveCreateOnly();
        }
        this.$refs.refUploadDialog.showDialog();
      } else {
        this.snackBarMesage = "Kode, Deskripsi dan Bidang/Dinas harus diisi dahulu";
        this.snackbar = true;
      }
    },
    saveCreateOnly() {
      if (this.formMode === FormMode.NEW_FORM) {
        FGeoDownloadService.createFGeoDownload(this.itemModified).then(
            (response) => {
              this.$emit("update:formMode", FormMode.EDIT_FORM);
              this.itemModified.id = response.data.id;
            },
            (error) => {
              this.formDialogOptions.errorMessage = error.response.data.message;
            }
        );
      }
    },
    showDialog(selectedIndex, item, itemsFDivision) {
      this.dialogShow = !this.dialogShow;
      if (selectedIndex > -1) {
        this.selectedIndex = selectedIndex;
        this.initializeEditMode(item);
      } else {
        (this.itemDefault = new FGeoDownload(0, "", "")),
          (this.itemModified = new FGeoDownload(0, "", "")),
          (this.selectedIndex = -1);
      }
      this.itemsFDivision = itemsFDivision;
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
          FGeoDownloadService.updateFGeoDownload(this.itemModified).then(
            () => {
              this.$emit("eventFromFormDialogEdit", this.itemModified);
            },
            (error) => {
              console.log(error);
              this.formDialogOptions.errorMessage = error.response.data.message;
            }
          );
        } else {
          FGeoDownloadService.createFGeoDownload(this.itemModified).then(
            (response) => {
              this.$emit("eventFromFormDialogNew", response.data);
            },
            (error) => {
              console.log(error);
              this.formDialogOptions.errorMessage = error.response.data.message;
            }
          );
        }
      }
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
      FGeoDownloadService.getFGeoDownloadById(item.id).then(
        (response) => {
          this.itemDefault = Object.assign({}, response.data);
          this.itemModified = response.data;
        },
        (error) => {
          console.log(error);
        }
      );
    },
    lookupImageUrl(item){
      if (item.avatarImage===undefined || item.avatarImage===""){
        return require('@/assets/images/no_image_available.jpeg')
      }else {
        return FileService.image_url_medium(item.avatarImage)
      }
    },
    lookupImageUrlLazy(){
      return  require('@/assets/images/no_image_available.jpeg')
    },
  },
};
</script>
  
  <style scoped>
  .card-hover-opacity{
    opacity: 0.4;
  }
  .card-not-hover-opacity{
    opacity: 1;
    /*transition: opacity .4s ease-in-out;*/
    transition: opacity .4s ease-in-out;
  }

  .show-btns {
    color: blue !important;
    opacity: 1;
  }
</style>