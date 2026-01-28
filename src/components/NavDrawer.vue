<template>
  <!-- z-index harus diatas Sticky Object yaitu 9 dan dibawah Dialog yaitu 200 -->
  <nav style="z-index: 20;">
    <v-toolbar :flat="currentUser === null" elevation="0">
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        class="text-grey-darken-2"
        v-if="currentUser"
      ></v-app-bar-nav-icon>
      <v-toolbar-title class="text-uppercase color-text-second d-flex justify-end mr-6">
        <div class="d-flex align-center">
          <div class="ml-2 font-weight-bold">DISKOMINFO<span class="font-weight-thin">NGANJUK</span></div>
          <v-img width="30" class="ml-2" :src="require('@/assets/logo.webp')"></v-img>
        </div>
      </v-toolbar-title>
    </v-toolbar>

    <v-navigation-drawer
      app
      class="nav-color-second"
      v-model="drawer"
      v-if="showNavbar"
    >
      <v-list nav>
        <v-list-item v-if="currentUser" class="mt-4" value="admin-profile" @click="$router.push('/change-profile')">
          <div class="d-flex flex-row">
            <v-avatar>
              <v-img
                  :lazy-src="lookupImageUrlLazy(currentUser)"
                  :src="lookupImageUrl(currentUser)"
              ></v-img>
            </v-avatar>
            <div class="ml-2 d-flex flex-column">
              <div class="text-subtitle-2 text-white font-weight-bold">{{ currentUser.username }} </div>
              <div class="text-caption text-white font-weight-light">{{ currentUser.email }} </div>
            </div>
          </div>
        </v-list-item>
        <v-divider class="mt-4 text-white"></v-divider>

        <v-list-item class="text-white text-body-2 font-weight-medium" to="/dashboard" link prepend-icon="mdi-monitor" value="dashboard">Dashboard</v-list-item>
        <v-list-item class="text-white text-body-2 font-weight-medium" to="/admin-peta" link prepend-icon="mdi-map" value="peta">PETA</v-list-item>

        <v-list-group
            :value="nav_drawer.title"
            v-for="nav_drawer in nav_drawers.filter((x) => x.visible)"
            :key="nav_drawer.title">
              <template v-slot:activator="{ props }">
                <v-list-item
                    class="text-body-2 text-white font-weight-medium"
                    :prepend-icon="nav_drawer.icon"
                    v-bind="props"
                >{{nav_drawer.title}}</v-list-item>
              </template>
              <v-list-item
                v-for="submenu in nav_drawer.items.filter((x) => x.visible)"
                :key="submenu.title"
                link
                :to="submenu.route"
                class="text-white text-caption"
              >{{submenu.title}}</v-list-item>
        </v-list-group>

        <v-list-group
            :value="nav_drawer.title"
            v-for="nav_drawer in nav_drawers_setup.filter((x) => x.visible)"
            :key="nav_drawer.title">
          <template v-slot:activator="{ props }">
            <v-list-item
                :prepend-icon="nav_drawer.icon"
                v-bind="props"
                class="text-body-2 text-white font-weight-medium"
            >{{nav_drawer.title}}</v-list-item>
          </template>
          <v-list-item
              v-for="submenu in nav_drawer.items.filter((x) => x.visible)"
              :key="submenu.title"
              link
              :to="submenu.route"
              class="text-white text-caption"
          >{{submenu.title}}</v-list-item>
        </v-list-group>

        <v-divider class="text-white"></v-divider>
        <v-list-item class="text-white font-weight-medium" prepend-icon="mdi-power" title="Keluar" value="keluar" @click="logOut"></v-list-item>
      </v-list>

      <div class="my-16">
      </div>

    </v-navigation-drawer>
  </nav>
</template>

<script>
import ERole from "../models/e-role";
import FileService from "../services/apiservices/file-service";
import TestService from "../services/test-service";
import EOrganizationLevel from "@/models/e-organization-level";

