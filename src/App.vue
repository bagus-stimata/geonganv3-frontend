<template>
  <v-app>
    <NavDrawer v-if="currentUser !== null" />
<!--    <MenuBar v-if="currentUser === null" />-->

    <v-main>
        <router-view></router-view>
    </v-main>

  </v-app>
</template>

<script>
// import MenuBar from "./components/MenuBar";
import NavDrawer from "./components/NavDrawer.vue";


export default {
  name: 'App',
  components: {
    // MenuBar: MenuBar,
    NavDrawer
  },
  data: () => ({
  }),
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    // currentUserUmkm(){
    //   if(this.$store.state.auth.user){
    //     return this.$store.state.auth.user.roles.includes(ERole.ROLE_UMKM);
    //   } else {
    //     return false
    //   }
    // },
  },
  methods: {
    initIcon() {
      let link =
          document.querySelector("link[rel*='icon']") ||
          document.createElement("link");
      link.type = "image/x-icon";
      link.rel = "shortcut icon";
      // link.href = this.icon;
      link.href = "/assets/logo.png";
      document.getElementsByTagName("head")[0].appendChild(link);
    },
    isSessionActive() {
      const sessionExpiresAt = localStorage.getItem("sessionExpiresAt");
      if (!sessionExpiresAt) {
        return false; // Sesi tidak ada
      }

      // Periksa apakah waktu kedaluwarsa sesi telah tercapai
      return Date.now() < sessionExpiresAt;
    },

    // addVisitor() {
    //   if (this.isSessionActive()) {
    //     console.log("Sesion masih aktif (tidak perlu menambahkan visitor)");
    //   } else {
    //     localStorage.removeItem("sessionExpiresAt");
    //     fetch('https://ipapi.co/json/')
    //         .then(response => response.json())
    //         .then(data => {
    //           // console.log(JSON.stringify(data))
    //
    //           let fVisitor = {
    //             description: data.city,
    //             province: data.region,
    //             country: data.country_name,
    //             latitude: data.latitude,
    //             longitude: data.longitude,
    //             timeZone: data.timezone,
    //             utcOffset: data.utc_offset,
    //             ipAddres: data.ip,
    //           };
    //           FVisitorService.addFVisitorCount(fVisitor).then(() => {
    //             // const sessionDuration = 4 * 60 * 60 * 1000; // Durasi sesi dalam milidetik (contoh: 4 x 60  menit)
    //             const sessionDuration = 5 * 60 * 1000; // durasi dalam 5 menit
    //             const sessionExpiresAt = Date.now() + sessionDuration;
    //             localStorage.setItem(
    //                 "sessionExpiresAt",
    //                 sessionExpiresAt.toString()
    //             );
    //           });
    //
    //         })
    //         .catch(error =>{
    //           let fVisitor = {
    //             description: "Unknown Location",
    //             province: "Unknown Location",
    //             country: "Unknown Location",
    //           };
    //           FVisitorService.addFVisitorCount(fVisitor).then(() => {
    //             // const sessionDuration = 4 * 60 * 60 * 1000; // Durasi sesi dalam milidetik (contoh: 4 x 60  menit)
    //             const sessionDuration = 5 * 60 * 1000; // durasi dalam 5 menit
    //             const sessionExpiresAt = Date.now() + sessionDuration;
    //             localStorage.setItem(
    //                 "sessionExpiresAt",
    //                 sessionExpiresAt.toString()
    //             );
    //           });
    //           console.error('Error:', error)
    //
    //         });
    //
    //   }
    // },

  },
  created() {
    this.initIcon();
    // this.addVisitor();
  },
  mounted() {
    this.initIcon();

    if (!this.currentUser) {
      //Kita tidak akan pernah push apapun jika belum login
      // this.$router.push('/login');
    }
    // if (this.currentUserUmkm){
    //   this.$router.push('/user-umkm-profile')
    // }

    /**
     * AKAN DI BERIKAN VALIDATE EXPIRED TOKEN
     */
    // console.log(`Current user is ${JSON.stringify(this.currentUser)}`)
    console.log("###### MOUNTED App.Vue PERTAMA KALI ####");
  },
}
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
.color-gradient-1 {
  background-image: linear-gradient(to top left, #1a7d53 10%, transparent 90%);
}
.color-bg-primary {
  background-color: #FF8030;
}
.color-bg-second {
  background-color: #005c7c;
}
.color-text-primary {
  color: #FF8030;
}
.color-text-second {
  color: #005c7c;
}
.bottom-gradient {
  background-image: linear-gradient(to top left, #1d7a52 10%, transparent 90%);
}

.repeating-gradient {
  background-image: repeating-linear-gradient(
      -45deg,
      rgba(255, 0, 0, 0.25),
      rgba(255, 0, 0, 0.25) 5px,
      rgba(0, 0, 255, 0.25) 5px,
      rgba(134, 134, 234, 0.25) 10px
  );
}
.navbar_submenu_color {
  background-color: #c8efe0;
}
</style>