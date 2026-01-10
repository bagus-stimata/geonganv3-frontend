<template>
    <v-card elevation="4" class="mt-4 ml-4 mr-4 pa-4">
      <FBeritaAgenda></FBeritaAgenda>
    </v-card>
  </template>
  
  <script>

  

  import FBeritaAgenda from "@/components/admin/berita/FBeritaAgendaTable.vue";

  export default {
    name: "BeritaAgendaView",
    components: {
      FBeritaAgenda
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