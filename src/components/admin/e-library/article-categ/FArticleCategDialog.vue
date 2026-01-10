<template>
  <div>
    <v-dialog
      v-model="dialogShow"
      :max-width="formDialogOptions.width"
      :style="{ zIndex: formDialogOptions.zIndex }"
      @keydown.esc.prevent="closeForm"
      persistent
      :fullscreen="$vuetify.display.smAndDown"
      :hide-overlay="$vuetify.display.smAndDown"
    >
      <v-card>
        <v-form v-model="valid" ref="form">
          <v-toolbar class="color-bg-second text-white" density="compact">
            <v-btn icon dark @click="closeForm">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title class="text-subtitle-2">Kategori Arsip
              <span class="ml-2 mr-2 font-weight-medium text-grey"> | </span>
              <span v-if="formMode === 'EDIT_FORM'">EDIT </span>
              <span class="font-weight-light ml-1 mr-1">ITEM</span>
              <span v-if="formMode === 'NEW_FORM'"> BARU</span>
              <span class="ml-2 mr-2 font-weight-medium text-grey" v-show="isItemModified">|</span>
              <v-chip
                  class="ma-2"
                  color="warning"
                  variant="outlined"
                  size="x-small"
                  v-show="isItemModified"
              >
                <v-icon left> mdi-pencil </v-icon>
                modified
              </v-chip>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn
                  dark
                  variant="text"
                  @click="save"
                  :disabled="!valid || isItemModified === false"
                  class="hidden-md-and-up"
              >
                Simpan
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="4" md="3">
                  <v-text-field
                    v-model="itemModified.kode1"
                    :rules="rulesLength"
                    label="Kode1"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    v-model="itemModified.description"
                    :rules="rulesLength"
                    label="Kategori Arsip/Dokumen"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="3" md="3">
                  <v-switch
                    v-model="itemModified.statusActive"
                    :label="itemModified.statusActive ? 'Aktif' : 'Non-Aktif'"
                    class="pa-3"
                    density="compact"
                    hide-details
                    color="primary"
                  ></v-switch>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <v-autocomplete
                    v-model="itemModified.fdivisionBean"
                    :items="itemsFDivision"
                    :rules="rulesNotEmpty"
                    item-value="id"
                    item-title="description"
                    auto-select-first
                    density="compact"
                    chips
                    deletable-chips
                    variant="outlined"
                    color="blue-grey lighten-2"
                    label="Bidang/Dinas"
                    hint="Bidang/Dinas"
                    persistent-hint
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-autocomplete
                      v-model="itemModified.articleCategGroup"
                      :items="itemsArticleCategGroup"
                      :rules="rulesNotEmpty"
                      item-value="id"
                      item-title="description"
                      auto-select-first
                      density="compact"
                      chips
                      deletable-chips
                      variant="outlined"
                      color="blue-grey lighten-2"
                      label="Kategori Grup"
                      hint="Kategori Grup"
                      persistent-hint
                  ></v-autocomplete>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-chip
              class="ml-4"
              color="error"
              variant="outlined"
              close
              size="small"
              v-show="formDialogOptions.errorMessage"
            >
              {{ formDialogOptions.errorMessage }}
            </v-chip>
            <v-spacer></v-spacer>
            <v-btn
              color="red-darken-1"
              variant="outlined"
              @click="closeForm"
              class="hidden-sm-and-down"
            >
              Batal
            </v-btn>
            <v-btn
              color="blue-darken-1"
              variant="flat"
              @click="save"
              :disabled="!valid || isItemModified === false"
              class="hidden-sm-and-down"
            >
              Simpan
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>

      <close-confirm-dialog
        ref="refCloseConfirmDialog"
        @eventFromCloseConfirm="passingEventFromCloseConfirm"
      ></close-confirm-dialog>
    </v-dialog>
  </div>
</template>
  
  <script>
import FArticleCategService from "@/services/apiservices-elibrary/f-article-categ-service";

