<template>
  <div>
    <v-card elevation="0" color="bg-white" class="no-gutters">
      <v-img
          :src="backgroundImage"
          alt="Banner Image"
          class="banner-image image-with-overlay py-16"
          :height="$vuetify.display.smAndDown? '900' : '900'"
          gradient="to left, rgba(0,0,0,.5), rgba(0,0,0,0.05)"
          cover
      >
        <div class="text-center" style="width: 100%">
          <v-row class="mt-md-16 mt-10">
            <v-spacer></v-spacer>
            <v-col class="mt-md-16 mt-10 px-6" cols="12" md="7" sm="6">
              <div class="text-md-h2 text-h3 font-weight-black text-white text-center ">Pahami Data Peta Lebih Cepat Lewat <span class="text-orange-accent-2">Geoportal</span></div>
            </v-col>
            <v-spacer></v-spacer>
          </v-row>
          <v-row class="mt-1 align-center justify-center" >
            <v-col cols="12" class="px-6" md="6" sm="6">
              <div class="text-subtitle-1 font-weight-bold text-white text-center">Dapatkan insight instan untuk keputusan yang lebih tepat</div>
            </v-col>
          </v-row>
          <v-row class="align-center justify-center">
            <v-col class="px-6 px-md-2" cols="12" md="5" sm="12" >
              <v-text-field
                  v-model="search"
                  style="box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2); text-transform: none;"
                  prepend-inner-icon="mdi-magnify"
                  density="compact"
                  class="rounded-xl bg-white pt-1 pb-3 px-3"
                  variant="plain"
                  @focus="isSearchActive = false"
                  @input="isSearchActive = false"
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
                    <v-btn @click="searchDataset" :color="isActiveDeepSearch?'indigo' : 'green'" class="rounded-be-xl rounded-te-xl font-weight-bold text-white" variant="flat" size="small" style="text-transform: none;">Search</v-btn>
                  </div>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </div>
        <v-row class="mt-3 align-center justify-center" >
          <v-col cols="12" md="6" sm="6" class="align-center justify-center d-flex flex-row">
            <v-chip size="large" style="box-shadow: 0 3px 6px 0 rgba(255, 255, 255, 0.4)" color="blue-accent-4"  variant="elevated" class="text-white font-weight-bold"><v-icon class="mr-2 text-white">mdi-creation</v-icon> Konten Terpopuler</v-chip>
          </v-col>
        </v-row>
        <v-sheet class="mx-auto bg-transparent" elevation="0" width="100%">
          <v-slide-group
              v-model="model"
              class="pa-4 bg-transparent"
              center-active
              mandatory
              :show-arrows="false"
          >
            <v-slide-group-item
                v-for="dataset in ftDatasetsFiltered"
                :key="dataset.id"
                v-slot="{ isSelected, toggle }"
            >
              <div class="sg-item-wrap" @click="toggle">
                <v-card
                    class="sg-card rounded-xl pa-2"
                    :class="{ 'sg-card--active': isSelected }"
                >
                  <v-row>
                    <v-col cols="5">
                      <v-img
                          width="100%"
                          :height="isMobile ? (isSelected ? '146' : '130') : (isSelected ? '224' : '186')"
                          cover
                          :src="lookupImageUrl(dataset)"
                          class="rounded-xl"
                      />
                    </v-col>
                    <v-col cols="7" class="py-4 d-flex flex-column justify-space-between">
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
              </div>
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-img>
    </v-card>
    <HomeSearchResult
        v-if="search && isSearchActive"
        ref="refHomeSearchResult"
        id="target-scroll-section"
    />
    <HomePetaInteraktif></HomePetaInteraktif>
    <HomeNews :fnewsFiltered="fnewsFiltered"></HomeNews>

    <v-card class="" elevation="0" :class="isSmAndDown? 'mt-n2': 'mt-2' ">
      <YoutubeVideo
      ></YoutubeVideo>
    </v-card>

  </div>
</template>

<script>
import YoutubeVideo from "@/components/public/beranda/YoutubeVideo.vue";
import HomePetaInteraktif from "@/components/public/beranda/HomePetaTematik.vue";
import HomeNews from "@/components/public/beranda/HomeNews.vue";
import HomeSearchResult from "@/components/public/beranda/HomeSearchResult.vue";
import FtDatasetService from "@/services/apiservices/ft-dataset-service";
import FtDataset from "@/models/ft-dataset";
import FileService from "@/services/apiservices/file-service";

