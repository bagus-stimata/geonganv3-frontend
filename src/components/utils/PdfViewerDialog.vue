<template>
  <v-dialog v-model="dialogShow" fullscreen>
    <v-toolbar class="color-bg-second text-white" density="compact">
      <v-spacer></v-spacer>
      <v-btn icon dark @click="closeDialog">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <VuePdfApp style="height: 100vh;" :pdf="filePdf(itemFile)" />
  </v-dialog>
</template>

<script>
import FileService from "@/services/apiservices/file-service";
import VuePdfApp from "vue3-pdf-app";
import "vue3-pdf-app/dist/icons/main.css";

export default {
  name: "PdfViewerDialog",
  components: {
    VuePdfApp,
  },
  data() {
    return {
      dialogShow: false,
      itemFile: "",
    };
  },

  props: {
    infoDialogTitle: String,
  },
  computed: {},
  methods: {
    filePdf(item) {
      return FileService.file_url(item.fileName);
    },
    showDialog(item) {
      this.dialogShow = !this.dialogShow;
      this.itemFile = item;
    },
    setDialogState(value) {
      this.dialogShow = value;
    },
    closeDialog() {
      this.dialogShow = false;
    },
  },
};
</script>

<style scoped>
</style>