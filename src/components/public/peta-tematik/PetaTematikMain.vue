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
                placeholder="Cari berdasarkan kata kunci"
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
          Katalog <span class="color-text-primary">Peta Tematik</span>
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
                      :src="require('@/assets/images/peta-tematik.png')"
                      class="rounded-lg"
                  />
                  <v-card-text>
                    <div class="text-subtitle-1 font-weight-bold text-indigo">
                      {{ set.title }}
                    </div>
                    <div class="text-subtitle-2 font-weight-light text-grey">
                      {{ set.desc }}
                    </div>
                  </v-card-text>

                  <v-spacer />

                  <v-card-actions class="text-center bg-indigo-lighten-5">
                    <v-spacer />
                    <v-btn size="small" class="font-weight-bold" variant="text" color="indigo">
                      <v-icon>mdi-map</v-icon><span class="ml-2">Lihat Detail</span>
                    </v-btn>
                    <v-spacer />
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
  name: "PetaTematikMain",
  components: {},
  data() {
    return {
      selectedCatId: 'all',
      mapsetItems: [
        {
          id: 1,
          title: 'Peta Tematik Kependudukan',
          desc: 'Sebaran & kepadatan penduduk per wilayah (choropleth/polygon).',
          img: require('@/assets/images/peta-tematik.png'),
          color: 'indigo',
        },
        {
          id: 2,
          title: 'Peta Tematik Ekonomi',
          desc: 'Indikator ekonomi wilayah: UMKM, pasar, dan pusat aktivitas (point/polygon).',
          img: require('@/assets/images/peta-tematik.png'),
          color: 'deep-purple',
        },
        {
          id: 3,
          title: 'Peta Tematik Infrastruktur',
          desc: 'Jaringan jalan, jembatan, utilitas dasar & aksesibilitas (line/point).',
          img: require('@/assets/images/peta-tematik.png'),
          color: 'teal',
        },
        {
          id: 4,
          title: 'Peta Tematik Tata Ruang',
          desc: 'Zonasi pemanfaatan ruang & kesesuaian lahan (polygon).',
          img: require('@/assets/images/peta-tematik.png'),
          color: 'blue',
        },
        {
          id: 5,
          title: 'Peta Tematik Lingkungan',
          desc: 'Tutupan lahan, vegetasi, area rawan, dan kualitas lingkungan (polygon).',
          img: require('@/assets/images/peta-tematik.png'),
          color: 'cyan',
        },
        {
          id: 6,
          title: 'Peta Tematik Pelayanan Publik',
          desc: 'Sebaran fasilitas layanan: kesehatan, pendidikan, pemerintahan (point).',
          img: require('@/assets/images/peta-tematik.png'),
          color: 'pink',
        },
      ],
      categories: [
        { id: 'all', name: 'All', color: 'primary', count: 128 },
        { id: 'admin', name: 'Administrasi', color: 'indigo', count: 18 },
        { id: 'infra', name: 'Infrastruktur & Utilitas', color: 'teal', count: 50 },
        { id: 'hydro', name: 'Hidrologi', color: 'blue-grey', count: 11 },
        { id: 'sosenv', name: 'Sosial & Lingkungan', color: 'light-green', count: 21 },
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