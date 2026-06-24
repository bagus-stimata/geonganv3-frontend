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
                  label="Pilih File GeoJSON (.geojson), Excel (.xlsx) atau CSV (.csv)"
                  accept=".geojson,.json,.xlsx,.xls,.csv"
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
              Preview Tabel ({{ previewRows.length }} baris, valid: {{ validRowCount }})
            </div>
            <div class="text-caption text-grey">
              Header otomatis dari file yang diupload
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

          <div class="text-caption mt-2" v-if="sourceType">
            Source: <strong>{{ sourceType }}</strong>
            <span v-if="sourceSheetName"> | Sheet: <strong>{{ sourceSheetName }}</strong></span>
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
      sourceSheetName: "",
      latKeyDetected: "",
      lonKeyDetected: "",
      validRowCount: 0,
      previewHeaders: [],
      previewRows: [],
      rawGeojsonFeatures: [],
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
    tableHeadersWithStatus() {
      return [
        { title: "OK", key: "__rowValid", sortable: false, align: "center", width: 44 },
        ...this.tableHeaders,
      ];
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
      this.rawGeojsonFeatures = [];
      this.warningMessage = "";
      this.infoMessage = "";
      this.canUseFile = false;
      this.sourceType = "";
      this.sourceSheetName = "";
      this.latKeyDetected = "";
      this.lonKeyDetected = "";
      this.validRowCount = 0;

      if (!file) return;

      const nameLower = (this.localFileName || "").toLowerCase();

      try {
        if (nameLower.endsWith(".xlsx") || nameLower.endsWith(".xls")) {
          this.sourceType = "EXCEL";
          await this.buildPreviewFromExcel(file);
        } else if (nameLower.endsWith(".csv")) {
          this.sourceType = "CSV";
          await this.buildPreviewFromCsv(file);
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
    isEmptyColumnValue(value) {
      if (value === null || value === undefined) return true;
      if (typeof value === "string") return value.trim() === "";
      if (Array.isArray(value)) return value.length === 0;
      if (typeof value === "object") {
        if (value instanceof Date) return false;
        return Object.keys(value).length === 0;
      }
      return false;
    },
    getRowHeaders(rows) {
      const headers = [];
      const seen = new Set();
      (rows || []).forEach((row) => {
        Object.keys(row || {}).forEach((key) => {
          if (!seen.has(key)) {
            seen.add(key);
            headers.push(key);
          }
        });
      });
      return headers;
    },
    isGeneratedEmptyHeader(key) {
      const normalized = String(key || "").trim();
      return normalized === "" || /^__EMPTY(?:_\d+)?$/i.test(normalized) || /^_\d+$/.test(normalized);
    },
    getColumnNonEmptyCount(rows, key) {
      return (rows || []).reduce((count, row) => {
        return count + (this.isEmptyColumnValue((row || {})[key]) ? 0 : 1);
      }, 0);
    },
    dropEmptyColumnsFromRows(rows) {
      const sourceRows = Array.isArray(rows) ? rows : [];
      const headers = this.getRowHeaders(sourceRows).filter((key) => {
        const filledCount = this.getColumnNonEmptyCount(sourceRows, key);
        if (filledCount === 0) return false;
        if (this.isGeneratedEmptyHeader(key)) return filledCount > 2;
        return true;
      });

      const cleanedRows = sourceRows.map((row) => {
        const cleaned = {};
        headers.forEach((key) => {
          cleaned[key] = Object.prototype.hasOwnProperty.call(row || {}, key)
            ? row[key]
            : "";
        });
        return cleaned;
      });

      return { rows: cleanedRows, headers };
    },
    dropEmptyPropertiesFromFeatures(features) {
      const sourceFeatures = Array.isArray(features) ? features : [];
      const propertyRows = sourceFeatures.map((f) => (f && f.properties) ? f.properties : {});
      const { headers } = this.dropEmptyColumnsFromRows(propertyRows);
      const headerSet = new Set(headers);

      return sourceFeatures.map((feature) => {
        const props = (feature && feature.properties) ? feature.properties : {};
        const cleanedProps = {};
        Object.keys(props).forEach((key) => {
          if (headerSet.has(key)) cleanedProps[key] = props[key];
        });
        return { ...feature, properties: cleanedProps };
      });
    },

    normalizeHeaderToken(value) {
      const raw = String(value || "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "");

      const normalized = raw.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      const compact = normalized.replace(/_/g, "");
      return { normalized, compact };
    },
    findHeaderKeysAll(headers, candidates) {
      const hdrs = (headers || []).map((h) => String(h));
      const normalizedHeaders = hdrs.map((h) => ({
        original: h,
        ...this.normalizeHeaderToken(h),
      }));

      const found = new Map();

      // exact matches first
      (candidates || []).forEach((c) => {
        const cand = this.normalizeHeaderToken(c);
        const matched = normalizedHeaders.find((h) =>
          h.normalized === cand.normalized || h.compact === cand.compact
        );
        if (matched) {
          found.set(matched.original, true);
        }
      });

      // contains matches (e.g. "koordinat_lat")
      // IMPORTANT: skip single-letter candidates (like 'x'/'y') to avoid false positives
      (candidates || []).forEach((c) => {
        const cand = this.normalizeHeaderToken(c);
        if (!cand.compact || cand.compact.length <= 1) return;
        normalizedHeaders.forEach((h) => {
          if (
            h.normalized.includes(cand.normalized) ||
            h.compact.includes(cand.compact)
          ) {
            found.set(h.original, true);
          }
        });
      });

      return Array.from(found.keys());
    },
    getCoordCandidates() {
      return {
        latCandidates: [
          "lat",
          "lati",
          "latit",
          "latitude",
          "latitude_y",
          "lattitude",
          "latitute",
          "latitud",
          "lat_deg",
          "lat_degree",
          "lat_d",
          "latitude_dd",
          "lat_dd",
          "latitude_decimal",
          "lat_decimal",
          "lat_dec",
          "koordinat_lat",
          "koordinatlat",
          "koordinatlintang",
          "koordinat_lintang",
          "koordinatlatitude",
          "koordinat_latitude",
          "coord_lat",
          "coordlatitude",
          "coordinate_lat",
          "coordinate_latitude",
          "point_lat",
          "titik_lat",
          "lat_point",
          "latitude_point",
          "y",
          "y_lat",
          "lat_y",
          "latitude_y_coord",
          "ycoord",
          "y_coord",
          "y_coordinate",
          "ycoordlat",
          "lat_y_coord",
          "koor_y",
          "coord_y",
          "coordinate_y",
          "y_koordinat",
          "y_lintang",
          "koordinaty",
          "koordinat_y",
          "lintang",
          "garislintang",
          "garis_lintang",
          "latitude_wgs_84",
          "lat_wgs84",
          "latwgs84",
          "lat_wgs_84",
          "latitude_wgs84",
          "latitude_84",
          "lat_84",
        ],
        lonCandidates: [
          "lon",
          "lng",
          "longi",
          "longitude",
          "longitude_x",
          "long",
          "longg",
          "longtitude",
          "longitud",
          "lon_deg",
          "lon_degree",
          "lon_d",
          "lon_dd",
          "longitude_dd",
          "long_dd",
          "lon_decimal",
          "longitude_decimal",
          "lon_dec",
          "koordinat_lon",
          "koordinatlon",
          "koordinatlong",
          "koordinatlongitude",
          "koordinat_bujur",
          "coord_lon",
          "coordlongitude",
          "coordinate_lon",
          "coordinate_longitude",
          "point_lon",
          "titik_lon",
          "lon_point",
          "longitude_point",
          "x",
          "x_lon",
          "lon_x",
          "longitude_x_coord",
          "xcoord",
          "x_coord",
          "x_coordinate",
          "xcoordlon",
          "lon_x_coord",
          "koor_x",
          "coord_x",
          "coordinate_x",
          "x_koordinat",
          "x_bujur",
          "koordinatx",
          "koordinat_x",
          "bujur",
          "garisbujur",
          "garis_bujur",
          "longitude_wgs_84",
          "lon_wgs84",
          "lonwgs84",
          "lon_wgs_84",
          "lng_wgs84",
          "longitude_wgs84",
          "longitude_84",
          "lon_84",
        ],
      };
    },
    pickBestLatLonFromRows(rows) {
      const headers = this.getRowHeaders(rows).filter(Boolean);
      const { latCandidates, lonCandidates } = this.getCoordCandidates();

      const latKeysAll = this.findHeaderKeysAll(headers, latCandidates);
      const lonKeysAll = this.findHeaderKeysAll(headers, lonCandidates);

      let latKey = "";
      let lonKey = "";
      let validRowCount = 0;

      latKeysAll.forEach((latCandidate) => {
        lonKeysAll.forEach((lonCandidate) => {
          if (latCandidate === lonCandidate) return;
          const count = rows.reduce((acc, row) => {
            return acc + (this.isRowValidStrict(row, headers, latCandidate, lonCandidate) ? 1 : 0);
          }, 0);
          if (count > validRowCount) {
            validRowCount = count;
            latKey = latCandidate;
            lonKey = lonCandidate;
          }
        });
      });

      return {
        headers,
        latKeysAll,
        lonKeysAll,
        latKey,
        lonKey,
        validRowCount,
      };
    },

    toNumberSafe(val) {
      if (val === null || val === undefined) return null;
      if (typeof val === "number" && Number.isFinite(val)) return val;
      const s = String(val).trim().replace(/\s+/g, "");
      if (!s) return null;

      // 1.234,56 -> 1234.56
      if (/^-?\d{1,3}(\.\d{3})+,\d+$/.test(s)) {
        const n = Number(s.replace(/\./g, "").replace(",", "."));
        return Number.isFinite(n) ? n : null;
      }
      // 1,234.56 -> 1234.56
      if (/^-?\d{1,3}(,\d{3})+\.\d+$/.test(s)) {
        const n = Number(s.replace(/,/g, ""));
        return Number.isFinite(n) ? n : null;
      }
      // 123,456789 -> 123.456789
      const n = Number(s.replace(",", "."));
      return Number.isFinite(n) ? n : null;
    },
    isGeojsonFeatureValidCoords(feature) {
      try {
        const g = feature && feature.geometry ? feature.geometry : null;
        if (!g || !g.type) return false;

        const t = String(g.type);
        const coords = g.coordinates;

        // For points, require [lon, lat] both finite numbers
        if (t === "Point") {
          if (!Array.isArray(coords) || coords.length < 2) return false;
          const lon = this.toNumberSafe(coords[0]);
          const lat = this.toNumberSafe(coords[1]);
          if (lat === null || lon === null) return false;
          if (lat < -90 || lat > 90) return false;
          if (lon < -180 || lon > 180) return false;
          return true;
        }

        // For MultiPoint, require at least one valid point
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

        // For other geometry types (LineString/Polygon/etc), treat as valid (coord structure differs)
        return true;
      } catch (e) {
        return false;
      }
    },
    isRowValidStrict(row, headers, latKey, lonKey) {
      // rule: ONLY coordinate columns are required (must be double + valid)
      // other columns may be empty.
      const r = row || {};

      // When lat/lon keys are expected (Excel): both must exist and be valid numbers in range.
      if (latKey || lonKey) {
        if (!latKey || !lonKey) return false;

        const latRaw = r[latKey];
        const lonRaw = r[lonKey];

        // treat empty string/null/undefined as missing
        const latMissing = latRaw === null || latRaw === undefined || (typeof latRaw === "string" && latRaw.trim() === "");
        const lonMissing = lonRaw === null || lonRaw === undefined || (typeof lonRaw === "string" && lonRaw.trim() === "");
        if (latMissing || lonMissing) return false;

        const lat = this.toNumberSafe(latRaw);
        const lon = this.toNumberSafe(lonRaw);
        if (lat === null || lon === null) return false;
        if (lat < -90 || lat > 90) return false;
        if (lon < -180 || lon > 180) return false;

        return true;
      }

      // For GeoJSON preview (no explicit coord columns): don't invalidate rows based on empties.
      return true;
    },
    async buildPreviewFromCsv(file) {
      const text = await file.text();

      const wb = XLSX.read(text, { type: "string" });
      const sheetName = wb.SheetNames && wb.SheetNames.length ? wb.SheetNames[0] : null;
      if (!sheetName) throw new Error("Sheet tidak ditemukan di file CSV");

      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });
      if (!rows || !rows.length) throw new Error("Data CSV kosong");

      const headers = Object.keys(rows[0] || {}).filter(Boolean);

      const latCandidates = ["lat", "latitude", "lattitude", "y", "y_lat", "ycoord"];
      const lonCandidates = ["lon", "lng", "longitude", "x", "x_lon", "xcoord"];

      const latKeysAll = this.findHeaderKeysAll(headers, latCandidates);
      const lonKeysAll = this.findHeaderKeysAll(headers, lonCandidates);

      const latKey = latKeysAll.length === 1 ? latKeysAll[0] : "";
      const lonKey = lonKeysAll.length === 1 ? lonKeysAll[0] : "";

      this.latKeyDetected = latKey;
      this.lonKeyDetected = lonKey;

      if (latKeysAll.length > 1 || lonKeysAll.length > 1) {
        const latMsg = latKeysAll.length > 1 ? `Latitude terdeteksi lebih dari 1 kolom: ${latKeysAll.join(", ")}` : "";
        const lonMsg = lonKeysAll.length > 1 ? `Longitude terdeteksi lebih dari 1 kolom: ${lonKeysAll.join(", ")}` : "";

        this.warningMessage =
            "File CSV ini punya kolom koordinat ganda (ambiguous). Tolong sisakan 1 kolom Latitude dan 1 kolom Longitude saja. " +
            [latMsg, lonMsg].filter(Boolean).join(" | ");
        this.infoMessage = "";
        this.canUseFile = false;
      } else if (!latKey && !lonKey) {
        this.warningMessage = "Data CSV ini tidak mengandung kolom koordinat (lat/latitude dan lon/longitude).";
        this.canUseFile = false;
      } else if (!latKey || !lonKey) {
        const missing = !latKey ? "Latitude (lat/latitude)" : "Longitude (lon/longitude)";
        this.warningMessage = `Data CSV ini tidak mengandung kolom ${missing}. Tidak bisa digunakan.`;
        this.canUseFile = false;
      } else {
        this.infoMessage = `Kolom koordinat terdeteksi: ${latKey} & ${lonKey}`;
        this.canUseFile = true;
      }

      this.previewHeaders = headers;

      this.previewRows = rows.map((r) => {
        const row = { ...r };
        row.__rowValid = this.isRowValidStrict(row, headers, latKey, lonKey);
        return row;
      });

      this.validRowCount = this.previewRows.filter((r) => r && r.__rowValid).length;

      if (this.canUseFile && this.validRowCount < 1) {
        this.warningMessage = "Struktur CSV valid, tapi tidak ada row yang memenuhi kriteria (koordinat wajib valid).";
        this.infoMessage = "";
        this.canUseFile = false;
      }

      if (this.canUseFile) {
        this.infoMessage = `Kolom koordinat terdeteksi: ${latKey} & ${lonKey}. Row valid: ${this.validRowCount}/${this.previewRows.length}`;
      }
    },
    async buildPreviewFromExcel(file) {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheetNames = wb.SheetNames || [];
      if (!sheetNames.length) throw new Error("Sheet tidak ditemukan di file Excel");

      const evaluated = sheetNames
        .map((sheetName) => {
          const ws = wb.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });
          if (!rows || !rows.length) return null;

          const cleaned = this.dropEmptyColumnsFromRows(rows);
          if (!cleaned.headers.length) return null;

          const picked = this.pickBestLatLonFromRows(cleaned.rows);
          return {
            sheetName,
            rows: cleaned.rows,
            ...picked,
          };
        })
        .filter(Boolean);

      if (!evaluated.length) throw new Error("Data Excel kosong");

      const candidatesWithCoords = evaluated.filter((x) => x.latKey && x.lonKey);
      const chosen = (candidatesWithCoords.length ? candidatesWithCoords : evaluated).sort((a, b) => {
        return (b.validRowCount || 0) - (a.validRowCount || 0);
      })[0];

      const rows = chosen.rows;
      const headers = chosen.headers;
      const latKeysAll = chosen.latKeysAll;
      const lonKeysAll = chosen.lonKeysAll;
      const latKey = chosen.latKey;
      const lonKey = chosen.lonKey;

      this.sourceSheetName = chosen.sheetName || "";

      this.latKeyDetected = latKey;
      this.lonKeyDetected = lonKey;

      // validation: must have BOTH
      if (!latKey && !lonKey) {
        this.warningMessage = "Data Excel ini tidak mengandung kolom koordinat (lat/latitude dan lon/longitude).";
        this.canUseFile = false;
      } else if (!latKey || !lonKey) {
        const missing = !latKey ? "Latitude (lat/latitude)" : "Longitude (lon/longitude)";
        this.warningMessage = `Data Excel ini tidak mengandung kolom ${missing}. Tidak bisa digunakan.`;
        this.canUseFile = false;
      } else {
        this.canUseFile = true;
      }

      // build preview table (ALL rows; pagination handled by v-data-table)
      const preview = rows;

      this.previewHeaders = headers;

      // mark each row validity (coordinates must be double and valid)
      this.previewRows = preview.map((r) => {
        const row = { ...r };
        row.__rowValid = this.isRowValidStrict(row, headers, latKey, lonKey);
        return row;
      });

      this.validRowCount = this.previewRows.filter((r) => r && r.__rowValid).length;

      // if file structure is OK but there is no valid row, disable
      if (this.canUseFile && this.validRowCount < 1) {
        this.warningMessage = "Struktur Excel valid, tapi tidak ada row yang memenuhi kriteria (koordinat wajib valid).";
        this.infoMessage = "";
        this.canUseFile = false;
      }

      if (this.canUseFile) {
        const hasAmbiguousKeys = latKeysAll.length > 1 || lonKeysAll.length > 1;
        const autoPickNote = hasAmbiguousKeys
          ? ` (auto-pick dari kandidat lat: ${latKeysAll.join(", ")} | lon: ${lonKeysAll.join(", ")})`
          : "";
        const sheetNote = this.sourceSheetName ? ` [Sheet: ${this.sourceSheetName}]` : "";
        this.infoMessage =
          `Kolom koordinat terdeteksi: ${latKey} & ${lonKey}${autoPickNote}. Row valid: ${this.validRowCount}/${this.previewRows.length}${sheetNote}`;
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

      this.rawGeojsonFeatures = this.dropEmptyPropertiesFromFeatures(features);
      const slice = this.rawGeojsonFeatures;

      const headerSet = new Set();
      slice.forEach((f) => {
        const props = (f && f.properties) ? f.properties : {};
        Object.keys(props || {}).forEach((k) => headerSet.add(k));
      });

      this.previewHeaders = Array.from(headerSet);

      // const headers = this.previewHeaders;
      this.previewRows = slice.map((f) => {
        const row = { ...(f.properties || {}) };
        row.__rowValid = this.isGeojsonFeatureValidCoords(f);
        return row;
      });

      this.validRowCount = this.previewRows.filter((r) => r && r.__rowValid).length;

      this.canUseFile = this.validRowCount > 0;
      if (this.canUseFile) {
        this.infoMessage = `GeoJSON terbaca. Row valid: ${this.validRowCount}/${this.previewRows.length}`;
        this.warningMessage = "";
      } else {
        this.warningMessage = "GeoJSON terbaca, tapi tidak ada row yang memenuhi kriteria.";
        this.infoMessage = "";
      }
    },


    confirmSelection() {
      const fileOriginal = Array.isArray(this.localFile) ? this.localFile[0] : this.localFile;

      // only send valid rows (strip helper field)
      const validRows = (this.previewRows || [])
        .filter((r) => r && r.__rowValid)
        .map((r) => {
          const rr = {};
          (this.previewHeaders || []).forEach((key) => {
            rr[key] = Object.prototype.hasOwnProperty.call(r, key) ? r[key] : "";
          });
          return rr;
        });

      let fileToEmit = fileOriginal || null;
      let fileNameToEmit = (fileOriginal && fileOriginal.name) ? fileOriginal.name : "";

      try {
        // If parent re-parses file, we must emit a filtered file.
        if (this.sourceType === "EXCEL" || this.sourceType === "CSV") {
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.json_to_sheet(validRows, { skipHeader: false });
          const safeName = (fileNameToEmit || (this.sourceType === "CSV" ? "data.csv" : "data.xlsx")).replace(/\.(xlsx|xls|csv)$/i, "");
          const newName = `${safeName}_valid.xlsx`;

          XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

          const out = XLSX.write(wb, {
            bookType: "xlsx",
            type: "array",
          });

          fileToEmit = new File([out], newName, {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          fileNameToEmit = newName;
        } else if (this.sourceType === "GEOJSON") {
          const feats = Array.isArray(this.rawGeojsonFeatures) ? this.rawGeojsonFeatures : [];
          const validFeatures = this.dropEmptyPropertiesFromFeatures(
            feats.filter((f) => this.isGeojsonFeatureValidCoords(f))
          );

          const fc = { type: "FeatureCollection", features: validFeatures };
          const text = JSON.stringify(fc);

          const safeName = (fileNameToEmit || "data.geojson").replace(/\.(geojson|json)$/i, "");
          const newName = `${safeName}_valid.geojson`;
          fileToEmit = new File([text], newName, { type: "application/geo+json" });
          fileNameToEmit = newName;
        }
      } catch (e) {
        // If regeneration fails, fall back to original file; rows remain filtered in payload.
        console.error("[UploadGeojsonExcelDatasetDialog] failed to create filtered file", e);
      }

      this.$emit("geojson-file-selected", {
        file: fileToEmit,
        fileName: fileNameToEmit,
        sourceType: this.sourceType,
        rows: validRows,
        headers: (this.previewHeaders || []).slice(),
        latKey: this.latKeyDetected,
        lonKey: this.lonKeyDetected,
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
