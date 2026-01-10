<template>
  <div>
    <v-dialog
      v-model="dialogShow"
      :max-width="formDialogOptions.width"
      :style="{ zIndex: formDialogOptions.zIndex }"
      @keydown.esc.prevent="closeForm"
      persistent
      :fullscreen="$vuetify.display.smAndDown"
      :hide-overlay="$vuetify.display.smAndDown"
    >
      <v-card>
        <v-form v-model="valid" ref="form">
          <v-toolbar class="color-bg-second text-white" density="compact">
            <v-btn icon dark @click="closeForm">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title class="text-subtitle-2">USERS
              <span class="ml-2 mr-2 font-weight-medium text-grey"> | </span>
              <span v-if="formMode === 'EDIT_FORM'">EDIT </span>
              <span class="font-weight-light ml-1 mr-1">ITEM</span>
              <span v-if="formMode === 'NEW_FORM'"> BARU</span>
              <span class="ml-2 mr-2 font-weight-medium text-grey" v-show="isItemModified">|</span>
              <v-chip
                  class="ma-2"
                  color="warning"
                  variant="outlined"
                  size="x-small"
                  v-show="isItemModified"
              >
                <v-icon left> mdi-pencil </v-icon>
                modified
              </v-chip>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn
                  dark
                  variant="text"
                  @click="save"
                  :disabled="!valid || isItemModified === false"
                  class="hidden-md-and-up"
              >
                Simpan
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>


          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="itemModified.username"
                    :rules="rulesNotEmpty"
                    prepend-inner-icon="mdi-account"
                    label="User Name"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="8">
                  <v-text-field
                    prepend-inner-icon="mdi-email"
                    v-model="itemModified.email"
                    :rules="[validateNotEmpty, validateEmail]"
                    label="Email"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="8" md="8">
                  <v-text-field
                    v-model="itemModified.password"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show1 ? 'text' : 'password'"
                    label="Password"
                    hide-details
                    @click:append="show1 = !show1"
                    clearable
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="3" md="3">
                  <v-switch
                    v-model="itemModified.isAccountNonLocked"
                    :label="
                      itemModified.isAccountNonLocked ? 'Aktif' : 'Locked'
                    "
                    class="pa-3"
                    density="compact"
                    hide-details
                    color="primary"
                  ></v-switch>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" sm="6" md="5">
                  <v-text-field
                    prepend-inner-icon="mdi-phone"
                    v-model="itemModified.phone"
                    label="Phone"
                    prefix="+62 "
                    type="number"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="7">
                  <v-text-field
                    v-model="itemModified.fullName"
                    label="Nama Lengkap"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <v-autocomplete
                    v-model="itemModified.fdivisionBean"
                    :items="itemsFDivision"
                    :rules="rulesNotEmpty"
                    item-value="id"
                    item-title="description"
                    auto-select-first
                    density="compact"
                    chips
                    variant="outlined"
                    deletable-chips
                    color="blue-grey lighten-2"
                    label="Divisi (Pemilik Data)"
                    hint="Divisi (Pemilik Data)"
                    persistent-hint
                  ></v-autocomplete>
                </v-col>

                <v-col cols="12" sm="6" md="6">
                  <v-autocomplete
                    v-model="itemModified.organizationLevel"
                    :items="itemsOrganizationLevel"
                    item-value="id"
                    item-title="description"
                    auto-select-first
                    density="compact"
                    chips
                    variant="outlined"
                    deletable-chips
                    color="blue-grey lighten-2"
                    label="Level Organisasi"
                    hint="SYS=Holding, CORP=DINAS, DIV=Bidang"
                    persistent-hint
                  ></v-autocomplete>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-autocomplete
                    v-model="itemModified.roles"
                    :items="itemsRolesComputed"
                    item-value="id"
                    item-title="description"
                    auto-select-first
                    density="compact"
                    variant="outlined"
                    chips
                    deletable-chips
                    color="blue-grey lighten-2"
                    label="Roles"
                    hint="Bisa dipilih multi"
                    persistent-hint
                    multiple
                  ></v-autocomplete>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-chip
              class="ml-4"
              color="error"
              variant="outlined"
              close
              size="small"
              v-show="formDialogOptions.errorMessage"
            >
              {{ formDialogOptions.errorMessage }}
            </v-chip>
            <v-spacer></v-spacer>
            <v-btn
              color="red-darken-1"
              variant="outlined"
              @click="closeForm"
              class="hidden-sm-and-down"
            >
              Batal
            </v-btn>
            <v-btn
              color="blue-darken-1"
              variant="flat"
              @click="save"
              :disabled="!valid || isItemModified === false"
              class="hidden-sm-and-down"
            >
              Simpan
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>

      <CloseConfirmDialog
        ref="refCloseConfirmDialog"
        @eventFromCloseConfirm="passingEventFromCloseConfirm"
      ></CloseConfirmDialog>
    </v-dialog>
  </div>
</template>

<script>
import AuthService from "@/services/auth-service";
import UserService from "@/services/user-service";
import FileService from "@/services/apiservices/file-service";

