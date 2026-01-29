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
          <v-toolbar-title class="font-weight-bold text-subtitle-1">Upload GeoJSON / Excel</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="closeForm">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-divider class="mx-4"></v-divider>
        <v-card-text class="px-4">
          <v-row class="align-start justify-start">
            <v-col cols="12" sm="12" md="8" class="align-start justify-start">
              <v-file-input
                  v-model="localFile"
                  label="Pilih File GeoJSON (.geojson) atau Excell (.xlsx)"
                  accept=".geojson,.json,.xlsx,.xls"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-file-upload"
                  @change="onFileSelected"
                  hide-details
              />
              <div class="text-caption mt-2" v-if="localFileName">
                File terpilih:
                <strong>{{ localFileName }}</strong>
              </div>
            </v-col>
            <v-col cols="12" sm="12" md="4" class="align-start justify-start">
              <v-btn
                  block
                  color="primary"
                  variant="flat"
                  style="text-transform: none;"
                  :disabled="!localFile || !canUseFile"
                  @click="confirmSelection"
              >
                Gunakan File Ini
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
        <v-alert
            v-if="warningMessage"
            type="warning"
            variant="tonal"
            density="comfortable"
            class="mt-3"
        >
          {{ warningMessage }}
        </v-alert>

        <v-alert
            v-else-if="infoMessage"
            type="info"
            variant="tonal"
            density="comfortable"
            class="mt-3"
        >
          {{ infoMessage }}
        </v-alert>

        <v-divider class="mx-4"></v-divider>

        <v-card-text class="px-4" v-if="previewHeaders.length">
          <div class="d-flex align-center justify-space-between">
            <div class="text-subtitle-2 font-weight-bold">
              Preview Tabel ({{ previewRows.length }} baris)
            </div>
            <div class="text-caption text-grey">
              Header otomatis dari file yang diupload
            </div>
          </div>

          <div class="preview-table mt-2">
            <v-data-table
              :headers="tableHeaders"
              :items="previewRows"
              :items-per-page="10"
              density="compact"
              fixed-header
              height="260"
              class="elevation-0"
            >
              <template #item="{ item }">
                <tr>
                  <td v-for="h in previewHeaders" :key="h">
                    {{ formatCell(item[h]) }}
                  </td>
                </tr>
              </template>

              <template #no-data>
                <div class="text-caption pa-4">Tidak ada data untuk ditampilkan</div>
              </template>
            </v-data-table>
          </div>

          <div class="text-caption mt-2" v-if="sourceType">
            Source: <strong>{{ sourceType }}</strong>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import * as XLSX from "xlsx";

