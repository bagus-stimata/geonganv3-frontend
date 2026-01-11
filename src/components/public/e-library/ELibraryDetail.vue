<template>
  <v-container fluid>
      <v-card-text class="mx-4 mt-0 pt-0">
        <v-breadcrumbs :items="itemsBreadcrumb">
        </v-breadcrumbs>
      </v-card-text>

      <v-row>
        <v-col cols="12" md="9" sm="12">
          <v-card elevation="4" class="pa-md-6 pa-1">
            <v-card-title>
              <div class="text-md-h5 p-wrap text-h6 font-weight-bold">{{itemModified.description}}</div>
              <div class="text-md-subtitle-2 text-caption mt-1 font-weight-bold">Authors : <span class="text-grey-lighten-1 font-weight-regular">{{itemModified.authors}}</span></div>
              <v-divider class="mt-md-6 mb-md-4 my-1" color="grey-darken-4" thickness="4"></v-divider>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4" sm="12">
                  <div class="d-flex my-2 align-center justify-center">
                    <v-card
                        width="250"
                        class="rounded-lg"
                    >
                      <v-img
                          height="300"
                          width="250"
                          cover
                          :src="lookupImageUrl(itemModified)"
                          class="rounded-lg text-center">
                      </v-img>
                    </v-card>
                  </div>
                  <div class="text-subtitle-1 mt-3 font-weight-black">INFO ARTICLE</div>
                  <v-row class="mt-1">
                    <v-col cols="3" sm="4" md="4">
                      <div class="text-subtitle-2">Volume</div>
                      <div class="text-subtitle-2">Halaman</div>
                      <div class="text-subtitle-2">Issue</div>
                      <div class="text-subtitle-2">DOI</div>
                    </v-col>
                    <v-col cols="9" sm="8" md="8">
                      <div class="text-subtitle-2"><span class="mr-1">:</span><span class="text-grey-lighten-1 font-weight-regular">{{itemModified.volume}}</span></div>
                      <div class="text-subtitle-2"><span class="mr-1">:</span><span class="text-grey-lighten-1 font-weight-regular">{{itemModified.pages}}</span></div>
                      <div class="text-subtitle-2"><span class="mr-1">:</span><span class="text-grey-lighten-1 font-weight-regular">{{itemModified.issues}}</span></div>
                      <div class="text-subtitle-2"><span class="mr-1">:</span><a>{{itemModified.doi}}</a></div>
                    </v-col>

                  </v-row>
                </v-col>
                <v-col cols="12" md="8" sm="12">
                  <div class="text-h6 font-weight-bold">ABSTRAK</div>
                  <v-textarea v-if="itemModified.notes" variant="plain" readonly class="text-subtitle-2 font-weight-light" v-html="itemModified.notes"></v-textarea>
                  <div v-else class="text-subtitle-2 text-grey font-weight-light my-4">No abstract available</div>
                </v-col>
              </v-row>
              <v-divider class="mt-md-4 mb-md-2 my-1" color="grey-darken-4" thickness="4"></v-divider>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3" sm="12">
          <v-card elevation="4" class="pa-1">
            <v-card-title class="text-subtitle-1 font-weight-bold">SOURCE</v-card-title>
            <v-card-text>
              <div class="text-subtitle-2">
                {{ itemModified.downloadCount }}
                <v-tooltip bottom>
                  <template v-slot:activator="{ props }">
                    <v-btn @click="downloadPDF(itemModified)" class="ml-2" v-bind="props" variant="elevated" size="x-small" color="primary">
                      Downloads
                      <v-icon color="white" size="small">mdi-download</v-icon>
                    </v-btn>

                  </template>
                  <span class="text-caption">Klik untuk mengunduh</span>
                </v-tooltip>

              </div>
              <div class="text-subtitle-2">
                {{ itemModified.viewCount }}
                <span class="text-primary ml-2 text-caption">views</span>
              </div>
            </v-card-text>
          </v-card>
          <v-card elevation="4" class="pa-1 mt-4">
            <v-card-title class="text-subtitle-1 font-weight-bold"><v-icon color="blue">mdi-link-variant</v-icon>
              ARTICLE LINKED</v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
</template>

<script>
import FileService from "@/services/apiservices/file-service";
import FArticleService from "@/services/apiservices-elibrary/f-article-service";
import FArticle from "@/models/elibrary/f-article";

export default {
  name: "LibraryDetail",
  components: {
  },
  data: () =>({
    itemsBreadcrumb: [
      {
        title: 'E-Library',
        disabled: false,
        href: '/public-e-library',
      },
      {
        title: 'Detail',
        disabled: true,
        href: '',
      },
    ],
    itemModified: new FArticle(),
    itemsFile: [],
    itemsFDivision:[],

  }),
  watch: {
  },
  computed:{
    currentUser(){
      return this.$store.state.auth.user
    },
  },
  methods: {
    fetchParent(){
    },
    lookupImageUrl(item) {
      if (item.avatarImage !== undefined && item.avatarImage !== "") {
        return FileService.image_url_medium(item.avatarImage);
      } else {
        return require("@/assets/images/no_image_available.jpeg");
      }
    },
    lookupImageUrlLazy(item) {
      if (item.avatarImage !== undefined && item.avatarImage !== "") {
        return FileService.image_url_verylow(item.avatarImage);
      } else {
        return require("@/assets/images/no_image_available.jpeg")
      }
    },
    downloadPDF(item) {
      if (item.id >0){

        FArticleService.updateFArticleAddDownloadCount(item).then(
            response => {
              this.itemModified.downloadCount = response.data.downloadCount
            },
            error => {
              console.log(error)
            }
        )
      }

      window.open(FileService.file_url(item.fileName), "_blank");
      // return FileService.file_url(item);

    },
    fetchFArticleById(id){
      FArticleService.getFArticleByIdPublic(id).then(
          response =>{
            this.itemModified = response.data

            if (this.itemModified.id >0) {
              FArticleService.updateFArticleAddViewCount(this.itemModified).then(
                  responseUpdate => {
                    this.itemModified.viewCount =  responseUpdate.data.viewCount
                  },
                  error => {
                    console.log(error)
                  }
              )

            }
          },
          error =>{
            console.log(error)
          }
      )
    },

  },

  mounted() {
    const routeString = this.$route.params.id

    const id =  Number.parseInt(routeString)
    this.fetchParent()
    this.fetchFArticleById(id)


  }

}
</script>

<style scoped>

.custom-textarea .v-input__control {
  border-bottom: none !important; /* Menghilangkan border bawah */
  box-shadow: none !important; /* Menghilangkan shadow */
}

.custom-textarea .v-textarea__underlay {
  border-bottom: none !important; /* Menghilangkan garis bawah pada area input */
}

.custom-textarea .v-textarea__input {
  border-bottom: none !important; /* Menghilangkan border di dalam textarea */
}

.custom-textarea .v-input__slot {
  border-bottom: none !important; /* Menghilangkan border pada slot input */
}

.custom-textarea .v-text-field__details {
  display: none; /* Menyembunyikan elemen tambahan yang mungkin menampilkan garis */
}


.cursor-pointer{
  font-weight: bold;
  cursor: pointer;
}
.p-wrap{
  text-wrap: wrap;
}

</style>