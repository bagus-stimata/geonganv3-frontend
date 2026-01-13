<template>
  <v-card elevation="0" class="mt-1">
    <v-container>
      <v-row class="mb-2">
        <v-spacer></v-spacer>
        <v-col cols="12"  sm="10" md="8">
          <v-text-field
              v-on:keyup.enter="searchOnEnter"
              v-on:blur="searchOnEnter"
              style="box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              class="rounded-lg text-caption pt-1 pb-3 px-2"
              variant="plain"
              hide-details
              placeholder="Cari berita"
          >
          </v-text-field>
        </v-col>
        <v-spacer></v-spacer>
      </v-row>
      <v-divider></v-divider>
      <v-card-text>
        <v-row class="ga-2">
          <v-col cols="12" class="d-flex flex-wrap ga-2">
            <v-btn
                v-for="cat in itemsBeritaCategComputed"
                :key="cat.id"
                :variant="selectedCatId === cat.id ? 'flat' : 'outlined'"
                :color="selectedCatId === cat.id ? 'indigo' : undefined"
                rounded="xl"
                density="comfortable"
                class="text-subtitle-2 px-4"
                @click="selectedCatId = cat.id"
            >
              {{ cat.description }}
<!--              <span class="ml-2 font-weight-bold" :class="selectedCatId === cat.id ? 'text-white' : 'text-medium-emphasis'">-->
<!--                ({{ cat.count }})-->
<!--              </span>-->
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
      <v-row>
        <v-col cols="12" sm="12" md="9" class="px-2">
          <v-row v-if="fNewsFiltered.length === 0">
            <v-col>
              <div class="text-center mt-2 my-6">No available news</div>
            </v-col>
          </v-row>
          <v-row
              v-else
              no-gutters
              class="wrap"
              justify="center"
          >
            <v-col
                v-for="(item, i) in fNewsFiltered"
                :key="i"
                cols="12"
                :xl="i === 0 ? 12 : 6"
                class="px-2"
            >
              <v-hover v-slot="{ isHovering, props }">
                <template v-if="i === 0">
                  <v-card
                      @click="toDetail(item)"
                      class="rounded-xl mb-4"
                      v-bind="props"
                      :style="isHovering? 'box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.3) !important;': 'box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2) !important;'"
                      elevation="0"
                  >
                    <div class="relative-position">
                      <v-img
                          width="100%"
                          :height="$vuetify.display.smAndDown? '300':'500'"
                          cover
                          class="rounded-xl img-zoom"
                          :src="lookupImageUrl(item)"
                      ></v-img>

                      <div class="black-glass-overlay pa-md-8 pa-4">
                        <div class="text-white">
                          <div class="text-md-h4 text-subtitle-2 font-weight-black">{{ item.title }}</div>
                          <div class="mt-2">
                            <span class="text-md-subtitle-2 text-caption" v-html="item.contentBody"></span>...
                          </div>
                          <div class="d-flex flex-row mb-4">
                            <div class="text-subtitle-2 me-2"><v-icon class="me-2" :size="$vuetify.display.smAndDown?'x-small':'small'">mdi-calendar-range</v-icon>{{computedDateFormattedDatefns(item.publishTime)}}</div>
                            <v-divider v-if="item.editorial" vertical thickness="2" class="mx-2" color="white"></v-divider>
                            <div v-if="item.editorial" class="text-subtitle-2"><v-icon class="me-2" :size="$vuetify.display.smAndDown?'x-small':'small'">mdi-fountain-pen-tip</v-icon>
                              {{ item.editorial }}</div>
                          </div>
                          <v-btn @click="toDetail(item)" variant="outlined" color="white" class="font-weight-bold" :size="$vuetify.display.smAndDown?'small':'default'"> Baca Selengkapnya</v-btn>
                        </div>
                      </div>
                    </div>
                  </v-card>
                </template>

                <template v-else>
                  <v-card
                      @click="toDetail(item)"
                      v-bind="props"
                      :style="isHovering? 'box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.3) !important;': 'box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2) !important;'"
                      width="100%"
                      class="rounded-lg mb-4"
                  >
                    <v-row>
                      <v-col cols="12" md="3">
                        <v-img
                            width="100%"
                            :height="$vuetify.display.smAndDown? '200':'180'"
                            cover
                            class="rounded-lg"
                            :src="lookupImageUrl(item)"
                        ></v-img>
                      </v-col>
                      <v-col
                          cols="12"
                          md="9"
                          class="py-5 pe-4 d-flex flex-column justify-space-between"
                      >
                        <div class="mt-2 px-3">
                          <div>{{ item.title }}...</div>
                          <div>
                            <span class="text-caption" v-html="item.contentBody"></span>...
                          </div>
                          <div class="d-flex flex-row mb-4">
                            <div class="text-subtitle-2 me-2 text-grey"><v-icon class="me-2" color="indigo" :size="$vuetify.display.smAndDown?'x-small':'small'">mdi-calendar-range</v-icon>{{computedDateFormattedDatefns(item.publishTime)}}</div>
                            <v-divider v-if="item.editorial" vertical thickness="2" class="mx-2" color="grey"></v-divider>
                            <div v-if="item.editorial" class="text-subtitle-2 text-grey"><v-icon color="indigo" class="me-2" :size="$vuetify.display.smAndDown?'x-small':'small'">mdi-fountain-pen-tip</v-icon>
                              {{ item.editorial }}</div>
                          </div>
                        </div>

                        <div class="d-flex flex-row">
                          <v-spacer />
                          <v-btn size="small" class="font-weight-bold" variant="text" color="orange">
                            <span @click="toDetail(item)" class="mr-2">Baca Selengkapnya</span>
                            <v-icon>mdi-arrow-right</v-icon>
                          </v-btn>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card>
                </template>
              </v-hover>
            </v-col>
          </v-row>
          <v-row class="mt-3" justify="center" align="center">
            <v-col class="justify-start" cols="4" md="2" sm="2">
              <v-select
                  v-model="pageSize"
                  :items="pageSizes"
                  label="Items per page"
                  variant="outlined"
                  density="compact"
              ></v-select>
            </v-col>
            <v-col cols="8" md="10" sm="8" class="d-flex flex-row justify-end">
              <v-pagination
                  v-model="currentPage"
                  :length="totalPaginationPages"
                  total-visible="8"
                  active-color="orange-darken-4"
                  size="x-small"
                  variant="flat"
              ></v-pagination>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" sm="12" md="3" class="px-2">
          <div class="mb-2 pb-1 font-weight-bold color-text-second"> Agenda </div>
          <v-divider thickness="2" color="grey"></v-divider>
          <v-row v-if="fAgendas.length === 0">
            <v-col>
              <div class="mt-2 text-caption text-center text-grey">No data Available</div>
            </v-col>
          </v-row>
          <v-row v-else class="mt-2">
            <v-col cols="12" v-for="(item, i) in fAgendas" :key="i">
              <v-hover v-slot="{ isHovering, props }">
                <v-card
                    @click="toDetail(item)"
                    v-bind="props"
                    :style="isHovering? 'box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.3) !important;': 'box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2) !important;'"
                    width="100%"
                    class="rounded-lg mb-4"
                >
                  <v-row>
                    <v-col cols="4">
                      <v-img
                          width="100%"
                          :height="$vuetify.display.smAndDown? '70':'70'"
                          cover
                          class="rounded-lg"
                          :src="lookupImageUrl(item)"
                      ></v-img>
                    </v-col>
                    <v-col
                        cols="8"
                        class="d-flex flex-column justify-center"
                    >
                      <div>
                        <div class="text-11 font-weight-bold">{{ item.title }}...</div>
                      </div>
                    </v-col>
                  </v-row>
                </v-card>
              </v-hover>
            </v-col>
          </v-row>

        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>
  
