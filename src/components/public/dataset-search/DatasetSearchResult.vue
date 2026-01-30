<template>
  <v-container>
    <v-row justify="end" no-gutters class="mt-2">
      <v-col cols="4" md="2" sm="2">
        <v-select
            v-model="pageSize"
            :items="pageSizes"
            label="Items per page"
            @change="updatePagination"
            variant="outlined"
            density="compact"
        ></v-select>
      </v-col>
    </v-row>

    <v-list class="mt-4" v-if="paginatedItems.length===0">
      <v-list-item>
          <v-list-item-title class="text-center text-orange">No data found</v-list-item-title>
      </v-list-item>
    </v-list>
    <v-list class="mt-4" v-else>
      <v-list-item
          v-for="(item, index) in paginatedItems"
          :key="index"
          class="my-2 list-item"
      >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
        <div class="text-green-darken-1 text-caption mt-n1">{{ lookupFDivision(item.fdivisionBean) }}</div>
        <v-list-item-subtitle class="text-grey-darken-2">{{ item.description }}</v-list-item-subtitle>
        <v-list-item-action class="align-center mt-4">
<!--          <v-btn color="primary" @click="previewData(item)" outlined x-small rounded>-->
          <v-btn class="me-2" color="primary" variant="outlined" size="x-small" rounded>
            Preview
            <v-icon small class="ml-1">mdi-magnify</v-icon>
          </v-btn>
          <div v-if="item.categ === 'Indikator' " class="text-orange-darken-1 text-caption mt-n">{{ item.categ }}</div>
          <div v-else class="text-blue-darken-1 text-caption mt-n4">{{ item.categ }}</div>
        </v-list-item-action>
      </v-list-item>
    </v-list>

    <v-row justify="end" no-gutters class="mt-2">
      <v-col cols="8" md="6" sm="6" class="d-flex">
        <v-spacer></v-spacer>
        <v-pagination
            v-model="currentPage"
            :length="totalPages"
            total-visible="8"
            rounded="circle"
            @input="updatePagination"
            active-color="orange-darken-4"
            size="x-small"
            variant="flat"
        ></v-pagination>
      </v-col>
    </v-row>
<!--    <DatasetContentDataDialog-->
<!--        ref="refFormDialog"-->
<!--    ></DatasetContentDataDialog>-->

<!--    <IndikatorResult-->
<!--      ref="refIndikatorResult"-->
<!--      :itemsFDivision="itemsFDivision"-->
<!--    ></IndikatorResult>-->
  </v-container>
</template>

<script>
import SearchPublicService from "@/services/apiservices/search-public-service";
// import DatasetContentDataDialog from "@/components/public-dataset-old-content/dataset-old-content-dialog/DatasetContentDataDialog.vue";
// import IndikatorResult from "@/components/public/indikator/IndikatorResult.vue";

export default {
  components: {
    // IndikatorResult,
    // DatasetContentDataDialog
  },
  data() {
    return {
      search: '',

      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 10,
      pageSizes: [10, 25, 50, 150, 500],
      items:[],
      itemsFDivision: [],

    };
  },
  computed: {
    filteredItems() {
      return this.items.filter(item => item.title.toLowerCase().includes(this.search.toLowerCase()));
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredItems.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredItems.length / this.pageSize);
    }
  },
  methods: {
    updatePagination() {
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
    },
    previewData(item) {

      if(item.categ === 'Dataset'){
        this.$refs.refFormDialog.showDialog(item.id)
      }else {
        this.$refs.refIndikatorResult.showDialog(item)
      }
      // console.log('Previewing data for:', item.title);
    },

    fetchData(search) {
      if (search !== undefined) {
        this.search = search
      }
      SearchPublicService.getSearchDatasetResult(
          "id",
          "DESC",
          this.search
      ).then(
          (response) => {
            const { items, itemsFDivision } = response.data;
            this.items = items;
            this.itemsFDivision = itemsFDivision;
            // console.log(JSON.stringify(this.items))
          },
          (error) => {
            console.log(error.response);
          }
      );
    },
    fetchParent() {
    },
    lookupFDivision(fdivisionBean) {
      if (this.itemsFDivision.length === 0) {
        return "-";
      }
      const str = this.itemsFDivision.filter((x) => x.id === fdivisionBean);
      if (str.length > 0) {
        return str[0].description;
      } else {
        return "-";
      }
    },

  },
  mounted() {
  }


};
</script>

<style scoped>
.v-container {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
}
.v-text-field {
  margin-bottom: 20px;
}
.v-btn {
  margin-bottom: 20px;
}
.v-list-item {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}
.v-list-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

</style>