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
            density="compact"
        >
          <v-btn
              icon
              @click="closeDialog"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-toolbar-title>Upload Gambar</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>

        <v-card-text class="justify-center">
          <v-row justify="center" align="center">
              <v-col cols="12" md="12" sm="6">
                  <v-text-field
                  label="Title or Description"
                  v-model="description"
                  density="compact"
                  variant="underlined"
                  ></v-text-field>
              </v-col>
          </v-row>

          <v-file-upload clearable v-model="currentImage" density="compact" accept=".png, .jpg, .jpeg, .mp4"></v-file-upload>
          <v-row justify="center" align="center" class="mt-2">
            <v-col cols="3" class="pl-2">
              <v-btn color="success" size="small" variant="flat" @click="startUpload" :disabled="!currentImage || parentId===0">
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

        </v-card-text>

      </v-card>

      <v-alert v-if="message">
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
import { VFileUpload } from 'vuetify/labs/VFileUpload'

export default {
  name: "UploadImageAndVideoDialog",
  props:{
    parentId: Number
  },
  components:{
    CloseConfirmDialog,
    VFileUpload
  },
  data() {
    return {
      dialogProgres: false,
      dialogShow: false,
      formDialogOptions: {
        title1: '',
        title2: '',
        message1: '',
        message2: '',
        errorMessage: '',
        color: "grey lighten-3",
        width: 600,
        zIndex: 250,
        noconfirm: false,
      },

      currentImage: undefined,
      previewImage: undefined,

      progress: 0,
      message: "",
      description: '',

      imageInfos: [],
    };
  },
  computed: {
    isItemModified() {
      const defaultItem = JSON.stringify(this.itemDefault)
      const modifiedItem = JSON.stringify(this.itemModified)
      return defaultItem !== modifiedItem
    }
  },

  methods: {

    startUpload() {
      const file = Array.isArray(this.currentImage) ? this.currentImage[0] : this.currentImage;
      if (!file) {
        this.message = "Please select an Image/Video!";
        return;
      }

      this.progress = 0;
      this.dialogProgres = true;

      const isMp4 = file.type === 'video/mp4' || /\.mp4$/i.test(file.name);

      const onProgress = (event) => {
        this.progress = Math.round((100 * event.loaded) / event.total);
      };

      const onDone = (response, emitEventName) => {
        this.message = response.data.message;
        this.$emit(emitEventName, {
          fileName: this.message,
          description: this.description,
        });
        this.dialogProgres = false;
      };

      const onFail = (err) => {
        this.progress = 0;
        this.message = "Could not upload the file! " + err;
        this.dialogProgres = false;
      };

      if (isMp4) {
        UploadService.uploadDocument(file, onProgress).then(
            (res) => onDone(res, 'eventUploadSuccessVideo')
        ).catch(onFail);
      } else {
        UploadService.uploadImage(file, onProgress).then(
            (res) => onDone(res, 'eventUploadSuccessImage')
        ).catch(onFail);
      }
    },

    showDialog(){
      this.dialogShow = true
      this.currentImage = undefined
      this.previewImage = undefined
      this.progress =0
      this.message = ""

    },
    closeDialog(){
      if (! this.isItemModified){
        this.dialogShow = false
        this.$emit('eventFromFormDialog1', this.itemModified)
      }else {
        this.$refs.refCloseConfirmDialog.showDialog(" Sudah terdapat modifikasi data", "Tetap tutup dan reset perubahan?")
      }
    },
    passingEventFromCloseConfirm(value){
      if (value==='OKE') this.dialogShow = false
    },
  },
  mounted() {

  },
};
</script>

<style scoped>

</style>
