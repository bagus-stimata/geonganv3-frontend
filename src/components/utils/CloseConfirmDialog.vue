<template>
  <v-dialog
      v-model="dialogShow"
      :max-width="myConfirmCloseOptions.width"
      :style="{ zIndex: myConfirmCloseOptions.zIndex }"
      @keydown.esc="dialogShow=false"
  >
    <v-card>
      <v-toolbar :color="myConfirmCloseOptions.color" density="compact" flat>
        <v-toolbar-title class="text-body-2 font-weight-bold">
          {{ myConfirmCloseOptions.title }}
        </v-toolbar-title>
      </v-toolbar>
        <p align="center" class="mt-2">
          {{myConfirmCloseOptions.message1}}<br>{{myConfirmCloseOptions.message2}}
        </p>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" outlined variant="text" @click="dialogShow=false">Cancel</v-btn>
        <v-btn color="red-darken-1" outlined variant="text" @click="closeConfirmed" ><v-icon small>mdi-close</v-icon> Close</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>

</template>

<script>
export default {
  name: "CloseDialog",
  data() {
    return {
      dialogShow: false,
      myConfirmCloseOptions: {
        title: 'Konfirmasi Close',
        message1: 'Sudah ada Modifikasi, Lanjutkan Cancel?',
        message2: '',
        color: "orange-darken-2",
        width: 400,
        zIndex: 250,
        noconfirm: false,
      },
    }
  },

  props: [
  ],
  computed: {
  },
  methods: {
    closeConfirmed: function(){
      this.$emit('eventFromCloseConfirm', "OKE")
    },
    showDialog(message1, message2) {
      this.myConfirmCloseOptions.message1 = message1!==undefined?message1:''
      this.myConfirmCloseOptions.message2 = message2!==undefined?message2:''
      this.dialogShow = !this.dialogShow
    },
    setDialogState(value){
      console.log(value)
      this.dialogShow =false
    }


  }

}
</script>

<style scoped>

</style>