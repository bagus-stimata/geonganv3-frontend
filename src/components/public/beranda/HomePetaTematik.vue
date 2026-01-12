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
        </div>
      </v-container>
    </v-card>
</template>

<script>

export default {
  name: "HomePetaInteraktif",
  components: {},
  data() {
    return {
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
      ],
    };
  },
  computed: {
  },
  methods: {
    toPetaTematik(){
      this.$router.push("/public-peta-tematik")
    }
  },
};
</script>
<style scoped>

</style>