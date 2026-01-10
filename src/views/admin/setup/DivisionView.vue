<template>
  <v-card elevation="4" class="mt-4 ml-4 mr-4 pa-4">
      <v-tabs
          v-model="tab"
          color="primary"
          direction="horizontal"
      >
        <v-tab class="font-weight-medium" prepend-icon="mdi-account-network" @click="tabDivisionClick" value="option-2">Produsen Data</v-tab>
      </v-tabs>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="option-2">
          <v-card flat>
            <v-card-text>
              <FDivisionTable ref="refDivisionTable"/>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>
      </v-tabs-window>
  </v-card>
</template>
  
<script>

import FDivisionTable from "@/components/admin/setting/division/FDivisionTable.vue";

export default {
  name: "DivisionView",
  components: {
    FDivisionTable,
  },
  data() {
    return {
      tab:"option-2",
    }
  },
  computed: {
  },
  methods: {
    tabDivisionClick(){
      try {
        this.$refs.refDivisionTable.fetchFDivision()
        this.$refs.refDivisionTable.fetchParent()
      }catch (e) {
        e.toString()
      }
    },
  },
}
</script>

<style scoped>
</style>