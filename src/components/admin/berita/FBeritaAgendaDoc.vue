<template>
  <div class="mt-4">
    <v-row>
      <v-col cols="12" md="5" sm="5">
        <v-container class="pa-4 text-center">
          <v-row class="fill-height" align="center" justify="center">
            <v-hover>
              <template v-slot:default="{ isHovering, props }">
                <v-card

                    v-bind="props"
                    class="align-self-center"
                    :elevation="isHovering ? 10 : 1"
                    :class="[{ 'on-hover': isHovering }, isHovering?'card-hover-opacity':'card-not-hover-opacity']"
                >
                  <v-img
                      @click="showImageViewer(itemModified.coverImage)"
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
      <v-col cols="12" md="7" sm="7" class="mt-4">
        <v-row>
          <v-textarea
              rows="2"
              auto-grow
              v-model="itemModified.title"
              :rules="rulesNotEmtpy"
              label="Judul"
              variant="outlined"
              density="compact"
          ></v-textarea>
        </v-row>
        <v-row>
          <v-textarea
              rows="2"
              auto-grow
              v-model="itemModified.contentMeta"
              :rules="rulesNotEmtpy"
              label="Deskripsi Singkat"
              variant="outlined"
              density="compact"
          ></v-textarea>
        </v-row>

        <v-row>
          <v-col md="4" sm="12" col="12">
            <v-autocomplete
                v-model="itemModified.typeNews"
                :items="itemsTypeNews"
                :rules="rulesNotEmtpy"
                item-value="id"
                item-title="description"
                auto-select-first
                density="compact"
                chips
                variant="outlined"
                deletable-chips
                color="blue-grey lighten-2"
                label="Tipe Berita"
                hint="1=Berita, 2=Agenda"
                persistent-hint
            ></v-autocomplete>
          </v-col>
          <v-col md="3" sm="12" col="12">
              <v-switch
                  :disabled="! isRedaktur"
                  v-model="itemModified.flagExposed"
                  :label="itemModified.flagExposed?'Tayang':'Tidak Tayang'"
                  density="compact"
                  hide-details
                  color="primary"
              ></v-switch>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-autocomplete
                v-model="itemModified.fdivisionBean"
                :items="itemsFDivision"
                :rules="rulesNotEmtpy"
                item-value="id"
                item-title="description"
                auto-select-first
                density="compact"
                chips
                variant="outlined"
                deletable-chips
                color="blue-grey lighten-2"
                label="Bidang/Dinas"
                persistent-hint
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" md="6">
            <v-autocomplete
                v-model="itemModified.categ"
                :items="itemsBeritaCateg"
                :rules="rulesNotEmtpy"
                item-value="id"
                item-title="description"
                auto-select-first
                density="compact"
                chips
                variant="outlined"
                deletable-chips
                color="blue-grey lighten-2"
                label="Kategori Berita"
                persistent-hint
            ></v-autocomplete>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <v-menu
                v-model="menuDate"
                :close-on-content-click="false"
                max-width="290"
            >
              <template v-slot:activator="{ props  }">
                <v-text-field
                    :model-value="computedDateFormattedDatefns(itemModified.publishTime)"
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
                  v-model="itemModified.publishTime"
                  @change="menuDate = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
                v-model="itemModified.editorial"
                label="Editorial"
                variant="outlined"
                :rules="rulesNotEmtpy"
                density="compact"
                hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
                v-model="itemModified.nomorUrut"
                label="Nomor Urut"
                type="number"
                variant="outlined"
                density="compact"
                hint="Beri Nomor Urut untuk Home"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="12"
        sm="12"
      >
        <quill-editor
            v-model:value="itemModified.contentBody"
            :options="editorOptions"
        ></quill-editor>

      </v-col>
    </v-row>

    <upload-image-dialog
      ref="refUploadDialog"
      @eventUploadSuccess="completeUploadSuccess"
    >
    </upload-image-dialog>
    <v-snackbar
        v-model="snackbar"
    >
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
import FileService from "@/services/apiservices/file-service";
import UploadImageDialog from "@/components/utils/UploadImageDialog";
import FEnumHelper from "@/models/f-enum-helper";
import ERole from "@/models/e-role";
import { quillEditor } from 'vue3-quill'
import ImageViewerDialog from "@/components/utils/ImageViewerDialog.vue";
import {EBeritaCategs} from "@/models/e-berita-categ";
import {useDate} from "vuetify/framework";

export default {
  name: "FBeritaAgendaDoc",
  components:{
    ImageViewerDialog,
    UploadImageDialog,
    quillEditor
  },
  props:{
    itemsFDivision: Array
  },
  data() {
    return{
      menuDate: false,
      cacheBust: 0,
      editorOptions: {
        placeholder: 'Tulis seperti halnya ms Word...',
      },
      snackbar: false,
      snackBarMesage: '',

      transparent: 'rgba(255, 255, 255, 0)',
      itemsTypeNews:[
        new FEnumHelper(1, 'Berita'), new FEnumHelper(2, 'Agenda')
      ],

      itemsBeritaCateg: EBeritaCategs,
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
  computed:{
    isRedaktur(){
      if ( (this.currentUser.roles.includes(ERole.ROLE_ADMIN) && this.currentUser.organizationLevel === "CORP")
      ){
        return true
      }else {
        return false
      }
    },
    currentUser() {
      return this.$store.state.auth.user;
    },

    itemModified: {
      get() {
        return this.$store.state.helperModule.itemModified
      },
      set(value) {
        this.$store.commit('helperModule/updateItemModified', value)
      }
    },
    itemDefault: {
      get() {
        return this.$store.state.helperModule.itemDefault
      },
      set(value) {
        this.$store.commit('helperModule/updateItemDefault', value)
      }
    },


  },
  methods: {
    computedDateFormattedDatefns(value) {
      const date = useDate()
      return date.format(value, 'fullDate')
    },
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
    showDialogUpload(){
      if (this.itemModified.title !==undefined && this.itemModified.contentMeta !==undefined &&
          this.itemModified.fdivisionBean !==undefined && this.itemModified.fdivisionBean !== 0){
        if (this.itemModified.id===0){
          this.$emit('saveCreateOnly')
        }
        this.$refs.refUploadDialog.showDialog()

      }else{
        this.snackBarMesage = 'Deskripsi dan Bidang/Dinas harus diisi dahulu'
        this.snackbar = true
      }
    },
    completeUploadSuccess: function (val){
      if (val.fileName !==""){
        FileService.deleteImage(this.itemModified.coverImage).then(
            ()=>{
            },
            error => {
              console.log(error.response)
            }
        )
        this.itemModified.coverImage = val.fileName
        this.$refs.refUploadDialog.closeDialog()
        this.$emit("saveUpdateOnly", 'dummy')
      }
    },
    lookupImageUrl(item){
      if (item.coverImage===undefined || item.coverImage===""){
          return require('@/assets/images/no_image_available.jpeg')
      }else {
        return FileService.image_url_medium(item.coverImage)
      }
    },
    lookupImageUrlLazy(){
      return  require('@/assets/images/no_image_available.jpeg')
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
  /*transition: opacity .4s ease-in-out;*/
  transition: opacity .4s ease-in-out;
}

.show-btns {
  opacity: 1;
}

</style>