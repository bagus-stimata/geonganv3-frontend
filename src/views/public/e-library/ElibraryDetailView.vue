<template>
  <Menubar></Menubar>
 <ELibraryDetail></ELibraryDetail>
  <AppFooter></AppFooter>
</template>

<script>
import ELibraryDetail from "@/components/public/e-library/ELibraryDetail.vue";
import AppFooter from "@/components/AppFooter.vue";
import Menubar from "@/components/MenuBar.vue";
// import UnderConstruction from "@/components/utils/UnderConstruction.vue";

export default {
  name: "ELibraryDetailView",
  components: {
    Menubar,
    // UnderConstruction,
    AppFooter,
    ELibraryDetail
  }
}
</script>

<style scoped>

</style>