<template>
  <v-card class="elevation-0">
    <v-card-title>
      <v-row class="align-center">
        <v-col class="font-weight-bold" cols="12" sm="12" md="6">
          CAROUSEL/GAMBAR SLIDE
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
      :items="fdinCarouselsFiltered"
      v-model:page="currentPage"
      :items-length="totalItems"
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
      <template v-slot:[`item.jenis`]="{ item }">
        <div>
          <div>{{ lookupFDinCarouselType(item.fdinCarouselTypeBean).description }}</div>
        </div>
      </template>
      <template v-slot:[`item.description`]="{ item }">
        <div>
          <div class="text-subtitle-2 font-weight-bold">{{item.kode1}}</div>
          <div class="text-caption">{{item.description}}</div>
        </div>
      </template>

      <template v-slot:[`item.avatarImage`]="{ item }">
        <div class="avatar-thumb ma-2 rounded overflow-hidden">
          <!-- VIDEO (YouTube) -->
          <v-hover v-if="item.fdinCarouselTypeBean === 2">
            <template #default="{ isHovering, props }">
              <div v-bind="props" class="position-relative w-100 h-100">
                <v-img
                    :src="getYoutubeThumbUrl(item)"
                    width="80"
                    height="80"
                    cover
                >
                  <template #placeholder>
                    <v-skeleton-loader type="image" />
                  </template>
                </v-img>

                <v-fade-transition>
                  <div
                      v-if="isHovering"
                      class="d-flex align-center justify-center position-absolute"
                      style="inset:0;background:rgba(0,0,0,.35);"
                  >
                    <v-icon color="white" size="36">mdi-play-circle</v-icon>
                  </div>
                </v-fade-transition>
              </div>
            </template>
          </v-hover>

          <!-- IMAGE -->
          <v-img
              v-else
              :src="lookupImageUrl(item)"
              width="80"
              height="80"
              cover
          >
            <template #placeholder>
              <v-skeleton-loader type="image" />
            </template>
          </v-img>
        </div>
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

    <FDinCarouselDialog
      v-model:formMode="formMode"
      ref="refFormDialog"
      @eventFromFormDialogNew="saveDataNew"
      @eventFromFormDialogEdit="saveDataEdit"
    ></FDinCarouselDialog>

    <v-snackbar v-model="snackbar">
      {{ snackBarMessage }}
      <template v-slot:actions="{ attrs }">
        <v-btn variant="text" v-bind="attrs" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>
  
  <script>
import FDinCarouselService from "@/services/apiservices/f-din-carousel-service";
import FDivisionService from "@/services/apiservices/f-division-service";

import DeleteDialog from "@/components/utils/DeleteConfirmDialog.vue";
import FDinCarouselDialog from "./FDinCarouselDialog.vue";
import FormMode from "@/models/form-mode";
import FDinCarousel from "@/models/f-din-carousel";
import FileService from "@/services/apiservices/file-service";
import {EDinCarouselSimples} from "@/models/e-din-carousel-simple";

