<template>
  <div class="mt-6">
    <v-container class="py-0">
      <v-breadcrumbs :items="itemsBreadcrumb">
      </v-breadcrumbs>
    </v-container>
    <v-container class="px-2">
      <v-row>
        <v-col cols="12" md="8" sm="8" align="center">
          <div class="d-flex flex-column">
            <span class="text-h4 text-center font-weight-bold mb-3">
              {{ itemModified.title }}
            </span>
            <span class="text-subtitle-2 mb-4 grey--text darken--3">{{
              computedDateFormattedDatefns(itemModified.publishTime)
            }} <span v-if="itemModified.editorial">ditulis oleh {{itemModified.editorial}}</span></span>
          </div>
          <v-hover v-slot="{ hover }">
            <v-card
              class="align-self-center mt-6"
              :elevation="hover ? 10 : 1"
              :class="[
                { 'on-hover': hover },
                hover ? 'card-hover-opacity' : 'card-not-hover-opacity',
              ]"
            >
              <v-img
                :lazy-src="lookupImageUrlLazy(itemModified)"
                :src="lookupImageUrl(itemModified)"
                max-height="650"
                max-width="900"
                cover
              >
                <v-card-title class="text-h6 white--text fill-height">
                  <v-row
                    class="fill-height flex-column"
                    justify="space-between"
                  >
                    <v-spacer />
                    <div class="align-self-center">
                      <v-btn
                        :class="{ 'show-btns': hover }"
                        :color="transparent"
                        icon
                        large
                        dark
                        outlined
                      >
                        <v-icon
                          :class="{ 'show-btns': hover }"
                          :color="transparent"
                          large
                        >
                          mdi-upload
                        </v-icon>
                      </v-btn>
                    </div>
                  </v-row>
                </v-card-title>
              </v-img>
            </v-card>
          </v-hover>
          <div class="mt-4 text-justify">
            <div class="text-subtitle-1 font-weight-bold px-4">{{itemModified.contentMeta}}</div>
            <quill-editor
                class="text-subtitle-2"
                v-model:value="itemModified.contentBody"
                :options="editorOptions"
                disabled
                style="border: none !important;"
            ></quill-editor>
          </div>
        </v-col>
        <v-col cols="12" md="4" sm="4" class="px-md-8 px-4 mt-12">
          <div class="mb-2 pb-1 font-weight-bold color-text-second"> Agenda </div>
          <v-divider thickness="2" color="grey"></v-divider>
          <v-row v-if="fAgendasFiltered.length === 0">
            <v-col>
              <div class="mt-2 text-caption text-center text-grey">No data Available</div>
            </v-col>
          </v-row>
          <v-row v-else class="mt-2">
            <v-col cols="12" v-for="(item, i) in fAgendasFiltered" :key="i">
              <v-hover v-slot="{ isHovering, props }">
                <v-card
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
  </div>
</template>

<script>
import FileService from "@/services/apiservices/file-service";
import FNews from "@/models/f-news";
import { format, parseISO } from "date-fns";
import FEnumHelper from "@/models/f-enum-helper";
import FNewsService from "@/services/apiservices/f-news-service";
import {quillEditor} from "vue3-quill";

export default {
  name: "PublicBeritaDetail",
  components: {
    quillEditor
  },
  props: {},
  data() {
    return {
      editorOptions: {
        placeholder: '',
        modules: {
          toolbar: false,
        }
      },
      itemsBreadcrumb: [
        {
          title: 'Home',
          disabled: false,
          href: '/home',
        },
        {
          title: 'Berita',
          disabled: false,
          href: '/public-berita',
        },
        {
          title: 'Detail',
          disabled: true,
          href: '',
        },
      ],
      FNewsCategories: [
        { id: 1, description: "Pemerintah" },
        { id: 2, description: "Hoaks" },
        {
          id: 3,
          description: "Teknologi Teknologi Teknologi Teknologi teknolo",
        },
        { id: 4, description: "Hari Besar" },
        { id: 5, description: "Lingkungan Hidup" },
      ],
      dummyDesc:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae temporibus, placeat ipsa nulla ea ut earum repellendus repudiandae? Sequi illum sapiente pariatur ex, a quisquam laboriosam nobis reiciendis aspernatur ea velit nesciunt beatae fuga error facere repellendus est qui voluptatem deleniti commodi tempora explicabo eaque vero? Possimus deserunt officiis voluptatem libero minima impedit, iusto molestias similique sint, debitis quia aut dolore iure repellendus quae fuga doloribus consectetur ad accusantium labore! Nostrum consectetur exercitationem recusandae velit vero quos non, qui fuga nesciunt voluptas alias ea, laboriosam sed minus reiciendis eaque! Corrupti dolor aspernatur nemo totam eos hic et facere saepe eligendi. Ducimus laudantium, quibusdam labore saepe harum voluptate quisquam modi non nisi temporibus optio quis ut numquam ipsam! Tempora ipsa voluptate autem sit nam fuga, est deserunt optio illum illo facere, quidem iusto incidunt iure laboriosam iste sequi exercitationem accusamus atque! Expedita consequuntur beatae, atque recusandae nostrum dolores quis praesentium quidem?",
      snackbar: false,
      snackBarMesage: "",

      transparent: "rgba(255, 255, 255, 0)",
      itemsTypeNews: [
        new FEnumHelper(1, "Berita"),
        new FEnumHelper(2, "Agenda"),
      ],
      paramId: 0,
      itemModified: new FNews(),
      itemsFDivision: [],
      fAgendas: [],
      valid: false,
      currentPage: 1,
      pageSize: 5,
      search: "",
    };
  },
  computed: {
    fAgendasFiltered() {
      return this.fAgendas.filter((item) => item.id !== this.paramId);
    },
  },
  methods: {
    computedDateFormattedDatefns(value) {
      return value ? format(parseISO(value), "dd MMM yyyy") : "";
    },
    lookupImageUrl(item) {
      if (item.coverImage === undefined || item.coverImage === "") {
        return require("@/assets/images/no_image_available.jpeg");
      } else {
        return FileService.image_url_medium(item.coverImage);
      }
    },
    lookupImageUrlLazy() {
      return require("@/assets/images/no_image_available.jpeg");
    },
    fetchFNews() {
      FNewsService.getAllFNewsContainingPublicAgenda(
        this.currentPage,
        this.pageSize,
        "created",
        "DESC",
        this.search
      ).then(
        (response) => {
          // console.log(response.data);
          const { items } = response.data;
          this.fAgendas = items;
          // this.totalPaginationPages = totalPages

          // console.log(`TotalPage ${totalPages} and TotalItems ${items} `)
        },
        (error) => {
          console.log(error.response);
        }
      );
    },
    linkNeated(link) {
      return link.replace(/\s+/g, "-").toLocaleLowerCase();
    },
    routeToAgenda(item) {
      this.$router.push(
        `/public-news-page/` + this.linkNeated(item.id.toString())
      );
      window.location.reload();
    },
  },

  mounted() {
    const id = this.$route.params.id;
    this.paramId = this.$route.params.id;
    this.fetchFNews();

    FNewsService.getFNewsByIdPublic(id).then(
      (response) => {
        this.itemDefault = Object.assign({}, response.data);
        this.itemModified = response.data;

        // this.retrieveFiles()
      },
      (error) => {
        console.log(error);
      }
    );
  },
};
</script>


<style scoped>
.text-justify {
  text-align: justify;
  text-justify: inter-word;
}
.object-fit-cover {
  object-fit: cover;
}
.text-11{
  font-size: 11px;
}
</style>