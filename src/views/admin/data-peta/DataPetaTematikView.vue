<template>
    <v-card elevation="0">
      <FtTematikDatasetTable></FtTematikDatasetTable>
    </v-card>
  </template>

  <script>

  import FtTematikDatasetTable from "@/components/admin/data-peta/peta-tematik/FtTematikDatasetTable.vue"

  export default {
    name: "DataPetaDatasetView",
    components: {
      FtTematikDatasetTable
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