<template>
  <v-card class="elevation-0">
    <v-card-title>
      <v-row class="align-center">
        <v-col cols="12" sm="12" md="6">
          <span class="font-weight-bold">{{ title }}</span>
        </v-col>
        <v-col cols="12" sm="12" md="6">
          <v-text-field
              v-on:keyup.enter="searchOnEnter"
              v-on:blur="searchOnEnter"
              append-icon="mdi-magnify"
              hint="Kode, Deskripsi (press ENTER to search)"
              label="Search"
              variant="underlined"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card-title>
    <v-data-table-server
      v-model="selectedItems"
      :single-select="!multiSelect"
      :show-select="multiSelect"
      :headers="headers"
      :items="fDivisionsFiltered"
      v-model:page="currentPage"
      :items-per-page="pageSize"
      hide-default-footer
      class="elevation-0"
      :items-length="totalItems"
      @page-count="totalTablePages = totalPaginationPages"
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

      <template v-slot:[`item.fcompanyBean`]="{ item }">
        {{ lookupFCompany(item.fcompanyBean) }}
      </template>
      <template v-slot:[`item.statusActive`]="{ item }">
        <v-chip :color="getColorStatusActive(item.statusActive)" size="x-small" variant="flat">
          {{ item.statusActive === true ? "Aktif" : "Non-Aktif" }}
        </v-chip>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-btn @click="showDialogEdit(item)" color="warning" size="small" variant="text" icon="mdi-pencil" :disabled="multiSelect"></v-btn>
        <v-btn @click="deleteDialogShow(item)" color="red accent-4" size="small" variant="text" icon="mdi-delete" :disabled="multiSelect"></v-btn>
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

    <delete-dialog
      ref="refDeleteConfirmDialog"
      @eventFromDeleteConfirmDialog1="deleteItemConfirmedSingleSelect"
      @eventFromDeleteConfirmDialog2="deleteItemConfirmedMultiSelect"
    ></delete-dialog>

    <f-division-dialog
      v-model:formMode="formMode"
      ref="refFormDialog"
      @eventFromFormDialogNew="saveDataNew"
      @eventFromFormDialogEdit="saveDataEdit"
    ></f-division-dialog>

    <v-snackbar v-model="snackbar">
      {{ snackBarMessage }}
      <template v-slot:actions="{ attrs }">
        <v-btn variant="text" v-bind="attrs" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>
import FDivisionService from "@/services/apiservices/f-division-service";
import FCompanyService from "@/services/apiservices/f-company-service";

import DeleteDialog from "@/components/utils/DeleteConfirmDialog";
import FDivisionDialog from "./FDivisionDialog";
import FormMode from "@/models/form-mode";
import FDivision from "@/models/f-division";

