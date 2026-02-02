<template>
  <v-dialog
      v-model="dialogShow"
      :max-width="myConfirmDeleteOptions.width"
      :style="{ zIndex: myConfirmDeleteOptions.zIndex }"
      @keydown.esc="dialogShow=false"
  >
    <v-card>
      <v-toolbar :color="myConfirmDeleteOptions.color" density="compact" flat>
        <v-toolbar-title class="text-body-2 font-weight-bold">
          {{ myConfirmDeleteOptions.title }}
        </v-toolbar-title>
      </v-toolbar>

      <v-card-title class="text-h6">{{myConfirmDeleteOptions.message1}}</v-card-title>
      <v-card-subtitle class="text--darken-1 subtitle-2">{{myConfirmDeleteOptions.message2}}</v-card-subtitle>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="gray-darken-1" outlined variant="text" @click="dialogShow=false">Cancel</v-btn>
        <v-btn color="red-darken-1" outlined variant="text" @click="okeConfirmed" ><v-icon small>mdi-save</v-icon>OK</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>

</template>

<script>
export default {
  name: "DeleteConfirmDialog",
  data() {
    return {
      selectedItems:[],
      selectedIndex: -1,
      dialogShow: false,
      myConfirmDeleteOptions: {
        title: 'Konfirmasi Hapus',
        message1: 'Yakin akan menghapus data?',
        message2: '',
        color: "red-accent-4",
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
    okeConfirmed: function(){
      if (this.selectedIndex>0) {
        this.$emit('eventFromDeleteConfirmDialog1', this.selectedIndex)
      }else {
        this.$emit('eventFromDeleteConfirmDialog2', this.selectedItems)
      }
    },
    showDialog(selectedIndex, message) {
      if (selectedIndex >-1) {
        this.myConfirmDeleteOptions.message2 = message
        this.selectedIndex = selectedIndex
        this.selectedItems =[]
        this.dialogShow = !this.dialogShow
      }
    },
    showDialogMulti(items, message) {
      if (items.length >-1) {
        this.selectedItems = items
        this.myConfirmDeleteOptions.message2 = message
        this.selectedIndex = -1
        this.dialogShow = !this.dialogShow
      }
    },

    setDialogState(value){
      this.dialogShow =value
    }

  }

}
</script>

<style scoped>

</style>