<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12" sm="12" md="8" class="px-2">
          <PublicBeritaTable></PublicBeritaTable>
        </v-col>
        <v-col cols="12" sm="12" md="4" class="px-2">
          <PublicAgendaTable></PublicAgendaTable>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
  
  <script>
import PublicAgendaTable from "@/components/public/berita/PublicAgendaCard";
import PublicBeritaTable from "@/components/public/berita/PublicBeritaCard";
export default {
  components: { PublicBeritaTable, PublicAgendaTable },
  data() {
    return {};
  },
  mounted() {
  }
};
</script>
  
  <style scoped>

</style>
  