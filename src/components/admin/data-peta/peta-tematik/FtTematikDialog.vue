<template>
  <div>
    <v-dialog
        v-model="dialogShow"
        :max-width="formDialogOptions.width"
        :style="{ zIndex: formDialogOptions.zIndex }"
        @keydown.esc.prevent="closeForm"
        persistent
        fullscreen
        :hide-overlay="$vuetify.display.smAndDown"
    >
      <v-card>
        <v-form v-model="valid" ref="form">
          <v-toolbar class="color-bg-second text-white" density="compact">
            <v-btn icon dark @click="closeForm">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>

            <v-toolbar-title class="text-subtitle-2">
              {{ title }}
              <span v-if="formMode === 'EDIT_FORM'" class="text-caption ml-1">
                <v-icon color="orange" size="small">mdi-pencil</v-icon>
              </span>
              <span v-if="formMode === 'NEW_FORM'" class="text-caption ml-1">
                <v-icon color="success" size="small">mdi-plus-circle</v-icon>
              </span>
            </v-toolbar-title>

            <v-spacer />

            <v-toolbar-items>
              <v-btn
                  dark
                  variant="text"
                  @click="applyChanges"
                  :disabled="!valid || isItemModified === false"
                  class="hidden-md-and-up"
                  style="text-transform:none;"
              >
                Apply
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>

          <!-- MASTER -->
          <v-card-title>
            <v-container class="pa-4">
              <v-row>
                <!-- Avatar / Image -->
                <v-col cols="12" sm="12" md="5">
                  <v-container class="pa-2 text-center">
                    <v-row align="center" justify="center">
                      <v-hover>
                        <template #default="{ isHovering, props }">
                          <v-card
                              v-bind="props"
                              class="align-self-center"
                              :elevation="isHovering ? 10 : 1"
                              :class="[
                              { 'on-hover': isHovering },
                              isHovering ? 'card-hover-opacity' : 'card-not-hover-opacity'
                            ]"
                          >
                            <v-img
                                :lazy-src="lookupImageUrlLazy(itemModified)"
                                :src="lookupImageUrl(itemModified)"
                                min-width="320"
                                min-height="320"
                                cover
                            >
                              <v-row class="fill-height flex-column" justify="space-between">
                                <v-spacer />
                                <div class="align-self-center">
                                  <v-btn
                                      :class="{ 'show-btns': isHovering }"
                                      :color="transparent"
                                      icon
                                      size="large"
                                      dark
                                      variant="outlined"
                                      @click="showDialogUpload"
                                  >
                                    <v-icon
                                        :class="{ 'show-btns': isHovering }"
                                        :color="transparent"
                                        size="large"
                                    >
                                      mdi-upload
                                    </v-icon>
                                  </v-btn>
                                </div>
                              </v-row>
                            </v-img>
                          </v-card>
                        </template>
                      </v-hover>
                    </v-row>
                  </v-container>
                </v-col>

                <!-- Fields -->
                <v-col cols="12" sm="12" md="7">
                  <v-row no-gutters>
                    <v-col cols="12" sm="12" md="6">
                      <v-text-field
                          v-model="itemModified.kode1"
                          label="Kode"
                          :rules="rulesNotEmpty"
                          variant="outlined"
                          density="compact"
                          class="mr-2"
                      />
                    </v-col>

                    <v-col cols="12" sm="12" md="6" class="align-center flex-column">
                      <v-switch
                          v-model="itemModified.statusActive"
                          :label="itemModified.statusActive ? 'Aktif' : 'Non-Aktif'"
                          class="pa-3"
                          density="compact"
                          hide-details
                          color="primary"
                      />
                    </v-col>
                  </v-row>

                  <v-row no-gutters>
                    <v-col cols="12">
                      <v-text-field
                          v-model="itemModified.description"
                          :rules="rulesNotEmpty"
                          label="Judul Tematik"
                          variant="outlined"
                          density="compact"
                      />
                    </v-col>
                  </v-row>

                  <v-row no-gutters>
                    <v-col cols="12">
                      <v-textarea
                          rows="3"
                          auto-grow
                          v-model="itemModified.notes"
                          label="Keterangan"
                          variant="outlined"
                          density="compact"
                      />
                    </v-col>
                  </v-row>

                  <v-row no-gutters>
                    <v-col cols="12">
                      <v-text-field
                          v-model="itemModified.categ"
                          label="Kategori"
                          placeholder="Mis. Administrasi / RDTR / Infrastruktur / Utilitas"
                          variant="outlined"
                          density="compact"
                      />
                    </v-col>
                  </v-row>

                  <v-row no-gutters>
                    <v-col cols="12">
                      <v-autocomplete
                          v-model="itemModified.fdivisionBean"
                          :items="itemsFDivision"
                          :rules="rulesNotEmpty"
                          item-value="id"
                          item-title="description"
                          auto-select-first
                          small-chips
                          deletable-chips
                          color="blue-grey-lighten-2"
                          label="Produsen Data"
                          persistent-hint
                          variant="outlined"
                          density="compact"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-container>
          </v-card-title>

          <v-divider />

          <!-- DETAIL: FtTematikDataset -->
          <v-card-text>
            <div class="d-flex align-center">
              <div class="text-subtitle-2 font-weight-bold">Dataset Terkait</div>
              <v-spacer />
              <v-chip
                  size="small"
                  variant="outlined"
                  color="primary"
                  v-if="itemModified.id && itemModified.id > 0"
              >
                Tematik ID: {{ itemModified.id }}
              </v-chip>
            </div>

            <div class="text-caption mt-1">
              Untuk menambah detail, Tematik harus <span class="font-weight-bold">sudah tersimpan</span>.
            </div>

            <v-row class="mt-2" no-gutters>
              <v-col cols="12" md="4">
                <v-btn
                  color="primary"
                  variant="flat"
                  block
                  class="rounded-lg"
                  style="text-transform:none;"
                  :disabled="!(itemModified.id && itemModified.id > 0)"
                  @click="openPickDatasetDialog"
                >
                  Pilih Dataset
                </v-btn>
              </v-col>
            </v-row>


            <v-table density="compact" class="mt-3">
              <thead>
              <tr>
                <th style="width: 56px;">#</th>
                <th>Dataset</th>
                <th style="width: 140px;">Aksi</th>
              </tr>
              </thead>
              <tbody>
              <tr v-if="!listFtTematikDataset || !listFtTematikDataset.length">
                <td colspan="3" class="text-caption text-grey pa-3">
                  Belum ada dataset terkait.
                </td>
              </tr>

              <tr v-for="(row, idx) in listFtTematikDataset" :key="row.id || idx">
                <td>{{ idx + 1 }}</td>
                <td>
                  <div class="text-subtitle-2 font-weight-bold">
                    {{ lookupDatasetName(row.ftDatasetBean) }}
                  </div>
                  <div class="text-caption font-weight-light" v-if="row.ftDatasetBean">
                    *ID: {{ row.ftDatasetBean }}
                  </div>
                </td>
                <td>
                  <v-btn
                      icon
                      density="comfortable"
                      variant="text"
                      color="red"
                      :disabled="!(row.id && row.id > 0)"
                      @click="deleteDatasetRelation(row)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
              </tbody>
            </v-table>
          </v-card-text>

          <v-divider />

          <!-- FOOTER -->
          <v-card-actions class="bg-amber-lighten-4">
            <v-chip
                class="ml-4"
                color="error"
                variant="outlined"
                close
                size="small"
                v-show="formDialogOptions.errorMessage"
                @click:close="formDialogOptions.errorMessage = ''"
            >
              {{ formDialogOptions.errorMessage }}
            </v-chip>

            <v-spacer />

            <v-btn
                color="red-darken-1"
                variant="outlined"
                @click="closeForm"
                :disabled="isItemModified === false"
                class="hidden-sm-and-down"
                style="text-transform:none;"
            >
              Batal
            </v-btn>

            <v-btn
                color="blue-darken-1"
                variant="outlined"
                @click="applyChanges"
                :disabled="!valid || isItemModified === false"
                class="hidden-sm-and-down mr-2"
                style="text-transform:none;"
            >
              Apply
            </v-btn>

            <v-btn
                color="blue-darken-1"
                variant="flat"
                @click="saveAndClose"
                :disabled="!valid || isItemModified === false"
                class="hidden-sm-and-down mr-4"
                style="text-transform:none;"
            >
              Save & Close
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>

      <CloseConfirmDialog
          ref="refCloseConfirmDialog"
          @eventFromCloseConfirm="passingEventFromCloseConfirm"
      />

      <UploadImageDialog
          ref="refUploadDialog"
          @eventUploadSuccess="completeUploadSuccess"
      />

      <v-dialog v-model="dialogLoading" hide-overlay persistent width="300">
        <v-card color="primary" dark>
          <v-card-text>
            Please Wait...
            <v-progress-linear indeterminate color="white" class="mb-0" />
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="snackbar">
        {{ snackBarMessage }}
        <template #actions="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar = false"> Close </v-btn>
        </template>
      </v-snackbar>
    </v-dialog>

    <v-dialog
      v-model="dialogPickupMapsetShow"
      :max-width="formDialogOptions.width"
      :style="{ zIndex: formDialogOptions.zIndex }"
      @keydown.esc.prevent="closeDialogPickDataset"
      persistent
      :class="$vuetify.display.smAndDown ? '' : 'overflow-hidden'"
      :hide-overlay="$vuetify.display.smAndDown"
    >
      <v-card
        class="rounded-lg d-flex flex-column"
        :class="$vuetify.display.smAndDown ? '' : 'overflow-hidden'"
        style="height: 85vh;"
      >
        <v-toolbar class="bg-white py-2 px-2" density="compact">
          <v-toolbar-title class="font-weight-bold text-subtitle-1">Katalog Mapset</v-toolbar-title>
          <v-spacer />
          <v-toolbar-items>
            <v-btn icon @click="closeDialogPickDataset">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-divider class="mx-4" />

        <!-- IMPORTANT: min-height:0 biar flex children bisa scroll dengan benar -->
        <v-card-text class="pa-4 d-flex flex-column" style="flex: 1; min-height: 0;">
          <v-row no-gutters class="ga-3 flex-grow-1" style="min-height: 0;">
            <!-- LEFT: Katalog -->
            <v-col
              cols="12"
              md="5"
              class="order-1 order-md-1 d-flex flex-column"
              style="min-height: 0;"
            >
              <div class="flex-grow-0">
                <v-text-field
                  v-model="search"
                  prepend-inner-icon="mdi-magnify"
                  density="compact"
                  label="Cari data pada mapset"
                  hide-details
                  class="rounded-lg text-caption"
                  variant="outlined"
                  @keyup.enter="runExtendedFilter"
                >
                  <template #append-inner>
                    <div class="d-flex flex-row align-center">
                      <v-divider vertical />
                      <v-btn
                        @click="runExtendedFilter"
                        class="font-weight-bold text-white"
                        variant="flat"
                        size="small"
                      >
                        Search
                      </v-btn>
                    </div>
                  </template>
                </v-text-field>
              </div>

              <!-- List container: flex-grow + min-height:0 => overflow works -->
              <v-card
                elevation="0"
                class="mt-3 px-1 flex-grow-1 overflow-y-auto"
                style="min-height: 0;"
              >
                <v-row v-if="ftDatasetsFiltered.length === 0">
                  <v-col>
                    <div class="text-center text-grey my-3 text-subtitle-2">Dataset not found</div>
                  </v-col>
                </v-row>

                <v-row v-else no-gutters class="ga-2">
                  <v-col cols="12" v-for="dataset in ftDatasetsFiltered" :key="dataset.id">
                    <v-card
                      :class="isDatasetSelected(dataset.id) ? 'border-activated' : ''"
                      elevation="0"
                      class="pa-2 border-thin border-opacity-25 rounded-lg"
                      width="100%"
                      @click="toggleDatasetSelection(dataset)"
                      style="cursor: pointer;"
                    >
                      <v-row no-gutters class="align-center">
                        <v-col cols="3" class="pe-2">
                          <v-img
                            width="100%"
                            height="68"
                            class="rounded"
                            cover
                            :src="lookupImageUrlLazy(dataset)"
                          />
                        </v-col>

                        <v-col cols="9">
                          <div class="d-flex align-center">
                            <div class="flex-grow-1">
                              <div class="text-caption font-weight-bold text-indigo text-truncate">
                                {{ dataset.description }}
                              </div>
                              <div
                                style="font-size: 11px !important"
                                class="text-caption font-weight-light text-grey-darken-4 text-truncate"
                              >
                                {{ dataset.notes }} - {{ dataset.tahun }}
                              </div>
                            </div>

                            <v-checkbox-btn
                              class="ms-2"
                              :color="isDatasetSelected(dataset.id) ? 'orange' : ''"
                              :model-value="isDatasetSelected(dataset.id)"
                              @click.stop
                              @update:model-value="(val) => toggleDatasetSelection(dataset, val)"
                            />
                          </div>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>

            <!-- RIGHT: Selected -->
            <v-col
              cols="12"
              md="7"
              class="order-2 order-md-2 d-flex flex-column"
              style="min-height: 0;"
            >
              <div class="d-flex align-center flex-grow-0">
                <div class="text-subtitle-2 font-weight-bold">Mapset Terpilih</div>
                <v-spacer />
                <v-chip
                  size="small"
                  variant="outlined"
                  color="primary"
                  v-if="itemsMapsetSelected && itemsMapsetSelected.length"
                >
                  {{ itemsMapsetSelected.length }} item
                </v-chip>
              </div>

              <div class="text-caption text-grey mt-1 flex-grow-0">
                Klik item di kiri untuk select/unselect. Drag handle siap kalo nanti mau reorder.
              </div>

              <v-card
                elevation="0"
                class="mt-3 flex-grow-1 overflow-y-auto border-thin border-opacity-25 rounded-lg"
                style="min-height: 0;"
              >
                <v-row v-if="!itemsMapsetSelected || itemsMapsetSelected.length === 0" class="pa-4">
                  <v-col>
                    <div class="text-center text-grey text-subtitle-2">Belum ada yang dipilih</div>
                  </v-col>
                </v-row>

                <v-row v-else no-gutters class="ga-2 pa-2">
                  <v-col cols="12" v-for="(itemSelected, index) in itemsMapsetSelected" :key="itemSelected.id">
                    <v-card
                      elevation="0"
                      class="d-flex rounded-lg flex-row align-center pa-2 border-thin border-opacity-25"
                    >
                      <v-icon size="small" class="me-2" color="grey">mdi-dots-vertical</v-icon>
                      <span class="bg-orange rounded-lg py-1 px-3 text-caption font-weight-bold text-white">
                        {{ index + 1 }}
                      </span>
                      <div class="ms-3">
                        <div class="text-subtitle-2 font-weight-bold text-indigo text-truncate" style="max-width: 42vw;">
                          {{ itemSelected.description }}
                        </div>
                        <div class="text-caption text-grey-darken-1 text-truncate" style="max-width: 42vw;">
                          {{ itemSelected.notes }}
                        </div>
                      </div>
                      <v-spacer />
                      <v-btn
                        icon
                        density="comfortable"
                        variant="text"
                        color="red"
                        @click.stop="toggleDatasetSelection(itemSelected, false)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>

              <div class="d-flex justify-end mt-3 flex-grow-0">
                <v-btn
                  variant="outlined"
                  color="red"
                  class="me-2"
                  style="text-transform:none;"
                  :disabled="!itemsMapsetSelected || itemsMapsetSelected.length === 0"
                  @click="itemsMapsetSelected = []"
                >
                  Hapus semua
                </v-btn>

                <v-btn
                  variant="flat"
                  color="primary"
                  style="text-transform:none;"
                  :disabled="!itemsMapsetSelected || itemsMapsetSelected.length === 0"
                  @click="closeDialogPickDataset"
                >
                  Selesai
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import FtTematikService from "@/services/apiservices/ft-tematik-service";
import FtTematikDatasetService from "@/services/apiservices/ft-tematik-dataset-service";
import FileService from "@/services/apiservices/file-service";

