<template>
  <v-card>
    <!-- Top bar: Save + Search -->
    <v-row class="px-2 pt-2" align="center">
      <v-col cols="12" sm="12" md="6" class="d-flex align-center ga-2">
        <v-btn
          color="primary"
          variant="flat"
          :loading="saving"
          :disabled="loading || saving || !hasDirty"
          @click="saveChanges"
        >
          Save changes
        </v-btn>
        <v-btn
          color="warning"
          variant="flat"
          :disabled="loading || saving || !hasDirty"
          @click="cancelChanges"
          style="text-transform: none;"
        >
          Cancel changes
        </v-btn>
        <span v-if="hasDirty" class="text-caption text-grey">
          {{ dirtyCount }} changed
        </span>

      </v-col>

      <v-col cols="12" sm="12" md="6" class="d-flex align-center justify-center ga-2">
        <v-btn
          v-if="isCoordinateDataset"
          color="success"
          variant="flat"
          class="rounded-lg"
          style="text-transform: none;"
          @click="openAddCoordDialog"
        >
          Tambah Koordinat
        </v-btn>

        <v-text-field
          v-model="search"
          label="Search"
          hint="press ⏎ to search"
          density="comfortable"
          @keyup.enter="searchOnEnter($event)"
          hide-details
        />

        <v-menu location="bottom end" :close-on-content-click="false">
          <template #activator="{ props: menuProps }">
            <v-btn v-bind="menuProps" icon variant="text" title="Geom settings">
              <v-icon>mdi-shape</v-icon>
            </v-btn>
          </template>

          <v-card min-width="260" class="pa-2">
            <div class="text-caption text-grey mb-2">Geom Columns</div>

            <v-switch
              v-model="showGeomCol"
              density="compact"
              hide-details
              inset
              label="Show geom (WKT)"
            />

            <v-switch
              v-model="showCentroidCol"
              density="compact"
              hide-details
              inset
              label="Show centroid (WKT)"
            />

            <v-divider class="my-2" />

            <div class="text-caption text-grey mb-1">Derive lat/lon from</div>
            <v-radio-group v-model="coordDeriveSource" density="compact" hide-details>
              <v-radio label="centroid" value="centroid" />
              <v-radio label="geom" value="geom" />
            </v-radio-group>
          </v-card>
        </v-menu>
      </v-col>
    <v-dialog v-model="dialogAddCoord" max-width="560">
      <v-card>
        <v-card-title class="text-subtitle-1">Tambah Koordinat</v-card-title>

        <v-card-text class="pt-2">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="addCoord.featureKey"
                label="Feature Key (auto)"
                density="comfortable"
                hide-details
                readonly
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                  v-model="addCoord.lat"
                  label="Latitude"
                  type="number"
                  density="comfortable"
                  hide-details
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                  v-model="addCoord.lon"
                  label="Longitude"
                  type="number"
                  density="comfortable"
                  hide-details
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" v-if="addCoordError" class="pt-0">
              <v-alert type="error" density="compact" variant="tonal">
                {{ addCoordError }}
              </v-alert>
            </v-col>
          </v-row>

        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeAddCoordDialog">Batal</v-btn>
          <v-btn color="success" variant="flat" @click="confirmAddCoord">Tambah</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    </v-row>

    <v-card-text v-if="serverRows && serverRows.length" class="mt-n2 mb-4">
      <v-row>
        <v-col cols="12">
          <div class="feature-table-scroll">
            <v-data-table-server
              density="compact"
              class="feature-attr-table"
              :headers="tableHeaders"
              :items="serverRows"
              :items-length="totalItems"
              :loading="loading"
              v-model:page="currentPage"
              v-model:items-per-page="pageSize"
              :items-per-page-options="pageSizes"
              @update:options="onOptionsChanged"
              :fixed-header="true"
              height="520"
            >
              <!-- Custom headers with resize handles -->
              <template #headers>
                <tr>
                  <th class="resizable-th" :style="colStyle('__idx')">
                    <div class="th-inner">
                      <span>#</span>
                      <span class="resize-handle" @mousedown.prevent="startResize('__idx', $event)"></span>
                    </div>
                  </th>

                  <th class="resizable-th" :style="colStyle('__featureKey')">
                    <div class="th-inner">
                      <span>Feature Key</span>
                      <span class="resize-handle" @mousedown.prevent="startResize('__featureKey', $event)"></span>
                    </div>
                  </th>

                  <th class="resizable-th" :style="colStyle('__actions')">
                    <div class="th-inner">
                      <span>Actions</span>
                      <span class="resize-handle" @mousedown.prevent="startResize('__actions', $event)"></span>
                    </div>
                  </th>

                  <th
                    v-for="col in columns"
                    :key="col"
                    class="resizable-th"
                    :style="colStyle(col)"
                  >
                    <div class="th-inner">
                      <span class="text-truncate">{{ col }}</span>
                      <span class="resize-handle" @mousedown.prevent="startResize(col, $event)"></span>
                    </div>
                  </th>
                </tr>
              </template>

              <!-- Custom row rendering with inline editors -->
              <template #item="{ item, index }">
                <tr>
                  <td class="text-caption" :style="colStyle('__idx')">
                    {{ (currentPage - 1) * pageSize + index + 1 }}
                  </td>

                  <td class="text-caption text-grey" :style="colStyle('__featureKey')">
                    {{ item.__featureKey }}
                  </td>

                  <td :style="colStyle('__actions')" class="pa-0">
                    <v-btn
                      icon
                      color="red"
                      variant="text"
                      size="small"
                      :disabled="loading || saving"
                      title="Hapus feature"
                      @click="() => openDeleteConfirmDialog(item)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>

                  <td v-for="col in columns" :key="col" class="pa-0" :style="colStyle(col)">
                    <v-text-field
                      :model-value="displayCellValue(item, col)"
                      @update:modelValue="(val) => onCellEdit(item, col, val)"
                      :readonly="isReadonlyCol(col)"
                      :variant="isReadonlyCol(col) ? 'plain' : 'underlined'"
                      density="compact"
                      hide-details
                    />
                  </td>
                </tr>
              </template>
            </v-data-table-server>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-text v-else class="text-caption text-grey">
      Tidak ada data feature untuk ditampilkan.
    </v-card-text>

    <DeleteConfirmDialog
      ref="deleteConfirmDialog"
      @eventFromDeleteConfirmDialog1="deleteFeatureConfirmed"
    />

  </v-card>
