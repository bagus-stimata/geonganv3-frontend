<template>
  <v-card elevation="0" class="mt-2">
    <v-container>
      <v-card-title class="mb-6">
        <v-row>
          <v-spacer></v-spacer>
          <v-col cols="12" md="6" sm="12">
            <v-text-field
                style="box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);"
                prepend-inner-icon="mdi-magnify"
                density="compact"
                class="rounded-lg text-caption pt-1 pb-3 px-3"
                variant="plain"
                hide-details
                placeholder="Cari Berdasarkan Nama Dataset/Kata Kunci"
            >
              <template #append-inner>
                <div class="d-flex flex-row align-center">
                  <v-divider vertical></v-divider>
                  <v-btn @click="activateDeepSearchGeojson" size="regular" class="px-2 font-weight-bold" :color="isActiveDeepSearch?'blue':''" density="comfortable" variant="text">
                    <v-icon v-if="isActiveDeepSearch" color="blue">mdi-map-check</v-icon>
                    <v-icon v-else>mdi-map</v-icon>
                    <span :class="isActiveDeepSearch?'text-blue':'text-grey-darken-2'" class="ml-1 font-weight-bold text-subtitle-2">Deep</span>
                    <v-tooltip
                        activator="parent"
                        location="top"
                    >Deep search dataset peta</v-tooltip>
                  </v-btn>
                  <v-btn :color="isActiveDeepSearch?'indigo' : 'green'" class="rounded-be-xl rounded-te-xl font-weight-bold text-white" variant="flat" size="small">Search</v-btn>
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
                v-for="cat in categories"
                :key="cat.id"
                :variant="selectedCatId === cat.id ? 'flat' : 'outlined'"
                :color="selectedCatId === cat.id ? 'indigo' : undefined"
                rounded="xl"
                class="text-subtitle-2 px-4"
                @click="selectedCatId = cat.id"
            >
              {{ cat.name }}
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
        <v-card class="mt-2 pa-4" elevation="0" style="box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2) !important;">
          <v-row
              no-gutters
              class="mt-2 wrap"
              justify="center"
          >
            <v-col
                v-for="set in mapsetItems"
                :key="set.id"
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
                    class="rounded-lg"
                >
                  <v-img
                      width="100%"
                      height="200"
                      cover
                      :src="require('@/assets/images/basemap.jpeg')"
                      class="rounded-lg"
                  />
                  <v-card-text>
                    <div class="text-subtitle-1 font-weight-bold text-indigo">
                      {{set.title}}
                    </div>
                    <div class="text-subtitle-2 font-weight-light text-grey">
                      {{ set.desc }}
                    </div>
                  </v-card-text>
                  <v-spacer></v-spacer>
                  <v-card-actions class="text-center bg-indigo-lighten-5">
                    <v-spacer></v-spacer>
                    <v-btn size="small" class="font-weight-bold" variant="text" color="indigo"><v-icon>mdi-map</v-icon><span class="ml-2">Lihat Detail</span></v-btn>
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-hover>
            </v-col>
          </v-row>
        </v-card>
      </v-card-text>
    </v-container>
  </v-card>
</template>

<script>

export default {
  name: "DatasetMain",
  components: {},
  data() {
    return {
      selectedCatId: 'all',
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
        {
          id: 5,
          title: 'Hidrologi',
          desc: 'Sungai, saluran, danau (line/polygon).',
          img: require('@/assets/images/basemap.jpeg'),
          color: 'cyan',
        },
        {
          id: 6,
          title: 'Fasilitas Publik',
          desc: 'Sekolah, puskesmas, kantor, dll (point).',
          img: require('@/assets/images/basemap.jpeg'),
          color: 'pink',
        },
        {
          id: 7,
          title: 'Kawasan Rawan Bencana',
          desc: 'KRB banjir/longsor (polygon) untuk mitigasi.',
          img: require('@/assets/images/basemap.jpeg'),
          color: 'orange',
        },
        {
          id: 8,
          title: 'Potensi Investasi',
          desc: 'Lahan potensial + catatan peluang (point/polygon).',
          img: require('@/assets/images/basemap.jpeg'),
          color: 'green',
        },
      ],
      categories: [
        { id: 'all', name: 'All', color: 'primary', count: 128 },
        { id: 'admin', name: 'Administrasi', color: 'indigo', count: 18 },
        { id: 'rdtr', name: 'RDTR / RTRW', color: 'deep-purple', count: 12 },
        { id: 'infra', name: 'Infrastruktur', color: 'teal', count: 26 },
        { id: 'transport', name: 'Transportasi', color: 'blue', count: 15 },
        { id: 'util', name: 'Utilitas', color: 'cyan', count: 9 },
        { id: 'landuse', name: 'Tata Guna Lahan', color: 'green', count: 22 },
        { id: 'env', name: 'Lingkungan', color: 'light-green', count: 14 },
        { id: 'hydro', name: 'Hidrologi', color: 'blue-grey', count: 11 },
        { id: 'demografi', name: 'Sosial & Demografi', color: 'pink', count: 7 },
        { id: 'invest', name: 'Potensi Investasi', color: 'orange', count: 10 },
      ],
      isActiveDeepSearch: false,

    };
  },
  methods: {
    activateDeepSearchGeojson(){
      this.isActiveDeepSearch = !this.isActiveDeepSearch
    },
  },
  mounted() {

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