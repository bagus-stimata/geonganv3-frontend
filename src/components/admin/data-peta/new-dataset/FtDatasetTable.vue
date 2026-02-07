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
          >

            <template #append-inner>
              <div class="d-flex flex-row align-center">
                <v-divider vertical></v-divider>
                <v-btn @click="activateDeepSearchGeojson" size="regular" class="px-2 font-weight-bold" :color="isActiveDeepSearch?'blue':''" density="comfortable" variant="text">
                  <v-chip prepend-icon="mdi-map" :class="isActiveDeepSearch?'text-blue':'text-grey-darken-2'" class="ml-1 font-weight-bold text-caption" style="text-transform: none;">
                    Deep
                  </v-chip>
                  <v-tooltip
                      activator="parent"
                      location="top"
                  >Pencarian lebih dalam ke isi geospasial</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-text-field>

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
          <v-menu v-if="false" offset-y style="align-items: start">
            <template v-slot:activator="{ props }">
              <v-btn
                  class="mx-1"
                  icon="mdi-view-grid"
                  size="x-small"
                  color="blue"
                  v-bind="props"
              ></v-btn>
            </template>
            <v-list color="grey lighten-4" class="mr">
              <v-list-item>
                <v-btn
                    class="mx-1 font-weight-bold"
                    variant="plain"
                    elevation="0"
                    color="gray-darken-1"
                    size="small"
                    @click="importDialogShow"
                >
                  <v-icon color="blue">mdi-upload</v-icon>
                  Import Data Peta Tabular
                </v-btn>
              </v-list-item>
            </v-list>
          </v-menu>
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
        <div v-if="item.showOnHome">
          <v-chip
              size="x-small"
              color="indigo"
              variant="flat"
          >
            Konten Populer
          </v-chip>
        </div>
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

      <template v-slot:[`item.hasGeojson`]="{ item }">
        <v-chip
            size="x-small"
            :color="item.hasGeojson ? 'teal' : 'grey'"
            variant="flat"
        >
          {{ item.hasGeojson ? "Ada GeoJSON" : "Belum Ada" }}
        </v-chip>
        <div class="text-caption mt-1 font-weight-regular">{{lookupTipePeta(item.tipePeta).description}}</div>
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

    <FtDatasetDialog
        v-model:formMode="formMode"
        :itemsFDivision="itemsFDivision"
        ref="refFormDialog"
        @fetchDataset="fetchFtDataset"
        @eventFromFormDialogNew="saveDataNew"
        @eventFromFormDialogEdit="saveDataEdit"
    ></FtDatasetDialog>

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
import FtDatasetService from "@/services/apiservices/ft-dataset-service";
import FDivisionService from "@/services/apiservices/f-division-service";
import DeleteConfirmDialog from "@/components/utils/DeleteConfirmDialog.vue";
import FtDatasetDialog from "./FtDatasetDialog.vue";
import FormMode from "@/models/form-mode";
import FtDataset from "@/models/ft-dataset";
import FileService from "@/services/apiservices/file-service";
import DataFilter from "@/models/payload/data-filter";
import {ETipePetas} from "@/models/e-tipe-peta";
import FtDatasetExtService from "@/services/apiservices/ft-dataset-ext-service";

export default {
  components: {
    FtDatasetDialog: FtDatasetDialog,
    DeleteConfirmDialog,
  },
  data() {
    return {
      title: "DATASET",
      snackbar: false,
      snackBarMessage: "",
      isActiveDeepSearch:false,

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
      itemsTipePeta: ETipePetas,

      search: "",
      headers: [
        {
          title: "No",
          key: "number",
          width: "8%",
          sortable: false,
        },
        { title: "", key: "avatarImage", width: "14%" },
        { title: "Deskripsi", key: "description", width: "20%" },
        { title: "Tahun", key: "tahun" },
        { title: "GeoJSON", key: "hasGeojson", width: "12%", align: "center" },
        { title: "Produsen Data", key: "fdivisionBean" },
        { title: "Actions", key: "actions", sortable: false },
      ],

      formMode: "",
      itemSelectedIndex: -1,
      itemSelected: "",
      ftDatasets: [new FtDataset()],
      itemsFDivision: [{ id: 0, kode1: "", description: "" }],
    };
  },
  watch: {
    currentPage(newPage) {
      console.log(newPage);
      if (newPage) {
        this.fetchFtDataset();
      }
    },
    pageSize(newValue) {
      const refreshData = this.currentPage === 1;
      this.currentPage = 1;
      if (refreshData) {
        console.log("Change PageSize " + newValue);
        this.fetchFtDataset();
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
    importDialogShow() {
      this.$refs.refImportDataTabular.showDialog();
      // console.log("hello bos")
    },
    showFilterDialog() {
      this.showFilter = !this.showFilter;
    },

    activateDeepSearchGeojson(){
      this.isActiveDeepSearch = !this.isActiveDeepSearch
      this.$nextTick(() =>{
        this.runExtendedFilter()
      })
    },
    runExtendedFilter() {
      const extendedFilter = new DataFilter();
      extendedFilter.fdivisionIds = this.filterFdivisions;
      extendedFilter.pageNo = this.currentPage;
      extendedFilter.pageSize = this.pageSize;
      extendedFilter.sortBy = "id";
      extendedFilter.order = "DESC";
      extendedFilter.search = this.search;
      extendedFilter.city = "";

      let deepSearch = false
      if (this.isActiveDeepSearch){
        if (this.isActiveDeepSearch===true){
          deepSearch = true
        }
      }

      // console.log(deepSearch)

      FtDatasetExtService.getPostAllFtDatasetContainingExt(
          extendedFilter,
          deepSearch
      ).then(
          (response) => {
            const { items, totalPages, totalItems } = response.data;
            this.ftDatasets = items;
            this.totalPaginationPages = totalPages;
            this.totalItems = totalItems;

            // console.log(`${new Date()} ==> ${items.length}`);

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

    fetchFtDataset() {
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
      this.fetchFtDataset();
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
      this.fetchFtDataset();
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
      FtDatasetService.deleteFtDataset(deletedItem.id).then(
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
        FtDatasetService.deleteAllFtDataset(itemIds).then(
            () => {
              this.fetchFtDataset();
              this.selectedItems = [];
              this.closeDialog();
            },
            (error) => {
              console.log("error " + error);
            }
        );
      }
    },
    lookupTipePeta(id) {
      const str = this.itemsTipePeta.filter((x) => x.id === id);
      if (str.length > 0) {
        return str[0];
      } else {
        return "-";
      }
    },
    closeDialog() {
      this.formMode = "";
      this.$refs.refDeleteConfirmDialog.setDialogState(false);
      this.$refs.refFormDialog.setDialogState(false);

      this.$nextTick(() => {
        this.itemSelected = Object.assign({}, new FtDataset());
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
      this.fetchFtDataset();
    }
  },
};
</script>

<style scoped>
</style>