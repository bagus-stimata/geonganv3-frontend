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

                  <v-row no-gutters class="ga-4">
                    <v-col cols="12" sm="12" md="6">
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
                    <v-col cols="12" sm="12" md="5">
                      <v-switch
                          v-model="itemModified.showOnHome"
                          label="Tandai Sebagai Konten Popular"
                          density="compact"
                          hide-details
                          color="primary"
                      ></v-switch>
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
            <v-row v-if="listFtTematikDataset">
              <v-col cols="12">
                <v-card
                    elevation="0"
                    class="mt-3 px-1 flex-grow-1 overflow-y-auto"
                    style="min-height: 0;"
                >
                  <v-row v-if="listFtTematikDataset.length === 0">
                    <v-col>
                      <div class="text-center text-grey my-3 text-subtitle-2">Belum ada dataset terpilih</div>
                    </v-col>
                  </v-row>

                 <v-row v-else no-gutters class="ga-2">
                    <v-col cols="12" v-for="item in listFtTematikDataset" :key="item.id">
                      <v-card
                          elevation="0"
                          class="pa-2 border-thin border-opacity-25 rounded-lg"
                          width="100%"
                          style="cursor: pointer;"
                      >
                        <v-row no-gutters class="align-center">
                          <v-col cols="3" class="pe-2">
                            <v-img
                                width="100%"
                                height="120"
                                class="rounded"
                                cover
                                :src="lookupImageUrlLazy(item.ftDataset)"
                            />
                          </v-col>

                          <v-col cols="9">
                            <div class="d-flex align-center">
                              <div class="flex-grow-1">
                                <div class="text-caption font-weight-bold text-indigo text-truncate">
                                  {{ item.ftDataset.description }}
                                </div>
                                <div class="text-blue">{{ item.ftDataset.tahun }}</div>
                                <div
                                    style="font-size: 11px !important"
                                    class="text-caption font-weight-light text-grey-darken-4 text-truncate"
                                >
                                  {{ item.ftDataset.notes }}
                                </div>
                              </div>

                              <v-spacer />

                              <v-btn
                                icon
                                density="comfortable"
                                variant="text"
                                color="red"
                                @click.stop="removeTematikDataset(item)"
                              >
                                <v-icon>mdi-delete</v-icon>
                              </v-btn>
                            </div>
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
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
              md="6"
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
                style="min-height: 0; max-height: 500px;"
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
                      height="86"
                      @click="toggleDatasetSelection(dataset)"
                      style="cursor: pointer;"
                    >
                      <v-row>
                        <v-col cols="3">
                          <v-img
                            width="100%"
                            height="68"
                            class="rounded"
                            cover
                            :src="lookupImageUrlLazy(dataset)"
                          />
                        </v-col>
                        <v-col cols="9" class="d-flex flex-row align-center justify-center">
                          <v-row class="align-center justify-center pe-4">
                            <v-col cols="10">
                              <div>
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
                            </v-col>
                            <v-col cols="2" class="justify-center align-center">
                              <v-checkbox-btn
                                  class="ms-2"
                                  :color="isDatasetSelected(dataset.id) ? 'orange' : ''"
                                  :model-value="isDatasetSelected(dataset.id)"
                                  @click.stop
                                  @update:model-value="(val) => toggleDatasetSelection(dataset, val)"
                              />
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>
              <div class="py-2">
                <v-row class="mt-3" justify="center" align="center">
                  <v-col class="justify-start" cols="4" md="4" sm="4">
                    <v-select
                        v-model="pageSize"
                        :items="pageSizes"
                        variant="outlined"
                        density="compact"
                        hide-details
                    ></v-select>
                  </v-col>
                  <v-col cols="8" md="8" sm="8" class="d-flex flex-row justify-end">
                    <v-pagination
                        v-model="currentPage"
                        :length="totalPaginationPages"
                        total-visible="1"
                        active-color="orange-darken-4"
                        size="x-small"
                        variant="flat"
                    ></v-pagination>
                  </v-col>
                </v-row>
              </div>
            </v-col>

            <!-- RIGHT: Selected -->
            <v-col
              cols="12"
              md="5"
              class="order-2 order-md-2 d-flex flex-column"
              style="min-height: 0; max-height: 480px;"
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
                  @click="tambahkanPilihanDataset"
                >
                  Tambahkan Pilihan
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
import FtDatasetExtService from "@/services/apiservices/ft-dataset-ext-service";
import FtDataset from "@/models/ft-dataset";

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
      listFtTematikDatasetDefault: [],

      // Pick Dataset dialog state
      dialogPickDataset: false,
      pickDatasetSearch: "",
      itemsDatasetPicked: [],

      // Katalog Mapset state (dipakai dialog kedua)
      ftDatasets: [],
      itemsMapsetSelected: [],
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 15, 20],
      totalPaginationPages: 0,
      totalItems: 0,
      isActiveDeepSearch: false,
      search: "",
    };
  },
  computed: {
    isItemModified() {
      // compare main form
      const a = JSON.stringify(this.itemDefault || {});
      const b = JSON.stringify(this.itemModified || {});
      if (a !== b) {
        return true;
      }
      // compare detail list (dataset-old terkait)
      const d1 = JSON.stringify(this.listFtTematikDatasetDefault || []);
      const d2 = JSON.stringify(this.listFtTematikDataset || []);
      return d1 !== d2;
    },
    ftDatasetsFiltered() {
      return this.ftDatasets;
    },
  },
  watch: {
    currentPage(newPage) {
      if (newPage) {
        this.runExtendedFilter();
      }
    },
    pageSize() {
      const refreshData = this.currentPage === 1;
      this.currentPage = 1;
      if (refreshData) {
        this.runExtendedFilter();
      }
    },
  },
  methods: {
    // Public API for parent
    async showDialog(selectedIndex, item) {
      this.dialogShow = true;
      this.formDialogOptions.errorMessage = "";
      this.selectedIndex = selectedIndex;

      if (selectedIndex > 1 && item && item.id) {
        await this.initializeEditMode(item.id);
      } else {
        this.initializeNewMode();
      }
    },

    initializeNewMode() {
      const newItem = new FtDataset(0, "", "");
      newItem.statusActive = false
      this.itemDefault = Object.assign({}, newItem);
      this.itemModified = Object.assign({}, newItem);

      // this.itemModified = new FtTematik();
      // this.itemDefault = JSON.parse(JSON.stringify(this.itemModified));

      this.listFtTematikDataset = [];
      this.listFtTematikDatasetDefault = [];
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
            incoming.showOnHome ?? false,
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
      this.$emit('fetchTematik')
    },
    closeDialogPickDataset() {
        this.dialogPickupMapsetShow = false;
    },
    tambahkanPilihanDataset() {
      this.listFtTematikDataset = [];
      let noUrut = 1;
      for (const dataset of this.itemsMapsetSelected) {
        if (!dataset || !dataset.id) continue;
        const newitem = new FtTematikDataset();
        newitem.id = noUrut++
        newitem.ftTematikBean = this.itemModified.id;
        newitem.ftDatasetBean = dataset.id;
        newitem.ftDataset = { ...dataset }; // simpan full object buat tampilan

        this.listFtTematikDataset.push(newitem);
      }

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
        const newListFtTematikDataset = (this.listFtTematikDataset || []).map((it) => {
          // const newIt = it
          // newIt.id = 0
          // return newIt;
          const newIt = {
            "id": 0,
            "ftTematikBean": it.ftTematikBean,
            "ftDatasetBean": it.ftDatasetBean
          }
          return newIt
        });


        if (this.formMode === FormMode.EDIT_FORM && payload.id > 0) {
          await FtTematikService.updateFtTematik(payload, false);

          await FtTematikDatasetService.deleteFtTematikDatasetByFtTematik(payload.id)
          await FtTematikDatasetService.createFtTematikDatasetMultiple(newListFtTematikDataset)

        } else {
          const resp = await FtTematikService.createFtTematik(payload);
          if (resp?.data?.id) this.itemModified.id = resp.data.id;

          await FtTematikDatasetService.createFtTematikDatasetMultiple(newListFtTematikDataset)

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
        this.$emit("fetchTematik");
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
        showOnHome: this.itemModified.showOnHome !== false,
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
        this.listFtTematikDataset = resp?.data || [];
        this.listFtTematikDatasetDefault = JSON.parse(JSON.stringify(this.listFtTematikDataset || []));
      } catch (e) {
        console.error(e);
        this.listFtTematikDataset = [];
      }
    },



    openPickDatasetDialog() {
      this.dialogPickupMapsetShow = true

      this.dialogPickDataset = false;
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
      FtDatasetExtService.getPostAllFtDatasetContainingExtPublic(
          extendedFilter,
          false
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

    removeTematikDataset(dataset) {
      if (!dataset) return;
      const id = dataset.id;
      this.listFtTematikDataset = (this.listFtTematikDataset || []).filter(
        (it) => it && it.id !== id
      );
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