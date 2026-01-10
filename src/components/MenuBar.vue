<template>
  <nav
      v-if="showNav">
    <v-container fluid>
      <v-toolbar
          density="compact"
          style="background-color: #ffffff"
          class="elevation-0 align-center"
          height="85"
    >
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        class="text-grey-darken-2 hidden-md-and-up"
      ></v-app-bar-nav-icon>

      <div class="ml-2 d-flex align-center cursor-pointer" @click="routeToPage('/')">
        <div class="mt-1 mb-1 mr-2">
          <v-img
            lazy
            height="55"
            width="55"
            :src="require('../assets/logo.png')"
          ></v-img>
        </div>
        <div class="subtitle-1 ml-1">
          <span class="font-weight-black teks-effect-toright hidden-sm-and-down">GEO PORTAL</span>
          <div
            class="subtitle-2 mt-n3 text-grey text--darken-2 font-weight-regular hidden-sm-and-down"
          >
            Kabupaten Nganjuk
          </div>
        </div>
      </div>

      <v-spacer></v-spacer>
        <v-toolbar-items class="hidden-sm-and-down">
          <v-btn
              size="small"
              :class="[
            'text-subtitle-2 custom-btn px-4',
            { 'btn-switch-on': isActive('/home') }
          ]"
              variant="text"
              elevation="0"
              color="gray darken-1"
              :to="{ path: '/home' }"
              v-if="!currentUser"
          >
            <span>Beranda</span>
          </v-btn>
        </v-toolbar-items>
        <v-toolbar-items class="hidden-sm-and-down">
          <v-btn
              size="small"
              :class="[
            'text-subtitle-2 custom-btn px-4',
            { 'btn-switch-on': isActive('/public-dataset') }
          ]"
              variant="text"
              elevation="0"
              color="gray darken-1"
              :to="{ path: '/public-dataset' }"
              v-if="!currentUser"
          >
            <span>Katalog Peta</span>
          </v-btn>
        </v-toolbar-items>
        <v-toolbar-items class="hidden-sm-and-down">
          <v-btn
              size="small"
              :class="[
            'text-subtitle-2 custom-btn px-4',
            { 'btn-switch-on': isActive('/public-map') }
          ]"
              variant="text"
              elevation="0"
              color="gray darken-1"
              :to="{ path: '/public-map' }"
              v-if="!currentUser"
          >
            <span>Peta Interaktif</span>
          </v-btn>
        </v-toolbar-items>
        <v-toolbar-items class="hidden-sm-and-down">
          <v-btn
              size="small"
              :class="[
            'text-subtitle-2 custom-btn px-4',
            { 'btn-switch-on': isActive('/public-berita') }
          ]"
              variant="text"
              elevation="0"
              color="gray darken-1"
              :to="{ path: '/public-berita' }"
              v-if="!currentUser"
          >
            <span>Berita</span>
          </v-btn>
        </v-toolbar-items>
        <v-toolbar-items class="hidden-sm-and-down">
          <v-btn
              size="small"
              :class="[
            'text-subtitle-2 custom-btn px-4',
            { 'btn-switch-on': isActive('/public-e-library') }
          ]"
              variant="text"
              elevation="0"
              color="gray darken-1"
              :to="{ path: '/public-e-library' }"
              v-if="!currentUser"
          >
            <span>Dokumen</span>
          </v-btn>
        </v-toolbar-items>
    </v-toolbar>
    </v-container>

    <v-navigation-drawer
      app
      class="hidden-md-and-up"
      v-model="drawer"
      v-if="!mdAndUp">
          <v-layout column>
            <div class="d-flex flex-row justify-center align-center mt-3 mb-2">
              <v-img
                lazy-src="../assets/logo.png"
                max-height="50"
                max-width="50"
                src="../assets/logo.png"
              ></v-img>
            </div>
            <div class="font-weight-light title ml-1">
              <span class="font-weight-black teks-effect-toright">DISKOMINFO</span>
              <div
                  class="narrow-letter-spacing subtitle-2 mt-n3 text-grey text--darken-2 font-weight-regular"
              >
                KABUPATEN NGANJUK
              </div>
            </div>

          </v-layout>

          <v-divider></v-divider>
          <v-list>
            <v-list-item color="deep-orange" route to="/home">
              <template #prepend>
                <v-icon>mdi-home</v-icon>
              </template>
              <v-list-item-subtitle>Beranda</v-list-item-subtitle>
            </v-list-item>
            <v-list-item color="deep-orange" route to="/public-dataset">
              <template #prepend>
                <v-icon>mdi-map</v-icon>
              </template>
              <v-list-item-subtitle>Katalog Peta</v-list-item-subtitle>
            </v-list-item>
            <v-list-item color="deep-orange" route to="/public-map">
              <template #prepend>
                <v-icon>mdi-map-marker</v-icon>
              </template>
              <v-list-item-subtitle>Peta Interaktif</v-list-item-subtitle>
            </v-list-item>
            <v-list-item color="deep-orange" route to="/public-berita">
              <template #prepend>
                <v-icon>mdi-newspaper</v-icon>
              </template>
              <v-list-item-subtitle>Berita</v-list-item-subtitle>
            </v-list-item>
            <v-list-item color="deep-orange" route to="/public-e-library">
              <template #prepend>
                <v-icon>mdi-archive</v-icon>
              </template>
              <v-list-item-subtitle>Dokumen</v-list-item-subtitle>
            </v-list-item>
          </v-list>
    </v-navigation-drawer>
  </nav>
