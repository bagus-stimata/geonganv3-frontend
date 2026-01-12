<template>
  <div>
    <v-dialog
      v-model="dialogShow"
      :max-width="formDialogOptions.width"
      :style="{ zIndex: formDialogOptions.zIndex }"
      @keydown.esc.prevent="closeForm"
      persistent
      height="85vh"
      :class="$vuetify.display.smAndDown? '': 'overflow-hidden'"
      :hide-overlay="$vuetify.display.smAndDown"
    >
      <v-card :class="$vuetify.display.smAndDown? '': 'overflow-hidden'" class="rounded-lg" height="85vh">
        <v-toolbar class="bg-white py-2 px-2" density="compact">
          <v-toolbar-title class="font-weight-bold text-subtitle-1">Katalog Mapset</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="closeForm">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-divider class="mx-4"></v-divider>
        <v-card-text class="h-100 d-flex flex-column">
          <v-row style="height: 93% !important;">
            <v-col cols="12" sm="12" md="5" class="order-2 order-md-1 d-flex flex-column" style="height: 93% !important;">
              <div class="flex-grow-0">
                <v-text-field
                    v-model="search"
                    prepend-inner-icon="mdi-magnify"
                    density="compact"
                    label="Cari mapset"
                    hide-details
                    class="rounded-lg text-caption mx-1"
                    variant="outlined"
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
                      <v-btn @click="runExtendedFilter" :color="isActiveDeepSearch?'indigo' : 'green'" class="font-weight-bold text-white" variant="flat" size="small">Search</v-btn>
                    </div>
                  </template>
                </v-text-field>
              </div>
              <v-card elevation="0" class="mt-4 px-1 flex-grow-1 overflow-y-auto">
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
                        class="pa-2 border-thin border-opacity-25"
                        width="100%"
                        height="86"
                        @click="toggleDatasetSelection(dataset)"
                        style="cursor: pointer;"
                    >
                      <v-row>
                        <v-col cols="3">
                          <v-img width="100%" height="68" class="rounded" cover :src="lookupImageUrl(dataset)" />
                        </v-col>

                        <v-col cols="9" class="d-flex flex-row align-center justify-center">
                          <v-row class="align-center justify-center pe-4">
                            <v-col cols="10">
                              <div>
                                <div class="text-caption font-weight-bold text-indigo">
                                  {{ dataset.description }}
                                </div>
                                <div
                                    style="font-size: 11px !important"
                                    class="text-caption font-weight-light text-grey-darken-4"
                                >
                                  {{ dataset.notes }} - {{dataset.tahun}}
                                </div>
                              </div>
                            </v-col>

                            <v-col cols="2" class="justify-center align-center">
                              <v-checkbox-btn
                                  :color="isDatasetSelected(dataset.id) ? 'orange' : ''"
                                  :model-value="isDatasetSelected(dataset.id)"
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
            </v-col>
            <v-col cols="12" sm="12" md="7" class="order-1 order-md-2" :style="$vuetify.display.smAndDown? '':'height: 96% !important;'">
              <v-card elevation="0" class="border-thin pa-3" :style="$vuetify.display.smAndDown? '':'height: 96% !important;'">
                <v-card v-if="itemsMapsetSelected.length ===0" elevation="0" class="d-flex flex-row justify-center align-center bg-grey-lighten-5 h-100" >
                  <v-card-text class="ma-0 pa-0 d-flex flex-column align-center justify-center text-center">
                    <v-img
                        lazy
                        height="80"
                        width="80"
                        :src="require('@/assets/images/map.png')"
                    ></v-img>
                    <div class="font-weight-black text-subtitle-1 mt-4 text-center">Pilih Mapset untuk preview</div>
                  </v-card-text>
                </v-card>
                <v-card v-else elevation="0" class="d-flex justify-start flex-column h-100">
                  <div>
                    <v-row class="mb-2">
                      <v-col cols="12" class="d-flex flex-row align-center">
                        <div class="font-weight-bold text-subtitle-2">Preview</div>
                        <v-spacer></v-spacer>
                        <v-btn @click="applyPeta" variant="flat" color="indigo" class="font-weight-bold text-subtitle-2" density="comfortable">Tampilkan pada peta</v-btn>
                      </v-col>
                    </v-row>
                    <BaseMapInteraktif map-min-height="30vh" map-max-height="30vh"></BaseMapInteraktif>
                    <v-row class="mt-1">
                      <v-col cols="12" class="d-flex flex-row align-center">
                        <div class="font-weight-bold text-subtitle-2">Mapset Terpilih</div>
                        <v-spacer></v-spacer>
                        <v-btn @click="deleteAllList" variant="flat" color="red" class="font-weight-bold text-subtitle-2" density="comfortable"><v-icon class="mr-1">mdi-delete</v-icon>Hapus semua</v-btn>
                      </v-col>
                    </v-row>
                    <v-divider class="mt-3 mb-3" thickness="2" color="grey"></v-divider>
                  </div>
                  <div class="overflow-y-auto" :style="$vuetify.display.smAndDown? 'height: 290px !important':''">
                    <v-row no-gutters class="ga-2">
                      <v-col cols="12" v-for="(itemSelected, index) in itemsMapsetSelected" :key="itemSelected.id">
                        <v-card elevation="0" class="d-flex rounded-lg flex-row align-center pa-1 border-opacity-25 border-thin">
                          <v-icon size="small" class="mx-1" color="grey">mdi-dots-vertical</v-icon>
                          <span class="bg-orange rounded-lg py-1 px-3 text-caption font-weight-bold text-white">{{index + 1}}</span>
                          <div class="ml-2 text-subtitle-2 font-weight-bold text-indigo">{{itemSelected.description}}</div>
                          <v-spacer></v-spacer>
                          <v-btn @click="deleteItem(itemSelected)" icon density="comfortable" variant="text" color="red"><v-icon>mdi-delete</v-icon></v-btn>
                        </v-card>
                      </v-col>
                    </v-row>
                  </div>
                </v-card>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
  
  <script>

