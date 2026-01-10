<template>
  <v-footer
      class="py-4 color-bg-second d-flex"
      height="auto"
  >
      <v-row class="mx-4">
        <v-col cols="12" md="6" class="text-start">
          <div class="mb-4">
            <v-btn route to="/login" class="glow-on-hover"> Login Admin </v-btn>
          </div>

          <v-card height="210" width="340">
            <l-map
                :zoom="zoom"
                :center="center"
                :options="{ scrollWheelZoom: false }"
            >
              <l-tile-layer
                  :url="tileLayerUrl"
                  :attribution="tileLayerAttribution"
              />
              <l-marker :lat-lng="markerPosition" />
            </l-map>
          </v-card>
        </v-col>
        <v-col cols="12" md="4" v-if="false">
          <div>
            <div class="text-white font-weight-black text-h5">Link Terkait</div>
            <div class="mt-4" v-if="false">
              <div class="font-weight-thin mt-1 text-caption"><a class="text-white" href="https://bekasikab.go.id/" target="_blank">Website Pemkab</a></div>
              <div class="font-weight-thin mt-1 text-caption"><a class="text-white" href="https://www.lapor.go.id/instansi/pemerintah-kabupaten-bekasi" target="_blank">Lapor</a></div>
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="6" class="text-end">
          <div class="text-end">
            <div class="icons d-flex text-end d-flex">
              <v-spacer></v-spacer>
              <a
                  href=""
                  class="icon icon--instagram"
                  target="_blank"
              >
                <v-icon >mdi-instagram</v-icon>
              </a>
              <a  href=""
                 class="icon icon--youtube"
                 target="_blank"
              >
                <v-icon>mdi-youtube</v-icon>

              </a>
              <a
                  href=""
                  class="icon icon--github"
                  target="_blank"
              >
                <v-icon>mdi-microsoft-internet-explorer</v-icon>
              </a>
            </div>
            <div class="text-white mt-6 text-end">
              <div class="d-flex flex-column">
                <div class="subtitle-2">
                  Jl. Merdeka No.21, Mangundikaran, Mangun Dikaran, Kec. Nganjuk, Kabupaten Nganjuk, Jawa Timur 64419</div>
                <div class="subtitle-2 mt-4">
                <span v-if="false">
                  <v-icon small color="white">mdi-email-outline</v-icon>
                  <span>
                    diskominfonganjuk@gmail.com
                  </span>
                </span>
                </div>
                <div class="subtitle-2" v-if="false">
                  <span>
                    <v-icon small color="white">mdi-phone</v-icon>
                    <span>
                      -
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

  </v-footer>
</template>

<script>
import {LMap, LMarker, LTileLayer} from "@vue-leaflet/vue-leaflet";
export default {
  name: "AppFooter",
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  data() {
    return {
      zoom: 13,
      center: this.$store.state.potensi.centerMap.coordinates, // Latitude dan Longitude
      markerPosition: this.$store.state.potensi.centerMap.coordinates, // Posisi Marker
      tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', // OpenStreetMap tiles
      tileLayerAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    };
  },
  methods: {

  },
  mounted() {
    this.center = this.$store.state.potensi.centerMap.coordinates
    this.markerPosition = this.$store.state.potensi.centerMap.coordinates

  }
}
</script>

<style scoped>
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
.icons {
  display: flex;
  column-gap: 10px;
}

.icon {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 26px;
  color: #fff;
  border-radius: 50%;
  outline: 2px solid #fff;
  transition-property: outline-offset, outline-color, background-color;
  transition-duration: 0.25s;
}

.icon:hover {
  outline-offset: 4px;
}

.icon:hover i {
  animation: shake 0.25s;
}

.icon--instagram:hover {
  background-image: radial-gradient(
      circle at 30% 107%,
      #fdf497 0%,
      #fdf497 5%,
      #fd5949 45%,
      #d6249f 60%,
      #285aeb 90%
  );
  outline-color: #a02d76;
}

.icon--twitter:hover {
  background-color: #1da1f2;
  outline-color: #1da1f2;
}
.icon--youtube:hover {
  background-color: #c51111;
  outline-color: #d21c1c;
}

.icon-tiktok:hover {
  background-image: radial-gradient(
      circle at 30% 107%,
      #9afd97 0%,
      #97fd99 5%,
      #fd5949 45%,
      #d6249f 60%,
      #35eb28 90%
  );
  outline-color: #a02d76;
}

.icon--github:hover {
  background-color: #2ea44f;
  outline-color: #2ea44f;
}

@keyframes shake {
  10% {
    transform: rotate(15deg);
  }

  20% {
    transform: rotate(-15deg);
  }

  30% {
    transform: rotate(15deg);
  }

  40% {
    transform: rotate(-15deg);
  }
}

.glow-on-hover {
  width: 220px;
  height: 50px;
  border: none;
  outline: none;
  color: #fff;
  background: #FF8030;
  cursor: pointer;
  position: relative;
  z-index: 0;
  border-radius: 10px;
}

.glow-on-hover:before {
  content: "";
  background: linear-gradient(
      45deg,
      #ff0000,
      #ff7300,
      #fffb00,
      #48ff00,
      #00ffd5,
      #1f2023,
      #1a7d53,
      #ff00c8,
      #ff0000
  );
  position: absolute;
  top: -2px;
  left: -2px;
  background-size: 400%;
  z-index: -1;
  filter: blur(5px);
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  animation: glowing 20s linear infinite;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  border-radius: 10px;
}

.glow-on-hover:active {
  color: #000;
}

.glow-on-hover:active:after {
  background: transparent;
}

.glow-on-hover:hover:before {
  opacity: 1;
}

.glow-on-hover:after {
  z-index: -1;
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background: #1a7d53;
  left: 0;
  top: 0;
  border-radius: 10px;
}

@keyframes glowing {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 400% 0;
  }
  100% {
    background-position: 0 0;
  }
}

div.font-weight-regular {
  transition: color 0.3s; /* Efek transisi warna selama 0.3 detik */
}
div.font-weight-regular:hover {
  color: red; /* Ubah warna saat mouse hover */
  cursor: pointer;
}
</style>