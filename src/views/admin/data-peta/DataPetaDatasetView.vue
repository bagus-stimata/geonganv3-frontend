<template>
    <v-card elevation="0">
      <FDayaDukungPetaTable></FDayaDukungPetaTable>
    </v-card>
  </template>

  <script>

  import FDayaDukungPetaTable from "@/components/admin/data-peta/dataset/FtDatasetTable.vue"

  export default {
    name: "DataPetaDatasetView",
    components: {
      FDayaDukungPetaTable
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