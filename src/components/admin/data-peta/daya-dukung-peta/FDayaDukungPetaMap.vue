<template>
  <div>
    <l-map
        :zoom="zoom"
        :max-zoom="maxZoom"
        :center="mapCenter"
        ref="map"
        @update:zoom="zoomUpdated"
        @update:center="centerUpdated"
        :options="{ scrollWheelZoom: false }"
        @ready="initializeFullscreen"
        style="z-index: 0;  min-height: 600px; "
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

      <l-control v-if="false">
        <div class="text-center">
          <v-menu
              v-model="showLayers1"
              :close-on-content-click="false"
              :nudge-width="300"
              offset-x
              max-height="600"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                  color="indigo"
                  dark
                  v-bind="props"
                  class="rounded-lg"
                  icon
                  large
                  outlined
                  elevation="10"
              >
                <v-icon>mdi-layers</v-icon>
              </v-btn>
            </template>

            <v-card width="500px" elevation="16" class="rounded-lg">
              <v-list>
                <v-list-item class="no-gutters" density="compact">
                  <v-list-item-action>
                    <v-btn variant="text" icon @click="showLayers1 = !showLayers1">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>

              <v-divider></v-divider>
              <v-card-text>
                <v-row class="ml-4" no-gutters>
                  <v-col
                      cols="12"
                      md="6"
                      sm="6"
                      xs="12"
                      v-for="(item, index) in computedItemsSpaDayaDukung"
                      :key="index"
                  >
                    <v-checkbox
                        v-model="item.selected"
                        input-value="true"
                        density="compact"
                        hide-details
                        :label="item.description.trim()"
                        class="caption"
                        @change="valueChangedSpaMainGeoJson(item)"
                    ></v-checkbox>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-menu>
        </div>
      </l-control>

      <l-geo-json
          v-for="(item, index) in computedItemsSpaDayaDukungGeojson"
          :key="index"
          :geojson="item.data"
          :options="options"
          :options-style="styleFunction"
      >
      </l-geo-json>


    </l-map>
  </div>
</template>

