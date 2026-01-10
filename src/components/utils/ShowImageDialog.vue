<template>
  <div>
    <v-dialog
      v-model="dialogShow"
      :max-width="formDialogOptions.width"
      :style="{ zIndex: formDialogOptions.zIndex }"
      @keydown.esc.prevent="closeForm"
      persistent
      fullscreen
    >

      <v-card>
        <v-toolbar
            dense
            elevation="0"
        >
          <v-btn
              icon
              dark
              @click="closeForm"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-toolbar-title>{{ title }}</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs}">
              <v-btn
                  dark
                  text
                  @click="downloadImage(itemModified)"
                  v-on="on"
                  v-bind="attrs"
              >
                <v-icon color="success">mdi-download</v-icon>
              </v-btn>
            </template>
            <span>Download</span>
          </v-tooltip>
          <v-toolbar-items >
            <v-btn
                dark
                text
                @click="closeForm"
            >
              <v-icon color="red">mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-img
            :lazy-src="lookupImageUrlLazy(itemModified)"
            :src="lookupImageUrl(itemModified)"
        >
        </v-img>

      </v-card>


    </v-dialog>
  </div>

</template>

<script>
import FileService from "@/services/apiservices/file-service";
import FileSaver from 'file-saver'

export default {
  components: {

  },
  props:{
    formMode: String,
  },
  data() {
    return {
      title: '',
      snackBarMesage: '',
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
      itemModified: '',
      selectFDivision: {id: 0, kode1: '', description: '' },


    }
  },
  computed: {

  },
  watch: {
  },

  methods: {


    showDialog(value) {
      this.itemModified =  value
      this.setDialogState(true)
    },
    setDialogState(value){
      this.dialogShow =value
    },

    closeForm(){
      if (! this.isItemModified){
        this.dialogShow = false
        this.$emit('eventFromFormDialog1', this.itemModified)
      }else {
        this.$refs.refCloseConfirmDialog.showDialog(" Sudah terdapat modifikasi data", "Tetap tutup dan reset perubahan?")
      }
    },

    downloadImage(item){
      // console.log(item.id)
      // let blob = new Blob(["hello World"], {type: "text/plain;charset=utf-8"})
      // FileSaver.saveAs(blob)

      FileSaver.saveAs(FileService.image_url_high(item.fileName), item.fileName)


      // console.log("Sudah possisi download bos")
      // return FileService.downloadImage(item.fileName).then(
      //     response =>{
      //       let fileURL = window.URL.createObjectURL(new Blob([response.data]));
      //       let fileLink = document.createElement('a');
      //
      //       fileLink.href = fileURL;
      //       fileLink.setAttribute('download', item.fileName);
      //       document.body.appendChild(fileLink);
      //
      //       fileLink.click();
      //     }
      // )


    },
    lookupImageUrl(item){
      if (item.fileName===undefined || item.fileName===""){
        return './assets/images/no_image_available.jpeg'
      }else {
        return FileService.image_url_high(item.fileName)
      }
    },
    lookupImageUrlLazy(item){
      if (item.fileName===undefined || item.fileName===""){
        return './assets/images/no_image_available.jpeg'
      }else {
        return FileService.image_url_verylow(item.fileName)
      }
    },

  }

}
</script>

<style scoped>

</style>