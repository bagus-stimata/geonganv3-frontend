<template>
  <v-card elevation="4" class="mt-4 ml-4 mr-4 pa-4">
      <v-tabs
          v-model="tab"
          color="primary"
          direction="horizontal"
      >
        <v-tab class="font-weight-medium" prepend-icon="mdi-file-tree" @click="tabCompanyClick" value="option-1">Company/CORP</v-tab>
      </v-tabs>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="option-1">
          <v-card flat>
            <v-card-text>
              <FCompanyTable ref="refCompanyTable"/>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>
      </v-tabs-window>
  </v-card>
</template>
  
<script>


import FCompanyTable from "@/components/admin/setting/company/FCompanyTable.vue";

export default {
  name: "StrukturSistemView",
  components: {
    FCompanyTable,
  },
  data() {
    return {
      tab:"option-1",
    }
  },
  computed: {
  },
  methods: {
    tabCompanyClick(){
      try {
        this.$refs.refCompanyTable.fetchFCompany()
      }catch (e) {
        e.toString()
      }
    },
  },
}
</script>

<style scoped>
</style>