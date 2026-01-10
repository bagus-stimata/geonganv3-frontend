<template>
  <v-card class="mt-2 ml-1 mr-1" elevation="0">
    <MainDashboard></MainDashboard>
  </v-card>
</template>
x
<script>



import MainDashboard from "@/components/admin/dashboard/MainDashboard.vue";

export default {
  name: "DashboardView",
  components: {
    MainDashboard

  },
  data() {
    return {}
  },
  computed: {},
  methods: {},


}
</script>

<style scoped>
</style>