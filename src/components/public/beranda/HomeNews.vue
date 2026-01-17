<template>
  <v-card elevation="0">
    <v-container>
      <div class="text-h4 mt-8 mb-6 font-weight-black color-text-second text-center">
        Berita <span class="color-text-primary">Terbaru</span>
      </div>
      <v-row v-if="fnewsFiltered.length === 0">
        <v-col>
          <div class="text-center mt-2 my-6">No available news</div>
        </v-col>
      </v-row>
      <v-row
          v-else
          no-gutters
          class="mt-2 wrap"
          justify="center"
      >
        <v-col
            v-for="item in fnewsFiltered"
            :key="item.id"
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
                  :src="lookupImageUrl(item)"
                  class="rounded-lg"
              />
              <v-card-text>
                <div class="text-subtitle-1 font-weight-black">
                  {{ item.title }}
                </div>
                <div class="text-caption mt-2" v-if="item.contentBody">
                  <span v-html="item.contentBody"></span>
                </div>
              </v-card-text>
              <v-spacer />
              <v-card-actions class="text-center bg-orange-lighten-1">
                <v-spacer />
                <v-btn @click="toDetail(item)" variant="text" class="font-weight-bold text-subtitle-1 text-white">Baca Selengkapnya</v-btn>
                <v-spacer />
              </v-card-actions>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import FileService from "@/services/apiservices/file-service";
export default {
  name: "HomeNews",
  props: {
    fnewsFiltered : Array
  },
  components: {},
  data() {
    return {
      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 3,
      pageSizes: [3],
      search: "",
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  methods: {
    linkNeated(link) {
      return link.replace(/\s+/g, "-").toLocaleLowerCase();
    },
    toNews(){
      this.$router.push("/public-berita")
    },
    toDetail(item){
      this.$router.push("/public-berita-detail/"+ this.linkNeated(item.id.toString()))
    },
    lookupImageUrl(item) {
      if (item.coverImage === undefined || item.title === "") {
        return require("@/assets/images/no_image_available.jpeg");
      } else {
        return FileService.image_url_low(item.coverImage);
      }
    },
    fetchNews(){

    }
  },
  mounted() {
  },
}
</script>

<style scoped>

</style>