<template>
  <Menubar></Menubar>
 <ElibraryMain></ElibraryMain>
  <AppFooter></AppFooter>
</template>

<script>
import ElibraryMain from "@/components/public/e-library/ElibraryMain.vue";
import AppFooter from "@/components/AppFooter.vue";
import Menubar from "@/components/MenuBar.vue";
// import UnderConstruction from "@/components/utils/UnderConstruction.vue";

export default {
  name: "ElibraryMainView",
  components: {
    Menubar,
    // UnderConstruction,
    AppFooter,
    ElibraryMain
  }
}
</script>

<style scoped>

</style>