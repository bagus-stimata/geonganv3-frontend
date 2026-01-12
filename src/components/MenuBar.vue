<template>
  <nav
      v-if="showNav && !this.currentUser"
      :style="isHome? 'position: fixed;top: 0;left: 0;right: 0;z-index: 9999' : ''"
      class="app-nav"
      :class="{ 'app-nav--transparent': isHome && !scrolled }">
    <v-container :class="isActive('/home') || isActive('/')? 'bg-transparent':''">
      <v-toolbar
          :class="isActive('/home') || isActive('/')? 'bg-transparent':''"
          density="compact"
          style="background-color: #ffffff"
          class="elevation-0 align-center"
          height="74"
    >
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        class="text-grey-darken-2 hidden-md-and-up"
      ></v-app-bar-nav-icon>

      <div class="d-flex align-center cursor-pointer" @click="routeToPage('/')">
        <div class="mt-1 mb-1 mr-2">
          <v-img
            lazy
            height="50"
            width="50"
            :src="require('../assets/logo.png')"
          ></v-img>
        </div>
        <div v-if="isHome && !scrolled" class="text-h5 ml-n1">
          <span class="font-weight-black text-white hidden-sm-and-down">GEO PORTAL</span>
          <div
              class="text-subtitle-2 mt-n1 text-white font-weight-light hidden-sm-and-down"
          >
            Kabupaten Nganjuk
          </div>
        </div>
        <div v-else class="text-subtitle-1 ml-n1">
          <span class="font-weight-black teks-effect-toright hidden-sm-and-down">GEO PORTAL</span>
          <div
            class="text-subtitle-2 mt-n3 text-grey-darken-2 font-weight-light hidden-sm-and-down"
          >
            Kabupaten Nganjuk
          </div>
        </div>
      </div>

      <v-spacer></v-spacer>
        <v-toolbar-items class="hidden-sm-and-down d-flex flex-column align-center justify-center">
          <div class="hidden-sm-and-down">
            <v-btn
                class="hidden-sm-and-down"
                size="small"
                :style="isHome && !scrolled?'color:white !important': ''"
                density="comfortable"
                :variant="isActive('/home')?'elevated':'plain'"
                :class="isActive('/home')?'color-bg-primary pa-3 text-white font-weight-bold' : 'pa-3 text-black font-weight-bold hover-btn'"
                elevation="0"
                :to="{ path: '/home' }"
                v-if="!currentUser"
            >
              <span>Beranda</span>
            </v-btn>
          </div>
        </v-toolbar-items>
        <v-toolbar-items class="hidden-sm-and-down d-flex flex-column align-center justify-center">
          <div class="hidden-sm-and-down">
            <v-btn
                class="hidden-sm-and-down"
                size="small"
                :style="isHome && !scrolled?'color:white !important': ''"
                density="comfortable"
                :variant="isActive('/public-dataset')?'elevated':'plain'"
                :class="isActive('/public-dataset')?'color-bg-primary pa-3 text-white font-weight-bold' : 'pa-3 text-black font-weight-bold hover-btn'"
                elevation="0"
                :to="{ path: '/public-dataset' }"
                v-if="!currentUser"
            >
              <span>Dataset Peta</span>
            </v-btn>
          </div>
        </v-toolbar-items>
        <v-toolbar-items class="hidden-sm-and-down d-flex flex-column align-center justify-center">
          <div class="hidden-sm-and-down">
            <v-btn
                class="hidden-sm-and-down"
                size="small"
                :style="isHome && !scrolled?'color:white !important': ''"
                density="comfortable"
                :variant="isActive('/public-map')?'elevated':'plain'"
                :class="isActive('/public-map')?'color-bg-primary pa-3 text-white font-weight-bold' : 'pa-3 text-black font-weight-bold hover-btn'"
                elevation="0"
                :to="{ path: '/public-map' }"
                v-if="!currentUser"
            >
              <span>Peta Interaktif</span>
            </v-btn>
          </div>
        </v-toolbar-items>
        <v-toolbar-items class="hidden-sm-and-down d-flex flex-column align-center justify-center">
          <div class="hidden-sm-and-down">
            <v-btn
                class="hidden-sm-and-down"
                size="small"
                :style="isHome && !scrolled?'color:white !important': ''"
                density="comfortable"
                :variant="isActive('/public-berita')?'elevated':'plain'"
                :class="isActive('/public-berita')?'color-bg-primary pa-3 text-white font-weight-bold' : 'pa-3 text-black font-weight-bold hover-btn'"
                elevation="0"
                :to="{ path: '/public-berita' }"
                v-if="!currentUser"
            >
              <span>Berita</span>
            </v-btn>
          </div>
        </v-toolbar-items>
        <v-toolbar-items class="hidden-sm-and-down d-flex flex-column align-center justify-center">
          <div class="hidden-sm-and-down">
            <v-btn
                class="hidden-sm-and-down"
                size="small"
                :style="isHome && !scrolled?'color:white !important': ''"
                density="comfortable"
                :variant="isActive('/public-e-library')?'elevated':'plain'"
                :class="isActive('/public-e-library')?'color-bg-primary pa-3 text-white font-weight-bold' : 'pa-3 text-black font-weight-bold hover-btn'"
                elevation="0"
                :to="{ path: '/public-e-library' }"
                v-if="!currentUser"
            >
              <span>Dokumen</span>
            </v-btn>
          </div>
        </v-toolbar-items>
    </v-toolbar>
    </v-container>
  </nav>
  <v-navigation-drawer
      v-model="drawer"
      v-if="showNav && isMobile && !this.currentUser"
      temporary
      location="left"
      :scrim="true"
      elevation="8"
      class="hidden-md-and-up mobile-drawer"
  >
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
</template>