import CloseConfirmDialog from "@/components/utils/CloseConfirmDialog";
import User from "@/models/user";
import FormMode from "@/models/form-mode";
import {ERoles} from "@/models/e-role";
// import ERole from "@/models/e-role";
import FDivision from "@/models/f-division";
import {EOrganizationLevels} from "@/models/e-organization-level";

export default {
  name: "UsersDialog",
  components: { CloseConfirmDialog },
  props: {
    formMode: String,
  },
  data() {
    return {
      show1: false,
      dialogShow: false,
      formDialogOptions: {
        title1: "",
        title2: "",
        message1: "",
        message2: "",
        errorMessage: "",
        color: "grey lighten-3",
        width: 800,
        zIndex: 200,
        noconfirm: false,
      },

      selectedItemIndex: -1,
      itemDefault: "",
      itemModified: new User(),
      validateNotEmpty: (value) => !!value || "Tidak Boleh Kosong",
      validateEmail: (value) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(value) || "Format Email Salah";
      },
      selectFDivision: { id: 0, kode1: "", description: "" },
      itemsFDivision: [new FDivision(0, "", "")],
      // ERole.ROLE_ADMIN,
      // itemsRoles: [ERole.ROLE_USER],
      // itemsOrganizationLevel:[
      //   'SYS',
      //   'CORP',
      //   'DIV'
      // ],
      itemsOrganizationLevel: EOrganizationLevels,
      valid: false,
      rulesLength: [
        (v) => !!v || " Tidak Boleh Kosong",
        (v) => v.length <= 255 || "Maksimal 255 Karakter",
        (v) => v.length > 3 || "Harus lebih besar dari 3 karakter",
      ],
      rulesNotEmpty: [(v) => !!v || "Tidak boleh kosong"],
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    itemsRolesComputed() {
      return ERoles.map((role) => role);
    },

    isItemModified() {
      const defaultItem = JSON.stringify(this.itemDefault);
      const modifiedItem = JSON.stringify(this.itemModified);

      return defaultItem !== modifiedItem;
    },

  },
  watch: {},
  methods: {
    showDialog(selectedIndex, item, itemsFDivision) {
      this.dialogShow = !this.dialogShow;
      if (selectedIndex > -1) {
        this.selectedIndex = selectedIndex;
        this.initializeEditMode(item);
      } else {
        this.itemDefault = new User(0, "", "", "");
        this.itemModified = new User(0, "", "", "");
        this.selectedIndex = -1;
      }
      this.itemsFDivision = itemsFDivision;
    },
    setDialogState(value) {
      this.dialogShow = value;
    },

    save() {
      if (this.isItemModified === false) {
        //Close aja
        this.dialogShow = false;
        this.$emit("eventFromFormDialog1", this.itemModified);
        return;
      }
      if (this.$refs.form.validate()) {
        if (this.formMode === FormMode.EDIT_FORM) {

          // console.log(JSON.stringify(this.itemModified));

          AuthService.updateUser(this.itemModified).then(
            () => {
              this.$emit("eventFromFormDialogEdit", this.itemModified);
            },
            (error) => {
              this.formDialogOptions.errorMessage = error.response.data;
            }
          );
        } else {
          AuthService.register(this.itemModified).then(
            (response) => {
              this.itemModified.password = "Welcome1";
              this.$emit("eventFromFormDialogNew", response.data);
            },
            (error) => {
              this.formDialogOptions.errorMessage = error.response.data.message;
            }
          );
        }
      }
    },
    closeForm() {
      if (!this.isItemModified) {
        this.dialogShow = false;
        this.$emit("eventFromFormDialog1", this.itemModified);
      } else {
        this.$refs.refCloseConfirmDialog.showDialog(
          " Sudah terdapat modifikasi data",
          "Tetap tutup dan reset perubahan?"
        );
      }
    },
    passingEventFromCloseConfirm(value) {
      if (value === "OKE") this.dialogShow = false;
    },
    initializeEditMode(item) {
      // this.itemDefault = item
      // this.itemModified = item

      this.formDialogOptions.errorMessage = "";
      const id = item.id;
      UserService.getUserById(id).then(
        (response) => {
          this.itemDefault = Object.assign({}, response.data);
          this.itemModified = response.data;
          /**
           * Harus di rubah jadi aarray dahulu
           */
          this.itemDefault.roles = this.rolesToArray(this.itemDefault.roles);
          this.itemModified.roles = this.rolesToArray(this.itemModified.roles);
        },
        (error) => {
          console.log(error);
        }
      );
    },

    rolesToArray(roles) {
      const arrRoles = [];
      roles.forEach((role) => {
        arrRoles.push(role.name);
      });
      return arrRoles;
    },

    lookupImageUrl(item) {
      if (item.avatarImage === undefined || item.avatarImage === "") {
        return require("@/assets/images/account_icon.png");
      } else {
        return FileService.image_url_medium(item.avatarImage);
      }
    },
    lookupImageUrlLazy() {
      return require("@/assets/images/account_icon.png");
    },
  },
};
</script>

<style scoped>
</style>