<template>
  <v-card class="elevation-0 mt-4 service bg-light section text-xs-center">
    <v-row class="">
      <v-col cols="11" sm="10" md="10" class="mx-4 mb-6">
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

    <div class="px-3">
      <v-card class="mt-1" elevation="0">
        <v-card-title class="mb-1 pb-1 font-weight-bold color-text-second"> Agenda </v-card-title>
        <v-card-text class="mt-6 text-caption text-center text-grey">No data Available</v-card-text>
      </v-card>
    </div>
  </v-card>
</template>
  
  <script>
import FNewsService from "@/services/apiservices/f-news-service";
// import FileService from "@/services/apiservices/file-service";

import FNews from "@/models/f-news";

// import { format, parseISO } from "date-fns";

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
      pageSize: 15,
      pageSizes: [15, 25, 50, 150, 500],

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

      formMode: "",
      itemSelectedIndex: -1,
      itemSelected: "",
      fBeritas: [new FNews(1, "001")],
    };
  },
  watch: {
    currentPage: {
      handler: function (value) {
        if (value) this.fetchFNews();
      },
    },
    pageSize: {
      handler: function (value) {
        const refreshData = this.currentPage === 1;
        this.currentPage = 1;
        if (refreshData) {
          console.log("Change PageSize " + value);
          this.fetchFNews();
        }
        // console.log("page size = " + value + " >> " + this.totalPages)
      },
    },
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    fNewsFiltered() {
      return this.fBeritas;
    },
  },
  methods: {
    searchOnEnter(event) {
      if (this.search !== event.target.value) {
        //Krusial untuk search
        // console.log(`${event.target.value} vs ${this.search}`)
        this.currentPage = 1;
        this.search = event.target.value;
        this.fetchFNews();
      }
    },
    fetchParent() {},

    fetchFNews() {
      if (this.paramId >0){
        FNewsService.getAllFNewsContainingAndFdivisionBeanPublicAgenda(
            this.currentPage,
            this.pageSize,
            "created",
            "DESC",
            this.search,
            this.paramId
        ).then(
            (response) => {
              const { items, totalPages } = response.data;
              this.fBeritas = items;
              this.totalPaginationPages = totalPages;
            },
            (error) => {
              console.log(error.response);
            }
        )

      }else {
        FNewsService.getAllFNewsContainingPublicAgenda(
            this.currentPage,
            this.pageSize,
            "created",
            "DESC",
            this.search
        ).then(
            (response) => {
              const { items, totalPages } = response.data;
              this.fBeritas = items;
              this.totalPaginationPages = totalPages;
            },
            (error) => {
              console.log(error.response);
            }
        )

      }

    },
  },
  mounted() {
    this.paramId = this.$route.params.id;


    // this.fetchFNews();
    // this.fetchParent();
  },
};
</script>
  
  <style scoped>
</style>