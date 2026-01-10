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
      :items="fArticlesFiltered"
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
      <template v-slot:[`item.number`]="{ index }">
        {{ index + (currentPage - 1) * pageSize + 1 }}
      </template>
      <template v-slot:[`item.description`]="{ item }">
        <div>
          <div class="text-subtitle-2">{{ item.description }}</div>
          <div class="caption text-blue">{{ item.authors }}</div>
          <div class="d-flex flex-row mt-2">
            <v-btn class="me-2 text-caption" variant="outlined" :color="item.fileName === ''? 'grey' : 'red-lighten-2'" :disabled="item.fileName === ''" size="small" density="comfortable" @click="showPdfViewerDialog(item)"><v-icon>mdi-file-pdf-box</v-icon>Preview</v-btn>
            <v-btn class="text-caption" variant="flat" :color="item.fileName === ''? 'grey' : 'blue'" :disabled="item.fileName === ''" size="small" density="comfortable" @click="downloadFile(item.fileName)"><v-icon>mdi-download</v-icon>Download</v-btn>
          </div>
        </div>
      </template>
      <template v-slot:[`item.data`]="{ item }">
        <div>
          <div v-if="item.volume !== ''">Volume : {{ item.volume }}</div>
          <div v-if="item.issues !== ''">Issues : {{ item.issues }}</div>
          <div>Pages : {{ item.pages }}</div>
         <div v-if="item.doi !== ''"> DOI : {{ item.doi }}</div>
        </div>
      </template>
      <template v-slot:[`item.publikasi`]="{ item }">
        <div>
          <div>Tanggal : {{ item.publicationDate }}</div>
          <div>Publisher : {{ item.publisher }}</div>
        </div>
      </template>

      <template v-slot:[`item.fdivisionBean`]="{ item }">
        <div>
          <div>{{ lookupFDivision(item.fdivisionBean).description }}</div>
          <v-chip :color="getColorStatusActive(item.statusActive)" size="x-small" variant="flat">
            {{ item.statusActive === true ? "Aktif" : "Non-Aktif" }}
          </v-chip>
        </div>
      </template>
      <template v-slot:[`item.articleCategGroup`]="{ item }">
        <div>
          <div>{{ lookupFArticleCateg(item.farticleCategBean).description }}</div>
          <v-chip :color="getColorCategGroup(item.articleCategGroup)" size="x-small" variant="flat">
            {{ lookupArticleCategGroup(item.articleCategGroup).description }}
          </v-chip>
        </div>
      </template>
      <template v-slot:[`item.avatarImage`]="{ item }">
        <v-img
          :key="cacheBust+Date.now()"
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
    <PdfViewerDialog ref="refPdfViewerDialog"></PdfViewerDialog>
    <FArticleDialog
      v-model:formMode="formMode"
      ref="refFormDialog"
      @eventFromFormDialogNew="saveDataNew"
      @eventFromFormDialogEdit="saveDataEdit"
      @eventUpdateImageRotate="eventUpdateImageRotate"
    ></FArticleDialog>

    <v-snackbar v-model="snackbar">
      {{ snackBarMesage }}
      <template v-slot:actions="{ attrs }">
        <v-btn variant="text" v-bind="attrs" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>
  
  <script>
import FArticleService from "@/services/apiservices-elibrary/f-article-service";
import FDivisionService from "@/services/apiservices/f-division-service";
import DeleteDialog from "@/components/utils/DeleteConfirmDialog.vue";
import FArticleDialog from "./FArticleDialog.vue";
import FormMode from "@/models/form-mode";
import FArticle from "@/models/elibrary/f-article";
import FileService from "@/services/apiservices/file-service";
import FArticleCategService from "@/services/apiservices-elibrary/f-article-categ-service";
import {EArticleCategGroups} from "@/models/e-article-categ-group";
import PdfViewerDialog from "@/components/utils/PdfViewerDialog.vue";

