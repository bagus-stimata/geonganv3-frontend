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
        <v-toolbar class="grey lighten-3" elevation="0" dense>
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-toolbar-title>Upload Gambar Ext</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>

        <v-card-text class="justify-center">
          <v-row justify="center" align="center">
            <v-col cols="12" md="12" sm="6">
              <v-text-field
                  label="Title or Description"
                  v-model="description"
                  small
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row justify="center" align="center">
            <v-col cols="10">
              <v-file-input
                  v-model="currentImage"
                  show-size
                  counter
                  label="Pilih Gambar"
                  accept=".png, .jpg, .jpeg"
                  @change="selectImage"
              ></v-file-input>
            </v-col>

            <v-col cols="2" class="pl-2">
              <v-btn
                  color="success"
                  small
                  @click="startUpload"
                  :disabled="!currentImage || parentId === 0"
              >
                Upload
                <v-icon right dark>mdi-cloud-upload</v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <div v-if="progress">
            <v-progress-linear v-model="progress" color="light-blue" height="25" reactive>
              <strong>{{ progress }} %</strong>
            </v-progress-linear>
          </div>

          <v-row v-if="previewImage" justify="center">
            <v-img class="ma-2" :src="previewImage" alt="" :max-width="300" :max-height="300" />
          </v-row>
        </v-card-text>
      </v-card>

      <v-alert v-if="message" dark>
        {{ message }}
      </v-alert>

    </v-dialog>

    <v-dialog v-model="dialogProgres" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          Please Wait...
          <v-progress-linear indeterminate color="white" class="mb-0" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import UploadService from "@/services/apiservices/file-upload-service";

export default {
  name: "UploadImageOriDialog",
  components: {
  },
  props: {
    parentId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      dialogProgres: false,
      dialogShow: false,
      formDialogOptions: {
        width: 800,
        zIndex: 250
      },
      currentImage: undefined,
      previewImage: undefined,
      progress: 0,
      message: "",
      description: ""
    };
  },
  methods: {
    selectImage() {
      // In Vuetify 3, @change on v-file-input passes a native event,
      // while v-model holds the actual File or File[].
      let file = this.currentImage;

      // If it's an array (multiple mode), take the first one
      if (Array.isArray(file)) {
        file = file[0];
      }

      // Guard: if no file, reset and exit
      if (!file) {
        this.currentImage = undefined;
        this.previewImage = undefined;
        this.progress = 0;
        this.message = "";
        return;
      }

      // Guard: ensure it's a Blob/File before creating an object URL
      if (!(file instanceof Blob)) {
        console.warn("selectImage: currentImage is not a Blob/File, got:", file);
        return;
      }

      this.currentImage = file;
      this.previewImage = URL.createObjectURL(file);
      this.progress = 0;
      this.message = "";
    },
    startUpload() {
      if (!this.currentImage) {
        this.message = "Please select an Image!";
        return;
      }

      this.dialogProgres = true;
      this.progress = 0;

      UploadService.uploadDocument(this.currentImage, (event) => {
        this.progress = Math.round((100 * event.loaded) / event.total);
      })
          .then((response) => {
            this.message = response.data.message;
            const messageToParent = {
              fileName: this.message,
              description: this.description
            };
            this.$emit('eventUploadSuccess', messageToParent);
            this.dialogProgres = false;
          })
          .catch((err) => {
            this.progress = 0;
            this.message = "Could not upload the image! " + err;
            this.currentImage = undefined;
            this.dialogProgres = false;
          });
    },
    showDialog() {
      this.dialogShow = true;
      this.currentImage = undefined;
      this.previewImage = undefined;
      this.progress = 0;
      this.message = "";
      this.description = "";
    },
    closeDialog() {
      this.$emit('eventFromFormDialog1', {}); // you may pass data if needed
      this.dialogShow = false;
    },
    passingEventFromCloseConfirm(value) {
      if (value === 'OKE') {
        this.dialogShow = false;
      }
    }
  }
};
</script>

<style scoped>
.preview {
  max-width: 200px;
}
</style>