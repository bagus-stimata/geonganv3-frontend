<template>
    <v-card elevation="4" class="mt-4 ml-4 mr-4 pa-4">
      <FArticleCateg></FArticleCateg>
    </v-card>
  </template>
  
  <script>

  

  import FArticleCateg from "@/components/admin/e-library/article-categ/FArticleCategTable.vue";

  export default {
    name: "ArticleCategView",
    components: {
      FArticleCateg
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