import BaseMapInteraktif from "@/components/public/peta-interaktif/BaseMapInteraktif.vue";
import FDayaDukungFilter from "@/models/payload/f-dayadukung-filter";
import FtDatasetService from "@/services/apiservices/ft-dataset-service";
import FtDataset from "@/models/ft-dataset";
import FileService from "@/services/apiservices/file-service";

export default {
  name: "PickMapsetDialog",
  components: {BaseMapInteraktif},
  data() {
    return {
      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 1000,
      totalItems: 0,
      search: "",
      isActiveDeepSearch:false,
      isCheckBoxActivated: false,
      itemsMapsetSelected: [],
      dialogShow: false,
      formDialogOptions: {
        title1: "",
        title2: "",
        message1: "",
        message2: "",
        errorMessage: "",
        color: "grey lighten-3",
        width: 1000,
        zIndex: 200,
        noconfirm: false,
      },
      ftDatasets: [new FtDataset()],
      itemsFile: [],
    };
  },
  computed: {
    ftDatasetsFiltered() {
      return this.ftDatasets;
    },
  },
  methods: {
    deleteItem(item) {
      this.itemsMapsetSelected = this.itemsMapsetSelected.filter(
          it => it.id !== item.id
      );
    },
    applyPeta(){
      this.$emit('applyPeta', this.itemsMapsetSelected)
      this.closeForm()
    },
    deleteAllList(){
      this.itemsMapsetSelected = []
    },
    runExtendedFilter() {
      const extendedFilter = new FDayaDukungFilter();
      extendedFilter.fdivisionIds = [];
      extendedFilter.pageNo = this.currentPage;
      extendedFilter.pageSize = this.pageSize;
      extendedFilter.sortBy = "id";
      extendedFilter.order = "DESC";
      extendedFilter.search = this.search;
      extendedFilter.city = "";
      let deepSearch = this.isActiveDeepSearch
      if(this.isActiveDeepSearch){
        deepSearch = true
      }
      FtDatasetService.getPostAllFtDatasetContainingExtPublic(
          extendedFilter,
          deepSearch
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
    lookupImageUrl(item){
      if (item.avatarImage===undefined || item.avatarImage===""){
        return require('@/assets/images/basemap.jpeg')
      }else {
        return FileService.image_url_medium(item.avatarImage)
      }
    },
    activateDeepSearchGeojson(){
      this.isActiveDeepSearch = !this.isActiveDeepSearch
    },
    showDialog(itemsMapsetSelected) {
      this.dialogShow = true
      this.itemsMapsetSelected = itemsMapsetSelected
    },
    closeForm() {
      this.dialogShow = false;
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
  },
  mounted() {
    this.runExtendedFilter()
  }
};
</script>
<style scoped>
.border-activated {
  border: 2px solid #FF8030 !important;
  border-radius: 8px;
}
</style>