</template>

<script setup>
/* eslint-env vue/setup-compiler-macros */

import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import FtDatasetFeaturesService from "@/services/apiservices/ft-dataset-features-service";
import DataFilter from "@/models/payload/f-dayadukung-filter";
import DeleteConfirmDialog from "@/components/utils/DeleteConfirmDialog.vue";
const deleteConfirmDialog = ref(null);

const dialogAddCoord = ref(false);
const addCoordError = ref("");
const addCoord = ref({
  featureKey: "",
  lat: "",
  lon: "",
});

function getNextFeatureKey() {
  const rows = Array.isArray(serverRows.value) ? serverRows.value : [];
  let maxNum = 0;

  for (const r of rows) {
    const k = r && r.__featureKey != null ? String(r.__featureKey).trim() : "";
    // expect numeric keys (like 1..64). Ignore tmp_ keys.
    const n = Number.parseInt(k, 10);
    if (Number.isFinite(n)) {
      if (n > maxNum) maxNum = n;
    }
  }

  // If empty, start at 1
  return String(maxNum + 1);
}

function openAddCoordDialog() {
  addCoordError.value = "";

  const nextKey = getNextFeatureKey();

  addCoord.value = {
    featureKey: nextKey,
    lat: "",
    lon: "",
  };

  dialogAddCoord.value = true;
}

function closeAddCoordDialog() {
  dialogAddCoord.value = false;
}


function openDeleteConfirmDialog(item) {
  if (!item) return;

  const dlg = deleteConfirmDialog.value;
  if (!dlg) return console.warn("DeleteConfirmDialog ref is not ready");

  const id = item.__id ?? item.id;
  if (id == null) return console.warn("missing id", item);

  const msg = `Feature Key: ${item.__featureKey ?? ""} | ID: ${id}`;

  // ONLY call method that exists in DeleteConfirmDialog.vue
  dlg.showDialog(id, msg);
}

