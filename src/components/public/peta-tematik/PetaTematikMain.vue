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
                @keyup.enter = "runExtendedFilter"
            >
              <template #append-inner>
                <div class="d-flex flex-row align-center">
                  <v-divider vertical></v-divider>
                  <v-btn @click="runExtendedFilter" color="green" class="font-weight-bold text-white" variant="flat" size="small">Search</v-btn>
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
            <v-chip
                v-for="cat in datasetsCateg"
                :key="cat.fdivisionBean"
                :variant="datasetCategSelected === cat.fdivisionBean ? 'flat' : 'outlined'"
                :color="datasetCategSelected === cat.fdivisionBean ? 'indigo' : undefined"
                rounded="xl"
                density="compact"
                size="small"
                class="text-subtitle-2 px-4"
                @click="selectCategClick(cat)"
            >
              <span class="text-caption">
                {{ cat.kode1 }}
              </span>
              <span class="ml-2 font-weight-bold" :class="datasetCategSelected === cat.fdivisionBean ? 'text-white' : 'text-medium-emphasis'">
                {{ cat.dataCount }}
              </span>
            </v-chip>

          </v-col>
        </v-row>
      </v-card-text>
      <v-card-text>
        <div class="text-h6 mb-6 font-weight-black text-indigo">
          Katalog <span class="color-text-primary">Peta Tematik</span>
        </div>
        <v-skeleton-loader
            :loading="loading"
            type="card, card"
            transition="scale-transition"
        >
          <v-responsive>
            <v-card class="mt-2 pa-4" elevation="0" style="box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2) !important;">
              <v-row
                  no-gutters
                  class="mt-2 wrap"
                  justify="center"
              >
                <v-col
                    v-for="tematik in ftTematiksFiltered"
                    :key="tematik.id"
                    sm="4"
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
                        class="rounded-lg d-flex flex-column h-100"
                    >
                      <v-img
                          width="100%"
                          height="200"
                          cover
                          :src="lookupImageUrl(tematik)"
                          :lazy-src="lookupImageLazyUrl(tematik)"
                          class="rounded-lg"
                      />
                      <v-card-text>
                        <div class="text-subtitle-1 font-weight-bold text-indigo">
                          {{ tematik.description }}
                        </div>
                        <div class="text-subtitle-2 font-weight-light text-grey">
                          {{ truncateNotes(tematik.notes) }}
                        </div>
                        <div class="text-subtitle-2 font-weight-black">
                          {{ tematik.categ }}
                        </div>
                        <v-chip size="small" density="comfortable" color="pink" class="font-weight-bold mt-2">Tematik</v-chip>
                      </v-card-text>
                      <v-spacer />
                      <v-card-actions class="text-center">
                        <v-spacer />
                        <v-btn  @click="goToPetaInteraktif(tematik)" size="default"  variant="text" color="indigo" style="text-transform: none;">
                          <span class="mr-2 font-weight-black">Lihat Detail</span><v-icon>mdi-arrow-right</v-icon>
                        </v-btn>
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
import FtTematikService from "@/services/apiservices/ft-tematik-service";
import FileService from "@/services/apiservices/file-service";

export default {
  name: "PetaTematikMain",
  components: {},
  data() {
    return {
      loading: false,
      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 6,
      pageSizes: [6, 10, 20],
      totalItems: 0,
      search: "",

      datasetCategSelected: {},
      datasetsCateg: [],

      mapsetItems: [
        {
          id: 1,
          title: 'Peta Tematik Kependudukan',
          desc: 'Sebaran & kepadatan penduduk per wilayah (choropleth/polygon).',
          img: require('@/assets/images/peta-tematik.png'),
          color: 'indigo',
        },
      ],
      ftTematiks:[],
      isActiveDeepSearch: false,
      filterFdivisions: [],

    };
  },
  watch: {
    currentPage(newPage) {
      if (newPage) {
        this.fetchTematik();
      }
    },
    pageSize() {
      const refreshData = this.currentPage === 1;
      this.currentPage = 1;
      if (refreshData) {
        this.fetchTematik();
      }
    },
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    ftTematiksFiltered() {
      return this.ftTematiks;
    },
  },
  methods: {
    selectCategClick(datasetCategSelected){
      this.datasetCategSelected = datasetCategSelected
      this.runExtendedFilter(this.datasetCategSelected.fdivisionBean);
    },

    lookupImageUrl(item){
      if (item.avatarImage===undefined || item.avatarImage===""){
        return require('@/assets/images/peta-tematik.png')
      }else {
        return FileService.image_url_low(item.avatarImage)
      }
    },
    lookupImageLazyUrl(item){
      if (item.avatarImage===undefined || item.avatarImage===""){
        return require('@/assets/images/peta-tematik.png')
      }else {
        return FileService.image_url_verylow(item.avatarImage)
      }
    },
    goToPetaInteraktif(item) {
      const tematikId = item.id;
      this.$router.push("/public-peta-interaktif?tematikId=" + tematikId);
    },
    fetchTematik(){
      this.runExtendedFilter()
    },
    runExtendedFilter(fdivisionBean) {
      const extendedFilter = new DataFilter();
      extendedFilter.fdivisionIds = this.filterFdivisions;
      extendedFilter.pageNo = this.currentPage;
      extendedFilter.pageSize = this.pageSize;
      extendedFilter.sortBy = "id";
      extendedFilter.order = "DESC";
      extendedFilter.search = this.search;

      if (fdivisionBean && fdivisionBean>0){
        extendedFilter.fdivisionIds = [fdivisionBean];
      }

      this.loading = true;
      FtTematikService.getPostAllFtTematikContainingExtPublic(extendedFilter).then(
          (response) => {
            const { items, totalPages, totalItems } = response.data;
            this.ftTematiks = items;
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

    truncateNotes(notes) {
      if (!notes) return "";
      return notes.length > 150 ? notes.substring(0, 150) + "…" : notes;
    },

    fetchParent(){
      FtTematikService.getCountTematiksPerDivPublic().then(
          response =>{
            this.datasetsCateg = []
            this.datasetsCateg.push({
              kode1:"All",
              description:"All Categories",
              fdivisionBean:0,
              dataCount: response.data.reduce((acc, curr) => acc + curr.dataCount, 0),
            })
            this.datasetsCateg.push(...response.data)
            // console.log(JSON.stringify(this.datasetsCateg));
          },
          error =>{
            console.log(error);
          }
      )
    },

  },
  mounted() {
    this.fetchParent()

    this.fetchTematik()
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