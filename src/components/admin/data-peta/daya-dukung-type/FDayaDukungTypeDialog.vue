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
        <v-form  v-model="valid" ref="form">
          <v-toolbar class="color-bg-second text-white" density="compact">
            <v-btn icon dark @click="closeForm">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title class="text-subtitle-2">{{title}}
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
                <v-col cols="12" md="12" sm="12">
                  <v-container class="pa-4 text-center">
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
                                :lazy-src="lookupImageUrlLazy(itemModified)"
                                :src="lookupImageUrl(itemModified)"
                                width="220"
                                height="220"
                                cover

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
                                        :color="transparent"
                                        icon
                                        size="large"
                                        dark
                                        variant="outlined"
                                        @click="showDialogUpload"
                                    >
                                      <v-icon
                                          :class="{ 'show-btns': isHovering }"
                                          :color="transparent"
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
              </v-row>
              <v-row>
                <v-col cols="12" sm="4" md="4">
                  <v-text-field
                      v-model="itemModified.kode1"
                      label="Kode"
                      :rules="rulesLength"
                      variant="outlined"
                      density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="5">
                  <v-text-field
                      v-model="itemModified.description"
                      :rules="rulesNotEmpty"
                      label="Jenis Peta"
                      variant="outlined"
                      density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-switch
                      v-model="itemModified.statusActive"
                      :label="itemModified.statusActive?'Aktif':'Non-Aktif'"
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
                      variant="outlined"
                      small-chips
                      deletable-chips
                      color="blue-grey lighten-2"
                      label="Div/Bidang"
                      hint="Div/Bidang"
                      persistent-hint
                      single-line
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


      <CloseConfirmDialog
        ref="refCloseConfirmDialog"
        @eventFromCloseConfirm="passingEventFromCloseConfirm"
      ></CloseConfirmDialog>

      <UploadImageDialog
          ref="refUploadDialog"
          @eventUploadSuccess="completeUploadSuccess"
      >
      </UploadImageDialog>
      <v-snackbar v-model="snackbar">
        {{ snackBarMessage }}
        <template v-slot:actions="{ attrs }">
          <v-btn variant="text" v-bind="attrs" @click="snackbar = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>


    </v-dialog>
  </div>

</template>

<script>
import FDayaDukungTypeService from '@/services/apiservices/f-dayadukung-type-service';

import CloseConfirmDialog from "@/components/utils/CloseConfirmDialog.vue";
import FormMode from "@/models/form-mode";
import FDayaDukungType from "@/models/f-dayadukung-type";
import FileService from "@/services/apiservices/file-service";
import UploadImageDialog from "@/components/utils/UploadImageDialog.vue";

