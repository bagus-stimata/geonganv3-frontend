<template>
  <div>
    <v-dialog
      v-model="dialogShow"
      :max-width="formDialogOptions.width"
      :style="{ zIndex: formDialogOptions.zIndex }"
      @keydown.esc.prevent="closeForm"
      persistent
      :class="$vuetify.display.smAndDown? '': 'overflow-hidden'"
      :hide-overlay="$vuetify.display.smAndDown"
    >
      <v-card class="rounded-lg" >
        <v-toolbar class="bg-white py-2 px-2" density="compact">
          <v-toolbar-title class="font-weight-bold text-subtitle-1">Pilihan Download</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="closeForm">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-divider class="mx-4"></v-divider>
        <v-card-text class="px-6">
          <div class="text-grey font-weight-light text-subtitle-1 mb-2"><span class="font-weight-bold text-green">1. Download Convert To Excel</span>, akan menghasilkan data export yang dimana geojson bertipe point akan di convert ke excell</div>
          <div class="text-grey font-weight-light text-subtitle-1 mb-2"><span class="font-weight-bold text-indigo">2. Download Fully Geojson</span>, akan menghasilkan semua data export berupa geojson</div>
          <v-btn class="mt-4" block @click="download('POINT TO EXCEL')" variant="flat" color="green">Download Convert To Excel</v-btn>
          <v-btn class="mt-4" block @click="download('FULLY GEOJSON')" variant="flat" color="indigo">Download Fully Geojson</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
  
<script>

import FGeoDownload from "@/models/f-geo-download";
import FGeoDownloadService from "@/services/apiservices/f-geo-download-service";

export default {
  name: "DownloadChoiceDialog",
  props:{
    itemsFDivision: Array
  },
  components: {},
  data() {
    return {
      dialogShow: false,
      itemsMapsetSelected:[],
      formDialogOptions: {
        title1: "",
        title2: "",
        message1: "",
        message2: "",
        errorMessage: "",
        color: "grey lighten-3",
        width: 500,
        zIndex: 200,
        noconfirm: false,
      },
    };
  },
  computed: {
  },
  watch: {
  },
  methods: {
    showDialog(itemsMapsetSelected) {
      this.dialogShow = true
      this.itemsMapsetSelected = itemsMapsetSelected
    },
    download(choice){
      const raw = localStorage.getItem("currentDownloader");
      let currentDownloader = JSON.parse(raw);
      // Isi fdivisionBean default (KOMINFO) jika ketemu
      const fdivision = this.itemsFDivision.filter(
          (x) => x.description && x.description.toUpperCase().includes("DISKOMINFO")
      );
      if (fdivision.length > 0) {
        currentDownloader.fdivisionBean = fdivision[0].id;
      }

      const payload = (this.itemsMapsetSelected || []).map((item) => {
        const entry = new FGeoDownload();
        entry.description = currentDownloader.description;
        entry.email = currentDownloader.email;
        entry.instansi = currentDownloader.instansi;
        entry.notes = item && item.description ? item.description : "";
        entry.ftDatasetBean = item && item.id ? item.id : 0;
        entry.fdivisionBean = currentDownloader.fdivisionBean;
        entry.statusActive = true;
        return entry;
      });

      if (payload.length === 0) {
        this.snackbar = {
          show: true,
          color: "warning",
          text: "Belum ada dataset yang valid untuk di-download",
          timeout: 1500,
        };
        return;
      }

      FGeoDownloadService.createFGeoDownloadMultiple(payload)
          .then(() => {
            this.$emit('downloadGeojsonZip', choice)
            this.closeForm()
          })
          .catch((err) => {
            console.error("createFGeoDownloadMultiple error", err);
            this.snackbar = {
              show: true,
              color: "error",
              text: "Gagal menyimpan info download",
              timeout: 2000,
            };
          });
    },
    closeForm() {
      this.dialogShow = false;
    },
  },
  mounted() {
  }
};
</script>
<style scoped>
.border-activated {
  border: 2px solid #FF8030 !important;
  border-radius: 8px;
}
</style>