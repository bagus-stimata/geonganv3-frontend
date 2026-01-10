<template>
  <div class="align-self-center">
    <v-dialog
      v-model="dialogShow"
      :max-width="formDialogOptions.width"
      :style="{ zIndex: formDialogOptions.zIndex }"
      @keydown.esc.prevent="closeDialog"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar
            class="grey lighten-3"
            elevation="0"
            density="compact">
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-toolbar-title>Upload Spasial</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>


        <v-card-text class="justify-center">
          <v-row justify="center" align="center">
            <v-col cols="12" md="6" sm="6">
              <v-text-field
                label="Judul"
                v-model="description"
                :rules="rulesNotEmpty"
                v-if="!hideOtherInput"
                variant="underlined"
              ></v-text-field>
            </v-col>
            <v-col cols="6" md="3" sm="3">
              <v-text-field
                label="Line Color"
                v-model="fillColor"
                v-if="!hideOtherInput"
              ></v-text-field>
            </v-col>
            <v-col cols="6" md="3" sm="3">
              <v-text-field
                label="Fill Color"
                v-model="lineColor"
                v-if="!hideOtherInput"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row justify="center" align="center">
            <v-col cols="12" sm="10" md="10">
              <v-file-input
                v-model="currentFile"
                show-size
                counter
                variant="underlined"
                label="Pilih Dokumen"
                :accept="acceptedFileTypes"
              ></v-file-input>
            </v-col>

            <v-col cols="12" sm="2" md="2" class="pl-2">
              <v-btn
                color="success"
                small
                @click="startUpload"
                :disabled="disableButton"
              >
                Upload
                <v-icon right dark>mdi-cloud-upload</v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <div v-if="progress">
            <div>
              <v-progress-linear
                v-model="progress"
                color="light-blue"
                height="25"
                reactive
              >
                <strong>{{ progress }} %</strong>
              </v-progress-linear>
            </div>
          </div>

          <v-row v-if="previewImage" justify="center">
            <v-img class="ma-2" :src="previewImage" alt="" max-width="300px" max-height="300px"></v-img>
          </v-row>
        </v-card-text>
      </v-card>

      <v-alert v-if="message"  dark>
        {{ message }}
      </v-alert>

      <close-confirm-dialog
        ref="refCloseConfirmDialog"
        @eventFromCloseConfirm="passingEventFromCloseConfirm"
      ></close-confirm-dialog>
    </v-dialog>

    <v-dialog
        v-model="dialogProgres"
        hide-overlay
        persistent
        width="300"
    >
      <v-card
          color="primary"
          dark
      >
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
  </div>
</template>

<script>
import UploadService from "@/services/apiservices/file-upload-service";
import CloseConfirmDialog from "@/components/utils/CloseConfirmDialog";

export default {
  name: "UploadSpasialDialog",
  props: {
    parentId: Number,
  },
  components: {
    CloseConfirmDialog,
  },
  data() {
    return {
      hideOtherInput: false,

      dialogProgres: false,
      dialogShow: false,
      formDialogOptions: {
        title1: "",
        title2: "",
        message1: "",
        message2: "",
        errorMessage: "",
        color: "grey lighten-3",
        width: 800,
        zIndex: 250,
        noconfirm: false,
      },

      acceptedFileTypes: [".json", ".shp", ".geojson"],
      uploadGsonToGzip: false,

      currentFile: '',
      previewImage: undefined,

      progress: 0,
      message: "",
      description: "",
      lineColor: "",
      fillColor: "",

      imageInfos: [],
      senderMessage: undefined,

      rulesNotEmpty: [(v) => !!v || "Tidak boleh kosong"],
    };
  },
  computed: {
    isItemModified() {
      const defaultItem = JSON.stringify(this.itemDefault);
      const modifiedItem = JSON.stringify(this.itemModified);
      return defaultItem !== modifiedItem;
    },
    disableButton() {
      return (
        !this.currentFile ||
        this.parentId === 0 ||
        (this.description === "" && !this.hideOtherInput)
      );
    },
  },

  methods: {

    startUpload() {
      if (!this.currentFile) {
        this.message = "Please select an Image!";
        return;
      }

      this.progress = 0;
      this.dialogProgres = true;

      if (this.uploadGsonToGzip) {
        UploadService.uploadGeoJsonToGzip(this.currentFile, (event) => {
          this.progress = Math.round((100 * event.loaded) / event.total);
        })
            .then((response) => {
              this.message = response.data.message;
              /**
               * Mendapat response nama file
               */
              const messageToParent = {
                fileName: this.message,
                description: this.description,
                lineColor: this.lineColor,
                fillColor: this.fillColor,
                senderMessage: this.senderMessage,
              };
              this.$emit("eventUploadSuccess", messageToParent);

              this.dialogProgres = false;
            })
            .catch((err) => {
              this.progress = 0;
              this.message = "Could not upload the image! " + err;
              this.currentFile = undefined;

              this.dialogProgres = false;
            });
      }else {
          UploadService.uploadDocument(this.currentFile, (event) => {
            this.progress = Math.round((100 * event.loaded) / event.total);
          })
              .then((response) => {
                this.message = response.data.message;
                /**
                 * Mendapat response nama file
                 */
                const messageToParent = {
                  fileName: this.message,
                  description: this.description,
                  lineColor: this.lineColor,
                  fillColor: this.fillColor,
                  senderMessage: this.senderMessage,
                };
                this.$emit("eventUploadSuccess", messageToParent);

                this.dialogProgres = false;
              })
              .catch((err) => {
                this.progress = 0;
                this.message = "Could not upload the image! " + err;
                this.currentFile = undefined;

                this.dialogProgres = false;
              });
      }

    },

    showDialog(senderMessage, hideOtherInput) {
      console.log("showDialog called with senderMessage:", senderMessage);
      this.dialogShow = true;
      this.currentFile = undefined;
      this.previewImage = undefined;
      this.progress = 0;
      this.message = "";
      this.description = "";
      this.lineColor = "";
      this.filColor = "";

      if (senderMessage !== undefined) {
        this.senderMessage = senderMessage;
        if (senderMessage.includes("shp")) {
          this.acceptedFileTypes = [".shp"];
        } else if (senderMessage.includes("shx")) {
          this.acceptedFileTypes = [".shx"];
        }else if (senderMessage.includes("dbf")) {
          this.acceptedFileTypes = [".dbf"];
        } else if (senderMessage.includes("geojson-gzip")) {
          this.acceptedFileTypes = [".geojson"];
          this.uploadGsonToGzip = true;

        } else {
          this.uploadGsonToGzip = false;
          this.acceptedFileTypes = [".json", ".shp", ".geojson"];
        }

      }

      if (hideOtherInput !== undefined) {
        if (hideOtherInput === true) {
          this.hideOtherInput = true;
        }
      }
    },
    closeDialog() {
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
  },
  mounted() {

  },
};
</script>

<style scoped>
.preview {
  max-width: 200px;
}
</style>
