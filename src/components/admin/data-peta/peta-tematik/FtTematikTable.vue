<template>
  <v-card class="elevation-0 px-4">
    <v-card-title>
      <v-row class="align-center">
        <v-col cols="12" sm="12" md="4">
          <span class="font-weight-bold">{{ title }}</span>
        </v-col>
        <v-col cols="12" sm="12" md="8" class="d-flex justify-center align-center">
          <v-text-field
              v-on:keyup.enter="searchOnEnter"
              v-on:blur="searchOnEnter"
              append-inner-icon="mdi-magnify"
              hint="Kode, Deskripsi (press ⏎ to search)"
              label="Search ⏎"
              variant="underlined"
          ></v-text-field>
          <v-btn @click="showFilterDialog" icon dark variant="text" color="blue" size="small">
            <v-icon>mdi-filter</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>

    <v-expand-transition>
      <v-card
          class="ml-2 mr-2 elevation-0 bg-grey-lighten-4"
          v-show="showFilter === true"
      >
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6" md="6">
              <v-autocomplete
                  v-model="filterFdivisions"
                  :items="itemsFDivision"
                  item-value="id"
                  item-title="description"
                  density="compact"
                  variant="outlined"
                  chips
                  small-chips
                  deletable-chips
                  clearable
                  label="Produsen Data"
                  multiple
                  hide-details
              ></v-autocomplete>
            </v-col>
            <v-col cols="6" sm="3" md="2" class="d-flex align-center">
              <v-btn color="primary" size="small" @click="runExtendedFilter">
                Terapkan
                <v-icon size="small" class="ml-1" color="green-lighten-2">mdi-filter</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <v-data-table-server
        v-model="selectedItems"
        :single-select="!multiSelect"
        :show-select="multiSelect"
        :headers="headers"
        :items="ftDatasetsFiltered"
        v-model:page="currentPage"
        :items-per-page="pageSize"
        hide-default-footer
        class="elevation-0"
        :items-length="totalItems"
        @page-count="totalTablePages = totalPaginationPages"
        density="compact"
    >
      <template v-slot:top>
        <v-row align="center" class="ml-4 mr-4">
          <v-switch
              v-model="multiSelect"
              :label="multiSelect ? 'Multi Select' : 'Single Select'"
              class="pa-3"
              color="primary"
              hide-details
          ></v-switch>
          <v-btn
              color="red-accent-4"
              size="x-small"
              v-if="multiSelect"
              class="mr-2"
              @click="deleteDialogMultiShow"
              icon="mdi-delete"
          ></v-btn>
          <v-spacer></v-spacer>
          <v-btn
              color="green"
              size="x-small"
              @click="showDialogNew"
              :disabled="multiSelect"
              icon="mdi-plus"
          ></v-btn>
        </v-row>
      </template>

      <template v-slot:[`item.number`]="{ index }">
        {{ index + (currentPage - 1) * pageSize + 1 }}
      </template>

      <template v-slot:[`item.description`]="{ item }">
        <div class="text-caption">
          {{ item.description }}
        </div>
        <div class="text-caption font-weight-light" v-if="item.kode1">
          *{{ item.kode1 }}
        </div>
      </template>

      <template v-slot:[`item.notes`]="{ item }">
        <div class="text-caption">
          {{ truncateNotes(item.notes) }}
        </div>
      </template>

      <template v-slot:[`item.categ`]="{ item }">
        <v-chip v-if="item.categ" size="x-small" color="blue" variant="flat">
          {{ item.categ }}
        </v-chip>
        <span v-else class="text-caption font-weight-light">-</span>
      </template>

      <template v-slot:[`item.avatarImage`]="{ item }">
        <v-img
            :lazy-src="lookupImageUrlLazy(item)"
            :src="lookupImageUrl(item)"
            alt="avatar"
            width="80px"
            height="80px"
            cover
            class="ma-2 rounded"
        >
        </v-img>
      </template>

      <template v-slot:[`item.fdivisionBean`]="{ item }">
        <div>
          <div>{{ lookupFDivision(item.fdivisionBean).description }}</div>
          <v-chip :color="getColorStatusActive(item.statusActive)" size="x-small" variant="flat">
            {{ item.statusActive === true ? "Aktif" : "Non-Aktif" }}
          </v-chip>
        </div>
      </template>


      <template v-slot:[`item.actions`]="{ item }">
        <v-btn
            @click="showDialogEdit(item)"
            color="warning"
            size="small"
            variant="text"
            icon="mdi-pencil"
            :disabled="multiSelect"
        ></v-btn>
        <v-btn
            @click="deleteDialogShow(item)"
            color="red accent-4"
            size="small"
            variant="text"
            icon="mdi-delete"
            :disabled="multiSelect"
        ></v-btn>
      </template>
    </v-data-table-server>

    <v-container>
      <v-row justify="end" align="center">
        <v-col cols="4" md="2" sm="2">
          <v-select
              v-model="pageSize"
              :items="pageSizes"
              label="Items per page"
              variant="outlined"
              density="compact"
          ></v-select>
        </v-col>
        <v-col cols="10" md="9" sm="8" class="align-start">
          <v-pagination
              v-model="currentPage"
              :length="totalPaginationPages"
              total-visible="8"
              rounded="circle"
              active-color="orange-darken-4"
              size="x-small"
              variant="flat"
          ></v-pagination>
        </v-col>
      </v-row>
    </v-container>

    <FtTematikDialog
        v-model:formMode="formMode"
        :itemsFDivision="itemsFDivision"
        ref="refFormDialog"
        @eventFromFormDialogNew="saveDataNew"
        @eventFromFormDialogEdit="saveDataEdit"
    ></FtTematikDialog>

    <DeleteConfirmDialog
        ref="refDeleteConfirmDialog"
        @eventFromDeleteConfirmDialog1="deleteItemConfirmedSingleSelect"
        @eventFromDeleteConfirmDialog2="deleteItemConfirmedMultiSelect"
    ></DeleteConfirmDialog>

    <v-dialog width="100px" v-model="dialogLoading">
      <v-card class="px-4 py-7">
        <v-row justify="center">
          <v-col cols="12" class="align-center">
            <v-progress-circular
                :size="40"
                :width="5"
                v-if="loading"
                indeterminate
                color="primary"
            ></v-progress-circular>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar">
      {{ snackBarMessage }}
      <template v-slot:actions="{ attrs }">
        <v-btn variant="text" v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>