export default {
  components: { FDivisionDialog, DeleteDialog },
  data() {
    return {
      title: "PRODUSEN DATA/BIDANG",
      snackbar: false,
      snackBarMessage: "",

      multiSelect: false,
      selectedItems: [],

      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 10,
      pageSizes: [10, 25, 50, 150, 500],
      totalItems: 0,

      search: "",
      headers: [
        {
          title: "Kode1",
          align: "start",
          sortable: false,
          key: "kode1",
        },
        { title: "", key: "description" },
        { title: "Company/Dinas", key: "fcompanyBean" },
        { title: "Aktif", key: "statusActive" },
        { title: "Actions", key: "actions", sortable: false },
      ],

      formMode: "",
      itemSelectedIndex: -1,
      itemSelected: "",
      fDivisions: [new FDivision(0, "", "")],
      itemsFCompany: [
        { id: 1, kode1: "", description: "" },
        { id: 2, kode1: "", description: "" },
      ],
    };
  },
  watch: {
    currentPage(newPage) {
      console.log(newPage)
      if (newPage) {
        this.fetchFDivision();
      }
    },
    pageSize(newValue) {
      const refreshData = this.currentPage === 1;
      this.currentPage = 1;
      if (refreshData) {
        console.log("Change PageSize " + newValue);
        this.fetchFDivision();
      }
    },
  },
  computed: {
    fDivisionsFiltered() {
      return this.fDivisions;
    },
  },
  methods: {
    searchOnEnter(event) {
      if (this.search !== event.target.value) {
        this.currentPage = 1;
        this.search = event.target.value;
        this.fetchFDivision();
      }
    },
    fetchParent() {
      FCompanyService.getAllFCompany().then(
        (response) => {
          this.itemsFCompany = response.data;
        },
        (error) => {
          console.log(error.response);
        }
      );
    },
    fetchFDivision() {
      FDivisionService.getAllFDivisionContaining(
        this.currentPage,
        this.pageSize,
        "id",
        "DESC",
        this.search
      ).then(
        (response) => {
          const { items, totalPages, totalItems } = response.data;
          this.fDivisions = items;
          this.totalPaginationPages = totalPages;
          this.totalItems = totalItems;
        },
        (error) => {
          console.log(error.response);
          if (error.response.status === 401) {
            this.snackBarMessage = "Anda tidak mempunyai Akses!!";
            this.snackbar = true;
          }
        }
      );
    },
    showDialogNew() {
      this.itemSelectedIndex = -1;
      const itemModified = Object.assign({}, "");
      this.formMode = FormMode.NEW_FORM;
      this.$refs.refFormDialog.showDialog(
        this.itemSelectedIndex,
        itemModified,
        this.itemsFCompany
      );
    },
    saveDataNew(itemFromRest) {
      this.itemSelected = itemFromRest;
      this.closeDialog();
      /**
       * Setiap data baru harus terlihat
       */
      this.fetchFDivision();
    },

    showDialogEdit(item) {
      this.itemSelectedIndex = this.fDivisionsFiltered.indexOf(item);
      const itemModified = Object.assign({}, item);
      this.formMode = FormMode.EDIT_FORM;
      this.$refs.refFormDialog.showDialog(
        this.itemSelectedIndex,
        itemModified,
        this.itemsFCompany
      );
    },
    saveDataEdit(item) {
      this.itemSelected = item;
      Object.assign(this.fDivisions[this.itemSelectedIndex], this.itemSelected);
      this.closeDialog();
    },

    deleteDialogShow(item) {
      this.itemSelectedIndex = this.fDivisionsFiltered.indexOf(item);
      this.itemSelected = Object.assign({}, item);
      this.$refs.refDeleteConfirmDialog.showDialog(
        this.itemSelectedIndex,
        item.username
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
    deleteItemConfirmedSingleSelect(index) {
      console.log("delete SingleItem: " + index);

      const deletedItem = this.fDivisions[this.itemSelectedIndex];
      FDivisionService.deleteFDivision(deletedItem.id).then(
        () => {
          this.fDivisions.splice(this.itemSelectedIndex, 1);
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
        let itemIds = [];
        for (let i = 0; i < items.length; i++) {
          itemIds.push(items[i].id);
        }
        FDivisionService.deleteAllFDivision(itemIds).then(
          (response) => {
            if (response.data) {
              for (let i = 0; i < items.length; i++) {
                if (
                  !response.data.includes(items[i].id) ||
                  response.data.length === 0
                ) {
                  const index = this.fDivisionsFiltered.indexOf(items[i]);
                  this.fDivisions.splice(index, 1);
                }
                if (response.data.length > 0) {
                  this.snackBarMessage = `${response.data.length} items gagal hapus (digunakan oleh data anak)`;
                  this.snackbar = true;
                }

                console.log(
                  "Undeleted Items: " + response.data + " = " + items[i].id
                );
              }
              this.closeDialog();
            }
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
        this.itemSelected = Object.assign({}, new FDivision());
        this.itemSelectedIndex = -1;
      });
    },

    getColorStatusActive(trueFalse) {
      if (trueFalse === true) return "green";
      else if (trueFalse === false) return "gray";
      else return "gray";
    },

    lookupFCompany(fcompanyBean) {
      const str = this.itemsFCompany.filter((x) => x.id === fcompanyBean);
      if (str.length > 0) {
        return str[0].description;
      } else {
        return "-";
      }
    },
  },
  mounted() {
    this.fetchFDivision();
    this.fetchParent();
  },
};
</script>

<style scoped>
</style>