export default {
  components: { FDinCarouselDialog, DeleteDialog },
  data() {
    return {
      snackbar: false,
      snackBarMessage: "",

      multiSelect: false,
      selectedItems: [],

      currentPage: 1,
      totalItems: 0,
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
        { title: "Judul", key: "description",  width:'32%' },
        { title: "Jenis", key: "jenis",  width:'15%' },
        { title: "Status", key: "fdivisionBean",  width:'18%' },
        { title: "Actions", key: "actions", sortable: false,  width:'12%' },
      ],
      itemsFDinCarouselType: EDinCarouselSimples,
      formMode: "",
      itemSelectedIndex: -1,
      itemSelected: "",
      fdinCarousels: [new FDinCarousel(0, "", "")],
      itemsFDivision: [],
    };
  },
  watch: {
    currentPage(newPage) {
      console.log(newPage)
      if (newPage) {
        this.fetchFDinCarousel();
      }
    },
    pageSize(newValue) {
      const refreshData = this.currentPage === 1;
      this.currentPage = 1;
      if (refreshData) {
        console.log("Change PageSize " + newValue);
        this.fetchFDinCarousel();
      }
    },
  },
  computed: {
    currentUser(){
      return this.$store.state.auth.user;
    },
    fdinCarouselsFiltered() {
      return this.fdinCarousels;
    },
  },
  methods: {
    searchOnEnter(event) {
      if (this.search !== event.target.value) {
        this.currentPage = 1;
        this.search = event.target.value;
        this.fetchFDinCarousel();
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
    fetchFDinCarousel() {
      FDinCarouselService.getAllFDinCarouselContaining(this.currentPage, this.pageSize, "id", "DESC", this.search).then(
        (response) => {
          const { items, totalPages, totalItems } = response.data;
          this.fdinCarousels = items;
          this.totalPaginationPages = totalPages;
          this.totalItems = totalItems;
        },
        (error) => {
          console.log(error.response);

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
      this.fetchFDinCarousel();
    },
    showDialogEdit(item) {
      this.itemSelectedIndex = this.fdinCarouselsFiltered.indexOf(item);
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
          this.fdinCarousels[this.itemSelectedIndex],
          this.itemSelected
        );
      } catch (e) {
        this.fetchFDinCarousel();
        e.toString();
      }
      this.closeDialog();
    },
    deleteDialogShow(item) {
      this.itemSelectedIndex = this.fdinCarouselsFiltered.indexOf(item);
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
      const deletedItem = this.fdinCarousels[this.itemSelectedIndex];
      FDinCarouselService.deleteFDinCarousel(deletedItem.id).then(
        () => {
          this.fdinCarousels.splice(this.itemSelectedIndex, 1);
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
        FDinCarouselService.deleteAllFDinCarousel(itemIds).then(
          (response) => {
            if (response.data) {
              for (let i = 0; i < items.length; i++) {
                if (
                  !response.data.includes(items[i].id) ||
                  response.data.length === 0
                ) {
                  const index = this.fdinCarouselsFiltered.indexOf(items[i]);
                  this.fdinCarousels.splice(index, 1);
                }
                if (response.data.length > 0) {
                  this.snackBarMessage = `${response.data.length} items gagal hapus (digunakan oleh data anak)`;
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
        this.itemSelected = Object.assign({}, new FDinCarousel());
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
    lookupFDinCarouselType(fBean) {
      const str = this.itemsFDinCarouselType.filter(
          (x) => x.id === fBean
      );
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

    lookupYoutubeVideoId(item) {
      const raw = (item?.remark || "").toString().trim();
      if (!raw) return "";

      // Accept accidental format: "VIDEOID&t=94s" (missing "?")
      if (!raw.includes("?") && raw.includes("&t=")) {
        const [id, tPart] = raw.split("&t=");
        return `${id}?t=${tPart}`;
      }

      // If user pastes full YouTube URL, extract videoId (+t if present)
      try {
        if (raw.startsWith("http")) {
          const url = new URL(raw);

          // youtu.be/<id>
          if (url.hostname.includes("youtu.be")) {
            const id = url.pathname.replace("/", "");
            const t = url.searchParams.get("t");
            return t ? `${id}?t=${t}` : `${id}${url.search || ""}`;
          }

          // youtube.com/watch?v=<id>
          const v = url.searchParams.get("v");
          if (v) {
            const t = url.searchParams.get("t");
            return t ? `${v}?t=${t}` : v;
          }
        }
      } catch (e) {
        // ignore parsing error, fallback below
      }

      // Already a clean videoId or videoId?t=xx or videoId?start=xx
      return raw;
    },
    getYoutubeVideoIdOnly(item) {
      const key = this.lookupYoutubeVideoId(item);
      if (!key) return "";
      // Support both "id?..." and rare "id&..."
      return key.split("?")[0].split("&")[0];
    },
    getYoutubeThumbUrl(item) {
      const id = this.getYoutubeVideoIdOnly(item);
      if (!id) return require("@/assets/images/no_image_available.jpeg");
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    },

  },
  mounted() {
    this.fetchFDinCarousel();
    this.fetchParent();
  },
};
</script>

  <style scoped>
.avatar-thumb {
  width: 80px;
  height: 80px;
  background: #f5f5f5;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
  </style>