import FtTematikService from "@/services/apiservices/ft-tematik-service";
import FDivisionService from "@/services/apiservices/f-division-service";
import DeleteConfirmDialog from "@/components/utils/DeleteConfirmDialog.vue";
import FtTematikDialog from "./FtTematikDialog.vue";
import FormMode from "@/models/form-mode";
import FtTematik from "@/models/ft-tematik";
import FileService from "@/services/apiservices/file-service";
import DataFilter from "@/models/payload/data-filter";

export default {
  components: {
    FtTematikDialog: FtTematikDialog,
    DeleteConfirmDialog,
  },
  data() {
    return {
      title: "Peta Tematik",
      snackbar: false,
      snackBarMessage: "",

      dialogLoading: false,
      loading: false,

      multiSelect: false,
      selectedItems: [],

      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 10,
      pageSizes: [10, 25, 50, 150, 500, 1500],
      totalItems: 0,

      showFilter: false,
      filterFdivisions: [],

      search: "",
      headers: [
        {
          title: "No",
          key: "number",
          width: "8%",
          sortable: false,
        },
        { title: "", key: "avatarImage", width: "14%" },
        { title: "Deskripsi", key: "description", width: "28%" },
        { title: "Notes", key: "notes", width: "18%" },
        { title: "Kategori", key: "categ", width: "12%" },
        { title: "Produsen Data", key: "fdivisionBean" },
        { title: "Actions", key: "actions", sortable: false },
      ],

      formMode: "",
      itemSelectedIndex: -1,
      itemSelected: "",
      ftDatasets: [new FtTematik()],
      itemsFDivision: [{ id: 0, kode1: "", description: "" }],
    };
  },
  watch: {
    currentPage(newPage) {
      console.log(newPage);
      if (newPage) {
        this.fetchFtTematik();
      }
    },
    pageSize(newValue) {
      const refreshData = this.currentPage === 1;
      this.currentPage = 1;
      if (refreshData) {
        console.log("Change PageSize " + newValue);
        this.fetchFtTematik();
      }
    },
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    ftDatasetsFiltered() {
      return this.ftDatasets;
    },
  },
  methods: {
    showFilterDialog() {
      this.showFilter = !this.showFilter;
    },
    truncateNotes(notes) {
      if (!notes) return "";
      return notes.length > 50 ? notes.substring(0, 50) + "…" : notes;
    },
    runExtendedFilter() {
      const extendedFilter = new DataFilter();
      extendedFilter.fdivisionIds = this.filterFdivisions;
      extendedFilter.pageNo = this.currentPage;
      extendedFilter.pageSize = this.pageSize;
      extendedFilter.sortBy = "id";
      extendedFilter.order = "DESC";
      extendedFilter.search = this.search;

      FtTematikService.getPostAllFtTematikContainingExt(extendedFilter).then(
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

    searchOnEnter(event) {
      if (this.search !== event.target.value) {
        this.currentPage = 1;
        this.search = event.target.value;
        this.runExtendedFilter();
      }
    },

    fetchParent() {
      if (this.currentUser.organizationLevel === "DIV") {
        FDivisionService.getFDivisionById(this.currentUser.fdivisionBean).then(
            (response) => {
              this.itemsFDivision = [response.data];
            },
            (error) => {
              console.log(error.response);
            }
        );
      } else {
        FDivisionService.getAllFDivision().then(
            (response) => {
              this.itemsFDivision = response.data;
            },
            (error) => {
              console.log(error.response);
            }
        );
      }
    },

    fetchFtTematik() {
      this.runExtendedFilter();
    },

    showDialogNew() {
      this.itemSelectedIndex = -1;
      const itemModified = Object.assign({}, "");
      this.formMode = FormMode.NEW_FORM;
      this.$refs.refFormDialog.showDialog(this.itemSelectedIndex, itemModified);
    },

    saveDataNew(itemFromRest) {
      this.itemSelected = itemFromRest;
      this.closeDialog();
      this.fetchFtTematik();
    },

    showDialogEdit(item) {
      this.itemSelectedIndex = this.ftDatasetsFiltered.indexOf(item);
      const itemModified = Object.assign({}, item);
      this.formMode = FormMode.EDIT_FORM;
      this.$refs.refFormDialog.showDialog(
          this.itemSelectedIndex,
          itemModified,
          this.itemsFDivision
      );
    },

    saveDataEdit(item) {
      this.itemSelected = item;
      this.fetchFtTematik();
      this.closeDialog();
    },

    deleteDialogShow(item) {
      this.itemSelectedIndex = this.ftDatasetsFiltered.indexOf(item);
      this.itemSelected = Object.assign({}, item);
      this.$refs.refDeleteConfirmDialog.showDialog(
          this.itemSelectedIndex,
          item.description || item.kode1 || String(item.id)
      );
    },

    deleteDialogMultiShow() {
      if (this.multiSelect === true) {
        this.$refs.refDeleteConfirmDialog.showDialogMulti(
            this.selectedItems,
            `${this.selectedItems.length} items selected`
        );
      }
    },

    deleteItemConfirmedSingleSelect() {
      const deletedItem = this.ftDatasets[this.itemSelectedIndex];
      FtTematikService.deleteFtTematik(deletedItem.id).then(
          () => {
            this.ftDatasets.splice(this.itemSelectedIndex, 1);
            this.closeDialog();
          },
          (error) => {
            console.log(error);
            this.snackBarMessage = "gagal hapus (digunakan oleh data anakk)";
            this.snackbar = true;
            this.$refs.refDeleteConfirmDialog.setDialogState(false);
          }
      );
    },

    deleteItemConfirmedMultiSelect(items) {
      if (items.length > -1) {
        const itemIds = items.map((x) => x.id);
        FtTematikService.deleteAllFtTematik(itemIds).then(
            () => {
              this.fetchFtTematik();
              this.selectedItems = [];
              this.closeDialog();
            },
            (error) => {
              console.log("error " + error);
            }
        );
      }
    },

    closeDialog() {
      this.formMode = "";
      this.$refs.refDeleteConfirmDialog.setDialogState(false);
      this.$refs.refFormDialog.setDialogState(false);

      this.$nextTick(() => {
        this.itemSelected = Object.assign({}, new FtTematik());
        this.itemSelectedIndex = -1;
      });
    },

    getColorStatusActive(trueFalse) {
      if (trueFalse === true) return "green";
      else if (trueFalse === false) return "gray";
      else return "gray";
    },

    lookupFDivision(fdivisionBean) {
      const str = this.itemsFDivision.filter((x) => x.id === fdivisionBean);
      if (str.length > 0) {
        return str[0];
      } else {
        return "-";
      }
    },

    lookupImageUrl(item) {
      if (item.avatarImage === undefined || item.avatarImage === "") {
        return require("@/assets/images/no_image_available.jpeg");
      } else {
        return FileService.image_url_low(item.avatarImage);
      }
    },

    lookupImageUrlLazy(item) {
      if (item.avatarImage === undefined || item.avatarImage === "") {
        return require("@/assets/images/no_image_available.jpeg");
      } else {
        return FileService.image_url_verylow(item.avatarImage);
      }
    },
  },
  async mounted() {
    if (!this.currentUser) {
      this.$router.push("/login");
    } else {
      await this.fetchParent();
      this.fetchFtTematik();
    }
  },
};
</script>

<style scoped>
</style>