export default {
  components: {},
  data() {
    return {
      top_menus: [
        {
          icon: "mdi-pencil",
          title: "Ubah Profile",
          route: "/change-profile",
          action: "",
          visible: true,
          iconColor: "orange",
        },
        {
          icon: "mdi-power",
          title: "Keluar",
          route: "#",
          action: "logOut",
          visible: true,
          iconColor: "red",
        },
      ],
      drawer: true,
    };
  },
  watch: {},
  computed: {
    isMobileDevice() {
      return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i
          .test(navigator.userAgent);
    },
    currentUser() {
      // console.log( `Isinya ${this.$store.state.auth.user}` )
      return this.$store.state.auth.user;
    },
    showNavbar() {
      if (this.currentUser && this.currentUser.roles) {
        return this.currentUser.roles;
      }
      return false;
    },
    loggedIn() {
      return this.$store.state.auth.status.loggedIn;
    },
    nav_drawers() {
      return [
        {
          title: "Berita",
          icon: "mdi-newspaper-variant",
          active: false,
          visible: [
            ERole.ROLE_ADMIN
          ].some((x) => this.currentUser.roles.includes(x)) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV,
          items: [
            {
              title: "Berita",
              route: "/admin-berita-agenda",
              icon: "",
              visible: [ERole.ROLE_ADMIN].some((x) =>
                  this.currentUser.roles.includes(x)
              ) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV,
            },
          ],
        },
        {
          title: "Arsip (Dokumen)",
          icon: "mdi-archive",
          active: false,
          visible: [ERole.ROLE_ADMIN].some((x) =>this.currentUser.roles.includes(x)),
          items: [
            {
              title: "Arsip Internal",
              route: "/admin-arsip",
              icon: "",
              visible: [ERole.ROLE_ADMIN].some((x) =>
                  this.currentUser.roles.includes(x)
              ),
            },
            {
              title: "Kategori Arsip",
              route: "/admin-arsip-categ",
              icon: "",
              visible: [ERole.ROLE_ADMIN].some((x) =>
                  this.currentUser.roles.includes(x)
              ) ,
            },

          ],
        },
        {
          title: "Data Peta",
          icon: "mdi-map-marker",
          active: false,
          visible: [ERole.ROLE_ADMIN].some((x) => this.currentUser.roles.includes(x)),
          items: [
            // {
            //   title: "Jenis",
            //   route: "/admin-dayadukung-type",
            //   icon: "",
            //   visible: [ERole.ROLE_ADMIN].some((x) =>
            //       this.currentUser.roles.includes(x)
            //   ) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV,
            // },

            // {
            //   title: "Data GeoJSON",
            //   route: "/data-peta-peta",
            //   icon: "",
            //   visible: [ERole.ROLE_ADMIN].some((x) =>
            //       this.currentUser.roles.includes(x)
            //   ) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV,
            // },
            // {
            //   title: "Data Tabular",
            //   route: "/admin-data-peta-tabular",
            //   icon: "",
            //   visible: [ERole.ROLE_ADMIN].some((x) =>
            //       this.currentUser.roles.includes(x)
            //   ) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV,
            // },
            {
              title: "Dataset",
              route: "/test-admin-data-peta-dataset",
              icon: "",
              visible: [ERole.ROLE_ADMIN].some((x) =>
                  this.currentUser.roles.includes(x)
              ),
            },

            {
              title: "Peta Tematik",
              route: "/admin-peta-tematik",
              icon: "",
              visible: [ERole.ROLE_ADMIN].some((x) =>
                  this.currentUser.roles.includes(x)
              ),
            },


            // {
            //   title: "Test Dataset",
            //   route: "/test-admin-data-peta-dataset",
            //   icon: "",
            //   visible: [ERole.ROLE_ADMIN].some((x) =>
            //       this.currentUser.roles.includes(x)
            //   ) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV,
            // },

            // {
            //   title: "Test PETA",
            //   route: "/test-peta-postgis",
            //   icon: "",
            //   visible: [ERole.ROLE_ADMIN].some((x) =>
            //       this.currentUser.roles.includes(x)
            //   ) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV,
            // },


          ],
        },

        {
          title: "Setup",
          icon: "mdi-cog",
          active: false,
          visible: [ERole.ROLE_ADMIN].some((x) => this.currentUser.roles.includes(x) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV),
          items: [
            // {
            //   title: "Sektor",
            //   route: "/admin-sektor",
            //   icon: "",
            //   visible: [ERole.ROLE_ADMIN].some((x) =>
            //       this.currentUser.roles.includes(x)
            //   ) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV,
            // },
            {
              title: "Produsen Data",
              route: "/admin-division",
              icon: "",
              visible: [ERole.ROLE_ADMIN].some((x) =>
                  this.currentUser.roles.includes(x)
              ) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV,
            },
            // {
            //   title: "Satuan",
            //   route: "/admin-satuan",
            //   icon: "",
            //   visible: [ERole.ROLE_ADMIN].some((x) =>
            //       this.currentUser.roles.includes(x)
            //   ) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV,
            // },
            // {
            //   title: "Wilayah",
            //   route: "/admin-wilayah",
            //   icon: "",
            //   visible: [ERole.ROLE_ADMIN].some((x) =>
            //       this.currentUser.roles.includes(x)
            //   ) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV,
            // },
            {
              title: "Carousel Image",
              route: "/admin-din-carousel",
              icon: "",
              visible: [ERole.ROLE_ADMIN].some((x) =>
                  this.currentUser.roles.includes(x)
              ) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV,
            },
          ],
        },
        {
          title: "Laporan",
          icon: "mdi-note-text",
          active: false,
          visible: [ERole.ROLE_ADMIN].some((x) => this.currentUser.roles.includes(x) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV),
          items: [
            {
              title: "Dataset Downloaded",
              route: "/admin-geo-download",
              icon: "",
              visible: [ERole.ROLE_ADMIN].some((x) =>
                  this.currentUser.roles.includes(x)
              ) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV,
            },
          ],
        },
      ];
    },

    nav_drawers_setup() {
      return [
        {
          title: "Admin",
          icon: "mdi-cog-outline",
          active: false,
          visible: [ERole.ROLE_ADMIN].some((x) =>
              this.currentUser.roles.includes(x)
          ) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV,
          items: [
            {
              title: "Pengguna",
              route: "/admin-sistem",
              icon: "",
              visible: [ERole.ROLE_ADMIN].some((x) =>
                  this.currentUser.roles.includes(x)
              ) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV,
            },
            {
              title: "Struktur Organisasi Sistem",
              route: "/admin-struktur-organisasi-sistem",
              icon: "",
              visible: [ERole.ROLE_ADMIN].some((x) =>
                  this.currentUser.roles.includes(x)
              ) && this.currentUser.organizationLevel !== EOrganizationLevel.DIV,
            },
          ],
        },
      ];
    },
  },

  methods: {
    logOut() {
      this.$store.dispatch("auth/logout");
      this.$router.push("/login");
    },


    lookupImageUrl(item) {
      // console.log(JSON.stringify(item))
      if (item.avatarImage === undefined || item.avatarImage === "") {
        return require("@/assets/images/account_icon.png");
      } else {
        return FileService.image_url_verylow(item.avatarImage);
      }
    },
    lookupImageUrlLazy() {
      return require("@/assets/images/account_icon.png");
    },
  },
  mounted() {
    TestService.getAdminBoard().then(
      () => {},
      (error) => {

        if (error.response.status === 401) {
          if (this.currentUser !== undefined || this.currentUser !== "") {
            this.$store.dispatch("auth/logout");
            this.$router.push("/login");
          }
        }
      }
    );
  },
};
</script>

<style scoped>
.nav-color{
  background-image: linear-gradient(to top left, #00386c 10%, transparent 90%);
}
.nav-color-second{
  background-color: #005c7c;
}
</style>