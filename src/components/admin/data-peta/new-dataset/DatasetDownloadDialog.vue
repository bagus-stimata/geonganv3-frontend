<template>
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
          <div class="text-grey font-weight-light text-subtitle-1 mb-1">
            Data yang di convert ke <span class="font-weight-bold text-green">Excel</span> hanya data yang berupa titik (Koordinat)
          </div>
          <v-chip size="small" color="green" variant="outlined" density="comfortable" class="text-caption mb-2 font-weight-bold" v-if="isTipePetaPoint">
            <v-icon class="me-1" color="green">mdi-check-circle</v-icon>
            Dataset point (titik koordinat) dapat dikonversikan ke excel
          </v-chip>
          <v-chip size="small" color="orange" variant="outlined" density="comfortable" class="text-caption mb-2 font-weight-bold" v-if="!isTipePetaPoint">
            Tidak ada dataset point (titik koordinat) yang bisa dikonversi ke excel
          </v-chip>
          <v-alert
            v-if="formDialogOptions.errorMessage"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mb-3"
          >
            {{ formDialogOptions.errorMessage }}
          </v-alert>

          <v-btn
            class="mt-4"
            block
            @click="download('POINT TO EXCEL')"
            variant="flat"
            color="green"
            :disabled="!isTipePetaPoint || isDownloading"
            :loading="isDownloading && lastDownloadChoice === 'POINT TO EXCEL'"
          >
            Download Convert To Excel
          </v-btn>
          <v-btn
            class="mt-4"
            block
            @click="download('FULLY GEOJSON')"
            variant="flat"
            color="indigo"
            :disabled="isDownloading"
            :loading="isDownloading && lastDownloadChoice === 'FULLY GEOJSON'"
          >
            Download Geojson
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
</template>

<script>
import ETipePeta from "@/models/e-tipe-peta";
import FtDataset from "@/models/ft-dataset";
import FtDatasetService from "@/services/apiservices/ft-dataset-service";

export default {
  name: "DatasetDownloadDialog",
  components: {},
  data() {
    return {
      itemModified: new FtDataset(),
      dialogShow: false,
      isDownloading: false,
      lastDownloadChoice: null,
      formDialogOptions: {
        title1: "",
        title2: "",
        message1: "",
        message2: "",
        errorMessage: "",
        color: "grey lighten-3",
        width: 550,
        zIndex: 200,
        noconfirm: false,
      },
    };
  },
  computed:{
    isTipePetaPoint(){
      return this.itemModified.tipePeta === ETipePeta.POINT
    }
  },
  watch: {
  },
  methods: {
    showDialog(item) {
      this.dialogShow = true;
      this.itemModified = item;
      this.formDialogOptions.errorMessage = "";
      this.isDownloading = false;
      this.lastDownloadChoice = null;
    },
    async download(choice) {
      this.formDialogOptions.errorMessage = "";
      this.lastDownloadChoice = choice;

      if (!this.itemModified?.id) {
        this.formDialogOptions.errorMessage = "Dataset belum dipilih atau ID tidak valid.";
        return;
      }

      try {
        this.isDownloading = true;
        let res;
        if (choice === "POINT TO EXCEL") {
          res = await FtDatasetService.exportGeojsonPointToExcel(this.itemModified.id);
        } else if (choice === "FULLY GEOJSON") {
          res = await FtDatasetService.exportGeojsonFtDatasetById(this.itemModified.id);
        } else {
          this.formDialogOptions.errorMessage = "Pilihan download tidak dikenali.";
          return;
        }

        if (!res || !res.data) {
          this.formDialogOptions.errorMessage = "Response download kosong.";
          return;
        }

        const headers = res.headers || {};
        const contentType = headers["content-type"] || "application/octet-stream";
        const disposition = headers["content-disposition"] || "";

        const filenameFromHeader = this.getFilenameFromDisposition(disposition);
        const fallbackName =
          choice === "POINT TO EXCEL"
            ? `dataset_${this.itemModified.kode1}_excel.xlsx`
            : `dataset_${this.itemModified.kode1}.geojson`;

        const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: contentType });
        const filename = filenameFromHeader || fallbackName;

        this.saveBlob(blob, filename);
      } catch (err) {
        console.error("[DatasetDownloadDialog] download error:", err);
        this.formDialogOptions.errorMessage = this.extractErrorMessage(err);
      } finally {
        this.isDownloading = false;
      }
    },

    getFilenameFromDisposition(disposition) {
      try {
        if (!disposition) return null;
        const match = String(disposition).match(/filename\*?=(?:UTF-8''|")?([^";]+)"?/i);
        if (!match || !match[1]) return null;

        const raw = match[1].trim();
        const decoded = raw.includes("%") ? decodeURIComponent(raw) : raw;
        return decoded.replace(/\r|\n/g, "");
      } catch (e) {
        console.error("[DatasetDownloadDialog] parse filename error:", e);
        return null;
      }
    },

    saveBlob(blob, filename) {
      try {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (e) {
        console.error("[DatasetDownloadDialog] saveBlob error:", e);
        this.formDialogOptions.errorMessage = "Gagal menyimpan file hasil download.";
      }
    },

    extractErrorMessage(err) {
      const maybeMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Terjadi error saat download.";
      return String(maybeMsg);
    },
    closeForm() {
      this.dialogShow = false;
      this.formDialogOptions.errorMessage = "";
      this.isDownloading = false;
      this.lastDownloadChoice = null;
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