</template>

<script>
import { useDisplay } from "vuetify";
export default {
  name: "NavBar",
  data() {
    return {
      drawer: false,
      isDarkMode: false,
      switchOn: false,
      mdAndUp: null,
      itemsGroup: [
        {id: 1, description: "Dokumen Perencanaan"},
      ],
      farticleCategs: [

      ]
    };
  },
  computed: {
    showNav() {
      const excludePaths = [
        "/login", "/register",
        "/registration-active",
        "/reset-success",
          "/public-map",

        "/reset-atur-ulang",
        "/reset-masukkan-otp",
        "/reset-masukkan-otp-password"
      ];

      const currentPath = this.$route.path;

      return !excludePaths.some((path) => currentPath.startsWith(path));
    },
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  methods: {
    linkNeated(link) {
      return link.replace(/\s+/g, "-").toLocaleLowerCase();
    },
    isActive(path) {
      return this.$route.path === path;
    },
    routeToPage(path){
      if(path !== ""){
        this.$router.push(path)
      }
    }
  },
  mounted() {
  },
  created() {
    // Gunakan useDisplay untuk mendapatkan status breakpoint
    const { mdAndUp } = useDisplay();
    this.mdAndUp = mdAndUp;
  },
};
</script>



<style scoped>
.color-bg-primary {
  background-color: #FF8030;
}
.color-bg-grey {
  background-color: #2C3137 !important;
}
.color-text-primary {
  color: #FF8030;
}
.color-text-second {
  color: #002647;
}
.teks-effect-toright {
  font-size: 0px;
  font-weight: bolder;
  letter-spacing: 3px;
  text-transform: uppercase;
  text-align: center;

  background: linear-gradient(to right, #3f51b5, #2196f3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient 5s ease infinite;

  text-transform: uppercase;
  background-image: linear-gradient(
    -225deg,
    #231557 0%,
    #44107a 29%,
    #ff1361 67%,
    #fff800 100%
  );

  background-size: auto auto;
  background-clip: border-box;
  background-size: 200% auto;
  color: #fff;
  background-clip: text;
  text-fill-color: transparent;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: textclip 2s linear infinite;
  display: inline-block;
  font-size: 32px;
}

@keyframes textclip {
  to {
    background-position: 200% center;
  }
}
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

.waviy {
  position: relative;
  font-weight: bolder;
}
.waviy span {
  position: relative;
  display: inline-block;
  font-size: 40px;
  color: #0f2270;
  text-transform: uppercase;
  animation: flip 2s infinite;
  animation-delay: calc(0.2s * var(--i));
}
@keyframes flip {
  0%,
  80% {
    transform: rotateY(360deg);
  }
}

.custom-btn {
  transition: all 0.5s ease; /* Menambahkan transisi halus */
  color: #000000; /* Warna teks */
  background-color: #ffffff; /* Warna latar belakang */
  border-radius: 1px; /* Sudut tombol */
  letter-spacing: 0px;
}

.custom-btn:hover {
  transition: all 0.5s ease; /* Menambahkan transisi halus */
  color: white;
  background-color: #FF8030; /* Warna latar belakang tipis saat hover */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Bayangan saat dihover */
}
.hover-list:hover .v-list-item-title {
  color: #FF8030 !important;
}
.hover-list:hover{
  background-color: #41454f !important;
}
.btn-switch-on {
  color: white;
  background-color: #FF8030; /* Warna latar belakang tipis saat hover */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Bayangan saat dihover */
}

</style>