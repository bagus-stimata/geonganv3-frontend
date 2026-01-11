<template>
  <MenuBar></MenuBar>
  <PublicHome></PublicHome>
  <AppFooter></AppFooter>
</template>

<script>
import { defineComponent } from 'vue';

// Components
import AppFooter from "@/components/AppFooter.vue";
import PublicHome from "@/components/public/beranda/PublicHome.vue";
import MenuBar from "@/components/MenuBar.vue";

export default defineComponent({
  name: 'HomeView',

  components: {
    MenuBar,
    AppFooter,
    PublicHome
  },
});
</script>