async function deleteFeatureConfirmed(selectedId) {
  const id = selectedId;
  const dlg = deleteConfirmDialog.value;

  if (id == null || dlg == null) {
    console.warn("deleteFeatureConfirmed: missing id", selectedId);
    return;
  }

  // IMPORTANT: do not change DeleteConfirmDialog.vue, so we call its existing method

  saving.value = true;
  loading.value = true;

  try {
    const resp = await FtDatasetFeaturesService.deleteFtDatasetFeatures(selectedId)
    if (typeof dlg.showDialog === "function" && selectedId >0 && resp) {
      dlg.setDialogState(false);
    }

    // refresh table + clear dirty state
    dirtyMap.value = {};
    await runExtendedFilter();

    emit("geoUpdated", { status: "deleted", id });
  } catch (e) {
    console.error("Failed to delete feature", id, e);
  } finally {
    saving.value = false;
    loading.value = false;
  }
}

function isValidLatLon(lat, lon) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lon < -180 || lon > 180) return false;
  return true;
}

// Strong key normalizer: removes all except a-z0-9 underscore and dot
function normKeyLoose(k) {
  // aggressive normalizer: remove everything except a-z0-9 underscore and dot
  // this handles hidden/invisible unicode chars in header keys (NBSP, LRM/RLM, word-joiner, etc.)
  return String(k ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9_.]+/g, "")
    .trim();
}



function confirmAddCoord() {
  addCoordError.value = "";

  const latNum = Number(String(addCoord.value.lat ?? "").trim());
  const lonNum = Number(String(addCoord.value.lon ?? "").trim());

  if (!isValidLatLon(latNum, lonNum)) {
    addCoordError.value = "Latitude/Longitude tidak valid.";
    return;
  }

  const fKey = String(addCoord.value.featureKey ?? "").trim();

  // Hand off creation to parent/backend; frontend no longer creates temp rows
  emit("geoUpdated", {
    status: "addCoord",
    featureKey: fKey,
    lat: latNum,
    lon: lonNum,
    geom: `POINT (${lonNum} ${latNum})`,
  });

  dialogAddCoord.value = false;
}

const props = defineProps({
  ftDataset: { type: Object, required: false },
  columns: { type: Array, default: () => [] },
});

const emit = defineEmits(["geoUpdated"]);

const search = ref("");
const currentPage = ref(1);
const pageSize = ref(15);
const pageSizes = ref([8, 15, 20]);

const loading = ref(false);
const saving = ref(false);
const serverRows = ref([]);
const totalItems = ref(0);

const showGeomCol = ref(false);
const showCentroidCol = ref(false);
const coordDeriveSource = ref("centroid");

const isCoordinateDataset = computed(() => {
  const dsType = String(props?.ftDataset?.datasetType ?? props?.ftDataset?.type ?? "").toLowerCase();
  if (dsType) {
    if (dsType.includes("point") || dsType.includes("coordinate") || dsType.includes("koordinat")) return true;
  }

  // fallback: detect by columns/keys containing lat+lon
  const incoming = Array.isArray(props.columns) ? props.columns : [];
  const first = Array.isArray(serverRows.value) && serverRows.value.length ? serverRows.value[0] : null;

  const keys = [
    ...incoming,
    ...(first && typeof first === "object" ? Object.keys(first) : []),
  ]
      .filter(Boolean)
      .map((k) => String(k).trim().toLowerCase())
      .filter((k) => k && !k.startsWith("__"));

  const latKeys = new Set(["lat", "latitude", "lattitude"]);
  const lonKeys = new Set(["lon", "lng", "longitude", "long"]);

  const hasLat = keys.some((k) => latKeys.has(k));
  const hasLon = keys.some((k) => lonKeys.has(k));
  return hasLat && hasLon;
});

// Dirty tracking: { [__id]: { id, ftDatasetBean, featureKey, props } }
const dirtyMap = ref({});
const dirtyCount = computed(() => Object.keys(dirtyMap.value || {}).length);
const hasDirty = computed(() => dirtyCount.value > 0);

watch(
    () => dirtyCount.value,
    (n) => {
      // Parent dialog biasanya enable Save & Close berdasarkan event ini
      emit("geoUpdated", { status: "dirty", dirty: n > 0, dirtyCount: n });
    }
);

// Column widths for resizing
const colWidths = ref({
  __idx: 60,
  __featureKey: 140,
  __actions: 90,
});

const resizing = ref({
  active: false,
  key: null,
  startX: 0,
  startW: 0,
});

