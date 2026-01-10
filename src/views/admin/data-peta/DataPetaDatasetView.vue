<template>
    <v-card class="mt-2 ml-2 mr-2" elevation="0">
      <FDayaDukungPetaTable></FDayaDukungPetaTable>
    </v-card>
  </template>
  
  <script>

  import FDayaDukungPetaTable from "@/components/admin/data-peta/daya-dukung-peta/FDayaDukungPetaTable.vue"

  export default {
    name: "DayaDukungView",
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