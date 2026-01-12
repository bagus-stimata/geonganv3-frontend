<template>
  <v-card class="elevation-0">
    <v-card-title>
      <v-row class="align-center">
        KATEGORI ARSIP/DOKUMEN
        <v-spacer></v-spacer>
        <v-col cols="4">
          <v-text-field
              v-on:keyup.enter="searchOnEnter"
              v-on:blur="searchOnEnter"
              append-icon="mdi-magnify"
              hint="Kode, Deskripsi (press ⏎ to search)"
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
      :items="farticleCategsFiltered"
      v-model:page="currentPage"
      :items-per-page="pageSize"
      :items-length="totalItems"
      hide-default-footer
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
              color="green"
              size="x-small"
              @click="showDialogNew"
              :disabled="multiSelect"
              icon="mdi-plus"
          ></v-btn>
        </v-row>
      </template>

      <template v-slot:[`item.fdivisionBean`]="{ item }">
        {{ lookupFDivision(item.fdivisionBean).description }}
      </template>
      <template v-slot:[`item.articleCategGroup`]="{ item }">
        {{ lookupArticleCategGroup(item.articleCategGroup).description }}
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

    <FArticleCategDialog
      v-model:formMode="formMode"
      ref="refFormDialog"
      @eventFromFormDialogNew="saveDataNew"
      @eventFromFormDialogEdit="saveDataEdit"
    ></FArticleCategDialog>

    <v-snackbar v-model="snackbar">
      {{ snackBarMesage }}
      <template v-slot:actions="{ attrs }">
        <v-btn variant="text" v-bind="attrs" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>
  
  <script>
import FArticleCategService from "@/services/apiservices-elibrary/f-article-categ-service";
import FDivisionService from "@/services/apiservices/f-division-service";

import DeleteDialog from "@/components/utils/DeleteConfirmDialog.vue";
import FArticleCategDialog from "./FArticleCategDialog.vue";
import FormMode from "@/models/form-mode";
import FArticleCateg from "@/models/elibrary/f-article-categ";
import {EArticleCategGroups} from "@/models/e-article-categ-group";

