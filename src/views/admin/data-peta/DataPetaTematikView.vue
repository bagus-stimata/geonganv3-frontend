<template>
    <v-card elevation="0">
      <FtTematikTable></FtTematikTable>
    </v-card>
  </template>

  <script>

  import FtTematikTable from "@/components/admin/data-peta/peta-tematik/FtTematikTable.vue"

  export default {
    name: "DataPetaDatasetView",
    components: {
      FtTematikTable: FtTematikTable
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