export default {
  components: {PdfViewerDialog, FArticleDialog, DeleteDialog },
  data() {
    return {
      title: "Buku, Jurnal, Produk Hukum, Renstra Etc",
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
      itemsFCountry: [],

      search: "",
      headers: [
        {
          title: "No",
          align: "start",
          sortable: false,
          key: "number",
          width:"8%"
        },
        { title: "", key: "avatarImage", width:"8%" },
        { title: "Judul Jurnal/Artikel", key: "description", width:"21%" },
        { title: "Data", key: "data", width:"15%" },
        { title: "Publikasi", key: "publikasi", width:"12%" },
        { title: "Group Categori", key: "articleCategGroup", width:"15%" },
        { title: "Actions", key: "actions", sortable: false, width:"10%" },
      ],

      formMode: "",
      itemSelectedIndex: -1,
      itemSelected: "",
      itemsFArticleCateg:[],
      itemsArticleCategGroup: EArticleCategGroups,
      fArticles: [new FArticle(0, "", "")],
      itemsFDivision: [
        { id: 1, kode1: "", description: "" },
        { id: 2, kode1: "", description: "" },
      ],
      cacheBust: 0,
    };
  },
  watch: {
    currentPage(newPage) {
      console.log(newPage)
      if (newPage) {
        this.fetchFArticle();
      }
    },
    pageSize(newValue) {
      const refreshData = this.currentPage === 1;
      this.currentPage = 1;
      if (refreshData) {
        console.log("Change PageSize " + newValue);
        this.fetchFArticle();
      }
    },
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    fArticlesFiltered() {
      return this.fArticles;
    },
  },
  methods: {
    eventUpdateImageRotate(){
      this.cacheBust = this.cacheBust++
    },
    showPdfViewerDialog(item) {
      this.$refs.refPdfViewerDialog.showDialog(item);
    },
    downloadFile(item) {
      window.open(FileService.file_url(item), '_blank');
    },
    searchOnEnter(event) {
      if (this.search !== event.target.value) {
        this.currentPage = 1;
        this.search = event.target.value;
        this.fetchFArticle();
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
        FArticleCategService.getAllFArticleCategByDivision(this.currentUser.fdivisionBean).then(
            (response) => {
              this.itemsFArticleCateg = response.data;
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
        FArticleCategService.getAllFArticleCateg().then(
            (response) => {
              this.itemsFArticleCateg = response.data;
            },
            (error) => {
              console.log(error.response);
            }
        );
      }
    },
    fetchFCountry() {
      fetch('https://restcountries.com/v3.1/all?fields=name,idd,cca2,cca3,region,subregion,timezones,languages')
          .then(response => response.json())
          .then(data => {
            data.forEach(country => {
              let name = country.name.common;
              let description = country.name.official;
              let region = country.region;

              let countryCode = parseInt((country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : '')).replace('+', ''), 10);
              this.itemsFCountry.push({id: countryCode, countryCode: countryCode, kode1: name, kode2:country.cca2, description: description,
                region: region,subregion:country.subregion, timeZone: country.timezones, languages: country.languages
              })

            });
          })
          .catch(error => console.error('Error:', error));
    },
    fetchFArticle() {
      FArticleService.getAllFArticleContaining(
        this.currentPage,
        this.pageSize,
        "id",
        "DESC",
        this.search
      ).then(
        (response) => {
          const { items, totalPages, totalItems } = response.data;
          this.fArticles = items;
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
      // this.formDialogShow = true
      this.formMode = FormMode.NEW_FORM;
      this.$refs.refFormDialog.showDialog(
          this.itemSelectedIndex,
          itemModified,
          this.itemsFDivision,
          this.itemsFCountry,
          this.itemsFArticleCateg
      );
    },
    saveDataNew(itemFromRest) {
      this.itemSelected = itemFromRest;
      this.closeDialog();
      /**
       * Setiap data baru harus terlihat
       */
      this.fetchFArticle();
    },

    showDialogEdit(item) {
      this.itemSelectedIndex = this.fArticlesFiltered.indexOf(item);
      const itemModified = Object.assign({}, item);
      this.formMode = FormMode.EDIT_FORM;
      this.$refs.refFormDialog.showDialog(
          this.itemSelectedIndex,
          itemModified,
          this.itemsFDivision,
          this.itemsFCountry,
          this.itemsFArticleCateg
      );
    },
    saveDataEdit(item) {
      this.itemSelected = item;
      try {
        Object.assign(this.fArticles[this.itemSelectedIndex], this.itemSelected);
      } catch (e) {
        this.fetchFArticle();
        e.toString();
      }
      this.closeDialog();
    },

    deleteDialogShow(item) {
      this.itemSelectedIndex = this.fArticlesFiltered.indexOf(item);
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

      const deletedItem = this.fArticles[this.itemSelectedIndex];
      FArticleService.deleteFArticle(deletedItem.id).then(
        () => {
          this.fArticles.splice(this.itemSelectedIndex, 1);
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
        FArticleService.deleteAllFArticle(itemIds).then(
          (response) => {
            if (response.data) {
              for (let i = 0; i < items.length; i++) {
                if (
                  !response.data.includes(items[i].id) ||
                  response.data.length === 0
                ) {
                  const index = this.fArticlesFiltered.indexOf(items[i]);
                  this.fArticles.splice(index, 1);
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
        this.itemSelected = Object.assign({}, new FArticle());
        this.itemSelectedIndex = -1;
      });
    },

    getColorStatusActive(trueFalse) {
      if (trueFalse === true) return "green";
      else if (trueFalse === false) return "gray";
      else return "gray";
    },
    getColorCategGroup(id) {
      if (id === 1) return "teal";
      else if (id === 2) return "indigo";
      else if (id === 3) return "purple";
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
    lookupFArticleCateg(farticleCategBean) {
      const str = this.itemsFArticleCateg.filter((x) => x.id === farticleCategBean);
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
  mounted() {
    this.fetchFCountry();
    this.fetchFArticle();
    this.fetchParent();
  },
};
</script>
  
  <style scoped>
</style>