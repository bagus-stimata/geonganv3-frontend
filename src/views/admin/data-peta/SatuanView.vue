<template>
    <v-card class="mt-2 ml-2 mr-2" elevation="0">
      <FSatuanTable></FSatuanTable>
    </v-card>
  </template>
  
  <script>

  import FSatuanTable from "@/components/admin/setup/satuan/FSatuanTable.vue";

  export default {
    name: "SatuanView",
    components: {
      FSatuanTable
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