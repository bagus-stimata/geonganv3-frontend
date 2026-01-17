<template>
  <div class="align-self-center">
    <v-dialog
      v-model="dialogShow"
      :style="{ zIndex: formDialogOptions.zIndex }"
      @keydown.esc.prevent="closeDialog"
      transition="dialog-top-transition"
      :width="formDialogOptions.width"
    >
      <v-card>
        <v-toolbar class="color-bg-second text-white" density="compact">
          <v-toolbar-title class="text-subtitle-2">Read File Excel</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>

        <v-card-text class="justify-center">
          <v-row>
            <v-col cols="5">
              <v-file-input
                  v-model="currentFile"
                  show-size
                  counter
                  label="Pilih File Excel"
                  accept=".xls,.xlsx"
                  variant="outlined"
                  density="compact"
                  @update:model-value="selectFile"
              ></v-file-input>
            </v-col>
            <v-col cols="5" class="pl-1">
              <v-autocomplete
                v-model="fdivisionBeanSelected"
                :items="itemsFDivision"
                item-value="id"
                item-title="description"
                variant="outlined"
                density="compact"
                color="blue-grey lighten-2"
                label="Produsen Data"
                hint="Kosong, maka akan disesuikan dengan bidang user"
                persistent-hint
              ></v-autocomplete>
            </v-col>

            <v-col cols="2" class="pl-2">
              <v-btn
                color="success"
                block
                @click="startUpload"
                :disabled="
                  !currentFile ||
                  fdivisionBeanSelected === 0 ||
                  fdivisionBeanSelected === null ||
                  sudahUpload === true
                "
              >
                Upload
                <v-icon right dark>mdi-cloud-upload</v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <v-row v-if="currentFile">
            <v-col cols="12" sm="12" md="12">
              <v-data-table
                :headers="headers"
                :items="itemsDataPetaTabularComputed"
                item-key="name"
                class="elevation-1"
                height="400"
                calculate-widths
                hide-default-footer
                disable-pagination
              >
                <template v-slot:[`item.number`]="{ item }">
                  <span><v-icon small color="green" v-if="item.statusUpload === 1">mdi-check-circle</v-icon></span>
                  <span><v-icon small color="red" v-if="item.statusUpload === 2">mdi-close</v-icon></span>
                  {{ item.number }}
                </template>
              </v-data-table>
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

          <v-row v-if="previewImage" justify="center">
            <v-img
              class="ma-2"
              :src="previewImage"
              alt=""
              max-width="300px"
              max-height="300px"
            ></v-img>
          </v-row>
        </v-card-text>
        <v-card-text>
          <div class="font-weight-bold text-subtitle-1 mb-2">Preview upload data tabular</div>
          <BaseMap map-max-height="400px" map-min-height="400px"></BaseMap>
        </v-card-text>
      </v-card>

      <v-alert v-if="message" border="left" color="blue-grey" dark>
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
import readXlsxFile from "read-excel-file";
import BaseMap from "@/components/utils/BaseMap.vue";

export default {
  name: "FtDatasetImportDataTabularDialog",
  props: {
    parentId: Number,
    itemsFDivision: Array,
  },
  components: {BaseMap},
  data() {
    return {
      sudahUpload: false,
      dialogProgres: false,
      dialogShow: false,
      formDialogOptions: {
        color: "grey lighten-3",
        width: 1200,
        zIndex: 200,
        noconfirm: false,
      },
      currentFile: undefined,
      previewImage: undefined,
      fdivisionBeanSelected: undefined,
      rulesNotEmpty: [(v) => !!v || "Tidak boleh kosong"],
      progress: 0,
      message: "",
      description: "",
      headers: [
        {
          title: "No",
          key: "number",
          width: "8%",
          sortable: false,
        },
      ],
      itemsDataPetaTabular: [],
    };
  },
  computed: {
    itemsDataPetaTabularComputed() {
      return this.itemsDataPetaTabular;
    },
  },

  methods: {
    selectFile(file) {
      this.currentFile = file;
      // this.previewImage = URL.createObjectURL(this.currentFile);
      this.progress = 0;
      this.message = "";

      let rowKe = 0;
      readXlsxFile(this.currentFile).then((rows) => {
        rows.forEach((item) => {
          if (rowKe > 0) {
            console.log(item)
            let itemsBean = {}
            itemsBean.number = rowKe + 1;
            itemsBean.statusUpload = 0;
          }

          rowKe++;
        });
      });
    },

    startUpload() {
      if (!this.currentFile) {
        this.message = "Please select an Image!";
      }
    },

    showDialog() {
      this.dialogShow = true;
      this.currentFile = undefined;
      this.previewImage = undefined;
      this.progress = 0;
      this.message = "";

      this.sudahUpload = false;

      this.itemsDataPetaTabular = [];
    },
    closeDialog() {
      if (!this.isItemModified) {
        this.dialogShow = false;
        this.$emit("eventFromFormDialog1", this.itemModified);
      }
      if (this.sudahUpload) {
        this.$emit("importExcelCompleted", "OKE");
      }
    },
    passingEventFromCloseConfirm(value) {
      if (value === "OKE") this.dialogShow = false;
    },
  },
  mounted() {},
};
</script>

<style scoped>
</style>