<script>
import FNews from "@/models/f-news";
import FNewsService from "@/services/apiservices/f-news-service";
import FileService from "@/services/apiservices/file-service";
import {format, parseISO} from "date-fns";
import {EBeritaCategs} from "@/models/e-berita-categ";
export default {
  components: {
  },
  data() {
    return {
      snackbar: false,
      snackBarMesage: "",
      paramId: 0,

      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 5,
      pageSizes: [10, 25, 50, 150, 500],

      search: "",
      fBeritas: [new FNews()],
      fAgendas: [new FNews()],
      selectedCatId: 'All',
      mapsetItems: [],
      itemsBeritaCateg: EBeritaCategs,
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
    itemsBeritaCategComputed() {
      const itemAll = { id: 'All', description: 'All' }
      const base = (this.itemsBeritaCateg || []).filter(item => item.id !== 'All')
      return [itemAll, ...base]
    },
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
    // addAllToFirst() {
    //   const itemAll = { id: 'All', description: 'All' }
    //   this.itemsBeritaCateg.unshift(itemAll)
    // },
    toDetail(item){
      this.$router.push("/public-berita-detail/"+ this.linkNeated(item.id.toString()))
    },
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
    fetchAgenda() {
      FNewsService.getAllFNewsContainingPublicAgenda(1, 10, "created", "DESC", '').then(
          (response) => {
            const { items} = response.data;
            this.fAgendas = items;
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
    computedDateFormattedDatefns(value) {
      return value ? format(parseISO(value), "dd - MM - yyyy") : "";
    },
  },
  mounted() {
    this.paramId = this.$route.params.id;

    // this.addAllToFirst()
    this.fetchParent();
    this.fetchFNews();
    this.fetchAgenda();
  },
};
</script>
  
<style scoped>
.relative-position {
  position: relative;
}

.img-zoom {
  transition: transform 0.5s ease;
}

.relative-position:hover .img-zoom {
  transform: scale(1.2);
}
.black-glass-overlay {
  height: 60%;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: rgba(0, 0, 0, 0.60);
  backdrop-filter: blur(4px);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

.overlay-text {
  color: white;
}
.text-11{
  font-size: 11px;
}
</style>
  