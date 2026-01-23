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
          <v-toolbar-title class="font-weight-bold text-subtitle-1">Upload SHP</v-toolbar-title>
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
              accept=".zip,application/zip,application/x-zip-compressed"
          />
          <div class="text-caption text-grey mt-2">
            File harus <strong>.zip</strong> dan berisi minimal 4 file: <strong>.shp</strong>, <strong>.shx</strong>, <strong>.dbf</strong>, <strong>.prj</strong>.
          </div>
          <v-row justify="center" align="center" class="mt-2">
            <v-col cols="4">
              <v-btn block color="success" size="small" variant="flat" @click="startUpload" :disabled="!currentFile">
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
        <v-alert v-if="message"  dark>
          {{ message }}
        </v-alert>
      </v-card>
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
import axios from "axios";
export default {
  name: "UploadShpToGeojsonDialog",
  props: {
    parentId: Number,
  },
  components: {
    VFileUpload
  },
  data() {
    return {
      toolBarTitle: "Upload SHP",
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
    async startUpload() {
      if (!this.currentFile) {
        this.message = "Please select a .zip file";
        return;
      }

      const file = Array.isArray(this.currentFile) ? this.currentFile[0] : this.currentFile;
      if (!file) {
        this.message = "Please select a .zip file";
        return;
      }

      const nameLower = String(file.name || "").toLowerCase();
      if (!nameLower.endsWith(".zip")) {
        this.message = "File harus .zip";
        return;
      }

      try {
        this.dialogProgres = true;
        this.progress = 0;
        this.message = "";

        const formData = new FormData();
        formData.append("fileZIP", file);

        // Endpoint convert: server returns geojson.zip as blob
        const resp = await axios.post(
          "https://desgreentools.des-green.org/desgreen/tools/convert-shapefile-to-geojsonzip",
          formData,
          {
            headers: {
              Authorization: "Basic 123Welcome123",
              "Content-Type": "multipart/form-data",
            },
            responseType: "blob",
            onUploadProgress: (event) => {
              const total = event && event.total ? event.total : 0;
              const loaded = event && event.loaded ? event.loaded : 0;
              if (total > 0) {
                this.progress = Math.round((100 * loaded) / total);
              }
            },
          }
        );

        const disposition =
          resp.headers &&
          (resp.headers["content-disposition"] || resp.headers["Content-Disposition"]);

        let outName = (file.name || "dataset").replace(/\.zip$/i, "") + ".geojson.zip";
        if (disposition && String(disposition).includes("filename=")) {
          const disp = String(disposition);
          const match = disp.match(/filename\*?=(?:UTF-8''|" )?([^";]+)"?/);
          if (match && match[1]) {
            const rawName = match[1].trim();
            try {
              outName = decodeURIComponent(rawName);
            } catch (e) {
              outName = rawName;
            }
          }
        }

        const blob = new Blob([resp.data], { type: "application/zip" });

        // Emit to parent dialog
        this.$emit("eventGeojsonZipReady", { fileName: outName, fileBlob: blob });

        this.dialogShow = false;
      } catch (e) {
        console.error(e);
        this.message = "Convert SHP ZIP gagal";
      } finally {
        this.dialogProgres = false;
      }
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
};
</script>

<style scoped>

</style>

import axios from "axios";