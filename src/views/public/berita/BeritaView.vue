<template>
  <Menubar></Menubar>
 <BeritaMain></BeritaMain>
  <AppFooter></AppFooter>
</template>

<script>
import BeritaMain from "@/components/public/berita/BeritaMain.vue";
import AppFooter from "@/components/AppFooter.vue";
import Menubar from "@/components/MenuBar.vue";
// import UnderConstruction from "@/components/utils/UnderConstruction.vue";

export default {
  name: "BeritaMainView",
  components: {
    Menubar,
    // UnderConstruction,
    AppFooter,
    BeritaMain
  }
}
</script>

<style scoped>

</style>