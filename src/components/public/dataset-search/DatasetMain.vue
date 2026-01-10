<template>
  <div>
    <MenuBar></MenuBar>
    <v-row class="mt-4">
      <v-col></v-col>
      <v-col cols="6" class="text-center" align="">
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
      <v-col></v-col>
    </v-row>

    <DatasetSearchResult
      ref="refDatasetSearchResult"
      id="target-scroll-section"
    ></DatasetSearchResult>

  </div>
</template>

<script>
import DatasetSearchResult from "@/components/public/dataset-search/DatasetSearchResult.vue";
import MenuBar from "@/components/MenuBar.vue";

export default {
  name: "DatasetMain",
  components: {MenuBar, DatasetSearchResult},
  data() {
    return {
      toggle_exclusive: undefined,
      isDarkMode: false,

      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 3,
      pageSizes: [3],
      itemsPerSlide: 3,

      model: null,
      search: "",
      itemsFDivision: [],

    };
  },
  methods: {
    searchData() {
      if (this.search.length < 3) {
        return;
      }

      const element = document.getElementById('target-scroll-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      this.$refs.refDatasetSearchResult.fetchData(this.search);

    },
  },
  mounted() {

  },
};
</script>

<style scoped>

.search-container {
  position: relative;
  display: inline-block;
}

.centered-input {
  color: #2e2e2e;
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