<script>
import { useDisplay } from "vuetify";
export default {
  name: "NavBar",
  data() {
    return {

      scrolled: false,
      onScrollHandler: null,
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
    isHome() {
      return this.isActive('/home') || this.isActive('/');
    },
    isMobile() {
      const v = this.mdAndUp;
      // mdAndUp is a Ref from Vuetify useDisplay; templates may not always unwrap it when stored in data.
      const mdUp = v && typeof v === 'object' && 'value' in v ? v.value : !!v;
      return !mdUp;
    },
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
  watch: {
    isHome() {
      this.onScrollHandler?.();
    }
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
    this.onScrollHandler = () => {
      if (!this.isHome) { this.scrolled = true; return; } // non-home always solid
      this.scrolled = (window.scrollY || 0) > 20;
    };
    window.addEventListener('scroll', this.onScrollHandler, { passive: true });
    this.onScrollHandler();
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScrollHandler);
  },
  created() {
    // Gunakan useDisplay untuk mendapatkan status breakpoint
    const { mdAndUp } = useDisplay();
    this.mdAndUp = mdAndUp;
  },
};
</script>



<style scoped>
.app-nav{

  height: 82px;      /* sesuaikan */
  display: flex;
  align-items: center;

  background: rgba(255,255,255,0.92);
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  backdrop-filter: blur(10px);

  transition: background-color 220ms ease, box-shadow 220ms ease, backdrop-filter 220ms ease, transform 220ms ease;
}

/* home + belum scroll => transparan (overlay hero) */
.app-nav--transparent{
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}
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
  font-weight: bolder;
  letter-spacing: 2px;
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
  font-size: 28px;
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
.hover-btn:hover{
  color: #FF8030 !important;
}

.mobile-drawer :deep(.v-navigation-drawer__content) {
  /* keep content scrollable on mobile */
  overflow-y: auto;
}

.mobile-drawer {
  z-index: 10000 !important;
}

.mobile-drawer :deep(.v-overlay__scrim) {
  z-index: 9999 !important;
}
</style>