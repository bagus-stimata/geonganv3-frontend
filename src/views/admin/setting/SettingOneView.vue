<template>
    <v-card elevation="4" class="mt-4 ml-4 mr-4 pa-4">
      <SettingOne></SettingOne>
    </v-card>
  </template>
  
  <script>
  import SettingOne from "@/components/admin/setting/sysvar/SettingOne.vue";

  export default {
    name: "SettingOneView",
    components: {
      SettingOne
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