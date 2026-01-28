<template>
  <div>
    <v-dialog
      v-model="dialogShow"
      :max-width="formDialogOptions.width"
      :style="{ zIndex: formDialogOptions.zIndex }"
      @keydown.esc.prevent="closeForm"
      persistent
      :class="$vuetify.display.smAndDown? '': 'overflow-hidden'"
      :hide-overlay="$vuetify.display.smAndDown"
    >
      <v-card class="rounded-lg" >
        <v-form v-model="valid" ref="form">
          <v-toolbar class="bg-white py-2 px-2" density="compact">
            <v-toolbar-title class="font-weight-bold text-subtitle-1">Download Data Geojson</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn icon @click="closeForm">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-divider class="mx-4"></v-divider>
          <v-card-text class="px-6">
            <div class="text-grey font-weight-light text-subtitle-2 mb-2">Untuk download dataset mohon isi informasi di bawah ini</div>
            <v-row class="my-0 py-0">
              <v-col cols="12" md="12" sm="12" class="my-0 py-0">
                <v-text-field
                    v-model="itemModified.description"
                    class="my-0 py-0"
                    density="compact"
                    variant="outlined"
                    label="Nama"
                    :rules="rulesNotEmpty"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="12" sm="12" class="my-0 py-0">
                <v-text-field
                    v-model="itemModified.email"
                    class="my-0 py-0"
                    density="compact"
                    variant="outlined"
                    label="Email"
                    :rules="[validateNotEmpty, validateEmail]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="12" sm="12" class="my-0 py-0">
                <v-text-field
                    v-model="itemModified.instansi"
                    class="my-0 py-0"
                    density="compact"
                    variant="outlined"
                    label="Nama Instansi"
                    :rules="rulesNotEmpty"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-btn class="mt-4" block :disabled="!valid" @click="next" variant="flat" color="indigo">Selanjutnya</v-btn>
          </v-card-text>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>
  
<script>

import FGeoDownload from "@/models/f-geo-download";

export default {
  name: "DownloadFormDialog",
  props:{
    itemsFDivision: Array
  },
  components: {},
  data() {
    return {
      valid:false,
      dialogShow: false,
      itemsMapsetSelected:[],
      formDialogOptions: {
        title1: "",
        title2: "",
        message1: "",
        message2: "",
        errorMessage: "",
        color: "grey lighten-3",
        width: 500,
        zIndex: 200,
        noconfirm: false,
      },
      rulesNotEmpty: [(v) => !!v || "Tidak Boleh Kosong"],
      itemModified: new FGeoDownload(),
      validateNotEmpty: (value) => !!value || "Tidak Boleh Kosong",
      validateEmail: (value) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(value) || "Format Email Salah";
      },
    };
  },
  computed: {
  },
  watch: {
  },
  methods: {
    showDialog(itemsMapsetSelected) {
      this.dialogShow = true
      this.itemsMapsetSelected = itemsMapsetSelected
    },
    next(){
      if (this.$refs.form.validate()) {
        const currentDownloader = {
          description: this.itemModified.description,
          email: this.itemModified.email,
          instansi: this.itemModified.instansi,
          dateFilled: new Date().toISOString(),
        };
        localStorage.setItem("currentDownloader", JSON.stringify(currentDownloader));
        this.$emit('showDialogDownloadChoice')
        this.closeForm()
      }
    },
    closeForm() {
      this.dialogShow = false;
    },
  },
  mounted() {
  }
};
</script>
<style scoped>
.border-activated {
  border: 2px solid #FF8030 !important;
  border-radius: 8px;
}
</style>