import CloseConfirmDialog from "@/components/utils/CloseConfirmDialog.vue";
import FormMode from "@/models/form-mode";
import FArticleCateg from "@/models/elibrary/f-article-categ";
import {EArticleCategGroups} from "@/models/e-article-categ-group";

export default {
  name: "FArticleCategDialog",
  components: { CloseConfirmDialog },
  props: {
    formMode: String,
  },
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
        width: 800,
        zIndex: 200,
        noconfirm: false,
      },

      selectedItemIndex: -1,
      itemDefault: "",
      itemModified: new FArticleCateg(0, "", ""),
      selectFDivision: { id: 0, kode1: "", description: "" },
      itemsFDivision: [
        { id: 1, kode1: "", description: "" },
        { id: 2, kode1: "", description: "" },
      ],

      itemsArticleCategGroup: EArticleCategGroups,
      valid: false,
      rulesLength: [
        (v) => !!v || " Tidak Boleh Kosong",
        (v) => v.length <= 255 || "Maksimal 255 Karakter",
        (v) => v.length > 1 || "Harus lebih besar dari 1 karakter",
      ],
      rulesNotEmpty: [(v) => !!v || "Tidak boleh kosong"],
    };
  },
  computed: {
    isItemModified() {
      const defaultItem = JSON.stringify(this.itemDefault);
      const modifiedItem = JSON.stringify(this.itemModified);
      return defaultItem !== modifiedItem;
    },
  },
  watch: {},
  methods: {
    showDialog(selectedIndex, item, itemsFDivision) {
      // console.log("show UserDialog " + item.id)
      // console.log(this.formMode)
      this.dialogShow = !this.dialogShow;
      if (selectedIndex > -1) {
        this.selectedIndex = selectedIndex;
        this.initializeEditMode(item);
      } else {
        (this.itemDefault = new FArticleCateg(0, "", "")),
          (this.itemModified = new FArticleCateg(0, "", "")),
          (this.selectedIndex = -1);
      }

      this.itemsFDivision = itemsFDivision;
    },
    setDialogState(value) {
      this.dialogShow = value;
    },
    save() {
      // console.log(this.isItemModified);
      if (this.isItemModified === false) {
        //Close aja
        this.dialogShow = false;
        this.$emit("eventFromFormDialog1", this.itemModified);
        return;
      }
      if (this.$refs.form.validate()) {
        if (this.formMode === FormMode.EDIT_FORM) {
          // console.log(JSON.stringify(this.itemModified));
          // console.log(this.itemModified);
          FArticleCategService.updateFArticleCateg(this.itemModified).then(
            () => {
              // console.log(response.data)
              this.$emit("eventFromFormDialogEdit", this.itemModified);
            },
            (error) => {
              console.log(error);
              // console.log(error);
              this.formDialogOptions.errorMessage = error.response.data.message;
            }
          );
        } else {
          FArticleCategService.createFArticleCateg(this.itemModified).then(
            (response) => {
              this.$emit("eventFromFormDialogNew", response.data);
            },
            (error) => {
              console.log(error);
              this.formDialogOptions.errorMessage = error.response.data.message;
            }
          );
        }
      }
    },
    closeForm() {
      if (!this.isItemModified) {
        this.dialogShow = false;
        this.$emit("eventFromFormDialog1", this.itemModified);
      } else {
        this.$refs.refCloseConfirmDialog.showDialog(
          " Sudah terdapat modifikasi data",
          "Tetap tutup dan reset perubahan?"
        );
      }
    },
    passingEventFromCloseConfirm(value) {
      if (value === "OKE") this.dialogShow = false;
    },
    initializeEditMode(item) {
      // this.itemDefault = item
      // this.itemModified = item

      this.formDialogOptions.errorMessage = "";

      FArticleCategService.getFArticleCategById(item.id).then(
        (response) => {
          // console.log(response.data)
          this.itemDefault = Object.assign({}, response.data);
          this.itemModified = response.data;
        },
        (error) => {
          console.log(error);
        }
      );
    },
  },
};
</script>
  
  <style scoped>
</style>