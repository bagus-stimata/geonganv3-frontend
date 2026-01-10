<template>
  <v-card class="elevation-0">
    <v-card-title>
      <v-row class="align-center">
        <v-col cols="12" sm="12" md="6">
          <v-icon class="mr-2">mdi-account-multiple</v-icon>
          <span class="font-weight-bold">{{ title }}</span>
        </v-col>
        <v-spacer></v-spacer>
        <v-col cols="12" sm="12" md="6">
          <v-text-field
              v-on:keyup.enter="searchOnEnter"
              v-on:blur="searchOnEnter"
              append-icon="mdi-magnify"
              hint="Username, Email, Full Name (press ENTER to search)"
              label="Search"
              variant="underlined"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card-title>
    <v-data-table-server
      v-model="selectedItems"
      :single-select="!multiSelect"
      :show-select="multiSelect"
      :headers="headers"
      :items="usersFiltered"
      v-model:page="currentPage"
      :items-per-page="pageSize"
      hide-default-footer
      class="elevation-0"
      :items-length="totalItems"
      @page-count="totalTablePages = totalPaginationPages"
    >
      <template v-slot:top>
        <v-row align="center" class="ml-4 mr-4">
          <v-switch
            v-model="multiSelect"
            :label="multiSelect ? 'Multi Select' : 'Single Select'"
            class="pa-3"
            color="primary"
            hide-details
          ></v-switch>
          <v-btn
            color="red-accent-4"
            size="x-small"
            v-if="multiSelect"
            class="mr-2"
            @click="deleteDialogMultiShow"
            icon="mdi-delete"
          ></v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="green"
            size="x-small"
            @click="showDialogNew"
            :disabled="multiSelect"
            icon="mdi-plus"
          ></v-btn>
        </v-row>
      </template>

      <template v-slot:[`item.username`]="{ item }">
        <div>
          {{ item.username }}
        </div>
      </template>

      <template v-slot:[`item.email`]="{ item }" v-if="false">
        <div>
          {{ item.email }}
        </div>
        <div v-if="item.remark1.includes('WhatsApp Verified')">
          <v-icon color="green" small>mdi-whatsapp</v-icon>+{{
            item.countryCode
          }}
          {{ item.phone }}
        </div>
        <div v-else>
          <v-icon x-small>mdi-whatsapp</v-icon>+{{ item.countryCode }}
          {{ item.phone }}
        </div>

        <div class="font-weight-thin caption">
          {{ item.remark1 }}
        </div>
      </template>

      <template v-slot:[`item.roles`]="{ item }" v-if="true">
        {{ rolesToArray(item.roles) }}
      </template>
      <template v-slot:[`item.fullName`]="{ item }">
        <tr>
          {{
            item.fullName
          }}
        </tr>
      </template>

      <template v-slot:[`item.fdivisionBean`]="{ item }">
        <tr>
          {{
            lookupFDivision(item.fdivisionBean)
          }}
        </tr>
        <tr>
          <v-chip
            :color="getColorOrganizationLevel(item.organizationLevel)"
            size="x-small"
            class="mr-1"
            variant="flat"
          >
            {{ item.organizationLevel }}
          </v-chip>
          <v-chip
            :color="getColorStatusActive(item.isAccountNonLocked)"
            size="x-small"
            variant="flat"
          >
            {{ item.isAccountNonLocked === true ? "Aktif" : "Locked" }}
          </v-chip>
        </tr>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-btn @click="showDialogEdit(item)" color="warning" size="small" variant="text" icon="mdi-pencil" :disabled="multiSelect"></v-btn>
        <v-btn @click="deleteDialogShow(item)" color="red accent-4" size="small" variant="text" icon="mdi-delete" :disabled="multiSelect"></v-btn>
      </template>
    </v-data-table-server>


    <v-container>
      <v-row justify="end" align="center">
        <v-col cols="4" md="2" sm="2">
          <v-select
            v-model="pageSize"
            :items="pageSizes"
            label="Items per page"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>
        <v-col cols="10" md="9" sm="8" class="align-start">
          <v-pagination
            v-model="currentPage"
            :length="totalPaginationPages"
            rounded="circle"
            total-visible="8"
            active-color="orange-darken-4"
            size="x-small"
            variant="flat"
          ></v-pagination>
        </v-col>
      </v-row>
    </v-container>

    <delete-dialog
      ref="refDeleteConfirmDialog"
      @eventFromDeleteConfirmDialog1="deleteItemConfirmedSingleSelect"
      @eventFromDeleteConfirmDialog2="deleteItemConfirmedMultiSelect"
    ></delete-dialog>

    <users-dialog
      :formMode="formMode"
      ref="refFormDialog"
      @eventFromFormDialogNew="saveDataNew"
      @eventFromFormDialogEdit="saveDataEdit"
    ></users-dialog>
  </v-card>
