<template>
  <v-card class="elevation-0">
    <v-card-title>
      <v-row class="align-center">
        <strong>{{ title }}</strong>
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
        :items="fSubAreasFiltered"
        v-model:page="currentPage"
        :items-per-page="pageSize"
        hide-default-footer
        class="elevation-0"
        :items-length="totalItems"
        @page-count="totalTablePages =totalPaginationPages "
    >
      <template v-slot:top>
        <v-row align="center" class="ml-4 mr-4">
          <v-switch
              disabled
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
      <template v-slot:[`item.number`]="{ index }">
        {{ (index + ((currentPage-1)*pageSize) +1 )}}
      </template>
      <template v-slot:[`item.statusActive`]="{ item }">
        <div>
          <v-chip :color="getColorStatusActive(item.statusActive)" size="x-small" variant="flat">
            {{ item.statusActive === true ? "Aktif" : "Non-Aktif" }}
          </v-chip>
        </div>
      </template>
      <template v-slot:[`item.description`]="{ item }">
        <div class="text-caption font-weight-bold">{{item.description}}</div>
        <div class="text-caption font-weight-light text-grey" v-if="item.kode1">*{{item.kode1}}</div>
      </template>
      <template v-slot:[`item.alias1`]="{ item }">
        <div class="text-grey text-caption">
          {{item.alias1}}
        </div>
        <div class="text-grey text-caption">
          {{item.alias2}}
        </div>
      </template>
      <template v-slot:[`item.fareaBean`]="{ item }">
        <span class="text-caption">
          {{ lookupFArea(item.fareaBean).description }}
        </span>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn @click="showDialogEdit(item)" :color="!multiSelect? 'warning' : 'grey-darken-3'" size="small" variant="text" icon="mdi-pencil" :disabled="multiSelect"></v-btn>
        <v-btn @click="deleteDialogShow(item)" :color="!multiSelect && false? 'red accent-4' : 'grey-darken-3'" size="small" variant="text" icon="mdi-delete" :disabled="multiSelect || true"></v-btn>
      </template>

    </v-data-table-server>

    <v-container>
      <v-row justify="end" align="center">
        <v-col cols="4" md="2" sm="6">
          <v-select
              v-model="pageSize"
              :items="pageSizes"
              label="Items per page"
              variant="outlined"
              density="compact"
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

    <DeleteConfirmDialog
        ref="refDeleteConfirmDialog"
        @eventFromDeleteConfirmDialog1="deleteItemConfirmedSingleSelect"
        @eventFromDeleteConfirmDialog2="deleteItemConfirmedMultiSelect"
    ></DeleteConfirmDialog>

    <FSubAreaDialog v-model:formMode="formMode"
                  ref="refFormDialog"
                  @eventFromFormDialogNew="saveDataNew"
                  @eventFromFormDialogEdit="saveDataEdit"
    ></FSubAreaDialog>

    <v-snackbar v-model="snackbar">
      {{ snackBarMessage }}
      <template v-slot:actions="{ attrs }">
        <v-btn variant="text" v-bind="attrs" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>

  </v-card>
</template>

<script>
import FSubAreaService from '@/services/apiservices/f-sub-area-service';
import FAreaService from "@/services/apiservices/f-area-service";

import DeleteConfirmDialog from "@/components/utils/DeleteConfirmDialog";

import FSubAreaDialog from "./FSubAreaDialog";
import FormMode from "@/models/form-mode";
import FSubArea from '@/models/f-sub-area'
import FileService from "@/services/apiservices/file-service";

