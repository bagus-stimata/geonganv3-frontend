<template>
  <div>
    <v-dialog
      v-model="dialogShow"
      :max-width="formDialogOptions.width"
      :style="{ zIndex: formDialogOptions.zIndex }"
      @keydown.esc.prevent="closeForm"
      persistent
      height="85vh"
      :class="$vuetify.display.smAndDown? '': 'overflow-hidden'"
      :hide-overlay="$vuetify.display.smAndDown"
    >
      <v-card :class="$vuetify.display.smAndDown? '': 'overflow-hidden'" class="rounded-lg" height="85vh">
        <v-toolbar class="bg-white py-2 px-2" density="compact">
          <v-toolbar-title class="font-weight-bold text-subtitle-1">Katalog Mapset</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="closeForm">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-divider class="mx-4"></v-divider>
        <v-card-text class="h-100 d-flex flex-column">
          <v-row style="height: 93% !important;">
            <v-col cols="12" sm="12" md="5" class="order-2 order-md-1 d-flex flex-column" style="height: 93% !important;">
              <div class="flex-grow-0">
                <v-text-field
                    prepend-inner-icon="mdi-magnify"
                    density="compact"
                    label="Cari mapset"
                    hide-details
                    class="rounded-lg text-caption mx-1"
                    variant="outlined"
                >
                  <template #append-inner>
                    <div class="d-flex flex-row align-center">
                      <v-divider vertical></v-divider>
                      <v-btn @click="activateDeepSearchGeojson" size="regular" class="px-2 font-weight-bold" :color="isActiveDeepSearch?'blue':''" density="comfortable" variant="text">
                        <v-chip prepend-icon="mdi-map" :class="isActiveDeepSearch?'text-blue':'text-grey-darken-2'" class="ml-1 font-weight-bold text-caption" style="text-transform: none;">
                          Deep
                        </v-chip>
                        <v-tooltip
                            activator="parent"
                            location="top"
                        >Pencarian lebih dalam ke isi geospasial</v-tooltip>
                      </v-btn>
                      <v-btn :color="isActiveDeepSearch?'indigo' : 'green'" class="font-weight-bold text-white" variant="flat" size="small">Search</v-btn>
                    </div>
                  </template>
                </v-text-field>
              </div>
              <v-card elevation="0" class="mt-4 px-1 flex-grow-1 overflow-y-auto">
                <v-row no-gutters class="ga-2">
                  <v-col cols="12" v-for="set in mapsetItems" :key="set.id">
                    <v-card
                        :class="itemsMapsetSelected.includes(set.id) ? 'border-activated' : ''"
                        elevation="0"
                        class="pa-2 border-thin border-opacity-25"
                        width="100%"
                        height="86"
                    >
                      <v-row>
                        <v-col cols="3">
                          <v-img width="100%" height="68" class="rounded" cover :src="set.img" />
                        </v-col>

                        <v-col cols="9" class="d-flex flex-row align-center justify-center">
                          <v-row class="align-center justify-center pe-4">
                            <v-col cols="10">
                              <div>
                                <div class="text-caption font-weight-bold text-indigo">
                                  {{ set.title }}
                                </div>
                                <div
                                    style="font-size: 11px !important"
                                    class="text-caption font-weight-light text-grey-darken-4"
                                >
                                  {{ set.desc }}
                                </div>
                              </div>
                            </v-col>

                            <v-col cols="2" class="justify-center align-center">
                              <v-checkbox-btn
                                  :color="itemsMapsetSelected.includes(set.id) ? 'orange': ''"
                                  v-model="itemsMapsetSelected"
                                  :value="set.id"
                              />
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
            <v-col cols="12" sm="12" md="7" class="order-1 order-md-2" :style="$vuetify.display.smAndDown? '':'height: 96% !important;'">
              <v-card elevation="0" class="border-thin pa-3" :style="$vuetify.display.smAndDown? '':'height: 96% !important;'">
                <v-card v-if="itemsMapsetSelected.length ===0" elevation="0" class="d-flex flex-row justify-center align-center bg-grey-lighten-5 h-100" >
                  <v-card-text class="ma-0 pa-0 d-flex flex-column align-center justify-center text-center">
                    <v-img
                        lazy
                        height="80"
                        width="80"
                        :src="require('@/assets/images/map.png')"
                    ></v-img>
                    <div class="font-weight-black text-subtitle-1 mt-4 text-center">Pilih Mapset untuk preview</div>
                  </v-card-text>
                </v-card>
                <v-card v-else elevation="0">
                  <v-row class="mb-2">
                    <v-col cols="12" class="d-flex flex-row align-center">
                      <div class="font-weight-bold text-subtitle-2">Preview</div>
                      <v-spacer></v-spacer>
                      <v-btn variant="flat" color="indigo" class="font-weight-bold text-subtitle-2" density="comfortable">Tampilkan pada peta</v-btn>
                    </v-col>
                  </v-row>
                  <BaseMapInteraktif map-min-height="30vh" map-max-height="30vh"></BaseMapInteraktif>
                  <v-row class="mt-1">
                    <v-col cols="12" class="d-flex flex-row align-center">
                      <div class="font-weight-bold text-subtitle-2">Mapset Terpilih</div>
                      <v-spacer></v-spacer>
                      <v-btn variant="flat" color="red" class="font-weight-bold text-subtitle-2" density="comfortable"><v-icon class="mr-1">mdi-delete</v-icon>Hapus semua</v-btn>
                    </v-col>
                  </v-row>
                  <v-divider class="mt-3 mb-3" thickness="2" color="grey"></v-divider>
                </v-card>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
  
  <script>