export default {
  components: { CloseConfirmDialog, UploadImageDialog },
  props:{
    formMode: String,
  },
  data() {
    return {
      title: 'Jenis Peta',
      snackBarMessage: '',
      snackbar: false,

      imageOverlay: false,

      dialogShow: false,
      formDialogOptions: {
        title1: '',
        title2: '',
        message1: '',
        message2: '',
        errorMessage: '',
        color: "grey lighten-3",
        width:800,
        zIndex: 200,
        noconfirm: false,
      },

      selectedItemIndex: -1,
      itemDefault: '',
      itemModified: new FDayaDukungType(),
      selectFDivision: {id: 0, kode1: '', description: '' },
      itemsFDivision: [],

      valid: false,
      rulesLength: [
        v => !!v || ' Tidak Boleh Kosong',
        v => v.length <= 255 || 'Maksimal 255 Karakter',
        v => v.length > 1 || 'Harus lebih besar dari 1 karakter'
      ],
      rulesNotEmpty: [
        v => !!v || 'Tidak boleh kosong'
      ],

      transparent: 'rgba(255, 255, 255, 0)',
    }
  },
  computed: {
    isItemModified() {
      const defaultItem = JSON.stringify(this.itemDefault)
      const modifiedItem = JSON.stringify(this.itemModified)
      return defaultItem !== modifiedItem
    },
  },
  watch: {
  },
  methods: {
    showDialogUpload(){
      if (this.itemModified.kode1 !==undefined &&
          this.itemModified.description !==undefined &&
          this.itemModified.fdivisionBean !==undefined){
        if (this.itemModified.id===0){
          this.saveCreateOnly()
        }
        this.$refs.refUploadDialog.showDialog()
      }else{
        this.snackBarMessage = 'Kode, Deskripsi dan Divisi harus diisi dahulu'
        this.snackbar = true
      }
    },
    completeUploadSuccess: function (val){
      if (this.itemModified.avatarImage !==undefined && this.itemModified.avatarImage !== '' ) {
        FileService.deleteImage(this.itemModified.avatarImage).then(
            () => {
            },
            (error) => {
              console.log(error.response)
            }
        )
      }
      if (val.fileName !==""){
        this.$refs.refUploadDialog.closeDialog()
        this.itemModified.avatarImage = val.fileName
        this.saveUpdateOnly()
      }
    },
    showDialog(selectedIndex, item, itemsFDivision) {
      this.dialogShow = !this.dialogShow
      if (selectedIndex >-1) {
        this.selectedIndex = selectedIndex
        this.initializeEditMode(item)
      }else {
        this.itemDefault =  new FDayaDukungType(0, '', '')
        this.itemModified =  new FDayaDukungType(0, '', '')
        this.selectedIndex = -1
      }
      this.itemsFDivision = itemsFDivision
    },
    setDialogState(value){
      this.dialogShow =value
    },
    save(){
      if (this.isItemModified===false){
        this.dialogShow = false
        this.$emit('eventFromFormDialog1', this.itemModified)
        return
      }
      if (this.$refs.form.validate()){
        if (this.formMode===FormMode.EDIT_FORM) {
          FDayaDukungTypeService.updateFDayaDukungType(this.itemModified).then(
              () => {
                this.$emit('eventFromFormDialogEdit', this.itemModified)
              },
              error => {
                this.formDialogOptions.errorMessage = error.response.data.message
              }
          )
        }else {
          FDayaDukungTypeService.createFDayaDukungType(this.itemModified).then(
              response =>{
                this.$emit('eventFromFormDialogNew', response.data)
              },
              error => {
                this.formDialogOptions.errorMessage = error.response.data.message
              }
          )
        }
      }
    },
    saveCreateOnly(){
      FDayaDukungTypeService.createFDayaDukungType(this.itemModified).then(
          response =>{
            this.$emit('update:formMode', FormMode.EDIT_FORM)
            this.itemModified.id = response.data.id
          },
          error => {
            this.formDialogOptions.errorMessage = error.response.data.message
          }
      )
    },
    saveUpdateOnly(){
      FDayaDukungTypeService.updateFDayaDukungType(this.itemModified).then(
          () => {
          },
          error => {
            this.formDialogOptions.errorMessage = error.response.data.message
          }
      )
    },
    closeForm(){
      if (! this.isItemModified){
        this.dialogShow = false
        this.$emit('eventFromFormDialog1', this.itemModified)
      }else {
        this.$refs.refCloseConfirmDialog.showDialog(" Sudah terdapat modifikasi data", "Tetap tutup dan reset perubahan?")
      }
    },
    passingEventFromCloseConfirm(value){
      if (value==='OKE') this.dialogShow = false
    },
    initializeEditMode(item){
      this.formDialogOptions.errorMessage = ''

      FDayaDukungTypeService.getFDayaDukungTypeById(item.id).then(
          response =>{
            this.itemDefault = Object.assign({}, response.data)
            this.itemModified = response.data
          },
          error =>{
            console.log(error)
          }
      )
    },
    lookupFDivision (fdivisionBean) {
      const str = this.itemsFDivision.filter(x => x.id===fdivisionBean)
      if (str.length>0){
        return `${str[0].description} (${str[0].kode1})`
      }else {
        return '-'
      }
    },
    lookupImageUrl(item){
      if (item.avatarImage===undefined || item.avatarImage===""){
        return require('@/assets/images/no_image_available.jpeg')
      }else {
        return FileService.image_url_medium(item.avatarImage)
      }
    },
    lookupImageUrlLazy(item){
      if (item.avatarImage===undefined || item.avatarImage===""){
        return require('@/assets/images/no_image_available.jpeg')
      }else {
        return FileService.image_url_verylow(item.avatarImage)
      }
    },
  }
}
</script>

<style scoped>
  .show-btns {
    color: blue !important;
    opacity: 1;
  }

</style>