function searchOnEnter(e) {
  const next = String(e?.target?.value ?? search.value ?? "").trim();
  currentPage.value = 1;
  search.value = next;
  runExtendedFilter();
}

function ensureColWidth(key) {
  if (!key) return;
  if (colWidths.value[key] == null) {
    colWidths.value[key] = 180;
  }
}

function colStyle(key) {
  ensureColWidth(key);
  const w = Number(colWidths.value[key] || 180);
  return {
    width: `${w}px`,
    minWidth: `${w}px`,
    maxWidth: `${w}px`,
  };
}

function startResize(key, e) {
  ensureColWidth(key);
  resizing.value = {
    active: true,
    key,
    startX: e.clientX,
    startW: Number(colWidths.value[key] || 180),
  };
  window.addEventListener("mousemove", onResizeMove);
  window.addEventListener("mouseup", stopResize);
}

function onResizeMove(e) {
  if (!resizing.value.active || !resizing.value.key) return;
  const dx = e.clientX - resizing.value.startX;
  const next = Math.max(80, resizing.value.startW + dx);
  colWidths.value[resizing.value.key] = next;
}

function stopResize() {
  if (!resizing.value.active) return;
  resizing.value.active = false;
  resizing.value.key = null;
  window.removeEventListener("mousemove", onResizeMove);
  window.removeEventListener("mouseup", stopResize);
}

onBeforeUnmount(() => {
  // safety cleanup
  window.removeEventListener("mousemove", onResizeMove);
  window.removeEventListener("mouseup", stopResize);
});

const autoColumns = computed(() => {
  const incoming = Array.isArray(props.columns) ? props.columns.filter(Boolean) : [];
  const first = Array.isArray(serverRows.value) && serverRows.value.length ? serverRows.value[0] : null;

  const allKeys = first && typeof first === "object"
      ? Object.keys(first).filter((k) => k && !k.startsWith("__"))
      : [];

  // If geom/centroid toggles are OFF, don't auto-include those keys from data
  const fromData = allKeys.filter((k) => {
    const low = String(k).toLowerCase();
    if (!showGeomCol.value && low === "geom") return false;
    if (!showCentroidCol.value && low === "centroid") return false;
    return true;
  });

  const merged = [];
  const seen = new Set();
  const pushUniq = (c) => {
    const raw = String(c ?? "");
    const norm = raw.trim();
    if (!norm) return;

    // de-dupe by trimmed lowercase, but KEEP original raw key in the merged list
    const low = norm.toLowerCase();
    if (seen.has(low)) return;
    seen.add(low);

    merged.push(raw);
  };

  incoming.forEach(pushUniq);
  fromData.forEach(pushUniq);

  // Force lat/lon columns when coordinate dataset
  if (isCoordinateDataset.value) {
    pushUniq("lat");
    pushUniq("lon");
  }

  // Explicitly add geom/centroid when toggled
  if (showGeomCol.value) pushUniq("geom");
  if (showCentroidCol.value) pushUniq("centroid");

  merged.forEach((c) => ensureColWidth(c));
  return merged;
});

const columns = computed(() => autoColumns.value);

const tableHeaders = computed(() => {
  return [
    { title: "#", key: "__idx", sortable: false, width: colWidths.value.__idx || 60 },
    { title: "Feature Key", key: "__featureKey", sortable: false, width: colWidths.value.__featureKey || 140 },
    { title: "Actions", key: "__actions", sortable: false, width: colWidths.value.__actions || 90 },
    ...columns.value.map((c) => ({ title: c, key: c, sortable: false, width: colWidths.value[c] || 180 })),
  ];
});

function isReadonlyCol(col) {
  const low = normKeyLoose(col);
  return (
      low === "geom" ||
      low === "centroid" ||
      low === "feature_id" ||
      low === "featureid" ||
      low === "geometry_type" ||
      low === "geometrytype"
  );
}

function displayCellValue(item, col) {
  return item ? item[col] : "";
}

// --- Helpers for normalizing props before sending to backend ---
function normalizePropsForBackend(p) {
  // Backend expects `props` as String (JSON) based on entity mapping.
  // We keep UI editing as object, but convert at save-time.
  if (p == null) return "{}";
  if (typeof p === "string") return p;
  try {
    return JSON.stringify(p);
  } catch (e) {
    console.error("Failed to stringify props", e);
    return "{}";
  }
}

