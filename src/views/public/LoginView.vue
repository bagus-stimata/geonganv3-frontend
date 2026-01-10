<template>
  <div class="bg">
    <v-tooltip v-if="$vuetify.display.mdAndUp">
      <template v-slot:activator="{ props }">
        <router-link to="/">
          <v-btn
              v-bind="props"
              location="top left"
              position="fixed"
              size="large"
              color="orange"
              class="floating-button text-white mt-3 ml-3"
              elevation="16"
          >
            <v-icon size="large" class="mr-1">mdi-home</v-icon>
            Kembali Ke Home
          </v-btn>
        </router-link>
      </template>
      <span>Back To Home</span>
    </v-tooltip>

    <v-tooltip v-if="$vuetify.display.smAndDown">
      <template v-slot:activator="{ props }">
        <router-link to="/">
          <v-btn
              v-bind="props"
              location="top left"
              position="fixed"
              color="orange"
              class="floating-button text-white mt-3 ml-3"
              elevation="16"
          >
            <v-icon size="large" class="mr-1">mdi-home</v-icon>
            Kembali ke Home
          </v-btn>
        </router-link>
      </template>
      <span>Kembali Ke Home</span>
    </v-tooltip>

    <div class="video-background">
      <div class="overlay"></div>
    </div>

    <v-row class="mt-10">
      <v-col cols="2" sm="2" md="3"> </v-col>
      <v-col cols="8" sm="8" md="6" >
        <div class="d-flex mt-16 mb-2 mx-4 justify-center">
          <v-form ref="form">
            <v-card elevation="24" class="glass-bg" width="360">
            <v-card-title class="text-white text-center">
              LOGIN
            </v-card-title>
            <v-card-text>
              <v-text-field
                  v-model="user.username"
                  label="Username"
                  hide-details="auto"
                  variant="underlined"
                  :rules="[validateNotEmpty]"
              ></v-text-field>
              <v-text-field
                  v-model="user.password"
                  :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="show1 ? 'text' : 'password'"
                  label="Password"
                  hide-details="auto"
                  @click:append="show1 = !show1"
                  @keydown.enter="handleLogin"
                  variant="underlined"
                  :rules="[validateNotEmpty]"
              ></v-text-field>
            </v-card-text>

            <v-container v-if="errorMessage">
              <div class="text-red text-center font-italic">{{ errorMessage }}</div>
            </v-container>

            <div class="d-flex mt-n1 mr-4" v-if="false">
              <v-spacer></v-spacer>
              <span class="ps-4 text-black subtitle-2">
                  <span class="font-italic highlight-on-hover"
                        :class="errorMessage?'text-blue subtitle-1 font-weight-bold':'text-black text--lighten-4' ">Lupa password?</span>
              </span>
            </div>
            <v-card-actions class="ma-4">
              <v-spacer />
              <v-btn variant="elevated" color="primary" @click="handleLogin" width="200px">Login</v-btn>
              <v-spacer />
            </v-card-actions>
            <v-card-actions v-if="false">
            <span class="ps-4 text-black">Do not have an account?
              <span style="text-decoration: none" class="text-blue font-weight-bold ml-1 subtitle-1 highlight-on-hover">Daftar Akun Baru Disini</span>
            </span>

            </v-card-actions>
          </v-card>
          </v-form>
        </div>
      </v-col>
      <v-col cols="2" sm="2" md="3"> </v-col>
    </v-row>
  </div>
</template>

<script>
import User from "@/models/user";
import ERole from "@/models/e-role";
import { useDisplay } from 'vuetify';
import EOrganizationLevel from "@/models/e-organization-level";
// import UserService from "@/services/user-service";

export default {
  name: "LoginView",
  components: {},
  data() {
    const { mdOnly, lgAndUp, smOnly, xsOnly } = useDisplay();
    return {
      isMdOnly: mdOnly,
      isLgAndUp: lgAndUp,
      isSmOnly: smOnly,
      isXsOnly: xsOnly,
      show1: false,
      user: new User("", ""),
      loading: false,
      message: "",
      errorMessage: '',
      validateNotEmpty: (value) => !!value || "Tidak Boleh Kosong",

    };
  },
  computed: {
    isMobileDevice() {
      return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(navigator.userAgent);
    },
    currentUser() {
      return this.$store.state.auth.user;
    },
    currentUserWebinar(){
      if(this.$store.state.auth.user){
        return !!this.$store.state.auth.user.roles.includes(ERole.ROLE_USER);
      } else {
        return false
      }
    },

  },
  created() {
    if (this.loggedIn && !this.currentUserWebinar) {
      this.$router.push("/profile");
    }
  },
  methods: {
    handleLogin() {
      this.errorMessage = ''
      this.loading = true;
      this.$refs.form.validate().then((isValid) => {
        if (!isValid) {
          this.loading = false;
          return;
        }

        if (this.user.username && this.user.password) {
          this.$store.dispatch("auth/login", this.user).then(
              () => {
                if((this.currentUser.organizationLevel === EOrganizationLevel.CORP || this.currentUser.organizationLevel === EOrganizationLevel.DIV) && this.currentUser.roles.includes(ERole.ROLE_ADMIN)){
                  // this.$router.push("/admin-monev-perizinan");
                  this.$router.push("/dashboard");

                // } else if((this.currentUser.organizationLevel === EOrganizationLevel.CORP || this.currentUser.organizationLevel === EOrganizationLevel.DIV) && this.currentUser.roles.includes(ERole.ROLE_SURVEYOR)){
                //     if(this.isMobileDevice){
                //       this.$router.push("/admin-monev-mobile");
                //     } else {
                //       this.$router.push("/admin-monev");
                //     }
                } else if(this.currentUser.organizationLevel === EOrganizationLevel.SYS){
                  this.$router.push("/dashboard");
                } else {
                  this.$router.push("/dashboard");
                }
              },
              (error) => {
                this.errorMessage = 'Username dan password anda tidak cocok'
                this.loading = false;
                this.message =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();
              }
          );
        }
      });
    },
  },
  mounted() {
    // this.encryptedFmeetingBean = this.$route.query.fmeetingBean;

  }
};
</script>
<style scoped>
.glass-bg {
  background: rgb(201, 203, 205);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4.3px);
  -webkit-backdrop-filter: blur(4.3px);
  border: 1px solid rgb(15, 34, 112);
}
.overlay {
  position: absolute;
  background-color: #010614;
  width: 100%;
  height: 100vh;
  z-index: 1;
  opacity: 0.6;
}
.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -2;
}

video {
  object-fit: cover;
  width: 100%;
  height: 100vh;
}
.floating-button {
  z-index: 99;
  position: fixed;
  bottom: 20px; /* Adjust the distance from the bottom as needed */
  right: 20px; /* Adjust the distance from the right as needed */
}
.bg {
  background: transparent;
  width: 100%;
  height: 100vh;
  z-index: 3;
  position: absolute;
  top: 0;
  left: 0;
}
.highlight-on-hover:hover {
  color: #5678f3 !important; /* Highlight color */
}
</style>


