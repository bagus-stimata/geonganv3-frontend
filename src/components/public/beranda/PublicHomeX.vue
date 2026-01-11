<template>
  <div>
    <v-card elevation="0" color="bg-white" class="no-gutters">
      <v-img
          :src="backgroundImage"
          alt="Banner Image"
          class="banner-image image-with-overlay"
          height="100vh"
          gradient="to left, rgba(0,0,0,.9), rgba(0,0,0,0.1)"
          cover
      >
        <div style="position: relative; top: 170px">
          <v-row>
            <v-col class="text-center d-flex">
              <v-spacer />
              <v-img
                  max-height="160"
                  max-width="110"
                  contain
                  :src="require('@/assets/logo.png')"
              />
              <v-spacer />
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <div class="title text-center">
                <h2>
                  <div class="waviy">
                    <span style="--i: 1" class="orange--text">G</span>
                    <span style="--i: 2" class="orange--text">E</span>
                    <span style="--i: 1" class="orange--text">O</span>
                    <span style="--i: 1" class="orange--text">.</span>
                    <span style="--i: 2">P</span>
                    <span style="--i: 1">O</span>
                    <span style="--i: 1">R</span>
                    <span style="--i: 2">T</span>
                    <span style="--i: 2">A</span>
                    <span style="--i: 2">L</span>
                  </div>
                </h2>
                <div class="mt-0 my-title1">DISKOMINFO</div><br>
                <div class="mt-n2 my-title2">KABUPATEN NGANJUK</div>
              </div>
            </v-col>
          </v-row>

          <v-row class="mt-0">
            <v-col />
            <v-col cols="12" class="text-center">
              <v-text-field
                  v-if="false"
                  v-model="search"
                  outlined
                  class="v-text-field__slot text-center white rounded-pill elevation-16"
                  append-inner-icon="mdi-magnify"
                  hide-details
                  single-line
                  placeholder="Masukkan Kata Kunci.. (Enter untuk mencari)"
                  @keyup.enter="searchData"
              />
              <!-- custom input tetap sama UI-nya -->
              <div class="search-container">
                <input
                    type="text"
                    v-model="search"
                    @keyup.enter="searchData"
                    placeholder="Masukkan Kata Kunci.. (Enter untuk mencari)"
                    class="centered-input"
                />
                <v-icon class="input-icon">mdi-magnify</v-icon>
              </div>
            </v-col>
            <v-col />
          </v-row>
        </div>
      </v-img>
    </v-card>

    <div class="text-center mt-n16">
      <v-row class="text-center">
        <v-spacer />
        <v-card class="d-flex text-center rounded-lg" elevation="15" style="z-index:2">
          <CustomButton label="Katalog Peta" icon="mdi-database" link="public-dataset" />
          <CustomButton label="Data OPD" icon="mdi-home" link="/" />
          <CustomButton label="Peta Interaktif" icon="mdi-map" link="public-map" />
          <CustomButton label="Berita" icon="mdi-library" link="public-berita" />
        </v-card>
        <v-spacer />
      </v-row>
    </div>

    <HomeSearchResult
        ref="refHomeSearchResult"
        id="target-scroll-section"
    />

    <div class="elevation-0" v-if="false">
      <CustomButton link="aa" icon="aa" label="aa" />
    </div>

    <div>
      <div class="text-h5 green--text text--darken-2 font-weight-bold text-center">
        CAPAIAN KINERJA INDIKATOR MAKRO
      </div>

      <div class="mt-6 text-center">
        <PublicHomeCharts />
      </div>
    </div>
  </div>
</template>

<script>
import CustomButton from "@/components/public/beranda/CustomButton.vue";
import HomeSearchResult from "@/components/public/beranda/HomeSearchResult.vue";
import PublicHomeCharts from "@/components/public/beranda/PublicHomeCharts.vue";

export default {
  name: "PublicHome",
  components: {PublicHomeCharts, HomeSearchResult, CustomButton},
  data() {
    return {
      toggle_exclusive: undefined,
      isDarkMode: false,
      switchOn: "beranda",

      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 3,
      pageSizes: [3],
      itemsPerSlide: 3,

      model: null,
      search: "",
      itemsFDivision: [],
      backgroundImage: require("@/assets/images/homeimage.jpg"),

    };
  },
  methods: {
    searchData() {
      if (this.search.length < 3) {
        return;
      }

      //Scroll ke paling Bawah Halaman
      // window.scrollTo({
      //   top: document.body.scrollHeight,
      //   behavior: 'smooth'
      // });
      const element = document.getElementById('target-scroll-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      this.$refs.refHomeSearchResult.fetchData(this.search);

      // console.log("searchData");

    },
  },
  mounted() {

  },
};
</script>

<style scoped src="./TeksAnim.css"/>

<style scoped>

.search-container {
  position: relative;
  display: inline-block;
}

.centered-input {
  color: white;
  text-align: center;
  font-weight: bold;
  padding: 10px 40px 10px 20px; /* Sesuaikan padding agar ada ruang untuk ikon */
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 50px; /* Membuat input menjadi melingkar */
  outline: none;
  width: 500px;
  background-color: transparent;
  flex-grow: 1;
}

.input-icon {
  margin-top: 10px;
  position: absolute;
  right: 10px; /* Posisi ikon di kanan input */
  color: #ccc;
  pointer-events: none; /* Ikon tidak bisa di-klik */
}
</style>