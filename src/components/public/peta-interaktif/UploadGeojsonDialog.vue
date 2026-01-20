<template>
  <div class="align-self-center">
    <v-dialog
      v-model="dialogShow"
      :max-width="formDialogOptions.width"
      :style="{ zIndex: formDialogOptions.zIndex }"
      @keydown.esc.prevent="closeDialog"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar class="bg-white py-2 px-2" density="compact">
          <v-toolbar-title class="font-weight-bold text-subtitle-1">Upload Geojson</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="closeDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-divider class="mx-4"></v-divider>
        <v-card-text class="justify-center px-4">
          <v-file-upload
              clearable
              v-model="currentFile"
              density="compact"
              accept=".geojson,application/geo+json,application/json"
          />
          <v-row justify="center" align="center" class="mt-2">
            <v-col cols="4" class="pl-2">
              <v-btn color="success" size="small" variant="flat" @click="startUpload" :disabled="!currentFile">
                Upload
                <v-icon right dark>mdi-cloud-upload</v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <div v-if="progress">
            <div>
              <v-progress-linear
                  v-model="progress"
                  color="light-blue"
                  height="25"
                  reactive
              >
                <strong>{{ progress }} %</strong>
              </v-progress-linear>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-alert v-if="message"  dark>
        {{ message }}
      </v-alert>
    </v-dialog>

    <v-dialog v-model="dialogProgres" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          Please Wait...
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { VFileUpload } from 'vuetify/labs/VFileUpload'

export default {
  name: "UploadGeojsonDialog",
  props: {
    parentId: Number,
  },
  components: {
    VFileUpload
  },
  data() {
    return {
      toolBarTitle: "Upload GeoJson",
      dialogProgres: false,
      dialogShow: false,
      formDialogOptions: {
        title1: "",
        title2: "",
        message1: "",
        message2: "",
        errorMessage: "",
        color: "grey lighten-3",
        width: 500,
        zIndex: 250,
        noconfirm: false,
      },
      currentFile: undefined,
      previewImage: undefined,

      progress: 0,
      message: "",
      description: "",
      nomorDoc: "",
      tanggalDoc: "",

      imageInfos: [],

    };
  },
  methods: {
    startUpload() {
      if (!this.currentFile) {
        this.message = "Please select a GeoJSON file!";
        return;
      }

      // VFileUpload Vuetify Labs biasanya ngasih array File; antisipasi dua-duanya.
      const file = Array.isArray(this.currentFile) ? this.currentFile[0] : this.currentFile;
      if (!file) {
        this.message = "File tidak valid.";
        return;
      }

      const name = (file.name || "").toLowerCase();
      if (!name.endsWith(".geojson") && !name.endsWith(".json")) {
        this.message = "File harus berformat .geojson atau .json";
        return;
      }

      this.progress = 0;
      this.dialogProgres = true;
      this.message = "";

      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          this.progress = Math.round((e.loaded / e.total) * 100);
        }
      };

      reader.onerror = () => {
        this.dialogProgres = false;
        this.progress = 0;
        this.message = "Gagal membaca file GeoJSON.";
      };

      reader.onload = () => {
        try {
          const text = reader.result || "";
          const geo = JSON.parse(text);

          if (!geo || typeof geo !== "object" || geo.type !== "FeatureCollection") {
            throw new Error("Not a FeatureCollection");
          }

          // Kirim ke parent (PetaInteraktif) biar bisa ditampilkan sebagai l-geo-json
          this.$emit("geojsonUploaded", geo);

          this.progress = 100;
          this.dialogProgres = false;
          this.message = "GeoJSON berhasil dimuat.";
          this.dialogShow = false;
        } catch (e) {
          console.error("Invalid GeoJSON:", e);
          this.dialogProgres = false;
          this.progress = 0;
          this.message = "File tidak valid sebagai GeoJSON (FeatureCollection).";
        }
      };

      reader.readAsText(file);
    },
    showDialog() {
      this.dialogShow = true;
      this.currentFile = undefined;
      this.previewImage = undefined;
      this.progress = 0;
      this.message = "";
    },
    closeDialog() {
      this.dialogShow = false
    },
  },
  mounted() {

  },
};
</script>

<style scoped>

</style>
