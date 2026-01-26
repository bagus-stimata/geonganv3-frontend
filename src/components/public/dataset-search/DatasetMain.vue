<template>
  <v-card elevation="0" class="mt-2">
    <v-container>
      <v-card-title class="mb-6">
        <v-row>
          <v-spacer></v-spacer>
          <v-col cols="12"  sm="10" md="8">
            <v-text-field
                v-model="search"
                style="box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);"
                prepend-inner-icon="mdi-magnify"
                density="compact"
                class="rounded-lg text-caption pt-1 pb-3 px-2"
                variant="plain"
                hide-details
                placeholder="Cari ⏎"
                @keyup.enter = "searchDataset"
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
                  <v-btn @click="searchDataset" :color="isActiveDeepSearch?'indigo' : 'green'" class=" font-weight-bold text-white" variant="flat" size="small">Search</v-btn>
                </div>
              </template>
            </v-text-field>
          </v-col>
          <v-spacer></v-spacer>
        </v-row>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-row class="ga-2">
          <v-col cols="12" class="d-flex flex-wrap ga-2">
            <v-btn
                v-for="cat in itemsCategComputed"
                :key="cat.id"
                :variant="selectedCatId === cat.id ? 'flat' : 'outlined'"
                :color="selectedCatId === cat.id ? 'indigo' : undefined"
                rounded="xl"
                density="comfortable"
                class="text-subtitle-2 px-4"
                @click="selectedCatId = cat.id"
            >
              {{ cat.description }}
              <span class="ml-2 font-weight-bold" :class="selectedCatId === cat.id ? 'text-white' : 'text-medium-emphasis'">
                ({{ cat.count }})
              </span>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-text>
        <div class="text-h6 mb-6 font-weight-black text-indigo">
          Katalog Dataset <span class="color-text-primary">Peta</span>
        </div>

        <v-skeleton-loader
            :loading="loading"
            type="card, card"
            transition="scale-transition"
        >
          <v-responsive>

            <v-card class="mt-2 pa-4" elevation="0" style="box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2) !important;">
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
                    md="3"
                    cols="12"
                    xl="2"
                    class="d-flex justify-center mb-2 pa-2"
                >
                  <v-hover v-slot="{ isHovering, props }">
                    <v-card
                        v-bind="props"
                        width="100%"
                        :style="isHovering ? 'box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.3) !important;' : 'box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2) !important;'"
                        class="rounded-lg d-flex flex-column h-100"
                    >
                      <v-img
                          width="100%"
                          height="200"
                          cover
                          :src="lookupImageUrl(dataset)"
                          :lazy-src="lookupImageLazyUrl(dataset)"
                          class="rounded-lg"
                      />
                      <v-card-text>
                        <div class="text-subtitle-1 font-weight-bold text-indigo">
                          {{ dataset.description }}
                        </div>
                        <div class="text-subtitle-2 font-weight-light text-grey">
                          {{ truncateNotes(dataset.notes) }}
                        </div>
                        <div class="text-subtitle-2 mt-2 font-weight-bold text-orange">
                          Tahun {{ dataset.tahun }}
                        </div>
                        <v-chip size="x-small" color="teal">Dataset</v-chip>
                      </v-card-text>

                      <v-spacer />

                      <v-card-actions class="text-center bg-indigo-lighten-5">
                        <v-spacer />
                        <v-btn @click="goToPetaInteraktif(dataset)" size="small" class="font-weight-bold" variant="text" color="indigo">
                          <v-icon>mdi-map</v-icon><span class="ml-2">Lihat Detail</span>
                        </v-btn>
                        <v-spacer />
                      </v-card-actions>
                    </v-card>
                  </v-hover>
                </v-col>
              </v-row>
            </v-card>

          </v-responsive>
        </v-skeleton-loader>


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

      </v-card-text>

    </v-container>
  </v-card>
</template>

<script>

import DataFilter from "@/models/payload/f-dayadukung-filter";
import FileService from "@/services/apiservices/file-service";
import FtDatasetExtService from "@/services/apiservices/ft-dataset-ext-service";

export default {
  name: "DatasetMain",
  components: {},
  data() {
    return {
      loading: false,

      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 8,
      pageSizes: [8, 15, 20],
      totalItems: 0,
      search: "",
      selectedCatId: 'All',
      ftDatasets: [],
      isActiveDeepSearch: false,

    };
  },
  watch: {
    currentPage(newPage) {
      if (newPage) {
        this.searchDataset();
      }
    },
    pageSize() {
      const refreshData = this.currentPage === 1;
      this.currentPage = 1;
      if (refreshData) {
        this.searchDataset();
      }
    },
  },
  computed: {
    itemsCategComputed(){
      const itemAll = { id: 'All', description: 'All', count: this.totalItems }
      // const base = (this.itemsCated || []).filter(item => item.id !== 'All')
      // return [itemAll, ...base]
      return [itemAll]
    },
    currentUser() {
      return this.$store.state.auth.user;
    },
    ftDatasetsFiltered() {
      return this.ftDatasets;
    },
  },
  methods: {
    goToPetaInteraktif(item) {
      const listIds = [item.id];
      this.$router.push("/public-peta-interaktif?itemIds=" + listIds.join(","));
    },

    runExtendedFilter(deepSearchStatus) {
      const extendedFilter = new DataFilter();
      extendedFilter.fdivisionIds = [];
      extendedFilter.pageNo = this.currentPage;
      extendedFilter.pageSize = this.pageSize;
      extendedFilter.sortBy = "id";
      extendedFilter.order = "DESC";
      extendedFilter.search = this.search;

      // let deepSearch = this.isActiveDeepSearch
      let deepSearch = false
      if (deepSearchStatus){
        if (deepSearchStatus===true){
          deepSearch = true
        }
      }

      // console.log(deepSearch);
      
      this.loading = true;
      FtDatasetExtService.getPostAllFtDatasetContainingExtPublic(
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
      ).finally(
          () => {
            this.loading = false;
          }
      )
    },
    searchDataset() {
      this.$nextTick(() =>{
        this.runExtendedFilter(this.isActiveDeepSearch);
      })

    },
    lookupImageUrl(item){
      if (item.avatarImage===undefined || item.avatarImage===""){
        return require('@/assets/images/basemap.webp')
      }else {
        return FileService.image_url_low(item.avatarImage)
      }
    },
    lookupImageLazyUrl(item){
      if (item.avatarImage===undefined || item.avatarImage===""){
        return require('@/assets/images/basemap.webp')
      }else {
        return FileService.image_url_verylow(item.avatarImage)
      }
    },

    activateDeepSearchGeojson(){
      this.isActiveDeepSearch = !this.isActiveDeepSearch
      this.$nextTick(() =>{
        this.searchDataset()
      })
    },
    truncateNotes(notes) {
      if (!notes) return "";
      return notes.length > 150 ? notes.substring(0, 150) + "…" : notes;
    },

  },
  mounted() {

    this.searchDataset()
  },
};
</script>

<style scoped>

/* <style scoped> */
.details-left :deep(.v-input__details) {
  justify-content: flex-start !important;
  align-items: flex-start !important;
  text-align: left !important;
}

/* slot #details masuk sebagai child langsung di v-input__details */
.details-left :deep(.v-input__details > *) {
  margin-left: 0 !important;
  margin-right: auto !important; /* ini yang “narik ke kiri” di flex */
  text-align: left !important;
  width: 100%;
  display: block;
}

.details-left :deep(.my-details) {
  text-align: left !important;
}
</style>