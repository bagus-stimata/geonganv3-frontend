<template>
  <Menubar></Menubar>
 <PublicBeritaDetail></PublicBeritaDetail>
  <AppFooter></AppFooter>
</template>

<script>
import PublicBeritaDetail from "@/components/public/berita/PublicBeritaDetail.vue";
import AppFooter from "@/components/AppFooter.vue";
import Menubar from "@/components/MenuBar.vue";
// import UnderConstruction from "@/components/utils/UnderConstruction.vue";

export default {
  name: "BeritaDetailView",
  components: {
    Menubar,
    // UnderConstruction,
    AppFooter,
    PublicBeritaDetail
  }
}
</script>

<style scoped>

</style>