import BaseMapInteraktif from "@/components/public/peta-interaktif/BaseMapInteraktif.vue";

export default {
  name: "PickMapsetDialog",
  components: {BaseMapInteraktif},
  data() {
    return {
      isActiveDeepSearch:false,
      isCheckBoxActivated: false,
      itemsMapsetSelected: [],
      dialogShow: false,
      formDialogOptions: {
        title1: "",
        title2: "",
        message1: "",
        message2: "",
        errorMessage: "",
        color: "grey lighten-3",
        width: 1000,
        zIndex: 200,
        noconfirm: false,
      },
      itemsFile: [],
      mapsetItems: [
        {
          id: 1,
          title: 'Dataset Titik UMKM',
          desc: 'Persebaran UMKM & lokasi usaha (point layer).',
          img: require('@/assets/images/basemap.jpeg'),
          color: 'indigo',
        },
        {
          id: 2,
          title: 'RDTR Zona Peruntukan',
          desc: 'Zonasi pemanfaatan ruang (polygon) untuk RDTR.',
          img: require('@/assets/images/basemap.jpeg'),
          color: 'deep-purple',
        },
        {
          id: 3,
          title: 'Jaringan Jalan',
          desc: 'Klasifikasi jalan nasional/prov/kab (line layer).',
          img: require('@/assets/images/basemap.jpeg'),
          color: 'teal',
        },
        {
          id: 4,
          title: 'Batas Administrasi',
          desc: 'Kabupaten/Kecamatan/Desa (polygon).',
          img: require('@/assets/images/basemap.jpeg'),
          color: 'blue',
        },
        {
          id: 5,
          title: 'Hidrologi',
          desc: 'Sungai, saluran, danau (line/polygon).',
          img: require('@/assets/images/basemap.jpeg'),
          color: 'cyan',
        },
        {
          id: 6,
          title: 'Fasilitas Publik',
          desc: 'Sekolah, puskesmas, kantor, dll (point).',
          img: require('@/assets/images/basemap.jpeg'),
          color: 'pink',
        },
        {
          id: 7,
          title: 'Kawasan Rawan Bencana',
          desc: 'KRB banjir/longsor (polygon) untuk mitigasi.',
          img: require('@/assets/images/basemap.jpeg'),
          color: 'orange',
        },
        {
          id: 8,
          title: 'Potensi Investasi',
          desc: 'Lahan potensial + catatan peluang (point/polygon).',
          img: require('@/assets/images/basemap.jpeg'),
          color: 'green',
        },
      ],
    };
  },
  computed: {
  },
  methods: {
    activateDeepSearchGeojson(){
      this.isActiveDeepSearch = !this.isActiveDeepSearch
    },
    showDialog() {
      this.dialogShow = true
    },
    closeForm() {
      this.dialogShow = false;
    },
  },
};
</script>
<style scoped>
.border-activated {
  border: 2px solid #FF8030 !important;
  border-radius: 8px;
}
</style>