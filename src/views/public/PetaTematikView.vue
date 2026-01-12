<template>
  <MenuBar></MenuBar>
  <PetaTematikMain></PetaTematikMain>
  <AppFooter/>
</template>

<script>
import AppFooter from "@/components/AppFooter";
import PetaTematikMain from "@/components/public/peta-tematik/PetaTematikMain.vue";
import MenuBar from "@/components/MenuBar.vue";

export default {
  components: {
    MenuBar,
    PetaTematikMain,
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
