<template>
    <v-card class="mt-2 ml-2 mr-2" elevation="0">
      <FDayaDukungTypeTable></FDayaDukungTypeTable>
    </v-card>
  </template>
  
  <script>

  import FDayaDukungTypeTable from "@/components/admin/data-peta/daya-dukung-type/FDayaDukungTypeTable.vue";

  export default {
    name: "DayaDukungTypeView",
    components: {
      FDayaDukungTypeTable
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