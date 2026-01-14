<template>
  <v-card elevation="0">
      <v-container>
        <div class="text-h4 mt-8 mb-3 font-weight-black color-text-second text-center">
          Peta Tematik <span class="color-text-primary">Interaktif</span>
        </div>
        <v-row class="align-center justify-center">
          <v-col cols="12" md="6" sm="12">
            <div class="text-subtitle-1 text-grey text-center">
              Pengalaman jelajah data melalui represenstasi visual, mengungkap pola dan tren, berinteraksi langsung dengan peta
            </div>
          </v-col>
        </v-row>
        <v-row class="align-center my-3 justify-center">
          <v-btn @click="toPetaTematik" variant="plain" size="small" class="text-deep-orange font-weight-bold">
            Lihat Lebih Banyak <v-icon class="ml-2">mdi-arrow-right</v-icon>
          </v-btn>
        </v-row>
        <div>
          <v-row
              no-gutters
              class="mt-2 wrap"
              justify="center"
          >
            <v-col
                v-for="tematik in ftTematiksFiltered"
                :key="tematik.id"
                sm="6"
                md="4"
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
                      {{ tematik.notes }}
                    </div>
                    <div class="text-subtitle-2 font-weight-black">
                      {{ tematik.categ }}
                    </div>
                    <v-chip size="small" density="comfortable" color="pink" class="font-weight-bold mt-2">Tematik</v-chip>
                  </v-card-text>
                  <v-spacer />
                  <v-card-actions class="text-center bg-indigo-lighten-5">
                    <v-spacer />
                    <v-btn @click="goToPetaInteraktif(tematik)" size="small" class="font-weight-bold" variant="text" color="indigo">
                      <v-icon>mdi-map</v-icon><span class="ml-2">Lihat Detail</span>
                    </v-btn>
                    <v-spacer />
                  </v-card-actions>
                </v-card>
              </v-hover>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-card>
</template>

<script>

import FileService from "@/services/apiservices/file-service";
import DataFilter from "@/models/payload/f-dayadukung-filter";
import FtTematikService from "@/services/apiservices/ft-tematik-service";

export default {
  name: "HomePetaInteraktif",
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
      ftTematiks:[],
      filterFdivisions: [],
    };
  },
  computed: {
    ftTematiksFiltered() {
      return this.ftTematiks;
    },
  },
  methods: {
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
    toPetaTematik(){
      this.$router.push("/public-peta-tematik")
    },
    goToPetaInteraktif(item) {
      const tematikId = item.id;
      this.$router.push("/public-peta-interaktif?tematikId=" + tematikId);
    },
    fetchTematik(){
      this.runExtendedFilter()
    },
    runExtendedFilter() {
      const extendedFilter = new DataFilter();
      extendedFilter.fdivisionIds = this.filterFdivisions;
      extendedFilter.pageNo = this.currentPage;
      extendedFilter.pageSize = this.pageSize;
      extendedFilter.sortBy = "id";
      extendedFilter.order = "DESC";
      extendedFilter.search = this.search;

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
  },
  mounted() {
    this.fetchTematik()
  },
};
</script>
<style scoped>

</style>