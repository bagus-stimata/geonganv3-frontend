<template>
  <v-card class="elevation-0">
    <v-card-title>
      <v-row class="align-center">
        <strong>DATASET TERDOWNLOAD</strong>
        <v-spacer></v-spacer>
        <v-col cols="4">
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
      :items="fgeoDownloadsFiltered"
      v-model:page="currentPage"
      :items-per-page="pageSize"
      hide-default-footer
      :items-length="totalItems"
      class="elevation-0"
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
              v-if="false"
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
        <div>
          <div class="text-subtitle-2">{{item.description}}</div>
          <div class="text-caption"><v-icon class="me-1" color="blue-darken-2">mdi-email</v-icon>{{item.email}}</div>
        </div>
      </template>
      <template v-slot:[`item.instansi`]="{ item }">
        <div>
          <div class="text-subtitle-2">{{item.instansi}}</div>
        </div>
      </template>
      <template v-slot:[`item.notes`]="{ item }">
        <div>
          <div class="text-caption text-justify">{{ item.notes}}</div>
        </div>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn @click="showDialogEdit(item)" color="blue" size="small" variant="text" icon="mdi-eye" :disabled="multiSelect"></v-btn>
        <v-btn v-if="false" @click="showDialogEdit(item)" color="warning" size="small" variant="text" icon="mdi-pencil" :disabled="multiSelect"></v-btn>
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

    <FGeoDownloadDialog
      v-model:formMode="formMode"
      ref="refFormDialog"
      @eventFromFormDialogNew="saveDataNew"
      @eventFromFormDialogEdit="saveDataEdit"
    ></FGeoDownloadDialog>

    <v-snackbar v-model="snackbar">
      {{ snackBarMesage }}
      <template v-slot:actions="{ attrs }">
        <v-btn variant="text" v-bind="attrs" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>
  
  <script>
import FGeoDownloadService from "@/services/apiservices/f-geo-download-service";
import FDivisionService from "@/services/apiservices/f-division-service";

import DeleteDialog from "@/components/utils/DeleteConfirmDialog.vue";
import FGeoDownloadDialog from "./FGeoDownloadDialog.vue";
import FormMode from "@/models/form-mode";
import FGeoDownload from "@/models/f-geo-download";
import FileService from "@/services/apiservices/file-service";

