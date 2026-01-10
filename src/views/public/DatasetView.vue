<template>
  <div>
    <DatasetMain></DatasetMain>
    <AppFooter/>
  </div>
</template>

<script>
import AppFooter from "@/components/AppFooter";
import DatasetMain from "@/components/public/dataset-search/DatasetMain.vue";

export default {
  components: {
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
