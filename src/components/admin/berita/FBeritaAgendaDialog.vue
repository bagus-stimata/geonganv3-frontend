<template>
  <div>
    <v-dialog
      v-model="dialogShow"
      @keydown.esc.prevent="closeForm"
      :style="{ zIndex: formDialogOptions.zIndex }"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-form v-model="valid" ref="form">
          <v-toolbar class="color-bg-second text-white" density="compact">
            <v-btn icon dark @click="closeForm">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title class="text-subtitle-2">Berita & Agenda
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
              <FBeritaAgendaDoc
                  :itemModified="itemModified"
                  :itemsFDivision="itemsFDivision"
                  @saveUpdateOnly="saveUpdateOnly"
                  @saveCreateOnly="saveCreateOnly"
                  @retrieveFiles="retrieveFiles"
              >
              </FBeritaAgendaDoc>

            </v-container>

          </v-card-text>

          <v-card-actions class="mt-4">
            <v-chip
                class="ml-4"
                color="error"
                variant="outlined"
                close
                size="small"
                v-show="formDialogOptions.errorMessage"
            >
              {{formDialogOptions.errorMessage}}
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
import FNewsService from '@/services/apiservices/f-news-service';

import CloseConfirmDialog from "@/components/utils/CloseConfirmDialog";
import FormMode from "@/models/form-mode";
import FNews from "@/models/f-news";
import { format, parseISO } from 'date-fns'
import FBeritaAgendaDoc from "./FBeritaAgendaDoc";

export default {
  name: "FBeritaAgendaDialog",
  components: {
    FBeritaAgendaDoc,
    CloseConfirmDialog
  },
  props:{
    formMode: String
  },
  data() {
    return {
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
      date: format(parseISO(new Date().toISOString()), 'dd-MMM-yyyy'),
      menuDate1: false,
      menuDate2: false,
      menuDate3: false,


      selectedItemIndex: -1,
      // itemDefault: '',
      // itemModified: new FNews(0, '', ''),

      selectFDivision: {id: 0, kode1: '', description: '' },
      itemsFDivision: [],
      itemsFile:[
        // new FNewsFile(1, '1','file1.jpg'),
        // new FNewsFile(2, '2','file2.jpg')
      ],

      valid: false,
      rulesLenght: [
        v => !!v || ' Tidak Boleh Kosong',
        v => v.length <= 255 || 'Maksimal 255 Karakter',
        v => v.length > 1 || 'Harus lebih besar dari 1 karakter'
      ],
      rulesNotEmtpy: [
        v => !!v || 'Tidak boleh kosong'
      ],

    }
  },
  computed: {
    isItemModified() {
      const defaultItem = JSON.stringify(this.itemDefault)
      const modifiedItem = JSON.stringify(this.itemModified)
      return defaultItem !== modifiedItem
    },

    itemModified: {
      get() {
        return this.$store.state.helperModule.itemModified
      },
      set(value) {
        this.$store.dispatch('helperModule/updateItemModified', value)
      }
    },
    itemDefault: {
      get() {
        return this.$store.state.helperModule.itemDefault
      },
      set(value) {
        this.$store.dispatch('helperModule/updateItemDefault', value)
      }
    },

  },

  watch: {
  },

  methods: {
    showDialog(selectedIndex, item, itemsFDivision) {
      this.dialogShow = !this.dialogShow
      if (selectedIndex >-1) {
        this.selectedIndex = selectedIndex
        this.initializeEditMode(item)

      }else {
        this.itemDefault =  new FNews(0),
        this.itemModified =  new FNews(0),
        this.selectedIndex = -1
      }
      this.itemsFDivision = itemsFDivision
      // console.log(JSON.stringify(this.itemsFDivision))
    },
    setDialogState(value){
      this.dialogShow =value
    },
    save(andCloseDialog){
      console.log(andCloseDialog)
      if (this.isItemModified===false){
        //Close aja
        this.dialogShow = false
        this.$emit('eventFromFormDialog1', this.itemModified)
        return
      }

      if (this.$refs.form.validate()){
        if (this.formMode===FormMode.EDIT_FORM) {
          this.itemModified.modifiedBy = this.$store.state.auth.user.username;
          this.itemModified.modified = new Date();
          FNewsService.updateFNews(this.itemModified).then(
              () => {
                if (andCloseDialog){
                  this.$emit('eventFromFormDialogEdit', this.itemModified)
                }
              },
              error => {
                this.formDialogOptions.errorMessage = error.response.data.message
              }
          )
        }else {
          if (this.itemModified.fdivisionBean >0 && this.itemModified.title !==undefined &&
              this.itemModified.contentMeta !==undefined){
            FNewsService.createFNews(this.itemModified).then(
                response =>{
                  if (andCloseDialog){
                    this.$emit('eventFromFormDialogNew', response.data)
                  }
                },
                error => {
                  this.formDialogOptions.errorMessage = error.response.data.message
                }
            )

          }

        }
      }
    },
    saveCreateOnly(){
      this.itemModified.modifiedBy = this.$store.state.auth.user.username;
      this.itemModified.modified = new Date();

      FNewsService.createFNews(this.itemModified).then(
          response =>{
            console.log('save pertama')
              /**
               * dipaksa Save dan Update Dahulu
               */
              this.initializeEditMode(response.data)
              // this.formMode = FormMode.EDIT_FORM
            this.$emit('eventUpdateFormMode', FormMode.EDIT_FORM)
          },
          error => {
            this.formDialogOptions.errorMessage = error.response.data.message
          }
      )
    },
    saveUpdateOnly(){
      // console.log(`sampek sini ${this.itemModified.coverImage}`)
      console.log(JSON.stringify(this.itemModified))
      console.log(this.itemModified.id)
      FNewsService.updateFNews(this.itemModified).then(
          () => {
          },
          error => {
            // console.log(error);
            this.formDialogOptions.errorMessage = error.response.data.message
          }
      )
    },
    closeForm(){
      this.$emit("eventUpdateImageRotate")
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
      FNewsService.getFNewsById(item.id).then(
          response =>{
            this.itemDefault = Object.assign({}, response.data)
            this.itemModified = response.data
          },
          error =>{
            console.log(error)
          }
      )

    },
    retrieveFiles(){
      // FNewsFileService.getAllFNewsFileByParent(this.itemModified.id).then(
      //     response=>{
      //       this.itemsFile = response.data
      //     },
      //     error=>{
      //       console.log(error.response)
      //     }
      // )
    },
  }
}
</script>

<style scoped>
</style>