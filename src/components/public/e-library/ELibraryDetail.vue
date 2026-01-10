<template>
  <v-card flat>
    <v-container>
      <v-card-text class="mx-4 mt-0 pt-0">
        <v-breadcrumbs :items="itemsBreadcrumb">
        </v-breadcrumbs>
      </v-card-text>
      <v-card-text class="mt-0 pt-0">
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-card
                width="240"
                px-3
                class="ma-3 rounded-lg"
            >
              <div>
                <v-img
                    height="300"
                    width="240"
                    :src="lookupImageUrl(itemModified)"
                    class="rounded-lg">
                </v-img>
              </div>
            </v-card>
          </v-col>

          <v-col class="mt-2" cols="12" md="9" sm="6">
            <div class="text-h5 font-weight-bold">{{itemModified.description}}</div>
            <div class="text-subtitle-2 mt-1 font-weight-bold">Authors : <span class="lighten-1 grey--text font-weight-regular">{{itemModified.authors}}</span></div>
            <div class="mt-6">
              <div class="text-subtitle-2 font-weight-bold">Volume : <span class="lighten-1 grey--text font-weight-regular">{{itemModified.volume}}</span></div>
              <div class="text-subtitle-2 font-weight-bold">Halaman : <span class="lighten-1 grey--text font-weight-regular">{{itemModified.pages}}</span></div>
              <div class="text-subtitle-2 font-weight-bold">Issue : <span class="lighten-1 grey--text font-weight-regular">{{itemModified.issues}}</span></div>
              <div class="text-subtitle-2 font-weight-bold">DOI : <a>{{itemModified.doi}}</a></div>
            </div>
            <div class="mt-8">
              <div class="text-subtitle-2">
                {{ itemModified.downloadCount }}
                <v-tooltip bottom>
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" variant="plain" size="small" style="text-transform: none !important;">
                      <span class="text-blue cursor-pointer" @click="downloadPDF(itemModified)">Downloads</span>
                      <v-icon color="blue" small>mdi-download</v-icon>
                    </v-btn>

                  </template>
                  <span class="caption">Klik untuk mengunduh</span>
                </v-tooltip>

              </div>
              <div class="text-subtitle-2">
                {{ itemModified.viewCount }}
                <span class="blue--text ml-2 caption">views</span>
              </div>
            </div>
          </v-col>

        </v-row>
      </v-card-text>
      <v-card-text>
        <div class="text-h6 font-weight-bold">ABSTRAK</div>
        <v-textarea variant="plain" readonly class="text-subtitle-2 font-weight-light" v-html="itemModified.notes"></v-textarea>
      </v-card-text>

      <v-card-text>
        <div class="text-subtitle-1">
          <v-icon color="blue">mdi-link-variant</v-icon>
          Rekomendasi Artikel Yang Berhubungan
        </div>
        <v-divider></v-divider>
      </v-card-text>
    </v-container>
  </v-card>
</template>

<script>
import FileService from "@/services/apiservices/file-service";
import FArticleService from "@/services/apiservices-elibrary/f-article-service";
import FArticle from "@/models/elibrary/f-article";

import {format, parseISO} from "date-fns";

import ERole from "@/models/e-role";

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
    currentUserWebinar(){
      if(this.$store.state.auth.user){
        return !!this.$store.state.auth.user.roles.includes(ERole.ROLE_USER);
      } else {
        return false
      }
    },
  },
  methods: {
    linkNeated(link) {
      return link.replace(/\s+/g, "-").toLocaleLowerCase();
    },
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
    computedDateFormattedDatefns(value) {
      return value ? format(parseISO(value), "dd-MMM-yyyy : hh:mm") : "";
      // return value.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    },
    formatTanggal(value, myFormat) {
      myFormat.toString()
      return value ? format(parseISO(value), `${myFormat}`) : "";
      // return value.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
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

</style>