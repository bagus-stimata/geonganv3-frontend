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
        <v-toolbar class="bg-white py-2 px-2" density="compact">
          <v-toolbar-title class="font-weight-bold text-subtitle-1">Upload SHP</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="closeDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-divider class="mx-4"></v-divider>
        <v-card-text class="justify-center px-4">
          <v-row>
            <v-col cols="12" md="3">
              <div class="text-caption text-black mb-1">File .shp</div>
              <v-file-input
                clearable
                class="bg-blue-lighten-5"
                variant="outlined"
                v-model="fileShp"
                density="compact"
                accept=".shp"
                hide-details
                show-size
              />
            </v-col>
            <v-col cols="12" md="3">
              <div class="text-caption text-black mb-1">File .shx</div>
              <v-file-input
                clearable
                class="bg-blue-lighten-5"
                variant="outlined"
                v-model="fileShx"
                density="compact"
                accept=".shx"
                hide-details
                show-size
              />
            </v-col>
            <v-col cols="12" md="3">
              <div class="text-caption text-black mb-1">File .dbf</div>
              <v-file-input
                clearable
                class="bg-blue-lighten-5"
                variant="outlined"
                v-model="fileDbf"
                density="compact"
                accept=".dbf"
                hide-details
                show-size
              />
            </v-col>
            <v-col cols="12" md="3">
              <div class="text-caption text-black mb-1">File .prj</div>
              <v-file-input
                clearable
                class="bg-blue-lighten-5"
                variant="outlined"
                v-model="filePrj"
                density="compact"
                accept=".prj"
                hide-details
                show-size
              />
            </v-col>
          </v-row>
          <div class="text-caption text-grey mt-2">
            Wajib upload 4 file: <strong>.shp</strong>, <strong>.shx</strong>, <strong>.dbf</strong>, <strong>.prj</strong> (dari shapefile yang sama).
          </div>
          <v-row justify="center" align="center" class="mt-2">
            <v-col cols="6" md="4">
              <v-btn
                block
                color="success"
                size="small"
                variant="flat"
                @click="startUpload"
                :disabled="!fileShp || !fileShx || !fileDbf || !filePrj"
              >
                Convert & Preview
                <v-icon right dark>mdi-cloud-upload</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="6" md="4">
              <v-btn
                block
                color="primary"
                size="small"
                variant="flat"
                style="text-transform: none;"
                @click="confirmSelection"
                :disabled="!canUseFile"
              >
                Gunakan File Ini
              </v-btn>
            </v-col>
          </v-row>

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

          <v-card-text class="px-0" v-if="previewHeaders.length">
            <div class="d-flex align-center justify-space-between">
              <div class="text-subtitle-2 font-weight-bold">
                Preview Tabel ({{ previewRows.length }} baris, valid: {{ validRowCount }})
              </div>
              <div class="text-caption text-grey">
                Header otomatis dari hasil konversi SHP
              </div>
            </div>

            <div class="preview-table mt-2">
              <v-data-table
                :headers="tableHeadersWithStatus"
                :items="previewRows"
                :items-per-page="10"
                density="compact"
                fixed-header
                height="260"
                class="elevation-0"
              >
                <template #item="{ item }">
                  <tr>
                    <td class="text-center" style="width:44px;">
                      <v-icon
                        v-if="item && item.__rowValid"
                        size="18"
                        color="success"
                      >mdi-check-circle</v-icon>
                      <v-icon
                        v-else
                        size="18"
                        color="error"
                      >mdi-close-circle</v-icon>
                    </td>
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
          </v-card-text>

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
    </v-dialog>

    <v-dialog v-model="dialogProgres" hide-overlay persistent width="300">
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
  </div>
</template>

