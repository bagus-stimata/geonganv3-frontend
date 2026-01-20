<template>
    <v-card elevation="4" class="mt-4 ml-4 mr-4 pa-4">
      <FGeoDownload></FGeoDownload>
    </v-card>
  </template>
  
  <script>

  

  import FGeoDownload from "@/components/admin/dataset-downloaded/FGeoDownloadTable.vue";

  export default {
    name: "GeoDownloadView",
    components: {
      FGeoDownload
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