function normalizeUpdatePayload(upd) {
  const safe = upd && typeof upd === "object" ? upd : {};
  const payload = {
    id: safe.id,
    ftDatasetBean: safe.ftDatasetBean,
    featureKey: safe.featureKey,
    props: normalizePropsForBackend(safe.props),
  };

  if (safe.geom != null && String(safe.geom).trim()) {
    payload.geom = String(safe.geom).trim();
  }

  return payload;
}

function normalizeFeatures(rawItems) {
  const items = Array.isArray(rawItems) ? rawItems : [];

  const toPropsObject = (p) => {
    if (p == null) return {};
    if (typeof p === "object") return p;
    if (typeof p === "string") {
      const s = p.trim();
      if (!s) return {};
      try {
        const parsed = JSON.parse(s);
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch (e) {
        console.error("Failed to parse props JSON string", e);
        return {};
      }
    }
    return {};
  };

  const parsePointWkt = (wkt) => {
    if (!wkt || typeof wkt !== "string") return null;
    const s = wkt.trim();
    if (!s) return null;

    // Strip optional SRID prefix: SRID=4326;POINT(x y)
    const noSrid = s.includes(";") ? s.split(";").slice(-1)[0].trim() : s;

    // Match POINT (x y) or POINT(x y)
    const m = noSrid.match(/POINT\s*\(\s*([+-]?(?:\d+\.?\d*|\d*\.?\d+))\s+([+-]?(?:\d+\.?\d*|\d*\.?\d+))\s*\)/i);
    if (!m) return null;

    const lon = Number(m[1]);
    const lat = Number(m[2]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

    return { lat, lon };
  };

  const hasLat = (o) => o && (o.lat != null || o.latitude != null || o.lattitude != null);
  const hasLon = (o) => o && (o.lon != null || o.lng != null || o.longitude != null || o.long != null);

  return items.map((it) => {
    const baseProps = toPropsObject(it?.props);

    // Create an alias map that also exposes trimmed-key variants
    const propsObj = { ...baseProps };
    try {
      for (const [k, v] of Object.entries(baseProps || {})) {
        const kt = String(k ?? "").trim();
        if (!kt) continue;
        // Only add alias if it doesn't already exist
        if (!(kt in propsObj)) propsObj[kt] = v;
      }
    } catch (e) {
      console.error("Failed to alias props keys", e);
    }

    // Derive lat/lon if missing (from centroid/geom WKT)
    if (!(hasLat(propsObj) && hasLon(propsObj))) {
      const fromCentroid = parsePointWkt(it?.centroid);
      const fromGeom = parsePointWkt(it?.geom);

      const derived = coordDeriveSource.value === "geom"
        ? (fromGeom || fromCentroid)
        : (fromCentroid || fromGeom);

      if (derived) {
        if (propsObj.lat == null) propsObj.lat = derived.lat;
        if (propsObj.lon == null) propsObj.lon = derived.lon;
      }
    }

    // Expose geom/centroid WKT as columns (for menu toggles)
    if (it?.geom != null) propsObj.geom = it.geom;
    if (it?.centroid != null) propsObj.centroid = it.centroid;

    return {
      __id: it?.id,
      __featureKey: it?.featureKey,
      ...propsObj,
    };
  });
}


function onCellEdit(row, col, val) {
  if (!row || !col) return;

  // update UI
  row[col] = val;
  // UI-only preview for Point geometry when lat/lon edited
  if (showGeomCol.value) {
    const low = String(col).toLowerCase();
    const isLat = low === "lat" || low === "latitude" || low === "lattitude";
    const isLon = low === "lon" || low === "lng" || low === "longitude" || low === "long";

    if (isLat || isLon) {
      const latRaw = row.lat ?? row.latitude ?? row.lattitude;
      const lonRaw = row.lon ?? row.lng ?? row.longitude ?? row.long;

      const latNum = Number(String(latRaw ?? "").trim());
      const lonNum = Number(String(lonRaw ?? "").trim());

      if (Number.isFinite(latNum) && Number.isFinite(lonNum)) {
        row.geom = `POINT (${lonNum} ${latNum})`;
      }
      // also keep dirty payload geom in sync when lat/lon changes
      const rid = row.__id;
      if (rid != null && dirtyMap.value && dirtyMap.value[rid]) {
        dirtyMap.value[rid].geom = row.geom;
      }

    }
  }

  // don't track readonly/system columns to backend props
  if (isReadonlyCol(col)) {
    return;
  }
  const id = row.__id;
  if (id == null) return;

  const datasetId = props.ftDataset && props.ftDataset.id != null ? Number(props.ftDataset.id) : null;

  // base payload if already dirty
  const base = dirtyMap.value && dirtyMap.value[id] ? dirtyMap.value[id] : null;

  const payload = base
    ? base
    : {
        id: row.__id,
        ftDatasetBean: datasetId,
        featureKey: String(row.__featureKey ?? ""),
        props: {},
      };

  // first edit: snapshot current props
  if (!base) {
    const snap = {};
    for (const c of columns.value) {
      snap[c] = row[c];
    }
    payload.props = snap;
  }

  payload.props = payload.props && typeof payload.props === "object" ? payload.props : {};
  payload.props[col] = val;

  dirtyMap.value = {
    ...(dirtyMap.value || {}),
    [id]: payload,
  };
}

async function runExtendedFilter() {
  const datasetId = props.ftDataset && props.ftDataset.id != null ? Number(props.ftDataset.id) : 0;
  if (!datasetId) {
    serverRows.value = [];
    totalItems.value = 0;
    dirtyMap.value = {};
    return;
  }

  const extendedFilter = new DataFilter();
  extendedFilter.datasetIds = [datasetId];
  extendedFilter.pageNo = currentPage.value;
  extendedFilter.pageSize = pageSize.value;
  extendedFilter.sortBy = "id";
  extendedFilter.order = "DESC";
  extendedFilter.search = search.value;

  loading.value = true;
  try {
    // DO NOT CHANGE THIS LINE (user requirement)
    const response = await FtDatasetFeaturesService.getPostAllFtDatasetContainingExt(extendedFilter);
    const data = response?.data || {};

    const items = Array.isArray(data.items) ? data.items : [];
    serverRows.value = normalizeFeatures(items);
    totalItems.value = Number(data.totalItems || 0);

    // reset dirty on reload to avoid stale saves
    dirtyMap.value = {};
  } catch (e) {
    console.error(e);
    serverRows.value = [];
    totalItems.value = 0;
    dirtyMap.value = {};
  } finally {
    loading.value = false;
  }
}

function onOptionsChanged(options) {
  if (options && Number.isFinite(Number(options.page))) currentPage.value = Number(options.page);
  if (options && Number.isFinite(Number(options.itemsPerPage))) pageSize.value = Number(options.itemsPerPage);
  runExtendedFilter();
}

async function cancelChanges() {
  // discard all unsaved edits
  try {
    dialogAddCoord.value = false;
    addCoordError.value = "";
    dirtyMap.value = {};
    await runExtendedFilter();
  } catch (e) {
    console.error(e);
    // even if reload fails, at least clear dirty state
    dirtyMap.value = {};
  }
}


async function saveChanges() {
  if (!hasDirty.value) return;

  const allUpdates = Object.values(dirtyMap.value || {});
  const updates = allUpdates.filter(Boolean);
  if (!updates.length) return;

  saving.value = true;
  loading.value = true;

  try {
    // Save sequentially to keep request load reasonable and make debugging easier.
    for (const upd of updates) {
      const payload = normalizeUpdatePayload(upd);

      try {
        await FtDatasetFeaturesService.updateFtDatasetFeatures(payload);
        emit("geoUpdated", { status: "ok", id: payload.id });
      } catch (err) {
        console.error("Error updating feature:", payload.id, err);
        // keep going
      }
    }

    // after successful save attempt, refresh and clear dirty
    dirtyMap.value = {};
    await runExtendedFilter();
  } catch (e) {
    console.error(e);
  } finally {
    saving.value = false;
    loading.value = false;
  }
}


onMounted(() => {
  runExtendedFilter();
});

watch(
  () => props.ftDataset && props.ftDataset.id,
  () => {
    currentPage.value = 1;
    runExtendedFilter();
  }
);
</script>

<style scoped>
.feature-table-scroll {
  overflow: auto;
}

.resizable-th {
  position: relative;
  padding: 0 !important;
  vertical-align: middle;
  background: white;
}

.th-inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  user-select: none;
}

.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 10px;
  cursor: col-resize;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  max-width: calc(100% - 12px);
}

.ga-2 {
  gap: 8px;
}
</style>