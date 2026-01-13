<template>
  <v-card elevation="0" class="bg-grey-lighten-5">
    <v-container>
      <div class="text-h5 mt-8 mb-3 font-weight-black color-text-second text-center">
        Hasil Pencarian
      </div>
      <div>
        <v-row v-if="ftDatasetsFiltered.length === 0">
          <v-col>
            <div class="text-center text-grey my-6">Dataset not found</div>
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
              xl="2"
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
                        :src="lookupImageUrl(dataset)"
                        class="rounded-lg"
                    />
                  </v-col>
                  <v-col cols="8" class="py-5 pe-4 d-flex flex-column justify-space-between">
                    <div>
                      <div class="text-subtitle-1 font-weight-bold text-indigo">
                        {{ dataset.description }}
                      </div>
                      <div class="text-subtitle-2 font-weight-light text-grey">
                        {{ dataset.notes }}
                      </div>
                      <div class="text-subtitle-2 mt-2 font-weight-bold text-orange">
                        Tahun {{ dataset.tahun }}
                      </div>
                    </div>
                    <div class="d-flex flex-row">
                      <v-spacer />
                      <v-btn size="small" class="font-weight-bold" variant="text" color="indigo">
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
        <v-col class="justify-start" cols="4" md="2" sm="2">
          <v-select
              v-model="pageSize"
              :items="pageSizes"
              label="Items per page"
              variant="outlined"
              density="compact"
          ></v-select>
        </v-col>
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
import FtDatasetService from "@/services/apiservices/ft-dataset-service";
import FileService from "@/services/apiservices/file-service";

export default {
  name: "HomeSearch",
  components: {},
  data() {
    return {
      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 4,
      pageSizes: [4, 10],
      totalItems: 0,
      search: "",
      ftDatasets: [new FtDataset()],
    };
  },
  watch: {
    currentPage(newPage) {
      if (newPage) {
        this.fetchFtDataset();
      }
    },
    pageSize() {
      const refreshData = this.currentPage === 1;
      this.currentPage = 1;
      if (refreshData) {
        this.fetchFtDataset();
      }
    },
  },
  computed: {
    ftDatasetsFiltered() {
      return this.ftDatasets;
    },
  },
  methods: {
    runExtendedFilter(search) {
      this.ftDatasets = []
      this.search = search
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
      // FtDatasetService.getAllFtDatasetPublic(
      //     deepSearch
      // ).then(
      //     (response) => {
      //       this.ftDatasets = response.data;
      //     },
      //     (error) => {
      //       console.log(error);
      //     }
      // );
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
    fetchFtDataset() {
      this.runExtendedFilter();
    },
    lookupImageUrl(item){
      if (item.avatarImage===undefined || item.avatarImage===""){
        return require('@/assets/images/basemap.webp')
      }else {
        return FileService.image_url_medium(item.avatarImage)
      }
    },
  },
};
</script>
<style scoped>

</style>