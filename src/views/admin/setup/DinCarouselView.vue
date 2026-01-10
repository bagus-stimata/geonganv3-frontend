<template>
    <v-card elevation="4" class="mt-4 ml-4 mr-4 pa-4">
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