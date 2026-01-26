<template>
  <v-card elevation="0" class="bg-grey-lighten-5">
    <v-container>
      <div class="text-h5 mt-8 mb-3 font-weight-black color-text-second text-center">
        Hasil Pencarian
      </div>
      <div>
        <v-row v-if="ftDatasetsFiltered.length === 0 && ftTematiksFiltered.length === 0">
          <v-col>
            <div class="text-center text-grey my-6">No data found</div>
          </v-col>
        </v-row>
        <v-row
            v-else
            no-gutters
            class="mt-2 wrap"
            justify="center"
        >
          <v-col
              v-for="dataset in ftDatasetsFiltered"
              :key="dataset.id"
              sm="6"
              md="6"
              cols="12"
              xl="4"
              class="d-flex justify-center mb-2 pa-2"
          >
            <v-hover v-slot="{ isHovering, props }">
              <v-card
                  v-bind="props"
                  width="100%"
                  :style="isHovering ? 'box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.3) !important;' : 'box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2) !important;'"
                  class="rounded-lg"
              >
                <v-row>
                  <v-col cols="4">
                    <v-img
                        width="100%"
                        height="140"
                        cover
                        :src="lookupImageUrlDataset(dataset)"
                        class="rounded-lg"
                    />
                  </v-col>
                  <v-col cols="8" class="py-5 pe-4 d-flex flex-column justify-space-between">
                    <div>
                      <div class="text-subtitle-1 font-weight-bold text-indigo">
                        {{ dataset.description }}
                      </div>
                      <div class="text-subtitle-2 font-weight-light text-grey">
                        {{ truncateNotes(dataset.notes) }}
                      </div>
                      <div class="text-caption font-weight-bold text-orange">
                        Tahun {{ dataset.tahun }}
                      </div>
                      <v-chip size="x-small" color="teal">Dataset</v-chip>
                    </div>
                    <div class="d-flex flex-row">
                      <v-spacer />
                      <v-btn  @click="goToPetaInteraktif(dataset, 'dataset')"  size="small" class="font-weight-bold" variant="text" color="indigo" style="text-transform: none;">
                        <span class="mr-2">Lihat Detail</span><v-icon>mdi-arrow-right</v-icon>
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-hover>
          </v-col>
          <v-col
              v-for="tematik in ftTematiksFiltered"
              :key="tematik.id"
              sm="6"
              md="6"
              cols="12"
              xl="4"
              class="d-flex justify-center mb-2 pa-2"
          >
            <v-hover v-slot="{ isHovering, props }">
              <v-card
                  v-bind="props"
                  width="100%"
                  :style="isHovering ? 'box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.3) !important;' : 'box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2) !important;'"
                  class="rounded-lg"
              >
                <v-row>
                  <v-col cols="4">
                    <v-img
                        width="100%"
                        height="140"
                        cover
                        :src="lookupImageUrlTematik(tematik)"
                        class="rounded-lg"
                    />
                  </v-col>
                  <v-col cols="8" class="py-5 pe-4 d-flex flex-column justify-space-between">
                    <div>
                      <div class="text-subtitle-1 font-weight-bold text-indigo">
                        {{ tematik.description }}
                      </div>
                      <div class="text-subtitle-2 font-weight-light text-grey">
                        {{ tematik.notes }}
                      </div>
                      <div class="text-caption font-weight-black">
                        {{ tematik.categ }}
                      </div>
                      <v-chip size="x-small" color="pink">Tematik</v-chip>
                    </div>
                    <div class="d-flex flex-row">
                      <v-spacer />
                      <v-btn  @click="goToPetaInteraktif(tematik, 'tematik')"  size="small" class="font-weight-bold" variant="text" color="indigo" style="text-transform: none;">
                        <span class="mr-2">Lihat Detail</span><v-icon>mdi-arrow-right</v-icon>
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </div>
      <v-row class="mt-3" justify="center" align="center">
        <v-spacer></v-spacer>
        <v-col cols="8" md="10" sm="8" class="d-flex flex-row justify-end">
          <v-pagination
              v-model="currentPage"
              :length="totalPaginationPages"
              total-visible="8"
              active-color="orange-darken-4"
              size="x-small"
              variant="flat"
          ></v-pagination>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>
<script>