</template>

<script>
import UserService from "@/services/user-service";
import DeleteDialog from "@/components/utils/DeleteConfirmDialog";
import UsersDialog from "./UsersDialog";
import FormMode from "@/models/form-mode";
import User from "@/models/user";
import EOrganizationLevel from "@/models/e-organization-level";
import FDivisionService from "@/services/apiservices/f-division-service";

export default {
  components: { UsersDialog, DeleteDialog },
  data() {
    return {
      title: "USERS",
      multiSelect: false,
      selectedItems: [],

      currentPage: 1,
      totalTablePages: 1,
      totalPaginationPages: 1,
      pageSize: 10,
      pageSizes: [10, 25, 50, 150, 500],
      totalItems:0,
      search: "",
      headers: [
        {
          title: "User Name",
          align: "start",
          sortable: true,
          key: "username",
          width: "16%",
        },
        { title: "Email", key: "email", width: "16%" },
        { title: "roles", key: "roles", width: "20%" },
        { title: "Full Name", key: "fullName", width: "16%" },
        { title: "Divisi/Bidang", key: "fdivisionBean", width: "18%" },
        { title: "Actions", key: "actions", sortable: false, width: "15%", align: "center" },
      ],

      formMode: "",
      itemSelectedIndex: -1,
      itemSelected: "",
      users: [new User("username", "email", "")],
      itemsFDivision: [
        { id: 1, kode1: "", description: "" },
        { id: 2, kode1: "", description: "" },
      ],
    };
  },
  watch: {
    currentPage(newPage) {
      console.log(newPage)
      if (newPage) {
        this.fetchUsers();
      }
    },
    pageSize(newValue) {
      const refreshData = this.currentPage === 1;
      this.currentPage = 1;
      if (refreshData) {
        console.log("Change PageSize " + newValue);
        this.fetchUsers();
      }
    },
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },

    usersFiltered() {
      return this.users;
    },
  },
  methods: {
    searchOnEnter(event) {
      if (this.search !== event.target.value) {
        this.currentPage = 1;
        this.search = event.target.value;
        this.fetchUsers();
      }
    },
    fetchUsers() {
      UserService.getAllUserContaining(
        this.currentPage,
        this.pageSize,
        "id",
        "DESC",
        this.search
      ).then(
        (response) => {
          const { items, totalPages, totalItems } = response.data;
          this.users = items;

          this.totalPaginationPages = totalPages;
          this.totalItems = totalItems;
        },
        (error) => {
          if (error.response.statusCode === 401) {
            //
          }
        }
      );
    },
    fetchParent() {
      if (
        this.currentUser.organizationLevel === EOrganizationLevel.SYS ||
        this.currentUser.organizationLevel === EOrganizationLevel.CORP
      ) {
        FDivisionService.getAllFDivision().then(
          (response) => {
            this.itemsFDivision = response.data;
          },
          (error) => {
            console.log(error.response);
          }
        );
      } else {
        FDivisionService.getFDivisionById(this.currentUser.fdivisionBean).then(
          (response) => {
            this.itemsFDivision = [response.data];
          },
          (error) => {
            console.log(error.response);
          }
        );
      }
    },

    showDialogNew() {
      this.itemSelectedIndex = -1;
      const itemModified = Object.assign({}, "");
      // this.formDialogShow = true
      this.formMode = FormMode.NEW_FORM;
      this.$refs.refFormDialog.showDialog(
        this.itemSelectedIndex,
        itemModified,
        this.itemsFDivision,
      );
    },
    saveDataNew(itemFromRest) {
      this.itemSelected = itemFromRest;
      this.closeDialog();
      /**
       * Setiap data baru harus terlihat
       */
      // this.users.push(this.itemSelected)
      // this.users = [itemFromRest].concat(this.users)
      // this.users.unshift(itemFromRest)
      this.fetchUsers();
    },

    showDialogEdit(item) {
      this.itemSelectedIndex = this.usersFiltered.indexOf(item);
      const itemModified = Object.assign({}, item);
      // this.formDialogShow = true
      this.formMode = FormMode.EDIT_FORM;
      this.$refs.refFormDialog.showDialog(
        this.itemSelectedIndex,
        itemModified,
        this.itemsFDivision
      );
    },
    saveDataEdit(item) {
      this.itemSelected = item;

      Object.assign(this.users[this.itemSelectedIndex], this.itemSelected);
      this.closeDialog();
    },

    deleteDialogShow(item) {
      this.itemSelectedIndex = this.usersFiltered.indexOf(item);
      this.itemSelected = Object.assign({}, item);
      // this.myConfirmDelete = true
      this.$refs.refDeleteConfirmDialog.showDialog(
        this.itemSelectedIndex,
        item.username
      );
    },
    deleteDialogMultiShow() {
      if (this.multiSelect === true) {
        this.$refs.refDeleteConfirmDialog.showDialogMulti(
          this.selectedItems,
          `${this.selectedItems.length} items selected`
        );
      }
    },
    deleteItemConfirmedSingleSelect(index) {
      console.log("delete SingleItem: " + index);

      const deletedItem = this.users[this.itemSelectedIndex];
      UserService.deleteUser(deletedItem.id).then(
        () => {
          this.users.splice(this.itemSelectedIndex, 1);
          this.closeDialog();
        },
        (error) => {
          console.log(error);
          this.$refs.refDeleteConfirmDialog.setDialogState(false);
        }
      );
    },
    deleteItemConfirmedMultiSelect(items) {
      if (items.length > -1) {
        let itemIds = [];
        for (let i = 0; i < items.length; i++) {
          itemIds.push(items[i].id);
        }
        UserService.deleteAllUser(itemIds).then(
          (response) => {
            if (response.data) {
              for (let i = 0; i < items.length; i++) {
                const index = this.usersFiltered.indexOf(items[i]);
                this.users.splice(index, 1);
              }
              this.closeDialog();
            }
          },
          (error) => {
            console.log("error " + error);
          }
        );
      }
    },
    closeDialog() {
      // this.myConfirmDialog = false
      this.formMode = "";
      this.$refs.refDeleteConfirmDialog.setDialogState(false);
      this.$refs.refFormDialog.setDialogState(false);

      this.$nextTick(() => {
        this.itemSelected = Object.assign({}, new User());
        this.itemSelectedIndex = -1;
      });
    },
    getColorStatusActive(trueFalse) {
      if (trueFalse === true) return "green";
      else if (trueFalse === false) return "gray";
      else return "gray";
    },
    getColorOrganizationLevel(value) {
      if (value === "CORP") return "red";
      else return "gray";
    },
    lookupFDivision(fdivisionBean) {
      const str = this.itemsFDivision.filter((x) => x.id === fdivisionBean);
      if (str.length > 0) {
        return str[0].description;
      } else {
        return "-";
      }
    },
    rolesToArray(roles) {
      if (roles===undefined) {
        return roles;
      }

      const arrRoles = [];
      roles.forEach((role) => {
        if ((role.name !== undefined) && (role.name !== null)) {
          arrRoles.push(role.name);
        }
      });

      if (arrRoles.length > 0) {
        return arrRoles;
      } else {
        return roles;
      }

      // return roles
    },
  },
  mounted() {
    this.fetchUsers();
    this.fetchParent();
  },
};
</script>

<style scoped>
</style>