<template>
  <v-dialog
      :max-width="formDialogOptions.width"
      :height="formDialogOptions.width"
      :style="{ zIndex: formDialogOptions.zIndex }"
      @keydown.esc.prevent="closeDialog"
      transition="dialog-top-transition"
      v-model="dialogShow"
  >
    <v-toolbar class="color-bg-second text-white" density="compact" flat>
      <v-btn
          density="compact"
          prepend-icon="mdi-download"
          @click="downloadImage"
      >Download</v-btn>
      <v-spacer></v-spacer>
      <v-btn icon @click="closeDialog" density="compact">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-img
        :lazy-src="lookupImageUrlFileName(fileName)"
        :src="lookupImageUrlLazyFileName(fileName)"
        min-width="180"
        height="180"
        cover
    ></v-img>
  </v-dialog>
</template>

<script>
import FileService from "@/services/apiservices/file-service";

export default {
  name: "ImageViewersSmallDialog",
  components: {},
  data() {
    return {
      formDialogOptions: {
        title1: '',
        title2: '',
        message1: '',
        message2: '',
        errorMessage: '',
        color: "grey lighten-3",
        width:600,
        zIndex: 250,
        noconfirm: false,
      },
      dialogShow: false,
      fileName: "",
    };
  },

  props: {
    infoDialogTitle: String,
  },
  computed: {},
  methods: {
    showDialog(imageFile) {
      this.dialogShow = !this.dialogShow;
      this.fileName = imageFile;
    },
    setDialogState(value) {
      this.dialogShow = value;
    },
    closeDialog() {
      this.dialogShow = false;
    },
    lookupImageUrlFileName(fileName) {
      if (fileName === undefined) {
        return require("@/assets/images/no_image_available.jpeg");
      } else {
        return FileService.image_url_high(fileName);
      }
    },
    lookupImageUrlLazyFileName(fileName) {
      return FileService.image_url_low(fileName);
    },
    downloadImage() {
      const url = this.lookupImageUrlFileName(this.fileName);
      const link = document.createElement("a");
      link.href = url;
      link.download = this.fileName || `${this.fileName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
};
</script>

<style scoped>
</style>