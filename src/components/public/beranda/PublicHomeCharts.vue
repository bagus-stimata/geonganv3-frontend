<template>
<div>
  <v-layout wrap class="justify-center">
    <v-card v-for="(item, index) in itemsData" :key="index" elevation="4" class="ma-2">
      <v-card-title class="mx-4 justify-center mb-2 text-blue-accent-3">
        {{item.description}}
      </v-card-title>
      <v-card-text>
        <IndikatorResultChart
            :dialogWidth="550"
            :series1="item.series"
            :labels1="item.labels"
            :itemModified="itemModified"
            :chartType="item.description.includes('Indek') || item.description.includes('Index') ?'line':'bar'"
        >
        </IndikatorResultChart>

      </v-card-text>
    </v-card>
  </v-layout>
</div>
</template>

<script>

import IndikatorResultChart from "@/components/public/indikator/IndikatorResultChart.vue";
import FtDataFilter from "@/models/payload/ft-data-filter";
import FIndikatorService from "@/services/apiservices/f-indikator-service";

export default {
  name: "PublicHomeCharts",
  components: {
    IndikatorResultChart
  },
  data() {
    return {
      itemsData: [],
      itemModified: undefined,
      search: "",
      filterYears: [2020, 2021, 2022, 2023, 2024],
      statusDataIds: [1],
      currentPage: 1,
      pageSize: 10,
      totalPaginationPages: 0,
    };
  },
  methods: {
    runExtendedFilter() {
      const extendedFilter = new FtDataFilter();
      extendedFilter.years = this.filterYears;

      extendedFilter.statusDataIds = this.statusDataIds;
      extendedFilter.pageNo = this.currentPage;
      extendedFilter.pageSize = this.pageSize;
      extendedFilter.sortBy = "id";
      extendedFilter.order = "DESC";
      extendedFilter.search = this.search;

      extendedFilter.showHome = true

      FIndikatorService.getPostAllFIndikatorContainingYearsShowHomePublic(
          extendedFilter
      ).then(
          (response) => {
            const { items, totalPages } = response.data;

            this.itemsData = items.map((item) => {
              let newItem = { ...item };
              newItem.description = item.description;
              newItem.fdivisionBean = item.fdivisionBean;

              let labels = [];
              let series = [];

              const findikatorDataByYear = {};
              item.listFindikatorData.sort((a, b) => a.tahun-b.tahun?1:0) .forEach(data => {
                findikatorDataByYear[data.tahun] = data;
                labels.push(data.tahun);
                series.push(data.nilai);
              });

              newItem.labels = labels
              newItem.series = series

              newItem._2020 = findikatorDataByYear[2020] || 0;
              newItem._2021 = findikatorDataByYear[2021] || 0;
              newItem._2022 = findikatorDataByYear[2022] || 0;
              newItem._2023 = findikatorDataByYear[2023] || 0;
              newItem._2024 = findikatorDataByYear[2024] || 0;

              return newItem;
            });

            this.totalPaginationPages = totalPages;
          },
          (error) => {
            console.log(error.response);
          }
      )


    },
  },
  mounted() {
    this.runExtendedFilter();
  }

}

</script>

<style scoped>

</style>