<script>
import {
  LMap,
  LTileLayer,
  // LMarker,
  // LIcon,
  // LPopup,
  LControlLayers,
  // LTooltip,
  LControl,
  LGeoJson,
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import 'leaflet-fullscreen';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';

import FileService from "@/services/apiservices/file-service";

import { Icon } from "leaflet";

delete Icon.Default.prototype.Default;
// Icon.Default.mergeOptions({
//   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: require('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: require('leaflet/dist/images/marker-shadow.png')
// });
Icon.Default.mergeOptions({
  iconRetinaUrl: require("@/assets/images/my-marker.webp"),
  iconUrl: require("@/assets/images/my-marker.webp"),
  shadowUrl: require("@/assets/images/my-marker.webp"),
});

export default {
  name: "CekLokasiUsahaMap",
  components: {
    LMap,
    LTileLayer,
    LControl,
    LControlLayers,
    // LMarker,
    // LIcon,
    // LPopup,
    // LTooltip,
    LGeoJson,
    // LControlPolylineMeasure,
  },
  props: {
  },
  watch: {
  },
  data() {
    return {
      isFullScreen: false,

      enableTooltip: true,
      zoom: 13,
      maxZoom: 18,
      currentMarker: {
        id: 0,
        coordinates: [-7.6051, 111.9035],
      },

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

      showLayers1: false,
      showLayers2: false,
      showLayers3: false,

      mapFullScreen: false,

      geojson: null,
      itemSpaDayaDukungGeojson: [],

      colorMap: {},
      firstLoadGeoJsonSelected: false,

      itemsFDayaDukung: Array,
      itemsFDayaDukungType: Array,
      itemsFSubArea: Array,
      itemsFArea: Array,

    };
  },
  computed: {
    mapCenter() {
      const center = this.$store.state.potensi.centerMap

      // Kalau dari Vuex sudah bentuk array [lat, lng]
      if (Array.isArray(center) && center.length === 2) {
        return center
      }

      // fallback ke default currentMarker di data()
      return this.currentMarker.coordinates
    },
    computedItemsSpaDayaDukung() {
      return this.itemsFDayaDukung.filter(
          (x) =>
              x.showToMap &&
              x.description !== "" &&
              x.fdivisionBean > 0 &&
              x.fdayaDukungTypeBean > 0 &&
              x.statusActive === true
      );
    },
    computedItemsSpaDayaDukungGeojson() {
      return this.itemSpaDayaDukungGeojson;
    },
    options() {
      return {
        onEachFeature: this.onEachFeatureFunction,
      };
    },
    onEachFeatureFunction() {
      if (!this.enableTooltip) {
        return () => {};
      }
      return (feature, layer) => {
        // layer.bindTooltip(
        //     "<div>" + this.jsonToHtmlTable(feature.properties) + "</div>",
        //     { permanent: false, sticky: true }
        // );
        // Popup pada klik, isinya juga sama
        layer.on('click', (e) => {
          const latlng = e.latlng;
          layer.bindPopup(
              `<div style='max-height: 350px; overflow-y: auto;'>
              ${this.jsonToHtmlTable(feature.properties)}
              </div><div><strong>${latlng.lat}, ${latlng.lng}</strong></div>`
          ).openPopup();
        });

      };
    },

  },
  methods: {
    initializeFullscreen() {
      const map = this.$refs.map.mapObject;
      if (map) {
        L.control.fullscreen().addTo(map);
      } else {
        console.error("Map object not initialized yet.");
      }
    },
    handleFullscreenChange() {
      this.isFullScreen = !!document.fullscreenElement;
    },
    zoomUpdated(zoom) {
      this.zoom = zoom;
    },
    centerUpdated(center) {
      this.center = center;
    },
    getRandomColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    styleFunction(feature) {
      let tebalGarisTepi = 1.2;
      let fillOpacity = 0.35;

      const props = feature?.properties || {};
      const geomType = feature?.geometry?.type || '';

      // Penyesuaian berdasarkan tipe geometrinya
      if (geomType === "MultiLineString") {
        tebalGarisTepi = 4.5;
      }

      // Cek nilai NAMOBJ
      const namobj = props.NAMOBJ || '';
      if (namobj === "Kawasan Peruntukan Industri" || namobj === "KPI") {
        fillOpacity = 0.8;
        tebalGarisTepi = 3;
      }

      // Gabungkan properti untuk membuat identifier
      const kandidatKeys = [
        'Description', 'description', 'DESCRIPTION',
        'Kabupaten', 'kabupaten', 'KABUPATEN',
        'Kecamatan', 'kecamatan', 'KECAMATAN',
        'Kec', 'KEC', 'Kab', 'KAB',
        'Desa', 'desa', 'DESA',
        'pola_ruang', 'POLA_RUANG',
        'keterangan', 'KETERANGAN','Keterangan',
        'Penggunaan', 'penggunaan', 'PENGGUNAAN',
        'NAMOBJ', 'OBJECTID',
        'Sempadan Sungai' // ← tambahkan di sini jika memang dipakai
      ];

      const parts = kandidatKeys
          .map(k => props[k])
          .filter(v => typeof v === 'string' && v.trim() !== '');

      let identifier = parts.length > 0 ? parts.join('_') : 'default';

      // Pastikan this.colorMap sudah ada
      if (!this.colorMap) {
        this.colorMap = {};
      }

      // Buat identifier fallback jika gagal dibuat
      if (!identifier || typeof identifier !== 'string' || identifier.trim() === '') {
        identifier = 'default';
      }

      // Jika belum ada warna untuk identifier ini, buatkan
      if (!this.colorMap[identifier]) {
        this.colorMap[identifier] = this.getRandomColor();
      }

      return {
        color: this.colorMap[identifier],
        weight: tebalGarisTepi,
        opacity: 0.8,
        fillColor: this.colorMap[identifier],
        fillOpacity: fillOpacity,
      };
    },

    lookupImageUrl(item) {
      if (item.avatarImage === undefined || item.avatarImage === "") {
        return require('@/assets/images/no_image_available.jpeg')
      } else {
        return FileService.image_url_low(item.avatarImage);
      }
    },
    lookupImageUrlLazy(item) {
      if (item.avatarImage === undefined || item.avatarImage === "") {
        return require('@/assets/images/no_image_available.jpeg')
      } else {
        return FileService.image_url_verylow(item.avatarImage);
      }
    },


    async valueChangedSpaMainGeoJson(value) {
      if (!value) return;

      // === NEW: Support inline GeoJSON string (no server fetch) ===
      const hasInlineGeojson =
        typeof value.geojson === "string" &&
        value.geojson.trim() !== "" &&
        value.geojson.trim() !== "{}";

      if (hasInlineGeojson) {
        try {
          const parsed = JSON.parse(value.geojson);
          if (!parsed || !Array.isArray(parsed.features)) {
            console.warn("GeoJSON inline tidak valid (features tidak ada/bukan array)", parsed);
            return;
          }

          const id = value.id ?? 0;
          const features = parsed.features;

          const dataWithMeta = {
            ...parsed,
            features: features.map((f) => ({
              ...f,
              properties: {
                ...(f.properties || {}),
                "Sumber Data": value.notes || value.sumberData || "",
              },
            })),
          };

          const payload = {
            id,
            data: dataWithMeta,
            lineColor: value.remark1,
            fillColor: value.remark2,
          };

          // replace if exists, else push
          const idx = this.itemSpaDayaDukungGeojson.findIndex((it) => it.id === id);
          if (idx >= 0) {
            this.itemSpaDayaDukungGeojson.splice(idx, 1, payload);
          } else {
            this.itemSpaDayaDukungGeojson.push(payload);
          }

          return;
        } catch (e) {
          console.error("Gagal parse GeoJSON inline:", e);
          return;
        }
      }

      // === Legacy: load geojson by fileNameLow from server ===
      let response = null;

      if (value.fileNameLow) {
        try {
          if (value.fileType === "geojson-gzip" || value.fileNameLow.endsWith(".geojson.gz")) {
            value.selected = true;
            response = await fetch(FileService.fileGeojsonGzip(value.fileNameLow));
          } else {
            value.selected = true;
            response = await fetch(FileService.file_url(value.fileNameLow));
          }

          if (!response) return;

          if (value.selected === true) {
            const geojsonResponse = await response.json();

            // Guard: features harus array
            const features = Array.isArray(geojsonResponse?.features) ? geojsonResponse.features : [];
            if (features.length === 0) {
              console.warn("GeoJSON response tidak memiliki features array", geojsonResponse);
              return;
            }

            this.itemSpaDayaDukungGeojson.push({
              id: value.id,
              data: {
                ...geojsonResponse,
                features: features.map((f) => ({
                  ...f,
                  properties: {
                    ...(f.properties || {}),
                    "Sumber Data": value.notes,
                  },
                })),
              },
              lineColor: value.remark1,
              fillColor: value.remark2,
            });
          } else {
            const index = this.itemSpaDayaDukungGeojson.findIndex((item) => item.id === value.id);
            if (index >= 0) this.itemSpaDayaDukungGeojson.splice(index, 1);
          }
        } catch (e) {
          console.error("Gagal load GeoJSON dari server:", e);
        }
      }
    },
    tampilkanPeta(item) {
      this.itemModified = item;

      // Clear previous preview layers first
      this.itemSpaDayaDukungGeojson = [];

      // Prefer inline GeoJSON (new concept)
      const hasInlineGeojson =
        item &&
        typeof item.geojson === "string" &&
        item.geojson.trim() !== "" &&
        item.geojson.trim() !== "{}";

      if (hasInlineGeojson) {
        // render directly from inline content
        this.valueChangedSpaMainGeoJson({ ...item, selected: true });
        return;
      }

      // Fallback (legacy): only fetch if fileNameLow is truly a server file (optional)
      // If you still use server files elsewhere, keep this fallback.
      if (item && item.fileNameLow) {
        this.valueChangedSpaMainGeoJson({ ...item, selected: true });
      }
    },
    resetTampilanPeta(){
      this.itemSpaDayaDukungGeojson = [];
    },
    jsonToHtmlTable(jsonValue) {
      const myObj = jsonValue;

      let text =
          "<table style='width: 300px'>\n" +
          "         <tr>\n" +
          "            <td style='width:40%'>::</td>\n" +
          "            <th></th>\n" +
          "         </tr>\n";
      for (const meta in myObj) {
        text +=
            "         <tr>\n" +
            "            <td style='color: #777777'>" +
            meta +
            "</td>\n" +
            "            <td>: &nbsp;" +
            myObj[meta] +
            "</td>\n" +
            "         </tr>\n";
      }
      text += "      </table>";

      return text;
    },


  },

  mounted() {
    this.currentMarker = this.$store.state.potensi.centerMap
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);

  },
  beforeUnmount() {
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
  }

};
</script>

<style scoped>

</style>
