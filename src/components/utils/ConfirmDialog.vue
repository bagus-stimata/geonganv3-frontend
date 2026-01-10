<template>
  <v-dialog
    v-model="dialogShow"
    :max-width="myConfirmOptions.width"
    :style="{ zIndex: myConfirmOptions.zIndex }"
    @keydown.esc="dialogShow = false"
  >
    <v-card>
      <v-toolbar :color="myConfirmOptions.color" density="compact" flat>
        <v-toolbar-title class="text-body-2 font-weight-bold">
          {{ myConfirmOptions.title }}
        </v-toolbar-title>
      </v-toolbar>

      <v-card-title class="text-h6">{{
        myConfirmOptions.message1
      }}</v-card-title>
      <v-card-subtitle class="text-subtitle-2 text-grey-darken-1r mt-2">{{
        myConfirmOptions.message2
      }}</v-card-subtitle>

      <v-card-actions class="mt-2">
        <v-spacer></v-spacer>
        <v-btn color="red-darken-1" variant="outlined" @click="cancelConfirmed"
          >Cancel</v-btn
        >
        <v-btn color="blue-darken-1" variant="outlined" @click="okeConfirmed"
          ><v-icon small>mdi-check</v-icon> OK</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ConfirmDialog",
  data() {
    return {
      selectedItems: [],
      selectedIndex: -1,
      dialogShow: false,
      itemModified: {},
      myConfirmOptions: {
        title: "Konfirmasi",
        message1: "Yakin?",
        message2: "",
        color: "blue-darken-2",
        width: 400,
        zIndex: 250,
      },
    };
  },

  props: [],
  computed: {},
  methods: {
    okeConfirmed: function () {
      this.$emit("eventFromOkeConfirmDialog", this.itemModified);
      this.dialogShow = false;
    },
    cancelConfirmed: function () {
      this.$emit("eventFromCancelConfirmDialog", "cancel");
      this.dialogShow = false;
    },
    showDialog(message1, message2, item) {
      this.myConfirmOptions.message1 = message1;
      this.myConfirmOptions.message2 = message2;
      this.itemModified = item
      this.dialogShow = !this.dialogShow;
    },

    setDialogState(value) {
      this.dialogShow = value;
    },
  },
};
</script>

<style scoped>
</style>