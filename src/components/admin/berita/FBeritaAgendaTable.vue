<template>
  <v-card class="elevation-0">
    <v-card-title>
      <v-row class="align-center">
        BERITA & AGENDA
        <v-spacer></v-spacer>
        <v-col cols="4">
          <v-text-field
              v-on:keyup.enter="searchOnEnter"
              v-on:blur="searchOnEnter"
              append-icon="mdi-magnify"
              hint="Kode, Deskripsi (press ENTER to search)"
              label="Search"
              variant="underlined"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card-title>
    <v-data-table-server
        v-model="selectedItems"
        :single-select="!multiSelect"
        :show-select="multiSelect"
        :headers="headers"
        :items="fKegiatansFiltered"
        v-model:page="currentPage"
        :items-per-page="pageSize"
        hide-default-footer
        class="elevation-0"
        :items-length="totalItems"
        @page-count="totalTablePages =totalPaginationPages "
        align="start"
    >
      <template v-slot:top>
        <v-row align="center" class="ml-4 mr-4">
          <v-switch
              v-model="multiSelect"
              :label="multiSelect ? 'Multi Select' : 'Single Select'"
              class="pa-3"
              color="primary"
              hide-details
          ></v-switch>
          <v-btn
              color="red-accent-4"
              size="x-small"
              v-if="multiSelect"
              class="mr-2"
              @click="deleteDialogMultiShow"
              icon="mdi-delete"
          ></v-btn>
          <v-spacer></v-spacer>
          <v-btn
              color="green"
              size="x-small"
              @click="showDialogNew"
              :disabled="multiSelect"
              icon="mdi-plus"
          ></v-btn>
        </v-row>
      </template>

      <template v-slot:[`item.title`]="{ item }">
        <div>
          <div>
            {{item.title}}
            <div class="mt-2">
              <v-chip size="x-small" variant="flat" :color="`${item.typeNews===1? 'blue':'green'}`" class=text-white>
                {{ lookupTypeNews(item.typeNews) }}
              </v-chip>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:[`item.contentMeta`]="{ item }">
        <div>
          {{item.contentMeta}}
        </div>
      </template>
      <template v-slot:[`item.created`]="{ item }">
        <div >
          <div>
            {{ dateTimeFormat(item.created ) }}
          </div>
          <div>
            by {{item.modifiedBy}}
          </div>
        </div>
      </template>

      <template v-slot:[`item.fdivisionBean`]="{ item }">
        {{ lookupFDivision(item.fdivisionBean) }}
      </template>
      <template v-slot:[`item.exposed`]="{ item }">
        <div>
          <div>
            <div class="green--text" v-if="item.flagExposed">
              <v-icon color="green">
                mdi-checkbox-blank-circle
              </v-icon>
              Sedang Tayang
            </div>
            <div v-else>
              <v-icon color="grey" size="small">
                mdi-checkbox-blank-circle
              </v-icon>
              Tidak Tayang
            </div>
          </div>
          <div>
            <v-chip v-if="item.showOnHome" variant="flat" size="x-small" color="purple" class="text-white">Ditampilkan di Beranda</v-chip>
            <v-chip v-if="item.showOnDesaCantik" variant="flat" size="x-small" color="teal" class="text-white">Ditampilkan di Lilin Desa</v-chip>
            <v-chip v-if="item.showOnPemudaDesa" variant="flat" size="x-small" color="orange" class="text-white">Ditampilkan di Pemuda Desa</v-chip>
          </div>
        </div>
      </template>

      <template v-slot:[`item.number`]="{ index }">
        {{ (index + ((currentPage-1)*pageSize) +1 )}}
      </template>

      <template v-slot:[`item.coverImage`]="{item}">
        <v-img
          :src="lookupImageUrl(item)"
          width="80px"
          height="80px"
          cover
          :key="cacheBust + Date.now()"
          class="ma-2 rounded">
        </v-img>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-btn @click="showDialogEdit(item)" color="warning" size="small" variant="text" icon="mdi-pencil" :disabled="multiSelect"></v-btn>
        <v-btn @click="deleteDialogShow(item)" color="red accent-4" size="small" variant="text" icon="mdi-delete" :disabled="multiSelect"></v-btn>

      </template>

    </v-data-table-server>
    <v-container>
      <v-row justify="end" align="center">
        <v-col cols="4" md="2" sm="2">
          <v-select
            v-model="pageSize"
            :items="pageSizes"
            label="Items per page"
            variant="outlined"
            density="compact"
            hide-details
          ></v-select>
        </v-col>
        <v-col cols="10" md="9" sm="8" class="align-start">
          <v-pagination
            v-model="currentPage"
            :length="totalPaginationPages"
            total-visible="8"
            rounded="circle"
            active-color="orange-darken-4"
            size="x-small"
            variant="flat"
          ></v-pagination>
        </v-col>
      </v-row>
    </v-container>

    <delete-dialog
        ref="refDeleteConfirmDialog"
        @eventFromDeleteConfirmDialog1="deleteItemConfirmedSingleSelect"
        @eventFromDeleteConfirmDialog2="deleteItemConfirmedMultiSelect"
    ></delete-dialog>

    <FBeritaAgendaDialog
        v-model:formMode="formMode"
        ref="refFormDialog"
        @eventFromFormDialogNew="saveDataNew"
        @eventFromFormDialogEdit="saveDataEdit"
        @eventUpdateImageRotate="eventUpdateImageRotate"
        @eventUpdateFormMode="formMode = $event"
    ></FBeritaAgendaDialog>

    <v-snackbar v-model="snackbar">
      {{ snackBarMesage }}
      <template v-slot:actions="{ attrs }">
        <v-btn
            variant="text"
            v-bind="attrs"
            @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

  </v-card>