import FtDataset from "@/models/ft-dataset";
import FDayaDukungFilter from "@/models/payload/f-dayadukung-filter";
import FileService from "@/services/apiservices/file-service";
import FtTematikService from "@/services/apiservices/ft-tematik-service";
import FtTematik from "@/models/ft-tematik";
import FtDatasetExtService from "@/services/apiservices/ft-dataset-ext-service";

export default {
  name: "HomeSearch",
  components: {},
  data() {
    return {
      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 4,
      pageSizes: [8, 16],
      search: "",
      ftDatasets: [new FtDataset()],
      ftTematiks: [new FtTematik()],
    };
  },
  watch: {
    currentPage(newPage) {
      if (newPage) {
        this.fetchData();
      }
    },
    pageSize() {
      const refreshData = this.currentPage === 1;
      this.currentPage = 1;
      if (refreshData) {
        this.fetchData();
      }
    },
  },
  computed: {
    ftDatasetsFiltered() {
      return this.ftDatasets;
    },
    ftTematiksFiltered() {
      return this.ftTematiks;
    },
  },
  methods: {
    goToPetaInteraktif(item, type) {
      const listIds = [item.id];
      if(type === 'dataset'){
        this.$router.push("/public-peta-interaktif?itemIds=" + listIds.join(","));
      }else if(type=== 'tematik'){
        this.$router.push("/public-peta-interaktif?tematikId=" + item.id);
      }
    },
    runExtendedFilter(search, deepSearchStatus) {
      if (typeof search === "string") {
        this.search = search.trim();
        this.currentPage = 1;
      }
      const extendedFilter = new FDayaDukungFilter();
      extendedFilter.fdivisionIds = [];
      extendedFilter.pageNo = this.currentPage; // sesuaikan kalau BE pakai 0-based
      extendedFilter.pageSize = this.pageSize;
      extendedFilter.sortBy = "id";
      extendedFilter.order = "DESC";
      extendedFilter.search = this.search || "";
      extendedFilter.city = "";

      let deepSearch = false
      if (deepSearchStatus){
        if (deepSearchStatus===true){
          deepSearch = true
        }
      }

      // Clone filter supaya nggak ke-mutate silang di service
      const filterDataset = { ...extendedFilter };
      const filterTematik = { ...extendedFilter };

      // Optional: clear dulu biar UX keliatan "refresh"
      this.ftDatasets = [];
      this.ftTematiks = [];

      // console.log(deepSearch);

      Promise.all([
        FtDatasetExtService.getPostAllFtDatasetContainingExtPublic(filterDataset, deepSearch),
        FtTematikService.getPostAllFtTematikContainingExtPublic(filterTematik),
      ])
          .then(([resDataset, resTematik]) => {
            const { items: itemsDataset, totalPages: tpDatasetRaw } = (resDataset && resDataset.data) || {};
            const { items: itemsTematik, totalPages: tpTematikRaw } = (resTematik && resTematik.data) || {};

            this.ftDatasets = Array.isArray(itemsDataset) ? itemsDataset : [];
            this.ftTematiks = Array.isArray(itemsTematik) ? itemsTematik : [];

            const safeDatasetPages = Number.isFinite(Number(tpDatasetRaw)) ? Number(tpDatasetRaw) : 0;
            const safeTematikPages = Number.isFinite(Number(tpTematikRaw)) ? Number(tpTematikRaw) : 0;

            const maxPages = Math.max(safeDatasetPages, safeTematikPages, 1);
            this.totalPaginationPages = maxPages;
          })
          .catch((err) => {
            console.log(err);
          });
    },
    fetchData() {
      this.runExtendedFilter();
    },
    lookupImageUrlDataset(item){
      if (item.avatarImage===undefined || item.avatarImage===""){
        return require('@/assets/images/basemap.webp')
      }else {
        return FileService.image_url_medium(item.avatarImage)
      }
    },
    lookupImageUrlTematik(item){
      if (item.avatarImage===undefined || item.avatarImage===""){
        return require('@/assets/images/peta-tematik.png')
      }else {
        return FileService.image_url_medium(item.avatarImage)
      }
    },
    truncateNotes(notes) {
      if (!notes) return "";
      return notes.length > 150 ? notes.substring(0, 150) + "…" : notes;
    },
  },
};
</script>
<style scoped>

</style>