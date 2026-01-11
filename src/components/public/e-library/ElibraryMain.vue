<template>
<!--  <v-app>-->
    <v-container class="mb-6">
      <v-row>
        <!-- Sidebar for Filters -->
        <v-col cols="12" sm="12" md="3" class="mt-2">
          <v-card outlined>
            <v-card-title class="subtitle-1 text-grey-darken-2 font-weight-bold no-gutters">Kategori</v-card-title>
            <v-divider class="mt-n2"></v-divider>
            <v-card-text class="mt-n4">
              <v-list dense>
                <v-checkbox
                    v-for="item in itemsFArticleCateg"
                    :key="item.id"
                    v-model="selectedFArticleCateg"
                    :label="item.description"
                    :value="item.id"
                    class="text-black"
                    hide-details
                    multiple
                    dense
                    @change="changeCategory"
                ></v-checkbox>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Filter by Year -->
          <v-card outlined class="mt-2 py-2">
            <v-card-subtitle class="subtitle-1 text-grey-darken-2 font-weight-bold">Filter By Year</v-card-subtitle>
            <v-card-text class="mt-n2">
              <v-row>
                <v-col class="d-flex">
                  <v-text-field density="compact" @change="runExtendedFilter" label="From" v-model="yearRange[0]" type="number" variant="outlined"></v-text-field>
                  <v-text-field density="compact" @change="runExtendedFilter" label="To" v-model="yearRange[1]" type="number" variant="outlined" class="ml-1"></v-text-field>
                </v-col>
              </v-row>

              <v-row class="mt-2">
                <v-col>
                  <v-btn small outlined color="red" @click="resetFilter">
                    <v-icon small>mdi-refresh</v-icon>
                    Reset
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Filter by Issues -->
          <v-card outlined class="mt-4" v-if="false">
            <v-card-title class="text-grey-darken-2 font-weight-bold">Filter By Issues</v-card-title>
            <v-list dense>
              <v-list-item v-for="issue in itemsIssues" :key="issue.id" @click="filterByIssue(issue.id)" class="text-red">
                <v-list-item-title>{{ issue.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Main Content -->
        <v-col cols="12" sm="12" md="9" class="mt-2">
          <!-- Search Bar -->
          <v-text-field
              v-on:keyup.enter="searchOnEnter"
              v-on:blur="searchOnEnter"
              label="Cari Judul atau Penulis"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              color="primary"
              density="compact"
              class="rounded-lg"
          ></v-text-field>

          <v-card-text class="text-center text-grey py-16 mt-16" v-if="fArticles.length === 0">
            Belum Ada {{ kategori }} Yang Di Publish
          </v-card-text>
          <!-- Article List -->
          <v-list v-if="fArticles.length > 0">
            <v-list-item v-for="article in fArticles" :key="article.id">
              <div class="flex-column">
                <div>

                  <div class="cursor-pointer font-weight-medium" @click="toArticleDetil(article)">
                    {{ article.description }}
                  </div>
                  <div class="caption text-grey darken-2">
                    <span v-if="article.publisher">
                      {{ article.publisher}},
                    </span>
                    <span>
                      {{ formatPublicationDate(article.publicationDate) }}
                    </span>
                  </div>
                  <div class="caption">
                    {{ article.authors }}
                  </div>
                </div>

                <div class="mt-4">
                    <v-btn x-small  color="grey-lighten-2" outlined @click="downloadPDF(article.fileName)" v-if="false">
                      <v-icon small color="blue">mdi-download</v-icon>
                      <span class="text-blue  text-transform-none">
                        Download PDF
                      </span>
                    </v-btn>
                    <span class="text-grey mx-1"></span>
                    <v-btn size="x-small" color="grey lighten-2" variant="outlined" @click="toArticleDetil(article)">
                      <v-icon small color="orange">mdi-format-float-left</v-icon>
                      <span class="text-blue text-transform-none">
                        Show Abstract
                      </span>
                    </v-btn>
                    <span class="text-grey mx-1"></span>
                    <v-btn size="x-small" color="grey lighten-2" variant="outlined" @click="toArticleDetil(article)">
                      <v-icon small color="blue">mdi-link-variant</v-icon>
                      <span class="text-blue text-transform-none">
                          Relate Paper
                        </span>
                    </v-btn>
                  </div>
                <v-divider class="my-2"></v-divider>
              </div>

            </v-list-item>
          </v-list>

          <!-- Pagination -->
            <v-pagination
                v-if="fArticles.length > 0"
                v-model="currentPage"
                :length="totalPaginationPages"
                total-visible="6"
                active-color="orange-darken-4"
                size="x-small"
                variant="flat"
            ></v-pagination>
        </v-col>

      </v-row>
    </v-container>
<!--  </v-app>-->
</template>

<script>
import FArticleService from "@/services/apiservices-elibrary/f-article-service";
import FArticleCategService from "@/services/apiservices-elibrary/f-article-categ-service";
import { format } from 'date-fns';
import FileService from "@/services/apiservices/file-service";

export default {
  name: 'ElibraryMain',
  props: {
    kategori: String
  },
  watch: {
  },

  data() {
    return {
      search: "",
      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 10,
      pageSizes: [10, 25, 50, 150, 500],
      yearRange: [2015, new Date().getFullYear()],
      selectedFArticleCateg: [],
      selectedIssue: undefined,

      articles: [
        {
          id: 1,
          title: "Sistem Informasi Penjualan Sparepart Motor Berbasis Web dan sangat dianjurkan untuk dijadikan referensi bagi mahasiswa yang sedang mengerjakan tugas akhir",
          subtitle: "Choerul Fikri Hamdani; Abdul Rahman",
          year: 2022,
          issueId: 1,
          pdfUrl: "#",
        },
        {
          id: 2,
          title: "Membangun Aplikasi Sistem Informasi Objek Wisata Berbasis Web dan sangat dianjurkan untuk dijadikan referensi bagi mahasiswa yang sedang mengerjakan tugas akhir",
          subtitle: "Desi Fitria Wulandika; Abdul Rohman",
          year: 2023,
          issueId: 2,
          pdfUrl: "#",
        },
      ],
      itemsIssues: [
        { id: 1, title: "Vol. 1 No. 1 (2022): APRIL 2022" },
        { id: 2, title: "Vol. 2 No. 1 (2023): APRIL 2023" },
      ],
      itemsFArticleCategDummy: [
        { id: 1, title: "Produk Hukum" },
        { id: 2, title: "Buku" },
      ],
      itemsFArticleCateg: [],
      fArticles:[],

    };
  },
  computed: {
  },
  methods: {
    searchOnEnter(event) {
      if (this.search !== event.target.value) {
        this.currentPage = 1;
        this.search = event.target.value;
        this.runExtendedFilter()
      }
    },
    fetchParent(){
      FArticleCategService.getAllFArticleCategPublic().then(
          (response) => {
            this.itemsFArticleCateg = response.data
            if (this.kategori){
                this.itemsFArticleCateg.forEach((item) => {
                  // console.log(`item.description: ${item.description} >> ${this.kategori}`)
                  if (item.description.toLowerCase().includes(this.kategori)){
                    this.selectedFArticleCateg.push(item.id)
                  }
                })
            }
            //Mengganti di Mounted
            this.runExtendedFilter()

          }
      )
    },

    runExtendedFilter() {
      const extendedFilter = {
        page: this.currentPage,
        pageSize: this.pageSize,
        sortBy: "id",
        order: "DESC",
        yearFrom: this.yearRange[0],
        yearTo: this.yearRange[1],
        selectedIssue: this.selectedIssue,
        search: this.search,
        fArticleCategIds: this.selectedFArticleCateg
      }

      // console.log(JSON.stringify(extendedFilter, null, 2))
      // this.fArticles = []

      FArticleService.getAllFArticleContainingYearsExtPublic(extendedFilter).then(
          (response) => {
            const { items, totalPages } = response.data;
            this.fArticles = items;
            this.totalPaginationPages = totalPages;

            // JSON.stringify(this.fArticles, null, 2)
          },
          (error) => {
            console.log(error)
          }
      )

    },
    changeCategory() {
      this.runExtendedFilter()
    },

    downloadFile(item) {
      return FileService.file_url(item);
    },

    toArticleDetil(article) {
      this.$router.push(`/public-e-library-detil/${article.id}`);
    },

    downloadPDF(pdfUrl) {
      window.open(FileService.file_url(pdfUrl), "_blank");
      // return FileService.file_url(item);

    },
    selectCateg(categ) {
      this.selectedCategFromParent = categ
    },
    resetFilter() {
      this.yearRange = [2015, 2024];
      this.selectedIssue = null;
      this.search = "";
      this.selectedFArticleCateg = [];

      this.runExtendedFilter()

    },

    filterByIssue(issueId) {
      this.selectedIssue = issueId;
    },
    formatPublicationDate(date){
      return format(new Date(date), 'MMMM yyyy')
    }
  },
  activated() {

  },
   mounted() {
    this.fetchParent()
    this.runExtendedFilter()
  }

};
</script>

<style scoped>
.red--text {
  color: #d32f2f !important;
}

.orange--text {
  color: #ff9800 !important;
}

.font-weight-bold {
  font-weight: bold;
}

.white--text {
  color: white !important;
}

.v-pagination {
  justify-content: center;
}

.grey--text {
  color: grey !important;
}

.mt-4 {
  margin-top: 16px;
}
.cursor-pointer {
  cursor: pointer;
}
.text-transform-none {
  text-transform: none !important;
}

</style>