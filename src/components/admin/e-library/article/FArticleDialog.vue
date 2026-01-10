<template>
  <div>
    <v-dialog
      v-model="dialogShow"
      fullscreen
      :style="{ zIndex: formDialogOptions.zIndex }"
      @keydown.esc.prevent="closeForm"
      persistent
      :hide-overlay="$vuetify.display.smAndDown"
    >

      <v-card>
        <v-form v-model="valid" ref="form">
          <v-toolbar class="color-bg-second text-white" density="compact">
            <v-btn icon dark @click="closeForm">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title class="text-subtitle-2">Buku, Jurnal, Produk Hukum etc
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

          <v-card-text class="mt-4">
            <v-container class="pa-2">
              <v-row>
                <v-col cols="12" md="3" sm="5">
                  <v-container class="pa-2">
                    <v-row align="center" justify="center">
                      <v-hover>
                        <template v-slot:default="{ isHovering, props }">
                          <v-card

                              v-bind="props"
                              class="align-self-center"
                              :elevation="isHovering ? 10 : 1"
                              :class="[{ 'on-hover': isHovering }, isHovering?'card-hover-opacity':'card-not-hover-opacity']"
                          >
                            <v-img
                                @click="showImageViewer(itemModified.avatarImage)"
                                :lazy-src="lookupImageUrlLazy(itemModified)"
                                :src="lookupImageUrl(itemModified)"
                                width="280"
                                height="280"
                                cover
                                :key="cacheBust+Date.now()"

                            >
                              <v-card-title class="text-h6 fill-height">
                                <v-row
                                    class="fill-height flex-column"
                                    justify="space-between"
                                >
                                  <v-spacer/>
                                  <div class="align-self-center">
                                    <v-btn
                                        :class="{ 'show-btns': isHovering }"
                                        :color="isHovering? 'white' : transparent"
                                        icon
                                        size="large"
                                        :variant="isHovering? 'elevated' : 'plain'"
                                        @click.stop="showDialogUpload"

                                    >
                                      <v-icon
                                          :class="{ 'show-btns': isHovering }"
                                          :color="isHovering? 'indigo' : transparent"
                                          size="large"
                                      >
                                        mdi-upload
                                      </v-icon>
                                    </v-btn>
                                  </div>
                                </v-row>

                              </v-card-title>
                            </v-img>
                          </v-card>
                        </template>
                      </v-hover>
                    </v-row>
                  </v-container>
                </v-col>
                <v-col cols="12" md="9" sm="7">
                  <v-row>
                    <v-col cols="12" sm="4" md="3">
                      <v-text-field
                        v-model="itemModified.kode1"
                        :rules="rulesLength"
                        label="Kode1"
                        variant="outlined"
                        density="compact"
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field
                        v-model="itemModified.description"
                        label="Judul Jurnal/Artikel"
                        :rules="rulesNotEmpty"
                        variant="outlined"
                        density="compact"
                        hide-details
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="4" md="4">
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
                    <v-col cols="12" sm="4" md="4">
                      <v-autocomplete
                        v-model="itemModified.farticleCategBean"
                        :items="itemsFArticleCateg"
                        :rules="rulesNotEmpty"
                        item-value="id"
                        item-title="description"
                        auto-select-first
                        density="compact"
                        chips
                        deletable-chips
                        variant="outlined"
                        color="blue-grey lighten-2"
                        label="Kategori Arsip/Dokumen"
                        hint="Kategori Arsip/Dokumen"
                        persistent-hint
                      ></v-autocomplete>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field
                        v-model="itemModified.publisher"
                        label="Publisher"
                        variant="outlined"
                        density="compact"
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-menu
                        v-model="menuDate"
                        :close-on-content-click="false"
                        max-width="290"
                      >
                        <template v-slot:activator="{ props  }">
                          <v-text-field
                            :model-value="computedDateFormattedDatefns(itemModified.publicationDate)"
                            prepend-inner-icon="mdi-calendar"
                            clearable
                            label="Tanggal Publikasi"
                            variant="outlined"
                            density="compact"
                            readonly
                            v-bind="props"
                          ></v-text-field>
                        </template>

                        <v-date-picker
                          v-model="itemModified.publicationDate"
                          @change="menuDate = false"
                        ></v-date-picker>
                      </v-menu>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-container>

            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="2">
                  <v-text-field
                    v-model="itemModified.volume"
                    label="Volume"
                    variant="outlined"
                    density="compact"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                  <v-text-field
                    v-model="itemModified.pages"
                    label="Halaman"
                    variant="outlined"
                    density="compact"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="itemModified.issues"
                    label="Issues"
                    variant="outlined"
                    density="compact"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                      v-model="itemModified.doi"
                      label="DOI"
                      variant="outlined"
                      density="compact"
                      hide-details
                  ></v-text-field>
                </v-col>
              </v-row>
              <div class="my-4">
                <span class="font-weight-bold py-2 subtitle-2">ABSTRACT</span>
                <quill-editor
                    v-model:value="itemModified.notes"
                    :options="editorOptions"
                ></quill-editor>
              </div>

              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field
                    v-model="itemModified.authors"
                    label="Authors (Penulis)"
                    variant="outlined"
                    density="compact"
                    hide-details
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                    <div class="caption font-weight-bold">
                      Upload File (PDF, Docx, etc)
                    </div>
                    <div class="lighten-4 rounded elevation-10 pa-4">
                      <v-btn
                          color="blue"
                          size="small"
                          class="elevation-6 ma-1"
                          @click="showDialogUploadDocument()"
                          icon
                      >
                        <v-icon color="white">mdi-upload</v-icon>
                      </v-btn>
                      <span v-if="itemModified.fileName === ''"
                      >No File</span
                      >
                      <a
                          v-else
                          :href="`${downloadFile(itemModified.fileName)}`"
                          target="_blank"
                      >
                        {{ itemModified.fileName }}
                        <v-icon color="green" size="x-small">mdi-download</v-icon>
                      </a>
                    </div>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions class="pb-10 pr-16">
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
              color="blue darken-1"
              variant="outlined"
              @click="closeForm"
              class="hidden-sm-and-down"
            >
              Batal
            </v-btn>
            <v-btn
              color="blue darken-1"
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
      <UploadDocumentSimpleDialog
        ref="refUploadDialogDocument"
        @eventUploadSuccess="completeUploadSuccessDocument"
      ></UploadDocumentSimpleDialog>
      <UploadImageDialog
        ref="refUploadDialog"
        @eventUploadSuccess="completeUploadSuccess"
      ></UploadImageDialog>
      <close-confirm-dialog
        ref="refCloseConfirmDialog"
        @eventFromCloseConfirm="passingEventFromCloseConfirm"
      ></close-confirm-dialog>
      <v-snackbar v-model="snackbar">
        {{ snackBarMesage }}
        <template v-slot:actions="{ attrs }">
          <v-btn variant="text" v-bind="attrs" @click="snackbar = false"> Close </v-btn>
        </template>
      </v-snackbar>
    </v-dialog>
    <ImageViewerDialog
        :max-width="600"
        :height="600"
        :fullscreen="false"
        ref="refImageViewerDialog"
        @rotating="imageViewerRotating"
    ></ImageViewerDialog>
  </div>
