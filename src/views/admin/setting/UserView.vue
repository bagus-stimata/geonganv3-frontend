<template>
  <v-card elevation="4" class="mt-4 ml-4 mr-4 pa-4">
      <v-tabs
          v-model="tab"
          color="primary"
          direction="horizontal"
      >
        <v-tab class="font-weight-medium" prepend-icon="mdi-account" @click="tabUsersClick" value="option-1">Users</v-tab>
        <v-tab class="font-weight-medium" prepend-icon="mdi-cog" value="option-2" disabled>Option</v-tab>
      </v-tabs>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="option-1">
          <v-card flat>
            <v-card-text>
              <UserTable ref="refUsersTable"/>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>
        <v-tabs-window-item value="option-2">
          <v-card flat>
            <v-card-text>
              <p>
                Application Setting
              </p>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>
      </v-tabs-window>
  </v-card>
</template>
  
<script>

import UserTable from "@/components/admin/setting/pengguna/UsersTable.vue";

export default {
  name: "UserTableView",
  components: {
    UserTable
  },
  data() {
    return {
      tab:"option-1",
    }
  },
  computed: {
  },
  methods: {
    tabUsersClick(){
      try {
        this.$refs.refUsersTable.fetchParent()
      }catch (e) {
        e.toString()
      }
    },
  },
}
</script>

<style scoped>
</style>