</template>

<script>
import FNewsService from '@/services/apiservices/f-news-service';
import FDivisionService from "@/services/apiservices/f-division-service";
import FileService from "@/services/apiservices/file-service"

import DeleteDialog from "@/components/utils/DeleteConfirmDialog";
import FBeritaAgendaDialog from "./FBeritaAgendaDialog";
import FormMode from "@/models/form-mode";
import FNews from '@/models/f-news'

import {format, parseISO} from "date-fns";

export default {
  components: { FBeritaAgendaDialog, DeleteDialog},
  data () {
    return {
      snackbar: false,
      snackBarMesage: '',

      multiSelect: false,
      selectedItems: [],

      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 10,
      totalItems: 0,
      pageSizes: [10, 25, 50, 150, 500],

      search: '',
      headers: [
        {
          title: 'No',
          key: 'number',
          width: '8%',
          sortable: false
        },
        { title: '', align: 'start', sortable: false, key: 'coverImage', width: '9%'},
        { title: 'Judul', key: 'title', width:'25%' },
        { title: 'Deskripsi Singkat', key: 'contentMeta', width: '22%' },
        { title: 'Exposed', key: 'exposed', width: '18%' },
        { title: 'Tanggal', key: 'created', align:'start', width: '20%' },
        { title: 'Actions', key: 'actions', align:'start', sortable: false },
      ],

      formMode: '',
      itemSelectedIndex: -1,
      itemSelected: '',
      fKegiatans:[],
      itemsFDivision: [],
      cacheBust: 0,

    }
  },
  watch: {
    currentPage(newPage) {
      console.log(newPage)
      if (newPage) {
        this.fetchFNews();
      }
    },
    pageSize(newValue) {
      const refreshData = this.currentPage === 1;
      this.currentPage = 1;
      if (refreshData) {
        console.log("Change PageSize " + newValue);
        this.fetchFNews();
      }
    },
  },
  computed: {
    currentUser(){
      return this.$store.state.auth.user;
    },
    fKegiatansFiltered(){
      return this.fKegiatans
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
  methods: {
    eventUpdateImageRotate(){
      this.cacheBust = this.cacheBust++
    },
    searchOnEnter(event){
      if (this.search !== event.target.value) {
        this.currentPage = 1
        this.search = event.target.value
        this.fetchFNews()
      }
    },
    fetchParent(){
      if (this.currentUser.organizationLevel === "CORP") {
        FDivisionService.getAllFDivision().then(
            response => {
              this.itemsFDivision = response.data
            },
            error => {
              console.log(error.response)
            }
        )
      }else  if (this.currentUser.organizationLevel === "DIV") {
        FDivisionService.getFDivisionById(this.currentUser.fdivisionBean).then(
            response=>{
              this.itemsFDivision = [response.data]
            },
            error=>{
              console.log(error.response)
            }
        )
      }
    },
    fetchFNews() {
      FNewsService.getAllFNewsContaining(this.currentPage, this.pageSize, "created", "DESC", this.search).then(
          response => {
            const { items, totalPages, totalItems} = response.data
            this.fKegiatans = items
            this.totalPaginationPages = totalPages
            this.totalItems = totalItems
          },
          error => {
            console.log(error.response)
            if (error.response.statusCode === 401){
              this.snackBarMesage = "Anda tidak mempunyai Akses!!"
              this.snackbar = true
            }
          }
      )
    },
    showDialogNew() {
      this.itemSelectedIndex =-1
      const itemModified = Object.assign({}, '')
      this.formMode = FormMode.NEW_FORM
      this.$refs.refFormDialog.showDialog(this.itemSelectedIndex, itemModified, this.itemsFDivision)
    },
    saveDataNew(itemFromRest){
      this.itemSelected = itemFromRest
      this.closeDialog()
      this.fetchFNews()
    },
    showDialogEdit (item) {
      this.itemSelectedIndex = this.fKegiatansFiltered.indexOf(item)
      const itemModified = Object.assign({}, item)

      this.formMode = FormMode.EDIT_FORM
      this.$refs.refFormDialog.showDialog(this.itemSelectedIndex, itemModified, this.itemsFDivision)
    },
    saveDataEdit(item){
        this.itemSelected = item
        try {
          Object.assign(this.fKegiatans[this.itemSelectedIndex], this.itemSelected)
        }catch (e){console.log(e)}
      this.closeDialog()
      this.fetchFNews()

    },
    deleteDialogShow (item) {
      this.itemSelectedIndex = this.fKegiatansFiltered.indexOf(item)
      this.itemSelected = Object.assign({}, item)
      this.$refs.refDeleteConfirmDialog.showDialog(this.itemSelectedIndex, item.username)
    },
    deleteDialogMultiShow(){
      if (this.multiSelect===true){
        this.$refs.refDeleteConfirmDialog.showDialogMulti(this.selectedItems, `${this.selectedItems.length} items selected`)
      }
    },
    deleteItemConfirmedSingleSelect(index){
      console.log("delete SingleItem: " + index)
      const deletedItem = this.fKegiatans[this.itemSelectedIndex]
      FNewsService.deleteFNews(deletedItem.id).then(
        () => {
          this.fKegiatans.splice(this.itemSelectedIndex, 1)
          this.closeDialog()
        },
        error => {
          console.log(error)
          this.snackBarMesage = 'gagal hapus (digunakan oleh data anakk)'
          this.snackbar = true
          this.$refs.refDeleteConfirmDialog.setDialogState(false)
        }
      )
    },
    deleteItemConfirmedMultiSelect(items){
      if (items.length >-1){
        let itemIds = []
        for (let i=0; i<items.length; i++){
            itemIds.push(items[i].id)
        }
        FNewsService.deleteAllFNews(itemIds).then(
            response => {
              if (response.data) {
                  for (let i = 0; i < items.length; i++) {
                    if (! response.data.includes(items[i].id)  || response.data.length === 0) {
                      const index = this.fKegiatansFiltered.indexOf(items[i])
                      this.fKegiatans.splice(index, 1)
                    }
                    if (response.data.length > 0) {
                      this.snackBarMesage = `${response.data.length} items gagal hapus (digunakan oleh data anak)`
                      this.snackbar = true
                    }
                }
                this.closeDialog()
              }
            },
            error => {
              console.log("error " + error)
            }
        )
      }
    },
    closeDialog () {
      this.formMode = ''
      this.$refs.refDeleteConfirmDialog.setDialogState(false)
      this.$refs.refFormDialog.setDialogState(false)
      this.$nextTick(() => {
        this.itemSelected = Object.assign({}, new FNews())
        this.itemSelectedIndex = -1
      })
    },
    getColorStatusActive (trueFalse) {
      if (trueFalse === true) return 'green'
      else if (trueFalse === false) return 'gray'
      else return 'gray'
    },
    lookupFDivision (fdivisionBean) {
      const str = this.itemsFDivision.filter(x => x.id==fdivisionBean)
      if (str.length>0){
        return str[0].description
      }else {
        return '-'
      }
    },
    lookupTypeNews (typeNewsBean) {
       if (typeNewsBean===1){
         return "Berita"
       }else  if (typeNewsBean===2){
         return "Agenda"
       }
    },

    lookupImageUrl(item){
      if (item.coverImage===undefined || item.coverImage===""){
        return require('@/assets/images/no_image_available.jpeg')

      }else {
        return FileService.image_url_verylow(item.coverImage)
      }
    },
    dateTimeFormat (value) {
      return value ? format(parseISO(value), 'dd-MMM-yyyy hh:mm:ss') : ''
    },

  },
  mounted() {
    this.fetchParent()
    this.fetchFNews()

  }

}
</script>

<style scoped>

</style>