</template>
  
<script>
import FArticleService from "@/services/apiservices-elibrary/f-article-service";
import UploadImageDialog from "@/components/utils/UploadImageDialog.vue";
import FileService from "@/services/apiservices/file-service";
import CloseConfirmDialog from "@/components/utils/CloseConfirmDialog.vue";
import FormMode from "@/models/form-mode";
import FArticle from "@/models/elibrary/f-article";
// import { format, parseISO } from "date-fns";
import UploadDocumentSimpleDialog from "@/components/utils/UploadDocumentSimpleDialog.vue";
import {quillEditor} from "vue3-quill";
import {useDate} from "vuetify";
import {EArticleCategGroups} from "@/models/e-article-categ-group";
import ImageViewerDialog from "@/components/utils/ImageViewerDialog.vue";

export default {
  name: "FArticleDialog",
  components: {
    ImageViewerDialog,
    UploadDocumentSimpleDialog,
    CloseConfirmDialog,
    UploadImageDialog,
    quillEditor
  },
  props: {
    formMode: String,
  },
  data() {
    return {
      cacheBust: 0,
      editorOptions: {
        placeholder: 'Tulis seperti halnya ms Word...',
      },
      snackBarMesage: "",
      snackbar: false,
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
      date: new Date('2018-03-02'),
      itemsFCountry: [],
      itemsFArticleCateg: [],
      // date: format(parseISO(new Date().toISOString()), "dd-MMM-yyyy"),
      menuDate: false,
      selectedItemIndex: -1,
      itemDefault: "",
      itemModified: new FArticle(0, "", ""),
      selectFDivision: { id: 0, kode1: "", description: "" },
      validateNotEmpty: (value) => !!value || "Tidak Boleh Kosong",
      validateEmail: (value) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(value) || "Format Email Salah";
      },
      itemsFDivision: [
        { id: 1, kode1: "", description: "" },
        { id: 2, kode1: "", description: "" },
      ],
      itemsArticleCategGroup: EArticleCategGroups,
      newFArticleId: 0,
      transparent: "rgba(255, 255, 255, 0)",
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
    publicationDate: {
      get() {
        try {
          const inputDate = new Date(this.itemModified.publicationDate);
          return inputDate.$vuetify.date.toISO().split("T")[0];
        } catch (e) {
          return new Date().$vuetify.date.toISO().split("T")[0];
        }
      },
      set(value) {
        this.itemModified.publicationDate = value;
      },
    },
    isItemModified() {
      const defaultItem = JSON.stringify(this.itemDefault);
      const modifiedItem = JSON.stringify(this.itemModified);
      return defaultItem !== modifiedItem;
    },
  },
  watch: {},
  methods: {
    showImageViewer(fileName) {
      if(fileName !== "" && fileName !== undefined){
        this.$refs.refImageViewerDialog.showDialog(fileName)
      }
    },
    imageViewerRotating(val){
      if (val){
        this.cacheBust = this.cacheBust++
      }
    },
    showDialogUpload() {
      if (
        this.itemModified.kode1 !== undefined &&
        this.itemModified.description !== undefined &&
        this.itemModified.fdivisionBean !== undefined
      ) {
        if (this.itemModified.id === 0) {
          // this.$emit('eventSaveItemWithoutClose', false)
          this.saveCreateOnly();
        }
        this.$refs.refUploadDialog.showDialog();
      } else {
        this.snackBarMesage = "Kode, Deskripsi dan Bidang/Dinas harus diisi dahulu";
        this.snackbar = true;
      }
    },
    completeUploadSuccess: function (val) {
      if (
        this.itemModified.avatarImage !== undefined &&
        this.itemModified.avatarImage !== ""
      ) {
        FileService.deleteImage(this.itemModified.avatarImage).then(
          () => {
          },
          (error) => {
            console.log(error.response);
          }
        );
      }
      if (val.fileName !== "") {
        this.$refs.refUploadDialog.closeDialog();
        this.itemModified.avatarImage = val.fileName;
        this.saveUpdateOnly();
      }
    },
    downloadFile(item) {
      // console.log(item);
      return FileService.file_url(item);
    },
    showDialogUploadDocument() {
      if (
          this.itemModified.kode1 !== "" &&
          this.itemModified.description !== "" &&
          this.itemModified.fdivisionBean !== 0
      ) {
        if (this.itemModified.id === 0) {
          this.saveCreateOnly();
        }
        this.$refs.refUploadDialogDocument.showDialog();
      } else {
        this.snackBarMesage =
            "Kode, Deskripsi, Bidang/Dinas harus diisi dahulu";
        this.snackbar = true;
      }
    },

    completeUploadSuccessDocument: function (val) {
        if (
            this.itemModified.fileName !== undefined &&
            this.itemModified.fileName !== ""
        ) {
          FileService.deleteFile(this.itemModified.fileName).then(
              () => {
                console.log(`Delete Image ${this.itemModified.fileName}`);
              },
              (error) => {
                console.log(error.response);
              }
          );
        }

        if (val.fileName !== "") {
          this.$refs.refUploadDialogDocument.closeDialog();
          this.itemModified.fileName = val.fileName;
          this.itemModified.fileType = 'DOC';
          this.saveUpdateOnly();
        }
    },
    computedDateFormattedDatefns(value) {
      const date = useDate()
      return date.format(value, 'fullDate')
    },
    showDialog(selectedIndex, item, itemsFDivision, itemsFCountry, itemsFArticleCateg) {
      this.dialogShow = !this.dialogShow;
      if (selectedIndex > -1) {
        this.selectedIndex = selectedIndex;
        this.initializeEditMode(item);
      } else {
        (this.itemDefault = new FArticle(0, "", "")),
          (this.itemModified = new FArticle(0, "", "")),
          (this.selectedIndex = -1);
      }

      this.itemsFDivision = itemsFDivision;
      this.itemsFCountry = itemsFCountry;
      this.itemsFArticleCateg = itemsFArticleCateg;
    },
    setDialogState(value) {
      this.dialogShow = value;
    },
    saveCreateOnly() {
      if(this.itemModified.farticleCategBean > 0){
        this.itemModified.articleCategGroup = this.lookupFArticleCateg(this.itemModified.farticleCategBean).articleCategGroup
      }
      if (this.formMode === FormMode.NEW_FORM) {
        FArticleService.createFArticle(this.itemModified).then(
          (response) => {
            /**
             * dipaksa Save dan Update Dahulu
             */
            this.$emit("update:formMode", FormMode.EDIT_FORM);
            this.itemModified.id = response.data.id;
          },
          (error) => {
            this.formDialogOptions.errorMessage = error.response.data.message;
          }
        );
      }
    },
    save() {
      if (this.isItemModified === false) {
        //Close aja
        this.dialogShow = false;
        this.$emit("eventFromFormDialog1", this.itemModified);
        return;
      }
      if (this.$refs.form.validate()) {
        if(this.itemModified.farticleCategBean > 0){
          this.itemModified.articleCategGroup = this.lookupFArticleCateg(this.itemModified.farticleCategBean).articleCategGroup
        }
        if (this.formMode === FormMode.EDIT_FORM) {
          FArticleService.updateFArticle(this.itemModified).then(
            () => {
              this.$emit("eventFromFormDialogEdit", this.itemModified);
            },
            (error) => {
              console.log(error);
              this.formDialogOptions.errorMessage = error.response.data.message;
            }
          );
        } else {
          FArticleService.createFArticle(this.itemModified).then(
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
    saveUpdateOnly() {
      if(this.itemModified.farticleCategBean > 0){
        this.itemModified.articleCategGroup = this.lookupFArticleCateg(this.itemModified.farticleCategBean).articleCategGroup
      }
      FArticleService.updateFArticle(this.itemModified).then(
        () => {
        },
        (error) => {
          this.formDialogOptions.errorMessage = error.response.data.message;
        }
      );
    },
    closeForm() {
      this.$emit("eventUpdateImageRotate")
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
    lookupImageUrl(item) {
      if (item.avatarImage === undefined || item.avatarImage === "") {
        return require("@/assets/images/no_image_available.jpeg");
      } else {
        return FileService.image_url_medium(item.avatarImage);
      }
    },
    lookupImageUrlLazy(item) {
      if (item.avatarImage === undefined || item.avatarImage === "") {
        return require("@/assets/images/no_image_available.jpeg");
      } else {
        return FileService.image_url_verylow(item.avatarImage);
      }
    },

    passingEventFromCloseConfirm(value) {
      if (value === "OKE") this.dialogShow = false;
    },
    lookupFArticleCateg(id) {
      const str = this.itemsFArticleCateg.filter((x) => x.id === id);
      if (str.length > 0) {
        return str[0];
      } else {
        return "-";
      }
    },
    initializeEditMode(item) {
      this.formDialogOptions.errorMessage = "";

      FArticleService.getFArticleById(item.id).then(
        (response) => {
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
.card-hover-opacity {
  opacity: 0.4;
}
.card-not-hover-opacity {
  opacity: 1;
  transition: opacity 0.4s ease-in-out;
}

.show-btns {
  opacity: 1;
}
</style>