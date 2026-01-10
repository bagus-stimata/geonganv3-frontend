<template>
  <div>
    <v-dialog
      v-model="dialogShow"
      :max-width="formDialogOptions.width"
      :style="{ zIndex: formDialogOptions.zIndex }"
      @keydown.esc.prevent="closeForm"
      persistent
      height="85vh"
      :hide-overlay="$vuetify.display.smAndDown"
    >
      <v-card class="rounded-lg" height="85vh">
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
        <v-card-text style="height: 100% !important;">
          <v-row style="height: 100% !important;">
            <v-col cols="12" sm="4" md="4" class="order-2 order-md-1">
              <v-text-field
                  append-inner-icon="mdi-magnify"
                  density="compact"
                  label="Cari"
                  hide-details
                  siz
                  class="rounded-lg text-caption mx-1"
                  variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4" md="8" class="order-1 order-md-2" style="height: 100% !important;">
              <v-card elevation="0" class="border-thin pa-3" style="height: 100% !important;">
                <v-card elevation="0" class="d-flex flex-row justify-center align-center bg-grey-lighten-5" style="height: 100% !important;">
                  <v-card-text class="d-flex flex-column align-center justify-center text-center">
                    <v-img
                        lazy
                        height="80"
                        width="80"
                        :src="require('@/assets/images/map.png')"
                    ></v-img>
                    <div class="font-weight-black text-subtitle-1 mt-4 text-center">Pilih Mapset untuk preview</div>
                  </v-card-text>
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

export default {
  name: "PickMapsetDialog",
  data() {
    return {
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
      itemsFile: []
    };
  },
  computed: {
  },
  methods: {
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

</style>