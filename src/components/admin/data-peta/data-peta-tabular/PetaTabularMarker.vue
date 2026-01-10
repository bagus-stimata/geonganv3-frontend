<template>
    <v-card>
      <l-map
          ref="map"
          :zoom="zoom"
          :max-zoom="maxZoom"
          :center="center"
          @update:zoom="zoomUpdated"
          @update:center="centerUpdated"
          style="height: 250px; width: 100%; z-index: 1"
          @click="setSingleMarker"
          :options="{ scrollWheelZoom: false }"
          @ready="initializeFullscreen"
      >
        <l-tile-layer :url="url" :attribution="attribution" />

        <l-control-layers position="topright"></l-control-layers>
        <l-tile-layer
            v-for="tileProvider in tileProviders"
            :key="tileProvider.name"
            :name="tileProvider.name"
            :visible="tileProvider.visible"
            :url="tileProvider.url"
            :attribution="tileProvider.attribution"
            layer-type="base"
        />

        <l-marker
            ref="marker"
            v-if="computedSingleMarker"
            :lat-lng="computedSingleMarker.coords"
            :icon="customIcon"
        >
          <l-popup>
            <div>
              <h4>Koordinat</h4>
              <div>
                [ {{ singleMarker.coords[0] }}, {{ singleMarker.coords[1] }} ]
              </div>
            </div>
          </l-popup>
        </l-marker>
      </l-map>

      <v-divider></v-divider>

      <v-card-actions v-if="false">
        <v-spacer></v-spacer>
        <v-btn
            color="primary"
            text
            @click="dialogShow = false"
        >
          Oke and Close
        </v-btn>
      </v-card-actions>

    </v-card>
</template>

<script>
import {LControlLayers, LMap, LMarker, LPopup, LTileLayer,} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import 'leaflet-fullscreen';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';

export default {
  name: "PetaTabularMarker",
  components: {
    LMap,
    LTileLayer,
    LControlLayers,
    LMarker,
    LPopup,
  },
  props: {
    singleMarker: Object
  },
  data() {
    return {
      isFullScreen: false,

      dialogShow: false,
      // singleMarker: undefined, // Objek untuk menyimpan satu koordinat marker
      customIcon: L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png",
        iconSize: [50, 38], // ukuran ikon
        iconAnchor: [19, 38], // titik acuan ikon
        popupAnchor: [0, -30] // titik popup relatif terhadap ikon
      }),
      zoom: 12,
      maxZoom: 18,
      center: this.$store.state.potensi.centerMap.coordinates,
      // center: [-7.871, 112.528],

      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',

      tileProviders: [
        {
          name: "OpenStreetMap",
          visible: true,
          attribution:
              '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        },
        {
          name: "OpenTopoMap",
          visible: false,
          url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          attribution:
              'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        },
        {
          name: "Satelite",
          visible: false,
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution:
              '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        },
      ],

    };
  },
  computed: {
    computedSingleMarker: {
      get() {
        return this.singleMarker;
      },
      set(value) {
        if (value) {
          this.$emit("updateSingleMarker", value);
        }
      }
    }
  },
  watch: {
  },
  methods: {
    initializeFullscreen(mapInstance) {
      // Vue-Leaflet v0.6+ exposes `leafletObject`; keep `mapObject` as fallback
      const map =
        mapInstance ||
        this.$refs.map?.leafletObject ||
        this.$refs.map?.mapObject;

      if (!map) {
        console.warn("initializeFullscreen: map instance is not ready yet");
        return;
      }

      L.control.fullscreen().addTo(map);
    },
    handleFullscreenChange() {
      this.isFullScreen = !!document.fullscreenElement;
      console.log(`fullscreenchange detected: ${this.isFullScreen}`);
    },

    setSingleMarker(event) {
      const { lat, lng } = event.latlng;
      this.computedSingleMarker = {
        coords: [lat, lng]
      }
      this.$nextTick(() => {
        const marker =
          this.$refs.marker?.leafletObject ||
          this.$refs.marker?.mapObject;

        if (marker) {
          marker.openPopup();
        }
      });
    },

    initialize(marker) {
      this.$nextTick(() => {
        const map =
          this.$refs.map?.leafletObject ||
          this.$refs.map?.mapObject;

        if (map) {
          map.invalidateSize();
        } else {
          console.warn("initialize: map instance is not ready yet");
        }

        this.computedSingleMarker = marker;
        if (this.computedSingleMarker) {
          this.center = [
            this.computedSingleMarker.coords[0],
            this.computedSingleMarker.coords[1],
          ];
        }
      });
    },

    showDialog() {
      this.dialogShow = !this.dialogShow
    },
    setDialogState(value){
      this.dialogShow =value
    },

    zoomUpdated (zoom) {
      this.zoom = zoom;
    },
    centerUpdated (center) {
      this.center = center;
    },
  },
  mounted() {
    // Trigger map resize so fullscreen & tiles render correctly
    this.$nextTick(() => {
      const map =
        this.$refs.map?.leafletObject ||
        this.$refs.map?.mapObject;

      if (map) {
        map.invalidateSize();
      } else {
        console.warn("mounted: map instance is not ready yet");
      }
    });
    document.addEventListener("fullscreenchange", this.handleFullscreenChange);
  },
  beforeUnmount() {
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
  }
}
</script>

<style>

</style>