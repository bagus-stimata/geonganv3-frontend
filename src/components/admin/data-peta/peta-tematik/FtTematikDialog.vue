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
              <v-col cols="12" md="8" class="pr-2">
                <v-autocomplete
                    v-model="selectedDatasetId"
                    :items="itemsFtDataset"
                    item-value="id"
                    item-title="description"
                    label="Pilih Dataset"
                    variant="outlined"
                    density="compact"
                    clearable
                    :disabled="!(itemModified.id && itemModified.id > 0)"
                    hide-details
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                    color="primary"
                    variant="flat"
                    block
                    class="rounded-lg"
                    style="text-transform:none;"
                    :disabled="!(itemModified.id && itemModified.id > 0) || !selectedDatasetId"
                    @click="addDatasetRelation"
                >
                  Tambah Dataset
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
      selectedDatasetId: null,
    };
  },
  computed: {
    isItemModified() {
      const a = JSON.stringify(this.itemDefault || {});
      const b = JSON.stringify(this.itemModified || {});
      return a !== b;
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
      this.selectedDatasetId = null;
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

    async addDatasetRelation() {
      try {
        if (!(this.itemModified?.id > 0)) {
          this.snackBarMessage = "Simpan Tematik dulu sebelum menambah detail";
          this.snackbar = true;
          return;
        }
        if (!this.selectedDatasetId) return;

        this.dialogLoading = true;

        const payload = [
          {
            id: 0,
            ftTematikBean: this.itemModified.id,
            ftDatasetBean: Number(this.selectedDatasetId),
            created: new Date(),
            modifiedBy: "",
          },
        ];

        await FtTematikDatasetService.createFtTematikDatasetMultiple(payload);

        this.selectedDatasetId = null;
        await this.reloadDetails();

        this.snackBarMessage = "Dataset ditambahkan";
        this.snackbar = true;
      } catch (e) {
        console.error(e);
        this.formDialogOptions.errorMessage =
            e?.response?.data?.message || "Gagal menambah dataset";
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
        FileService.deleteImage(this.itemModified.avatarImage).catch(() => {});
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
  },
};
</script>

<style scoped>
.show-btns {
  color: blue !important;
  opacity: 1;
}
</style>