export default {
  name: "UploadGeojsonExcelDatasetDialog",
  props: {
    geojsonFile: { type: [File, Blob, Array, Object, null], default: null },
    geojsonFileName: { type: String, default: "" },
  },
  components: {},
  data() {
    return {
      sourceType: "",
      previewHeaders: [],
      previewRows: [],
      warningMessage: "",
      infoMessage: "",
      canUseFile: false,
      dialogShow: false,
      formDialogOptions: {
        title1: "",
        title2: "",
        message1: "",
        message2: "",
        errorMessage: "",
        color: "grey lighten-3",
        width: 1200,
        zIndex: 200,
        noconfirm: false,
      },
      localFile: null,
      localFileName: "",
    };
  },
  computed: {
    tableHeaders() {
      return (this.previewHeaders || []).map((h) => ({
        title: String(h),
        key: String(h),
        sortable: false,
      }));
    },
  },
  watch: {
  },
  methods: {
    showDialog() {
      this.dialogShow = true;
      // initialize from props each time opened
      const f = Array.isArray(this.geojsonFile) ? this.geojsonFile[0] : this.geojsonFile;
      this.localFile = f || null;
      this.localFileName = this.geojsonFileName || (f && f.name) || "";
      if (this.localFile) {
        this.onFileSelected();
      }
    },

    async onFileSelected() {
      const file = Array.isArray(this.localFile) ? this.localFile[0] : this.localFile;
      this.localFile = file || null;
      this.localFileName = (file && file.name) ? file.name : "";

      // reset preview + messages
      this.previewHeaders = [];
      this.previewRows = [];
      this.warningMessage = "";
      this.infoMessage = "";
      this.canUseFile = false;
      this.sourceType = "";

      if (!file) return;

      const nameLower = (this.localFileName || "").toLowerCase();

      try {
        if (nameLower.endsWith(".xlsx") || nameLower.endsWith(".xls")) {
          this.sourceType = "EXCEL";
          await this.buildPreviewFromExcel(file);
        } else {
          this.sourceType = "GEOJSON";
          await this.buildPreviewFromGeojson(file);
        }
      } catch (e) {
        console.error("[UploadGeojsonExcelDatasetDialog] parse error", e);
        this.warningMessage = "Gagal membaca file. Pastikan format GeoJSON/Excel valid.";
        this.canUseFile = false;
      }
    },
    formatCell(val) {
      if (val === null || val === undefined) return "";
      if (typeof val === "object") {
        try { return JSON.stringify(val); } catch (e) { return String(val); }
      }
      return String(val);
    },

    findHeaderKeysAll(headers, candidates) {
      const hdrs = (headers || []).map((h) => String(h));
      const lower = hdrs.map((h) => h.toLowerCase());

      const found = new Map();

      // exact matches first
      (candidates || []).forEach((c) => {
        const cc = String(c).toLowerCase();
        const idx = lower.indexOf(cc);
        if (idx >= 0) {
          found.set(hdrs[idx], true);
        }
      });

      // contains matches (e.g. "koordinat_lat")
      // IMPORTANT: skip single-letter candidates (like 'x'/'y') to avoid false positives
      (candidates || []).forEach((c) => {
        const cc = String(c).toLowerCase();
        if (cc.length <= 1) return;
        lower.forEach((h, idx) => {
          if (h.includes(cc)) {
            found.set(hdrs[idx], true);
          }
        });
      });

      return Array.from(found.keys());
    },

    toNumberSafe(val) {
      if (val === null || val === undefined) return null;
      if (typeof val === "number" && Number.isFinite(val)) return val;
      const s = String(val).trim().replace(",", ".");
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    },
    async buildPreviewFromExcel(file) {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheetName = wb.SheetNames && wb.SheetNames.length ? wb.SheetNames[0] : null;
      if (!sheetName) throw new Error("Sheet tidak ditemukan di file Excel");

      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });
      if (!rows || !rows.length) throw new Error("Data Excel kosong");

      const headers = Object.keys(rows[0] || {}).filter(Boolean);

      const latCandidates = ["lat", "latitude", "lattitude", "y", "y_lat", "ycoord"];
      const lonCandidates = ["lon", "lng", "longitude", "x", "x_lon", "xcoord"];

      const latKeysAll = this.findHeaderKeysAll(headers, latCandidates);
      const lonKeysAll = this.findHeaderKeysAll(headers, lonCandidates);

      // pick a single key if unambiguous
      const latKey = latKeysAll.length === 1 ? latKeysAll[0] : "";
      const lonKey = lonKeysAll.length === 1 ? lonKeysAll[0] : "";

      // validation: ambiguous duplicates (human error)
      if (latKeysAll.length > 1 || lonKeysAll.length > 1) {
        const latMsg = latKeysAll.length > 1 ? `Latitude terdeteksi lebih dari 1 kolom: ${latKeysAll.join(", ")}` : "";
        const lonMsg = lonKeysAll.length > 1 ? `Longitude terdeteksi lebih dari 1 kolom: ${lonKeysAll.join(", ")}` : "";

        this.warningMessage =
          "File Excel ini punya kolom koordinat ganda (ambiguous). Tolong sisakan 1 kolom Latitude dan 1 kolom Longitude saja. " +
          [latMsg, lonMsg].filter(Boolean).join(" | ");
        this.infoMessage = "";
        this.canUseFile = false;
      }
      // validation: must have BOTH (and not ambiguous)
      else if (!latKey && !lonKey) {
        this.warningMessage = "Data Excel ini tidak mengandung kolom koordinat (lat/latitude dan lon/longitude).";
        this.canUseFile = false;
      } else if (!latKey || !lonKey) {
        const missing = !latKey ? "Latitude (lat/latitude)" : "Longitude (lon/longitude)";
        this.warningMessage = `Data Excel ini tidak mengandung kolom ${missing}. Tidak bisa digunakan.`;
        this.canUseFile = false;
      } else {
        this.infoMessage = `Kolom koordinat terdeteksi: ${latKey} & ${lonKey}`;
        this.canUseFile = true;
      }

      // build preview table (show up to 10 rows)
      const maxRows = 10;
      const preview = rows.slice(0, maxRows);

      this.previewHeaders = headers;
      this.previewRows = preview.map((r) => ({ ...r }));

      // extra check: ensure at least one valid coordinate row
      if (this.canUseFile) {
        const hasValid = preview.some((r) => {
          const lat = this.toNumberSafe(r[latKey]);
          const lon = this.toNumberSafe(r[lonKey]);
          return lat !== null && lon !== null && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
        });

        if (!hasValid) {
          this.warningMessage = "Kolom koordinat ada, tapi tidak ada baris yang valid (lat/lon harus numeric dan dalam range).";
          this.infoMessage = "";
          this.canUseFile = false;
        }
      }
    },
    async buildPreviewFromGeojson(file) {
      const text = await file.text();
      const obj = JSON.parse(text);

      let features = [];
      if (obj && obj.type === "FeatureCollection" && Array.isArray(obj.features)) {
        features = obj.features;
      } else if (obj && obj.type === "Feature") {
        features = [obj];
      } else {
        throw new Error("Format GeoJSON tidak valid");
      }

      if (!features.length) throw new Error("GeoJSON tidak memiliki fitur");

      const maxRows = 10;
      const slice = features.slice(0, maxRows);

      const headerSet = new Set();
      slice.forEach((f) => {
        const props = (f && f.properties) ? f.properties : {};
        Object.keys(props || {}).forEach((k) => headerSet.add(k));
      });

      this.previewHeaders = Array.from(headerSet);
      this.previewRows = slice.map((f) => ({ ...(f.properties || {}) }));

      this.canUseFile = true;
      this.infoMessage = "GeoJSON terbaca. Preview menampilkan properties.";
    },


    confirmSelection() {
      const file = Array.isArray(this.localFile) ? this.localFile[0] : this.localFile;
      this.$emit("geojson-file-selected", {
        file: file || null,
        fileName: (file && file.name) ? file.name : "",
      });
      this.closeForm();
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
<style scoped>
.preview-table {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}
.preview-table :deep(.v-data-table__wrapper) {
  overflow-y: auto;
}
.preview-table :deep(th),
.preview-table :deep(td) {
  white-space: nowrap;
}
</style>