export default {
  components: { FArticleCategDialog, DeleteDialog },
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
          title: "Kode1",
          align: "start",
          sortable: false,
          key: "kode1",
        },
        { title: "Kategori Arsip/Dokumen", key: "description" },
        { title: "Bidang/Dinas", key: "fdivisionBean" },
        { title: "Kategori Grup", key: "articleCategGroup" },
        { title: "Aktif", key: "statusActive" },
        { title: "Actions", key: "actions", sortable: false },
      ],

      formMode: "",
      itemSelectedIndex: -1,
      itemSelected: "",
      farticleCategs: [new FArticleCateg(0, "", "")],
      itemsFDivision: [],
      itemsArticleCategGroup: EArticleCategGroups,
    };
  },
  watch: {
    currentPage(newPage) {
      console.log(newPage)
      if (newPage) {
        this.fetchFArticleCateg();
      }
    },
    pageSize(newValue) {
      const refreshData = this.currentPage === 1;
      this.currentPage = 1;
      if (refreshData) {
        console.log("Change PageSize " + newValue);
        this.fetchFArticleCateg();
      }
    },
  },
  computed: {
    currentUser(){
      return this.$store.state.auth.user;
    },
    farticleCategsFiltered() {
      return this.farticleCategs;
    },
  },
  methods: {
    searchOnEnter(event) {
      if (this.search !== event.target.value) {
        //Krusial untuk search
        // console.log(`${event.target.value} vs ${this.search}`)
        this.currentPage = 1;
        this.search = event.target.value;
        this.fetchFArticleCateg();
      }
    },
    fetchParent() {
      if (this.currentUser.organizationLevel === "DIV") {
        FDivisionService.getFDivisionById(this.currentUser.fdivisionBean).then(
            response=>{
              this.itemsFDivision = [response.data]
              // console.log(response.data.items)
            },
            error=>{
              console.log(error.response)
            }
        )

      }else {
        FDivisionService.getAllFDivision().then(
            response => {
              // console.log(JSON.stringify(response.data))
              this.itemsFDivision = response.data
            },
            error => {
              console.log(error.response)
            }
        )
      }
    },
    fetchFArticleCateg() {
      FArticleCategService.getAllFArticleCategContaining(
        this.currentPage,
        this.pageSize,
        "id",
        "DESC",
        this.search
      ).then(
        (response) => {
          // console.log(" >>> " + responstotalItemse.data.items)
          const { items, totalPages, totalItems } = response.data;
          this.farticleCategs = items;
          this.totalPaginationPages = totalPages;
          this.totalItems = totalItems;
          // console.log(`TotalPage ${totalPages} and TotalItems ${items} `);
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
      // this.formDialogShow = true
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
      /**
       * Setiap data baru harus terlihat
       */
      // this.farticleCategs.push(this.itemSelected)
      // this.farticleCategs = [itemFromRest].concat(this.farticleCategs)
      // this.farticleCategs.unshift(itemFromRest)
      this.fetchFArticleCateg();
    },

    showDialogEdit(item) {
      this.itemSelectedIndex = this.farticleCategsFiltered.indexOf(item);
      const itemModified = Object.assign({}, item);
      // this.formDialogShow = true
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
          this.farticleCategs[this.itemSelectedIndex],
          this.itemSelected
        );
      } catch (e) {
        this.fetchFArticleCateg();
        e.toString();
      }
      this.closeDialog();
    },

    deleteDialogShow(item) {
      // console.log(item)
      this.itemSelectedIndex = this.farticleCategsFiltered.indexOf(item);
      this.itemSelected = Object.assign({}, item);
      // this.myConfirmDelete = true
      this.$refs.refDeleteConfirmDialog.showDialog(
        this.itemSelectedIndex,
        item.username
      );
    },
    deleteDialogMultiShow() {
      if (this.multiSelect === true) {
        // console.log(`nilai ${this.selectedItems}`)
        this.$refs.refDeleteConfirmDialog.showDialogMulti(
          this.selectedItems,
          `${this.selectedItems.length} items selected`
        );
      }
    },
    deleteItemConfirmedSingleSelect(index) {
      console.log("delete SingleItem: " + index);

      const deletedItem = this.farticleCategs[this.itemSelectedIndex];
      FArticleCategService.deleteFArticleCateg(deletedItem.id).then(
        () => {
          // console.log("hapus bos " + response.data + " >> " + this.itemSelectedIndex)
          this.farticleCategs.splice(this.itemSelectedIndex, 1);
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
      // console.log(okeMessage)
      if (items.length > -1) {
        let itemIds = [];
        for (let i = 0; i < items.length; i++) {
          itemIds.push(items[i].id);
        }
        // console.log("Item idex: " + itemIds)

        FArticleCategService.deleteAllFArticleCateg(itemIds).then(
          (response) => {
            if (response.data) {
              for (let i = 0; i < items.length; i++) {
                if (
                  !response.data.includes(items[i].id) ||
                  response.data.length === 0
                ) {
                  const index = this.farticleCategsFiltered.indexOf(items[i]);
                  this.farticleCategs.splice(index, 1);
                }
                if (response.data.length > 0) {
                  this.snackBarMesage = `${response.data.length} items gagal hapus (digunakan oleh data anak)`;
                  this.snackbar = true;
                }

                // console.log(
                //   "Undeleted Items: " + response.data + " = " + items[i].id
                // );
              }
              this.closeDialog();
            }
          },
          (error) => {
            console.log("error " + error);
          }
        );

        // console.log(items)
        // FArticleCategService.deleteAllFArticleCategs()
      }
    },
    closeDialog() {
      // this.myConfirmDialog = false
      this.formMode = "";
      this.$refs.refDeleteConfirmDialog.setDialogState(false);
      this.$refs.refFormDialog.setDialogState(false);

      this.$nextTick(() => {
        this.itemSelected = Object.assign({}, new FArticleCateg());
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
    lookupArticleCategGroup(id) {
      const str = this.itemsArticleCategGroup.filter((x) => x.id === id);
      if (str.length > 0) {
        return str[0];
      } else {
        return "-";
      }
    },
  },
  mounted() {
    this.fetchFArticleCateg();
    this.fetchParent();
  },
};
</script>
  
  <style scoped>
</style>