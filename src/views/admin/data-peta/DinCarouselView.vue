<template>
    <v-card class="mt-2 ml-2 mr-2 pa-4" elevation="1">
      <FDinCarouselTable></FDinCarouselTable>
    </v-card>
  </template>
  
  <script>

  

  import FDinCarouselTable from "@/components/admin/setup/gambar-slide/FDinCarouselTable.vue";

  export default {
    name: "DinCarouselView",
    components: {
      FDinCarouselTable
    },
    data() {
      return {
      }
    },
    computed: {
    },
    methods: {
    },
  
  
  }
  </script>
  
  <style scoped>
  </style>