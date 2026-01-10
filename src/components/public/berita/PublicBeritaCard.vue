<template>
  <v-card class="elevation-0 mt-4 service bg-light section text-xs-center">
    <v-row class="px-2">
      <v-col cols="12" sm="6" md="6">
        <!-- rounded -->
        <v-text-field
          v-on:keyup.enter="searchOnEnter"
          v-on:blur="searchOnEnter"
          append-icon="mdi-magnify"
          hint="Judul, Deskripsi Singkat (press ENTER to search)"
          label="Search"
          variant="outlined"
          density="comfortable"
        ></v-text-field>
        <!-- outlined -->
      </v-col>
    </v-row>

    <v-card
      class="elevation-0 mt-4 mb-10"
      v-for="(item, i) in fNewsFiltered"
      :key="i"
    >
      <v-row>
        <v-col align="center" md="2" cols="4">
          <v-card dark class="text-center py-2 px-1 text-white" style="background-color: darkblue">
            <span class="text-h5 font-weight-bold">{{computedDateFormattedDatefnsDay(item.created)}}</span>
            <br />
            <span class="text-subtitle-2 font-weight-medium">{{ computedDateFormattedDatefnsMonthYear(item.created) }}</span>
          </v-card>
        </v-col>
        <v-col md="10" cols="12">
          <v-card-title class="py-0 px-0">
            <v-img
              height="350"
              cover
              class="rounded-lg"
              lazy
              :src="lookupImageUrl(item)"
            ></v-img>
          </v-card-title>
          <v-card-text class="d-flex flex-column px-0 mt-5">
            <span class="text-h5 font-weight-bold">{{ item.title }}</span>
            <span
              class="text-caption mt-3 mb-1"
              v-html="item.contentBody"
            ></span>
          </v-card-text>
          <v-btn
            color="deep-orange darken-1"
            min-height="38px"
            class="text-caption font-weight-medium text-white"
            >
            <router-link
              class="text-caption font-weight-medium text-white"
              style="text-decoration: none"
              :to="`public-berita-detail/` + linkNeated(item.id.toString())"
              >Baca Selengkapnya
            </router-link>
          </v-btn
          >
        </v-col>
      </v-row>
      <v-divider class="mt-5"></v-divider>
    </v-card>
    <v-container>
      <v-row justify="center" align="center">
        <v-col cols="10" md="9" sm="8" align="right">
          <v-pagination
            v-model="currentPage"
            total-visible="3"
            active-color="orange-darken-4"
            size="small"
            variant="flat"
            :length="totalPaginationPages"
          ></v-pagination>
        </v-col>
      </v-row>
    </v-container>

    <v-snackbar v-model="snackbar">
      {{ snackBarMesage }}
      <template v-slot:actions="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>
  
  <script>
import FNewsService from "@/services/apiservices/f-news-service";
import FileService from "@/services/apiservices/file-service";

import FNews from "@/models/f-news";

import { format, parseISO } from "date-fns";

export default {
  components: {},
  data() {
    return {
      snackbar: false,
      snackBarMesage: "",
      paramId: 0,

      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 5,
      pageSizes: [9, 25, 50, 150, 500],

      search: "",
      headers: [
        {
          text: "",
          align: "start",
          sortable: false,
          value: "coverImage",
          width: "20%",
        },
        { text: "", value: "title", width: "30%" },
      ],
      fnewsDummy: [
        {avatarImage: require("@/assets/dummy/news-1.png"), title: "DPMD Kabupaten Bekasi Kembangkan Inovasi Sadatayu", contentBody: "Dinas Pemberdayaan Masyarakat dan Desa (DPMD) Kabupaten Bekasi menggelar Rapat Kelompok Kerja Operasional..."},
        {avatarImage: require("@/assets/dummy/news-2.png"), title: "DPMD Kabupaten Bekasi Usulkan Reward untuk Desa Berprestasi", contentBody: "Kepala Dinas Pemberdayaan Masyarakat dan Desa (DPMD) Kabupaten Bekasi, Rahmat Atong, akan mengusulkan..."},
        {avatarImage: require("@/assets/dummy/news-3.png"), title: "DPMD Adakan Lomba Posyandu Tingkat Kabupaten Bekasi", contentBody: "Dinas Pemberdayaan Masyarakat dan Desa (DPMD) Kabupaten Bekasi mengadakan lomba pos pembinaan..."},
        {avatarImage: require("@/assets/dummy/news-3.png"), title: "DPMD Kabupaten Bekasi Gelar Sosialisasi Penyusunan ADD", contentBody: "Dinas Pemberdayaan Masyarakat dan Desa (DPMD) Kabupaten Bekasi menggelar kegiatan sosialisasi..."}
      ],
      formMode: "",
      itemSelectedIndex: -1,
      itemSelected: "",
      fBeritas: [new FNews(1, "001")],
    };
  },
  watch: {
    currentPage(newPage) {
      console.log(newPage)
      if (newPage) {
        this.fetchFNews();
      }
    },
    pageSize(newValue) {
      const refreshData = this.currentPage === 1;
      this.currentPage = 1;
      if (refreshData) {
        console.log("Change PageSize " + newValue);
        this.fetchFNews();
      }
    },
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    fNewsFiltered() {
      let beritasModified = [];
      for (let i = 0; i < this.fBeritas.length; i++) {
        let itemBerita = this.fBeritas[i];
        if (itemBerita.contentBody !== undefined) {
          if (itemBerita.contentBody.length > 180) {
            itemBerita.contentBody =
              itemBerita.contentBody.substr(0, 179) + "...";
          }
        }
        beritasModified.push(itemBerita);
      }

      return beritasModified;
    },
  },
  methods: {
    searchOnEnter(event) {
      if (this.search !== event.target.value) {
        this.currentPage = 1;
        this.search = event.target.value;
        this.fetchFNews();
      }
    },
    fetchParent() {},
    fetchFNews() {
      FNewsService.getAllFNewsContainingPublicBerita(this.currentPage, this.pageSize, "created", "DESC", this.search).then(
        (response) => {
          const { items, totalPages } = response.data;
          this.fBeritas = items;
          this.totalPaginationPages = totalPages;
        },
        (error) => {
          console.log(error.response);
        }
      );
    },
    linkNeated(link) {
      return link.replace(/\s+/g, "-").toLocaleLowerCase();
    },
    lookupImageUrl(item) {
      if (item.coverImage === undefined || item.title === "") {
        return require("@/assets/images/no_image_available.jpeg");
      } else {
        return FileService.image_url_low(item.coverImage);
      }
    },
    computedDateFormattedDatefnsDay(value) {
      return value ? format(parseISO(value), "dd") : "";
    },
    computedDateFormattedDatefnsMonthYear(value) {
      return value ? format(parseISO(value), "MM - yyyy") : "";
    },
  },
  mounted() {
    this.paramId = this.$route.params.id;

    this.fetchParent();
    this.fetchFNews();
  },
};
</script>
  
  <style scoped>
</style>