<script>
import axios from "axios";
import JSZip from "jszip";
export default {
  name: "UploadShpToGeojsonDialog",
  props: {
    parentId: Number,
  },
  components: {},
  data() {
    return {
      dialogProgres: false,
      dialogShow: false,
      formDialogOptions: {
        title1: "",
        title2: "",
        message1: "",
        message2: "",
        errorMessage: "",
        color: "grey lighten-3",
        width: 1200,
        zIndex: 250,
        noconfirm: false,
      },
      fileShp: undefined,
      fileShx: undefined,
      fileDbf: undefined,
      filePrj: undefined,
      previewImage: undefined,
      progress: 0,
      message: "",
      warningMessage: "",
      infoMessage: "",
      canUseFile: false,
      previewHeaders: [],
      previewRows: [],
      rawGeojsonFeatures: [],
      validRowCount: 0,
      geojsonTextOriginal: "",
      convertedFileName: "",
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
    tableHeadersWithStatus() {
      return [
        { title: "OK", key: "__rowValid", sortable: false, align: "center", width: 44 },
        ...this.tableHeaders,
      ];
    },
  },
  methods: {
    formatCell(val) {
      if (val === null || val === undefined) return "";
      if (typeof val === "object") {
        try { return JSON.stringify(val); } catch (e) { return String(val); }
      }
      return String(val);
    },
    toNumberSafe(val) {
      if (val === null || val === undefined) return null;
      if (typeof val === "number" && Number.isFinite(val)) return val;
      const s = String(val).trim().replace(",", ".");
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    },
    isGeojsonFeatureValidCoords(feature) {
      try {
        const g = feature && feature.geometry ? feature.geometry : null;
        if (!g || !g.type) return false;

        const t = String(g.type);
        const coords = g.coordinates;

        // Point: [lon, lat]
        if (t === "Point") {
          if (!Array.isArray(coords) || coords.length < 2) return false;
          const lon = this.toNumberSafe(coords[0]);
          const lat = this.toNumberSafe(coords[1]);
          if (lat === null || lon === null) return false;
          if (lat < -90 || lat > 90) return false;
          if (lon < -180 || lon > 180) return false;
          return true;
        }

        // MultiPoint: at least one valid point
        if (t === "MultiPoint") {
          if (!Array.isArray(coords) || coords.length < 1) return false;
          return coords.some((pt) => {
            if (!Array.isArray(pt) || pt.length < 2) return false;
            const lon = this.toNumberSafe(pt[0]);
            const lat = this.toNumberSafe(pt[1]);
            if (lat === null || lon === null) return false;
            if (lat < -90 || lat > 90) return false;
            if (lon < -180 || lon > 180) return false;
            return true;
          });
        }

        // Other geometry types: treat as valid (no point coords requirement)
        return true;
      } catch (e) {
        return false;
      }
    },
    resetPreviewState() {
      this.previewHeaders = [];
      this.previewRows = [];
      this.rawGeojsonFeatures = [];
      this.validRowCount = 0;
      this.geojsonTextOriginal = "";
      this.convertedFileName = "";
      this.warningMessage = "";
      this.infoMessage = "";
      this.canUseFile = false;
      this.message = "";
    },
    async parseGeojsonTextToPreview(geojsonText) {
      const obj = JSON.parse(geojsonText);

      let features = [];
      if (obj && obj.type === "FeatureCollection" && Array.isArray(obj.features)) {
        features = obj.features;
      } else if (obj && obj.type === "Feature") {
        features = [obj];
      } else {
        throw new Error("Format GeoJSON tidak valid");
      }

      if (!features.length) throw new Error("GeoJSON tidak memiliki fitur");

      this.rawGeojsonFeatures = features;

      const headerSet = new Set();
      features.forEach((f) => {
        const props = (f && f.properties) ? f.properties : {};
        Object.keys(props || {}).forEach((k) => headerSet.add(k));
      });

      this.previewHeaders = Array.from(headerSet);
      this.previewRows = features.map((f) => {
        const row = { ...(f.properties || {}) };
        row.__rowValid = this.isGeojsonFeatureValidCoords(f);
        return row;
      });

      this.validRowCount = this.previewRows.filter((r) => r && r.__rowValid).length;
      this.canUseFile = this.validRowCount > 0;

      if (this.canUseFile) {
        this.infoMessage = `Hasil konversi terbaca. Row valid: ${this.validRowCount}/${this.previewRows.length}`;
        this.warningMessage = "";
      } else {
        this.warningMessage = "Hasil konversi terbaca, tapi tidak ada row yang memenuhi kriteria.";
        this.infoMessage = "";
      }
    },
    async extractGeojsonFromZipBlob(zipBlob) {
      const zip = await JSZip.loadAsync(zipBlob);
      const candidates = Object.keys(zip.files || {}).filter((k) => k.toLowerCase().endsWith(".geojson") || k.toLowerCase().endsWith(".json"));
      if (!candidates.length) {
        throw new Error("ZIP tidak berisi file .geojson/.json");
      }
      // pick the first geojson-like file
      const name = candidates[0];
      const text = await zip.files[name].async("string");
      return { name, text };
    },
    async startUpload() {
      const toSingleFile = (v) => (Array.isArray(v) ? v[0] : v);

      const shp = toSingleFile(this.fileShp);
      const shx = toSingleFile(this.fileShx);
      const dbf = toSingleFile(this.fileDbf);
      const prj = toSingleFile(this.filePrj);

      if (!shp || !shx || !dbf || !prj) {
        this.warningMessage = "Wajib pilih 4 file: .shp, .shx, .dbf, .prj";
        this.infoMessage = "";
        return;
      }

      const endsWith = (f, ext) => String(f.name || "").toLowerCase().endsWith(ext);
      if (!endsWith(shp, ".shp") || !endsWith(shx, ".shx") || !endsWith(dbf, ".dbf") || !endsWith(prj, ".prj")) {
        this.warningMessage = "Extensi file harus sesuai: .shp, .shx, .dbf, .prj";
        this.infoMessage = "";
        return;
      }

      try {
        this.resetPreviewState();
        this.dialogProgres = true;
        this.progress = 0;

        const formData = new FormData();
        formData.append("fileSHP", shp);
        formData.append("fileSHX", shx);
        formData.append("fileDBF", dbf);
        formData.append("filePRJ", prj);

        // Endpoint convert: server may return geojson.zip OR geojson
        const resp = await axios.post(
          "https://desgreentools.des-green.org/desgreen/tools/convert-shapefile-to-geojsonzip",
          formData,
          {
            headers: {
              Authorization: "Basic 123Welcome123",
              "Content-Type": "multipart/form-data",
            },
            responseType: "blob",
            onUploadProgress: (event) => {
              const total = event && event.total ? event.total : 0;
              const loaded = event && event.loaded ? event.loaded : 0;
              if (total > 0) {
                this.progress = Math.round((100 * loaded) / total);
              }
            },
          }
        );

        const disposition =
          resp.headers &&
          (resp.headers["content-disposition"] || resp.headers["Content-Disposition"]);

        let outName = (shp.name || "dataset").replace(/\.shp$/i, "");
        if (disposition && String(disposition).includes("filename=")) {
          const disp = String(disposition);
          const match = disp.match(/filename\*?=(?:UTF-8''|")?([^";]+)"?/);
          if (match && match[1]) {
            const rawName = match[1].trim();
            try {
              outName = decodeURIComponent(rawName);
            } catch (e) {
              outName = rawName;
            }
          }
        }

        const blob = new Blob([resp.data]);
        const nameLower = String(outName || "").toLowerCase();
        const typeLower = String(blob.type || "").toLowerCase();

        let geojsonText = "";
        let convertedName = "";

        // Decide zip vs geojson
        const isZip = nameLower.endsWith(".zip") || typeLower.includes("zip");
        if (isZip) {
          const extracted = await this.extractGeojsonFromZipBlob(blob);
          geojsonText = extracted.text;
          convertedName = extracted.name;
        } else {
          geojsonText = await blob.text();
          convertedName = nameLower.endsWith(".geojson") || nameLower.endsWith(".json") ? outName : `${outName}.geojson`;
        }

        this.geojsonTextOriginal = geojsonText;
        this.convertedFileName = convertedName || outName;

        await this.parseGeojsonTextToPreview(geojsonText);
      } catch (e) {
        console.error(e);
        this.warningMessage = "Convert SHP gagal / hasil tidak bisa dipreview.";
        this.infoMessage = "";
        this.canUseFile = false;
      } finally {
        this.dialogProgres = false;
      }
    },
    confirmSelection() {
      try {
        const feats = Array.isArray(this.rawGeojsonFeatures) ? this.rawGeojsonFeatures : [];
        const validFeatures = feats.filter((f) => this.isGeojsonFeatureValidCoords(f));

        const fc = { type: "FeatureCollection", features: validFeatures };
        const text = JSON.stringify(fc);

        const baseName = String(this.convertedFileName || "dataset").replace(/\.(geojson|json)$/i, "");
        const newName = `${baseName}_valid.geojson`;

        const fileToEmit = new File([text], newName, { type: "application/geo+json" });

        // Also provide valid rows for table usage if parent wants
        const validRows = (this.previewRows || [])
          .filter((r) => r && r.__rowValid)
          .map((r) => {
            const rr = { ...r };
            delete rr.__rowValid;
            return rr;
          });

        this.$emit("geojson-file-selected", {
          file: fileToEmit,
          fileName: newName,
          sourceType: "SHP",
          rows: validRows,
          headers: (this.previewHeaders || []).slice(),
        });

        this.dialogShow = false;
      } catch (e) {
        console.error("[UploadShpToGeojsonDialog] confirmSelection failed", e);
        this.warningMessage = "Gagal menyiapkan file GeoJSON valid.";
        this.infoMessage = "";
      }
    },
    showDialog() {
      this.dialogShow = true;
      this.fileShp = undefined;
      this.fileShx = undefined;
      this.fileDbf = undefined;
      this.filePrj = undefined;
      this.previewImage = undefined;
      this.progress = 0;
      this.resetPreviewState();
    },
    closeDialog() {
      this.dialogShow = false
    },
  },
};
</script>

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