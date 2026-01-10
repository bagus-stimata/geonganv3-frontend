<template>
  <v-card class="elevation-0">
    <v-card-title>
      <v-row class="align-center">
        <span class="font-weight-bold">{{title}}</span>
        <v-spacer></v-spacer>
        <v-col cols="4">
          <v-text-field
              v-on:keyup.enter="searchOnEnter"
              v-on:blur="searchOnEnter"
              append-icon="mdi-magnify"
              hint="Description, Kode (press ENTER to search)"
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
      :items="fsektorsFiltered"
      v-model:page="currentPage"
      :items-per-page="pageSize"
      hide-default-footer
      class="elevation-0"
      @page-count="totalTablePages = totalPaginationPages"
    >
      <template v-slot:top>
        <v-row align="center" class="ml-4 mr-4">
          <v-switch
            v-model="multiSelect"
            :label="multiSelect ? 'Multi Select' : 'Single Select'"
            size="x-small"
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
      <template v-slot:[`item.fdivisionBean`]="{ item }">
        <div>
          <div>{{ lookupFDivision(item.fdivisionBean).description }}</div>
          <v-chip :color="getColorStatusActive(item.statusActive)" size="x-small" variant="flat">
            {{ item.statusActive === true ? "Aktif" : "Non-Aktif" }}
          </v-chip>
        </div>
      </template>
      <template v-slot:[`item.avatarImage`]="{item}">
        <v-img
            :src="lookupImageUrl(item)"
            width="80px"
            height="80px"
            cover
            class="ma-2 rounded">
        </v-img>
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

    <FSektorDialog
      v-model:formMode="formMode"
      ref="refFormDialog"
      @eventFromFormDialogNew="saveDataNew"
      @eventFromFormDialogEdit="saveDataEdit"
    ></FSektorDialog>

    <v-snackbar v-model="snackbar">
      {{ snackBarMesage }}
      <template v-slot:actions="{ attrs }">
        <v-btn variant="text" v-bind="attrs" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>
  
  <script>
import FSektorService from "@/services/apiservices/f-sektor-service";
import FDivisionService from "@/services/apiservices/f-division-service";

import DeleteDialog from "@/components/utils/DeleteConfirmDialog.vue";
import FSektorDialog from "./FSektorDialog.vue";
import FormMode from "@/models/form-mode";
import FSektor from "@/models/f-sektor";
import FileService from "@/services/apiservices/file-service";

export default {
  components: { FSektorDialog, DeleteDialog },
  data() {
    return {
      title: "SEKTOR",
      snackbar: false,
      snackBarMesage: "",

      multiSelect: false,
      selectedItems: [],

      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 10,
      pageSizes: [10, 25, 50, 150, 500],

      search: "",
      headers: [
        {
          title: 'No',
          align: 'start',
          sortable: false,
          key: 'number',
          width:'10%'
        },
        { title: '', align: 'start', sortable: false, key: 'avatarImage', width: '13%'},
        { title: "Nama Sektor", key: "description",  width:'47%' },
        { title: "Status", key: "fdivisionBean",  width:'18%' },
        { title: "Actions", key: "actions", sortable: false,  width:'12%' },
      ],

      formMode: "",
      itemSelectedIndex: -1,
      itemSelected: "",
      fsektors: [new FSektor(0, "", "")],
      itemsFDivision: [],
    };
  },
  watch: {
    currentPage(newPage) {
      console.log(newPage)
      if (newPage) {
        this.fetchFSektor();
      }
    },
    pageSize(newValue) {
      const refreshData = this.currentPage === 1;
      this.currentPage = 1;
      if (refreshData) {
        console.log("Change PageSize " + newValue);
        this.fetchFSektor();
      }
    },
  },
  computed: {
    currentUser(){
      return this.$store.state.auth.user;
    },
    fsektorsFiltered() {
      return this.fsektors;
    },
  },
  methods: {
    searchOnEnter(event) {
      if (this.search !== event.target.value) {
        this.currentPage = 1;
        this.search = event.target.value;
        this.fetchFSektor();
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
    fetchFSektor() {
      FSektorService.getAllFSektorContaining(
        this.currentPage,
        this.pageSize,
        "id",
        "DESC",
        this.search
      ).then(
        (response) => {
          const { items, totalPages } = response.data;
          this.fsektors = items;
          this.totalPaginationPages = totalPages;
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
      this.fetchFSektor();
    },
    showDialogEdit(item) {
      this.itemSelectedIndex = this.fsektorsFiltered.indexOf(item);
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
          this.fsektors[this.itemSelectedIndex],
          this.itemSelected
        );
      } catch (e) {
        this.fetchFSektor();
        e.toString();
      }
      this.closeDialog();
    },
    deleteDialogShow(item) {
      this.itemSelectedIndex = this.fsektorsFiltered.indexOf(item);
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
      const deletedItem = this.fsektors[this.itemSelectedIndex];
      FSektorService.deleteFSektor(deletedItem.id).then(
        () => {
          this.fsektors.splice(this.itemSelectedIndex, 1);
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
        FSektorService.deleteAllFSektor(itemIds).then(
          (response) => {
            if (response.data) {
              for (let i = 0; i < items.length; i++) {
                if (
                  !response.data.includes(items[i].id) ||
                  response.data.length === 0
                ) {
                  const index = this.fsektorsFiltered.indexOf(items[i]);
                  this.fsektors.splice(index, 1);
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
        this.itemSelected = Object.assign({}, new FSektor());
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
    this.fetchFSektor();
    this.fetchParent();
  },
};
</script>
  
  <style scoped>
</style>