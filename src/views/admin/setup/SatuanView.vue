<template>
    <v-card elevation="4" class="mt-4 ml-4 mr-4 pa-4">
      <SatuanTable></SatuanTable>
    </v-card>
  </template>
  
  <script>

  

  import SatuanTable from "@/components/admin/setup/satuan/FSatuanTable.vue";

  export default {
    name: "SatuanView",
    components: {
      SatuanTable
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