export default {
  components: { FSubAreaDialog, DeleteConfirmDialog},
  data () {
    return {
      title: 'DESA/KELURAHAN',
      snackbar: false,
      snackBarMessage: '',

      multiSelect: false,
      selectedItems: [],

      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 25,
      pageSizes: [10, 25, 50, 150, 500],
      totalItems: 0,

      search: '',
      headers: [
        {
          title: 'No',
          key: 'number',
          width: '7%',
          sortable: false
        },
        { title: 'Desa/Kelurahan', key: 'description', width:"40%" },
        { title: 'Kecamatan', key: 'fareaBean', width: '30%' },
        { title: 'Aktif', key: 'statusActive' },
        { title: 'Actions', align: 'center', key: 'actions', sortable: false },
      ],

      formMode: '',
      itemSelectedIndex: -1,
      itemSelected: '',
      fSubAreas:[
        new FSubArea(0, '','')
      ],
      itemsFArea: [
        { id: 0, kode1: '', description: '' },
      ],
      itemsFSalesman:[],

      fareaReports:[]

    }
  },
  watch: {
    currentPage(newPage) {
      console.log(newPage)
      if (newPage) {
        this.fetchFSubArea();
      }
    },
    pageSize(newValue) {
      const refreshData = this.currentPage === 1;
      this.currentPage = 1;
      if (refreshData) {
        console.log("Change PageSize " + newValue);
        this.fetchFSubArea();
      }
    },
  },
  computed: {
    currentUser(){
      return this.$store.state.auth.user;
    },
    fSubAreasFiltered(){
      return this.fSubAreas
    }
  },
  methods: {
    searchOnEnter(event){
      if (this.search !== event.target.value) {
        this.currentPage = 1
        this.search = event.target.value
        this.fetchFSubArea()
      }
    },
    fetchParent(){
      FAreaService.getAllFArea().then(
          response => {
            this.itemsFArea = response.data
          },
          error => {
            console.log(error.response)
          }
      )

    },
    fetchFSubArea() {
      FSubAreaService.getAllFSubAreaContaining(this.currentPage, this.pageSize, "id", "DESC", this.search).then(
          response => {
            const { items, totalPages, totalItems} = response.data
            this.fSubAreas = items
            this.totalPaginationPages = totalPages
            this.totalItems = totalItems
          },
          error => {
            console.log(error.response)
            if (error.response.status===401){
              this.snackBarMessage = "Anda tidak mempunyai Akses!!"
              this.snackbar = true
            }
          }
      )

    },
    showDialogNew() {
      this.itemSelectedIndex =-1
      const itemModified = Object.assign({}, '')
      this.formMode = FormMode.NEW_FORM
      this.$refs.refFormDialog.showDialog(this.itemSelectedIndex, itemModified, this.itemsFArea)
    },
    saveDataNew(itemFromRest){
      this.itemSelected = itemFromRest
      this.closeDialog()
      this.fetchFSubArea()
    },

    showDialogEdit (item) {
      this.itemSelectedIndex = this.fSubAreasFiltered.indexOf(item)
      const itemModified = Object.assign({}, item)
      this.formMode = FormMode.EDIT_FORM
      this.$refs.refFormDialog.showDialog(this.itemSelectedIndex, itemModified, this.itemsFArea)
    },
    saveDataEdit(item){
        this.itemSelected = item
        try {
          Object.assign(this.fSubAreas[this.itemSelectedIndex], this.itemSelected)
        }catch (e) {
            this.fetchFSubArea()
          e.toString()
        }
        this.closeDialog()
    },


    deleteDialogShow (item) {
      this.itemSelectedIndex = this.fSubAreasFiltered.indexOf(item)
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

      const deletedItem = this.fSubAreas[this.itemSelectedIndex]
      FSubAreaService.deleteFSubArea(deletedItem.id).then(
        () => {
          // console.log("hapus bos " + response.data + " >> " + this.itemSelectedIndex)
          this.fSubAreas.splice(this.itemSelectedIndex, 1)
          this.closeDialog()
        },
        error => {
          console.log(error)
          this.snackBarMessage = 'gagal hapus (digunakan oleh data anakk)'
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
        FSubAreaService.deleteAllFSubArea(itemIds).then(
            response => {
              if (response.data) {
                  for (let i = 0; i < items.length; i++) {
                    if (! response.data.includes(items[i].id)  || response.data.length === 0) {
                      const index = this.fSubAreasFiltered.indexOf(items[i])
                      this.fSubAreas.splice(index, 1)
                    }
                    if (response.data.length > 0) {
                      this.snackBarMessage = `${response.data.length} items gagal hapus (digunakan oleh data anak)`
                      this.snackbar = true
                    }

                    console.log("Undeleted Items: " + response.data + " = " + items[i].id)
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
        this.itemSelected = Object.assign({}, new FSubArea())
        this.itemSelectedIndex = -1
      })
    },
    getColorStatusActive (trueFalse) {
      if (trueFalse === true) return 'green'
      else if (trueFalse === false) return 'gray'
      else return 'gray'
    },
    lookupFArea (fareaBean) {
      const str = this.itemsFArea.filter(x => x.id===fareaBean)
      if (str.length>0){
        return str[0]
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

  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push('/login')
    }else {
      this.fetchFSubArea()
      this.fetchParent()

    }
  }

}
</script>

<style scoped>

</style>