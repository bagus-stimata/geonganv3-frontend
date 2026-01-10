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
          <v-toolbar-title class="text-subtitle-2">USERS
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
                <v-col cols="12" sm="4" md="4">
                  <v-text-field
                      v-model="itemModified.kode1"
                      label="Kode"
                      variant="outlined"
                      density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                      v-model="itemModified.description"
                      :rules="rulesNotEmpty"
                      label="Nama Desa/Kelurahan"
                      variant="outlined"
                      density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                  <v-switch
                      v-model="itemModified.statusActive"
                      :label="itemModified.statusActive?'Aktif':'Non-Aktif'"
                      density="compact"
                      hide-details
                      color="primary"
                      class="pa-3"
                  ></v-switch>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <v-autocomplete
                      v-model="itemModified.fareaBean"
                      :items="itemsFArea"
                      :rules="rulesNotEmpty"
                      item-value="id"
                      item-title="description"
                      auto-select-first
                      dense
                      chips
                      deletable-chips
                      color="blue-grey lighten-2"
                      label="Kecamatan"
                      :hint="`Kecamatan : ${lookupFArea(itemModified.fareaBean)}`"
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
import FSubAreaService from '@/services/apiservices/f-sub-area-service';

import CloseConfirmDialog from "@/components/utils/CloseConfirmDialog";
import FormMode from "@/models/form-mode";
import FSubArea from "@/models/f-sub-area";
import FileService from "@/services/apiservices/file-service";
import UploadImageDialog from "@/components/utils/UploadImageDialog";

export default {
  components: { CloseConfirmDialog, UploadImageDialog },
  props:{
    formMode: String,
  },
  data() {
    return {
      title: 'DESA/KELURAHAN',
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
      itemModified: new FSubArea(0, '', ''),
      selectFArea: {id: 0, kode1: '', description: '' },
      itemsFArea: [],

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
          this.itemModified.fareaBean !==undefined){

        if (this.itemModified.id===0){
          // this.$emit('eventSaveItemWithoutClose', false)
          this.saveCreateOnly()
        }
        this.$refs.refUploadDialog.showDialog()

      }else{
        this.snackBarMessage = 'Kode, Deskripsi dan Divisi harus diisi dahulu'
        this.snackbar = true
      }

    },

    completeUploadSuccess: function (val){

      // console.log(val)
      //Hapus Dulu yang lama
      console.log(this.itemModified.avatarImage)

      if (this.itemModified.avatarImage !==undefined && this.itemModified.avatarImage !== '' ) {
        FileService.deleteImage(this.itemModified.avatarImage).then(
            response=>{
              console.log(response.data)
            },
            error => {
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

    showDialog(selectedIndex, item, itemsFArea) {
      // console.log("show UserDialog " + item.id)
      // console.log(this.formMode)
      this.dialogShow = !this.dialogShow
      if (selectedIndex >-1) {
        this.selectedIndex = selectedIndex
        this.initializeEditMode(item)
      }else {
        this.itemDefault =  new FSubArea(0, '', ''),
        this.itemModified =  new FSubArea(0, '', ''),
        this.selectedIndex = -1
      }

      this.itemsFArea = itemsFArea

    },
    setDialogState(value){
      this.dialogShow =value
    },
    save(){
      if (this.isItemModified===false){
        //Close aja
        this.dialogShow = false
        this.$emit('eventFromFormDialog1', this.itemModified)
        return
      }
      if (this.$refs.form.validate()){
        if (this.formMode===FormMode.EDIT_FORM) {
          FSubAreaService.updateFSubArea(this.itemModified).then(
              () => {
                // console.log(response.data)
                this.$emit('eventFromFormDialogEdit', this.itemModified)
              },
              error => {
                // console.log(error);
                this.formDialogOptions.errorMessage = error.response.data.message
              }
          )
        }else {
          FSubAreaService.createFSubArea(this.itemModified).then(
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
      FSubAreaService.createFSubArea(this.itemModified).then(
          response =>{
            /**
             * dipaksa Save dan Update Dahulu
             */
            // this.initializeEditMode(response.data)
            this.$emit('update:formMode', FormMode.EDIT_FORM)
            this.itemModified.id = response.data.id
          },
          error => {
            this.formDialogOptions.errorMessage = error.response.data.message
          }
      )
    },
    saveUpdateOnly(){
      FSubAreaService.updateFSubArea(this.itemModified).then(
          () => {
          },
          error => {
            // console.log(error);
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
      // this.itemDefault = item
      // this.itemModified = item

      this.formDialogOptions.errorMessage = ''

      FSubAreaService.getFSubAreaById(item.id).then(
          response =>{
            // console.log(response.data)
            this.itemDefault = Object.assign({}, response.data)
            this.itemModified = response.data
          },
          error =>{
            console.log(error)
          }
      )
    },
    lookupFArea (fareaBean) {
      const str = this.itemsFArea.filter(x => x.id===fareaBean)
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
    lookupImageUrlLazy(){
      return require('@/assets/images/no_image_available.jpeg')
    },

  }

}
</script>

<style scoped>

  .card-hover-opacity{
    opacity: 0.4;
  }
  .card-not-hover-opacity{
    opacity: 1;
    transition: opacity .4s ease-in-out;
  }

  .show-btns {
    color: blue !important;
    opacity: 1;
  }

</style>