export default {
  components: { FGeoDownloadDialog, DeleteDialog },
  data() {
    return {
      snackbar: false,
      snackBarMesage: "",

      multiSelect: false,
      selectedItems: [],

      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 10,
      totalItems: 0,
      pageSizes: [10, 25, 50, 150, 500],

      search: "",
      headers: [
        {
          title: 'No',
          align: 'start',
          sortable: false,
          key: 'number',
          width:'8%'
        },
        { title: "Nama/Inisial", key: "description",  width:'20%' },
        { title: "Instansi", key: "instansi",  width:'20%' },
        { title: "Dataset Terdownload", key: "notes",  width:'40%' },
        // { title: "Status", key: "fdivisionBean",  width:'20%' },
        { title: "Actions", key: "actions", sortable: false,  width:'12%', align: 'center' },
      ],

      formMode: "",
      itemSelectedIndex: -1,
      itemSelected: "",
      fgeoDownloads: [new FGeoDownload(0, "", "")],
      itemsFDivision: [],
    };
  },
  watch: {
    currentPage(newPage) {
      console.log(newPage)
      if (newPage) {
        this.fetchFGeoDownload();
      }
    },
    pageSize(newValue) {
      const refreshData = this.currentPage === 1;
      this.currentPage = 1;
      if (refreshData) {
        console.log("Change PageSize " + newValue);
        this.fetchFGeoDownload();
      }
    },
  },
  computed: {
    currentUser(){
      return this.$store.state.auth.user;
    },
    fgeoDownloadsFiltered() {
      return this.fgeoDownloads;
    },
  },
  methods: {
    searchOnEnter(event) {
      if (this.search !== event.target.value) {
        this.currentPage = 1;
        this.search = event.target.value;
        this.fetchFGeoDownload();
      }
    },
    fetchParent() {
      if (this.currentUser.organizationLevel === "DIV") {
        FDivisionService.getFDivisionById(this.currentUser.fdivisionBean).then(
            response=>{
              this.itemsFDivision = [response.data]
            },
            error=>{
              console.log(error.response)
            }
        )
      }else {
        FDivisionService.getAllFDivision().then(
            response => {
              this.itemsFDivision = response.data
            },
            error => {
              console.log(error.response)
            }
        )
      }
    },
    fetchFGeoDownload() {
      FGeoDownloadService.getAllFGeoDownloadContaining(
        this.currentPage,
        this.pageSize,
        "id",
        "DESC",
        this.search
      ).then(
        (response) => {
          const { items, totalPages, totalItems } = response.data;
          this.fgeoDownloads = items;
          this.totalPaginationPages = totalPages;
          this.totalItems = totalItems;
        },
        (error) => {
          console.log(error.response);
          if (error.response.statusCode === 401) {
            this.snackBarMesage = "Anda tidak mempunyai Akses!!";
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
        this.itemsFDivision
      );
    },
    saveDataNew(itemFromRest) {
      this.itemSelected = itemFromRest;
      this.closeDialog();
      this.fetchFGeoDownload();
    },
    showDialogEdit(item) {
      this.itemSelectedIndex = this.fgeoDownloadsFiltered.indexOf(item);
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
      try {
        Object.assign(
          this.fgeoDownloads[this.itemSelectedIndex],
          this.itemSelected
        );
      } catch (e) {
        this.fetchFGeoDownload();
        e.toString();
      }
      this.closeDialog();
    },
    truncateText(str, maxLength = 100) {
      if (!str) return '';
      return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    },
    deleteDialogShow(item) {
      this.itemSelectedIndex = this.fgeoDownloadsFiltered.indexOf(item);
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
      const deletedItem = this.fgeoDownloads[this.itemSelectedIndex];
      FGeoDownloadService.deleteFGeoDownload(deletedItem.id).then(
        () => {
          this.fgeoDownloads.splice(this.itemSelectedIndex, 1);
          this.closeDialog();
        },
        (error) => {
          console.log(error);
          this.snackBarMesage = "gagal hapus (digunakan oleh data anakk)";
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
        FGeoDownloadService.deleteAllFGeoDownload(itemIds).then(
          (response) => {
            if (response.data) {
              for (let i = 0; i < items.length; i++) {
                if (
                  !response.data.includes(items[i].id) ||
                  response.data.length === 0
                ) {
                  const index = this.fgeoDownloadsFiltered.indexOf(items[i]);
                  this.fgeoDownloads.splice(index, 1);
                }
                if (response.data.length > 0) {
                  this.snackBarMesage = `${response.data.length} items gagal hapus (digunakan oleh data anak)`;
                  this.snackbar = true;
                }
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
        this.itemSelected = Object.assign({}, new FGeoDownload());
        this.itemSelectedIndex = -1;
      });
    },
    getColorStatusActive(trueFalse) {
      if (trueFalse === true) return "green";
      else if (trueFalse === false) return "gray";
      else return "gray";
    },
    lookupFDivision(fdivisionBean) {
      const str = this.itemsFDivision.filter((x) => x.id == fdivisionBean);
      if (str.length > 0) {
        return str[0];
      } else {
        return "-";
      }
    },
    lookupImageUrl(item){
      if (item.avatarImage===undefined || item.avatarImage===""){
        return require('@/assets/images/no_image_available.jpeg')

      }else {
        return FileService.image_url_verylow(item.avatarImage)
      }
    },
  },
  mounted() {
    this.fetchFGeoDownload();
    this.fetchParent();
  },
};
</script>
  
  <style scoped>
</style>