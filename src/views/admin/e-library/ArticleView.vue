<template>
    <v-card elevation="4" class="mt-4 ml-4 mr-4 pa-4">
      <FArticle></FArticle>
    </v-card>
  </template>
  
  <script>

  

  import FArticle from "@/components/admin/e-library/article/FArticleTable.vue";

  export default {
    name: "ArticleView",
    components: {
      FArticle
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