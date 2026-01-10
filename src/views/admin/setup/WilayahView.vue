<template>
  <v-card elevation="4" class="mt-4 ml-4 mr-4 pa-4">
    <v-card-title>
      <v-row class="align-center">
        <div class="font-weight-bold mb-4 text-grey">
          <v-icon class="mr-2">
            mdi-map
        </v-icon>WILAYAH</div>
        <v-spacer></v-spacer>
      </v-row>
    </v-card-title>
      <v-tabs
          v-model="tab"
          color="primary"
          direction="horizontal"
      >
        <v-tab class="font-weight-medium" @click="tabRegionClick" value="option-1">Kabupaten</v-tab>
        <v-tab class="font-weight-medium" @click="tabAreaClick" value="option-2">Kecamatan</v-tab>
        <v-tab class="font-weight-medium" @click="tabSubAreaClick" value="option-3">Desa/Kelurahan</v-tab>
      </v-tabs>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="option-1">
          <v-card flat>
            <v-card-text>
              <FRegionTable ref="refRegionTable"/>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>
        <v-tabs-window-item value="option-2">
          <v-card flat>
            <v-card-text>
              <FAreaTable ref="refAreaTable"/>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>
        <v-tabs-window-item value="option-3">
          <v-card flat>
            <v-card-text>
              <FSubAreaTable ref="refSubAreaTable"/>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>
      </v-tabs-window>
  </v-card>
</template>
  
<script>


import FRegionTable from "@/components/admin/setup/wilayah/region/FRegionTable.vue";
import FSubAreaTable from "@/components/admin/setup/wilayah/sub-area/FSubAreaTable.vue";
import FAreaTable from "@/components/admin/setup/wilayah/area/FAreaTable.vue";

export default {
  name: "WilayahView",
  components: {
    FRegionTable,
    FAreaTable,
    FSubAreaTable
  },
  data() {
    return {
      tab:"option-1",
    }
  },
  computed: {
  },
  methods: {
    tabRegionClick(){
      try {
        this.$refs.refRegionTable.fetchFRegion()
      }catch (e) {
        e.toString()
      }
    },
    tabAreaClick(){
      try {
        this.$refs.refAreaTable.fetchFArea()
      }catch (e) {
        e.toString()
      }
    },
    tabSubAreaClick(){
      try {
        this.$refs.refSubAreaTable.fetchFSubArea()
      }catch (e) {
        e.toString()
      }
    },
  },
}
</script>

<style scoped>
</style>