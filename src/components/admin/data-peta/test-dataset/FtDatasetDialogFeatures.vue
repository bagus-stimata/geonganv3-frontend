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
        <span v-if="hasDirty" class="text-caption text-grey">
          {{ dirtyCount }} changed
        </span>
      </v-col>

      <v-col cols="12" sm="12" md="6">
        <v-text-field
          v-model="search"
          label="Search"
          hint="press ⏎ to search"
          @keyup.enter="searchOnEnter($event)"
        />
      </v-col>
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

                  <td v-for="col in columns" :key="col" class="pa-0" :style="colStyle(col)">
                    <v-text-field
                      :model-value="item[col]"
                      @update:modelValue="(val) => onCellEdit(item, col, val)"
                      variant="underlined"
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
  </v-card>
</template>

<script setup>
/* eslint-env vue/setup-compiler-macros */

import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import FtDatasetFeaturesService from "@/services/apiservices/ft-dataset-features-service";
import DataFilter from "@/models/payload/f-dayadukung-filter";

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

// Dirty tracking: { [__id]: { id, ftDatasetBean, featureKey, props } }
const dirtyMap = ref({});
const dirtyCount = computed(() => Object.keys(dirtyMap.value || {}).length);
const hasDirty = computed(() => dirtyCount.value > 0);

// Column widths for resizing
const colWidths = ref({
  __idx: 60,
  __featureKey: 140,
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
  if (incoming.length) {
    incoming.forEach((c) => ensureColWidth(c));
    return incoming;
  }

  const first = Array.isArray(serverRows.value) && serverRows.value.length ? serverRows.value[0] : null;
  if (!first) return [];

  const cols = Object.keys(first).filter((k) => k && !k.startsWith("__"));
  cols.forEach((c) => ensureColWidth(c));
  return cols;
});

const columns = computed(() => autoColumns.value);

const tableHeaders = computed(() => {
  return [
    { title: "#", key: "__idx", sortable: false, width: colWidths.value.__idx || 60 },
    { title: "Feature Key", key: "__featureKey", sortable: false, width: colWidths.value.__featureKey || 140 },
    ...columns.value.map((c) => ({ title: c, key: c, sortable: false, width: colWidths.value[c] || 180 })),
  ];
});

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
  return {
    id: safe.id,
    ftDatasetBean: safe.ftDatasetBean,
    featureKey: safe.featureKey,
    // force props to string JSON
    props: normalizePropsForBackend(safe.props),
  };
}

function normalizeFeatures(rawItems) {
  const items = Array.isArray(rawItems) ? rawItems : [];
  return items.map((it) => {
    const propsObj = it && typeof it.props === "object" && it.props != null ? it.props : {};
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

async function saveChanges() {
  if (!hasDirty.value) return;

  const updates = Object.values(dirtyMap.value || {});
  if (!updates.length) return;

  saving.value = true;
  loading.value = true;

  try {
    // Save sequentially to keep request load reasonable and make debugging easier.
    for (const upd of updates) {
      const payload = normalizeUpdatePayload(upd);

      try {
        await FtDatasetFeaturesService.updateFtDatasetFeatures(payload);
        // const res = await FtDatasetFeaturesService.updateFtDatasetFeatures(payload);
        // console.log("Updated feature:", payload.id, res?.data?.data || res?.data || {});
        // notify parent so it can refresh map/table if needed
        emit("geoUpdated", { status: "ok", id: payload.id });

      } catch (err) {
        console.error("Error updating feature:", payload.id, err);
        // keep going for other rows
      }
    }

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