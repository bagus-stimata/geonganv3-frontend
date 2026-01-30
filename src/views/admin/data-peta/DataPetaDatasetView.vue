<template>
    <v-card elevation="0">
      <FtDatasetTable></FtDatasetTable>
    </v-card>
  </template>

  <script>

  import FtDatasetTable from "@/components/admin/data-peta/new-dataset/FtDatasetTable.vue"

  export default {
    name: "DataPetaDatasetView",
    components: {
      FtDatasetTable
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