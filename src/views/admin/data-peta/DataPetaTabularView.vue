<template>
    <v-card class="mt-2 ml-2 mr-2" elevation="0">
      <PetaTabularTable></PetaTabularTable>
    </v-card>
  </template>
  
  <script>


  import PetaTabularTable from "@/components/admin/data-peta/data-peta-tabular/PetaTabularTable.vue";

  export default {
    name: "PetaTabularView",
    components: {
      PetaTabularTable
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