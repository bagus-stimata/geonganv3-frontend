<template>
  <PublicHome></PublicHome>
  <AppFooter></AppFooter>
</template>

<script>
import { defineComponent } from 'vue';

// Components
import AppFooter from "@/components/AppFooter.vue";
import PublicHome from "@/components/public/beranda/PublicHome.vue";

export default defineComponent({
  name: 'HomeView',

  components: {
    AppFooter,
    PublicHome
  },
});
</script>
