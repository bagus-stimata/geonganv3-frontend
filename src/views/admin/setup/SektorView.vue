<template>
    <v-card elevation="4" class="mt-4 ml-4 mr-4 pa-4">
      <SektorTable></SektorTable>
    </v-card>
  </template>
  
  <script>

  

  import SektorTable from "@/components/admin/setup/sektor/FSektorTable.vue";

  export default {
    name: "SektorView",
    components: {
      SektorTable
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