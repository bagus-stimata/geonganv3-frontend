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
      <v-row v-else justify="center" class="wrap">
        <v-col
            class="d-flex justify-center"
            v-for="(item, i) in fnewsFiltered"
            :key="i"
        >
          <v-card
              min-width="320"
              max-width="400"
              class="my-2"
          >
            <v-img
                min-width="320"
                max-width="400"
                height="220"
                lazy
                cover
                :src="lookupImageUrl(item)"
            ></v-img>

            <v-card-text class="text-subtitle-1 mt-1 font-weight-bold">
              <div>{{item.title }}...</div>
            </v-card-text>

            <v-card-text>
              <div v-if="false" class="my-2 font-weight-light">
                {{ item.contentMeta }}
              </div>

              <div>
                <span v-html="item.contentBody"></span>...
              </div>
              <div class="mt-2">
                <v-btn @click="toDetail(item)" block variant="outlined" class="font-weight-bold" color="deep-orange darken-2">Selengkapnya</v-btn>
              </div>
            </v-card-text>
          </v-card>
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