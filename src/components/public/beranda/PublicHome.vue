<template>
  <div>
    <v-card elevation="0" color="bg-white" class="no-gutters">
      <v-img
          :src="backgroundImage"
          alt="Banner Image"
          class="banner-image image-with-overlay py-16"
          height="100vh"
          gradient="to left, rgba(0,0,0,.9), rgba(0,0,0,0.1)"
          cover
      >
        <div class="text-center" style="width: 100%">
          <v-row class="mt-10">
            <v-spacer></v-spacer>
            <v-col class="mt-10" cols="12" md="6" sm="6">
              <div class="text-md-h2 text-h3 font-weight-black text-white text-center">Lebih mudah paham data lewat peta</div>
            </v-col>
            <v-spacer></v-spacer>
          </v-row>
          <v-row class="mt-1 align-center justify-center" >
            <v-col cols="12" md="6" sm="6">
              <div class="text-subtitle-1 font-weight-bold text-white text-center">Dapatkan insight dengan cepat, untuk keputusan yang tepat</div>
            </v-col>
          </v-row>
          <v-row class="align-center justify-center">
            <v-col class="px-3 mx-3" cols="12" md="5" sm="12" >
              <v-text-field
                  style="box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2); text-transform: none;"
                  prepend-inner-icon="mdi-magnify"
                  density="compact"
                  class="rounded-xl bg-white pt-1 pb-3 px-3"
                  variant="plain"
                  hide-details
                  placeholder="Cari dengan kata kunci"
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
                    <v-btn :color="isActiveDeepSearch?'indigo' : 'green'" class="rounded-be-xl rounded-te-xl font-weight-bold text-white" variant="flat" size="small" style="text-transform: none;">Search</v-btn>
                  </div>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </div>
        <v-sheet class="mx-auto bg-transparent" elevation="0" width="100%">
          <v-slide-group
              v-model="model"
              class="pa-4 bg-transparent"
              center-active
              mandatory
              :show-arrows="false"
          >
            <v-slide-group-item
                v-for="set in mapsetItems"
                :key="set.id"
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
                          :height="isMobile ? (isSelected ? '160' : '130') : (isSelected ? '224' : '186')"
                          cover
                          :src="require('@/assets/images/basemap.jpeg')"
                          class="rounded-xl"
                      />
                    </v-col>
                    <v-col cols="7" class="py-4">
                      <div class="text-md-h6 text-subtitle-1 font-weight-bold text-indigo">
                        {{set.title}}
                      </div>
                      <div class="text-md-subtitle-1 text-subtitle-2 font-weight-light text-grey">
                        {{ set.desc }}
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
    <HomePetaInteraktif></HomePetaInteraktif>
    <HomeNews :fnewsFiltered="fnewsFiltered"></HomeNews>
    <YoutubeVideo
    ></YoutubeVideo>
  </div>
</template>

<script>
import YoutubeVideo from "@/components/public/beranda/YoutubeVideo.vue";
import HomePetaInteraktif from "@/components/public/beranda/HomePetaInteraktif.vue";
import HomeNews from "@/components/public/beranda/HomeNews.vue";

export default {
  name: "PublicHome",
  components: {HomeNews, HomePetaInteraktif, YoutubeVideo},
  data() {
    return {
      fnewsFiltered:[],
      mapsetItems: [
        {
          id: 1,
          title: 'Dataset Titik UMKM',
          desc: 'Persebaran UMKM & lokasi usaha (point layer).',
          img: require('@/assets/images/basemap.jpeg'),
          color: 'indigo',
        },
        {
          id: 2,
          title: 'RDTR Zona Peruntukan',
          desc: 'Zonasi pemanfaatan ruang (polygon) untuk RDTR.',
          img: require('@/assets/images/basemap.jpeg'),
          color: 'deep-purple',
        },
        {
          id: 3,
          title: 'Jaringan Jalan',
          desc: 'Klasifikasi jalan nasional/prov/kab (line layer).',
          img: require('@/assets/images/basemap.jpeg'),
          color: 'teal',
        },
        {
          id: 4,
          title: 'Batas Administrasi',
          desc: 'Kabupaten/Kecamatan/Desa (polygon).',
          img: require('@/assets/images/basemap.jpeg'),
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
      backgroundImage: require("@/assets/images/homeimage.jpg"),
      isActiveDeepSearch: false,
    };
  },
  computed: {
    isMobile() {
      const d = this.$vuetify && this.$vuetify.display
      return d ? d.smAndDown : false
    },
  },
  methods: {
    activateDeepSearchGeojson(){
      this.isActiveDeepSearch = !this.isActiveDeepSearch
    },
  },
  mounted() {
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
  width: min(700px, 94vw);                /* >= width aktif */
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
  width: min(700px, 88vw);
  height: 240px;
  transform: translateZ(0);
}

@media (max-width: 600px){
  .sg-item-wrap{
    width: 94vw;
    padding: 2px;
  }

  .sg-card{
    height: 150px;
  }

  .sg-card--active{
    height: 180px;
  }
}

/* <style scoped> */
:deep(.v-slide-group__prev),
:deep(.v-slide-group__next) {
  display: none !important;
}
</style>