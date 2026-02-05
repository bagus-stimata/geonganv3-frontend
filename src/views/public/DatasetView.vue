<template>
  <MenuBar></MenuBar>
  <DatasetMain></DatasetMain>
  <AppFooter/>
</template>

<script>
import AppFooter from "@/components/AppFooter";
import DatasetMain from "@/components/public/dataset/DatasetMain.vue";
import MenuBar from "@/components/MenuBar.vue";

export default {
  components: {
    MenuBar,
    DatasetMain,
    AppFooter
  },
  data () {
    return {
    }
  },


}
</script>

<style>
</style>