import CloseConfirmDialog from "@/components/utils/CloseConfirmDialog";
import UploadImageDialog from "@/components/utils/UploadImageDialog";
import FormMode from "@/models/form-mode";

import FtTematik from "@/models/ft-tematik";
import FtTematikDataset from "@/models/ft-tematik-dataset";
import DataFilter from "@/models/payload/f-dayadukung-filter";
import FtDatasetService from "@/services/apiservices/ft-dataset-service";

export default {
  components: {
    CloseConfirmDialog,
    UploadImageDialog,
  },
  props: {
    formMode: String,
    itemsFDivision: { type: Array, default: () => [] },
    itemsFtDataset: { type: Array, default: () => [] }, // pass from parent
  },
  data() {
    return {
      title: "Tematik Peta",
      dialogShow: false,
      dialogPickupMapsetShow: false,

      snackbar: false,
      snackBarMessage: "",

      dialogLoading: false,

      formDialogOptions: {
        errorMessage: "",
        width: 900,
        zIndex: 200,
      },

      valid: false,
      rulesNotEmpty: [(v) => !!v || "Tidak boleh kosong"],

      transparent: "rgba(255, 255, 255, 0)",

      selectedIndex: -1,
      itemDefault: null,
      itemModified: new FtTematik(),

      listFtTematikDataset: [],

      // Pick Dataset dialog state
      dialogPickDataset: false,
      pickDatasetSearch: "",
      itemsDatasetPicked: [],

      // Katalog Mapset state (dipakai dialog kedua)
      ftDatasets: [],
      itemsMapsetSelected: [],
      currentPage: 1,
      pageSize: 20,
      totalPaginationPages: 0,
      totalItems: 0,
      isActiveDeepSearch: false,
      search: "",
    };
  },
  computed: {
    isItemModified() {
      const a = JSON.stringify(this.itemDefault || {});
      const b = JSON.stringify(this.itemModified || {});
      return a !== b;
    },
    ftDatasetsFiltered() {
      return this.ftDatasets;
    },

    pickedDatasetsLabel() {
      if (!this.itemsDatasetPicked || !this.itemsDatasetPicked.length) return "Klik untuk memilih dataset";
      const names = this.itemsDatasetPicked
        .slice(0, 3)
        .map((x) => x?.description || x?.kode1 || `#${x?.id}`)
        .filter(Boolean);
      const more = this.itemsDatasetPicked.length - names.length;
      return more > 0 ? `${names.join(", ")} (+${more} lagi)` : names.join(", ");
    },

    filteredDatasets() {
      const list = Array.isArray(this.itemsFtDataset) ? this.itemsFtDataset : [];
      const q = (this.pickDatasetSearch || "").toLowerCase().trim();
      if (!q) return list;
      return list.filter((x) => {
        const id = String(x?.id ?? "");
        const kode1 = String(x?.kode1 ?? "").toLowerCase();
        const desc = String(x?.description ?? "").toLowerCase();
        return id.includes(q) || kode1.includes(q) || desc.includes(q);
      });
    },
  },
  methods: {
    // Public API for parent
    async showDialog(selectedIndex, item) {
      this.dialogShow = true;
      this.formDialogOptions.errorMessage = "";
      this.selectedIndex = selectedIndex;

      if (selectedIndex > -1 && item && item.id) {
        await this.initializeEditMode(item.id);
      } else {
        this.initializeNewMode();
      }
    },

    initializeNewMode() {
      this.itemModified = new FtTematik();
      this.itemDefault = JSON.parse(JSON.stringify(this.itemModified));
      this.listFtTematikDataset = [];
    },

    async initializeEditMode(id) {
      try {
        this.dialogLoading = true;

        const resp = await FtTematikService.getFtTematikById(id, false);
        const incoming = resp?.data || {};

        this.itemModified = new FtTematik(
            incoming.id ?? 0,
            incoming.kode1 ?? "",
            incoming.description ?? "",
            incoming.avatarImage ?? "",
            incoming.notes ?? "",
            incoming.categ ?? "",
            incoming.fdivisionBean ?? 0,
            incoming.statusActive ?? true,
            incoming.created ? new Date(incoming.created) : new Date(),
            incoming.modified ? new Date(incoming.modified) : new Date(),
            incoming.modifiedBy ?? ""
        );

        this.itemDefault = JSON.parse(JSON.stringify(this.itemModified));
        await this.reloadDetails();
      } catch (e) {
        console.error(e);
        this.formDialogOptions.errorMessage = "Gagal memuat data Tematik";
      } finally {
        this.dialogLoading = false;
      }
    },

    closeForm() {
      if (!this.isItemModified) {
        this.dialogShow = false;
        this.$emit("eventFromFormDialog1", this.itemModified);
      } else {
        this.$refs.refCloseConfirmDialog.showDialog(
            "Sudah terdapat modifikasi data",
            "Tetap tutup dan reset perubahan?"
        );
      }
    },
    closeDialogPickDataset() {
        this.dialogPickupMapsetShow = false;
    },

    passingEventFromCloseConfirm(value) {
      if (value === "OKE") this.dialogShow = false;
    },

    async applyChanges() {
      try {
        if (this.$refs.form && typeof this.$refs.form.validate === "function") {
          const ok = await this.$refs.form.validate();
          if (ok === false) return;
        }
        if (!this.valid) return;

        this.dialogLoading = true;

        const payload = this.buildPayload();

        if (this.formMode === FormMode.EDIT_FORM && payload.id > 0) {
          await FtTematikService.updateFtTematik(payload, false);
        } else {
          const resp = await FtTematikService.createFtTematik(payload);
          if (resp?.data?.id) this.itemModified.id = resp.data.id;
          this.$emit("update:formMode", FormMode.EDIT_FORM);
        }

        await this.initializeEditMode(this.itemModified.id);

        this.snackBarMessage = "Tersimpan (Apply)";
        this.snackbar = true;
      } catch (e) {
        console.error(e);
        this.formDialogOptions.errorMessage =
            e?.response?.data?.message || "Gagal menyimpan Tematik";
      } finally {
        this.dialogLoading = false;
      }
    },

    async saveAndClose() {
      await this.applyChanges();
      if (this.isItemModified === false) {
        this.dialogShow = false;
        this.$emit("eventFromFormDialog1", this.itemModified);
      }
    },

    buildPayload() {
      return {
        id: this.itemModified.id || 0,
        kode1: this.itemModified.kode1 || "",
        description: this.itemModified.description || "",
        avatarImage: this.itemModified.avatarImage || "",
        notes: this.itemModified.notes || "",
        categ: this.itemModified.categ || "",
        fdivisionBean: this.itemModified.fdivisionBean || 0,
        statusActive: this.itemModified.statusActive !== false,
        created: this.itemModified.created || new Date(),
        modified: new Date(),
        modifiedBy: this.itemModified.modifiedBy || "",
      };
    },

    async reloadDetails() {
      if (!this.itemModified?.id) {
        this.listFtTematikDataset = [];
        return;
      }
      try {
        const resp = await FtTematikDatasetService.getAllFtTematikDatasetByFtTematik(this.itemModified.id);
        const rows = resp?.data || [];
        this.listFtTematikDataset = (Array.isArray(rows) ? rows : []).map((x) => new FtTematikDataset(
            x.id ?? 0,
            x.ftTematikBean ?? this.itemModified.id,
            x.ftDatasetBean ?? 0,
            x.created ? new Date(x.created) : new Date(),
            x.modifiedBy ?? ""
        ));
      } catch (e) {
        console.error(e);
        this.listFtTematikDataset = [];
      }
    },

    lookupDatasetName(datasetId) {
      const id = Number(datasetId || 0);
      const found = (this.itemsFtDataset || []).find((x) => Number(x.id) === id);
      return found?.description || "-";
    },


    openPickDatasetDialog() {
      this.dialogPickupMapsetShow = true

      this.dialogPickDataset = false;
    },

    clearPickedDatasets() {
      this.itemsDatasetPicked = [];
    },

    isDatasetPicked(id) {
      const v = Number(id || 0);
      return (this.itemsDatasetPicked || []).some((it) => Number(it?.id) === v);
    },

    toggleDatasetPick(dataset, forceValue) {
      if (!dataset || !dataset.id) return;

      const exists = this.isDatasetPicked(dataset.id);
      const shouldSelect = (typeof forceValue === 'boolean') ? forceValue : !exists;

      if (shouldSelect && !exists) {
        this.itemsDatasetPicked.push({ ...dataset });
      }

      if (!shouldSelect && exists) {
        this.itemsDatasetPicked = this.itemsDatasetPicked.filter((it) => Number(it?.id) !== Number(dataset.id));
      }
    },

    isAlreadyLinkedDataset(datasetId) {
      const id = Number(datasetId || 0);
      return (this.listFtTematikDataset || []).some((x) => Number(x?.ftDatasetBean || 0) === id);
    },

    async applyPickedDatasets() {
      try {
        if (!(this.itemModified?.id > 0)) {
          this.snackBarMessage = "Simpan Tematik dulu sebelum menambah detail";
          this.snackbar = true;
          return;
        }

        const pickedIds = (this.itemsDatasetPicked || [])
          .map((x) => Number(x?.id || 0))
          .filter((x) => x > 0);

        if (!pickedIds.length) return;

        // Create only the ones not yet linked
        const existingIds = (this.listFtTematikDataset || [])
          .map((x) => Number(x?.ftDatasetBean || 0))
          .filter((x) => x > 0);

        const toCreateIds = pickedIds.filter((id) => !existingIds.includes(id));

        if (!toCreateIds.length) {
          this.snackBarMessage = "Semua dataset yang dipilih sudah ditautkan";
          this.snackbar = true;
          this.dialogPickDataset = false;
          return;
        }

        this.dialogLoading = true;

        const payload = toCreateIds.map((id) => ({
          id: 0,
          ftTematikBean: this.itemModified.id,
          ftDatasetBean: id,
          created: new Date(),
          modifiedBy: "",
        }));

        await FtTematikDatasetService.createFtTematikDatasetMultiple(payload);

        await this.reloadDetails();

        this.dialogPickDataset = false;
        this.snackBarMessage = `Dataset ditambahkan: ${toCreateIds.length}`;
        this.snackbar = true;
      } catch (e) {
        console.error(e);
        this.formDialogOptions.errorMessage = e?.response?.data?.message || "Gagal menambah dataset";
      } finally {
        this.dialogLoading = false;
      }
    },

    async deleteDatasetRelation(row) {
      try {
        if (!(row?.id > 0)) return;

        this.dialogLoading = true;
        await FtTematikDatasetService.deleteFtTematikDataset(row.id);
        await this.reloadDetails();

        this.snackBarMessage = "Dataset dihapus";
        this.snackbar = true;
      } catch (e) {
        console.error(e);
        this.formDialogOptions.errorMessage =
            e?.response?.data?.message || "Gagal menghapus dataset";
      } finally {
        this.dialogLoading = false;
      }
    },

    // Avatar upload (no map)
    showDialogUpload() {
      if (
          this.itemModified.kode1 !== undefined &&
          this.itemModified.description !== undefined &&
          this.itemModified.fdivisionBean !== undefined
      ) {
        if (this.itemModified.id === 0) {
          this.applyChanges(); // create first
        }
        this.$refs.refUploadDialog.showDialog();
      } else {
        this.snackBarMessage = "Kode, Judul, dan Produsen Data harus diisi dahulu";
        this.snackbar = true;
      }
    },

    completeUploadSuccess(val) {
      if (this.itemModified.avatarImage) {
        FileService.deleteImage(this.itemModified.avatarImage).catch((e) => {
          console.warn("[FtTematikDialog] delete old image failed", e);
        });
      }
      if (val?.fileName) {
        this.$refs.refUploadDialog.closeDialog();
        this.itemModified.avatarImage = val.fileName;
        this.applyChanges();
      }
    },

    lookupImageUrl(item) {
      if (!item?.avatarImage) return require("@/assets/images/no_image_available.jpeg");
      return FileService.image_url_medium(item.avatarImage);
    },

    lookupImageUrlLazy(item) {
      if (!item?.avatarImage) return require("@/assets/images/no_image_available.jpeg");
      return FileService.image_url_verylow(item.avatarImage);
    },

    runExtendedFilter() {
      const extendedFilter = new DataFilter();
      extendedFilter.fdivisionIds = [];
      extendedFilter.pageNo = this.currentPage;
      extendedFilter.pageSize = this.pageSize;
      extendedFilter.sortBy = "id";
      extendedFilter.order = "DESC";
      extendedFilter.search = this.search;
      let deepSearch = this.isActiveDeepSearch
      if(this.isActiveDeepSearch){
        deepSearch = true
      }
      FtDatasetService.getPostAllFtDatasetContainingExtPublic(
          extendedFilter,
          deepSearch
      ).then(
          (response) => {
            const { items, totalPages, totalItems } = response.data;
            this.ftDatasets = items;
            this.totalPaginationPages = totalPages;
            this.totalItems = totalItems;
          },
          (error) => {
            console.log(error);
          }
      );
    },
    isDatasetSelected(id) {
      return this.itemsMapsetSelected.some((it) => it && it.id === id);
    },
    toggleDatasetSelection(dataset, forceValue) {
      if (!dataset) return;

      const exists = this.isDatasetSelected(dataset.id);
      const shouldSelect = (typeof forceValue === 'boolean') ? forceValue : !exists;

      if (shouldSelect && !exists) {
        // push full object (shallow copy to avoid accidental reactive side-effects)
        this.itemsMapsetSelected.push({ ...dataset });
        return;
      }

      if (!shouldSelect && exists) {
        this.itemsMapsetSelected = this.itemsMapsetSelected.filter((it) => it && it.id !== dataset.id);
      }
    },
  },
  mounted() {
    this.runExtendedFilter()
  }
};
</script>

<style scoped>
.show-btns {
  color: blue !important;
  opacity: 1;
}

.border-activated {
  border: 2px solid #fb8c00 !important; /* orange */
  background: rgba(251, 140, 0, 0.06) !important;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>