export default {
  name: "PublicHome",
  components: {HomeSearchResult, HomeNews, HomePetaInteraktif, YoutubeVideo},
  data() {
    return {
      isSearchActive: false,
      fnewsFiltered:[],
      mapsetItems: [
        {
          id: 1,
          title: 'Dataset Titik UMKM',
          desc: 'Persebaran UMKM & lokasi usaha (point layer).',
          img: require('@/assets/images/basemap.webp'),
          color: 'indigo',
        },
        {
          id: 2,
          title: 'RDTR Zona Peruntukan',
          desc: 'Zonasi pemanfaatan ruang (polygon) untuk RDTR.',
          img: require('@/assets/images/basemap.webp'),
          color: 'deep-purple',
        },
        {
          id: 3,
          title: 'Jaringan Jalan',
          desc: 'Klasifikasi jalan nasional/prov/kab (line layer).',
          img: require('@/assets/images/basemap.webp'),
          color: 'teal',
        },
        {
          id: 4,
          title: 'Batas Administrasi',
          desc: 'Kabupaten/Kecamatan/Desa (polygon).',
          img: require('@/assets/images/basemap.webp'),
          color: 'blue',
        },
      ],
      model: 0,            // index 0..14
      cycleTimer: null,
      cycleMs: 4500,
      toggle_exclusive: undefined,
      isDarkMode: false,
      switchOn: "beranda",

      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 3,
      pageSizes: [3],
      itemsPerSlide: 3,

      search: "",
      itemsFDivision: [],
      backgroundImage: require("@/assets/images/background/homeimage.webp"),
      isActiveDeepSearch: false,
      ftDatasets: [new FtDataset()],
    };
  },
  computed: {
    ftDatasetsFiltered() {
      return this.ftDatasets.filter(items => (items.showToMap === true));
    },
    isSmAndDown() {
      // Vuetify 3: use $vuetify.display; fallback false to avoid runtime crash
      return !!(this.$vuetify && this.$vuetify.display && this.$vuetify.display.smAndDown)
    },
    isMobile() {
      const d = this.$vuetify && this.$vuetify.display
      return d ? d.smAndDown : false
    },
  },
  methods: {
    lookupImageUrl(item){
      if (item.avatarImage===undefined || item.avatarImage===""){
        return require('@/assets/images/basemap.webp')
      }else {
        return FileService.image_url_medium(item.avatarImage)
      }
    },
    fetchFtDataset() {
      let deepSearch = this.isActiveDeepSearch
      if(this.isActiveDeepSearch){
        deepSearch = true
      }
      FtDatasetService.getAllFtDatasetPublic(deepSearch).then(
          (response) => {
            this.ftDatasets = response.data;
          },
          (error) => {
            console.log(error);
          }
      );
    },
    searchDataset () {
      this.isSearchActive = true
      this.$nextTick(() => {
        const comp = this.$refs.refHomeSearchResult
        if (comp && typeof comp.runExtendedFilter === 'function') {
          comp.runExtendedFilter(this.search)
        }
        const el = comp?.$el || comp
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    },
    activateDeepSearchGeojson(){
      this.isActiveDeepSearch = !this.isActiveDeepSearch
    },
  },
  mounted() {
    this.fetchFtDataset()
    this.model = 1;
    this.cycleTimer = window.setInterval(() => {
      const total = 4;
      this.model = (Number(this.model) + 1) % total;
    }, this.cycleMs);
  },
  beforeUnmount() {
    if (this.cycleTimer) window.clearInterval(this.cycleTimer);
  },
};
</script>

<style scoped src="./TeksAnim.css"/>

<style scoped>

.sg-item-wrap{
  /* setiap item punya "slot" yang selalu center */
  width: min(720px, 94vw);                /* >= width aktif */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
}

.sg-card{
  width: min(560px, 80vw);
  height: 200px;
  transition: width 220ms ease, height 220ms ease, transform 220ms ease;
}

.sg-card--active{
  width: min(720px, 88vw);
  height: 240px;
  transform: translateZ(0);
}

@media (max-width: 960px){
  .sg-item-wrap{
    width: 94vw;
    padding: 2px;
  }

  .sg-card{
    height: 140px;
  }

  .sg-card--active{
    height: 160px;
  }
}

/* <style scoped> */
:deep(.v-slide-group__prev),
:deep(.v-slide-group__next) {
  display: none !important;
}
</style>