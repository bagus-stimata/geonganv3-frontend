<template>
  <div>
    <v-dialog
      v-model="dialogShow"
      :style="{ zIndex: formDialogOptions.zIndex }"
      @keydown.esc.prevent="closeForm"
      persistent
      fullscreen
      :hide-overlay="$vuetify.display.smAndDown"
    >
      <v-toolbar color="white" dark flat density="compact">
        <v-btn
            class="ml-4"
            size="small"
          icon
          variant="tonal"
          color="rec"
          :style="{ color: formDialogOptions.color }"
          @click="closeForm"
        >
          <v-icon size="large" color="primary" class="font-weight-bold">mdi-arrow-left</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card class="rounded-0">
        <div class="sticky-bar">
          <v-text-field
            v-model="searchText"
            label="Masukkan Alamat atau Nama Tempat"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-magnify"
            :loading="loadingPred"
            clearable
            autofocus
            hide-details
            @input="onInputSearch"
            @click:clear="clearSearch"
          />
        </div>
        <!-- Removed hidden mapDiv for PlacesService, not needed with new API -->

        <!-- Suggestion list -->
        <v-list v-if="predictions.length > 0" class="pt-0">
          <v-list-item
            v-for="(p, idx) in predictions"
            :key="p.raw?.placePrediction?.placeId || p.raw?.placePrediction?.id || idx"
            @click="selectPrediction(p)"
            class="py-2"
          >
            <v-list-item-title class="text-body-2 font-weight-medium">
              {{ p.title }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption text-grey">
              {{ p.subtitle }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <!-- Helper: too short -->
        <v-alert v-else-if="isTooShort" type="info" variant="tonal" class="mx-4 mb-4">
          Ketik minimal 4 karakter…
        </v-alert>

        <!-- Empty: no results -->
        <v-alert v-else-if="searchText && !loadingPred" type="info" variant="tonal" class="mx-4 mb-4">
          Nggak ada hasil. Coba ubah kata kunci.
        </v-alert>

        <v-divider></v-divider>
        <v-card-actions class="justify-end">
          <v-chip size="small" class="mr-2" color="blue" @click="closeForm">Tutup</v-chip>
        </v-card-actions>
      </v-card>

    </v-dialog>
    <v-snackbar
        v-model="snackbar"
    >
      {{ snackBarMessage }}
      <template v-slot:actions="{ attrs }">
        <v-btn
            variant="text"
            v-bind="attrs"
            @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>

export default {
  name: "GooglePlacesDialog",
  components: { },
  props: {
    formMode: String,
  },
  data() {
    return {
      dialogShow: false,
      snackbar: false,
      snackBarMessage: '',
      formDialogOptions: {
        title1: "",
        title2: "",
        message1: "",
        message2: "",
        errorMessage: "",
        color: "grey lighten-3",
        width: 1000,
        zIndex: 99999,
        noconfirm: false,
      },
      // Google Places state
      searchText: '',
      predictions: [],
      loadingPred: false,
      sessionToken: null,
      debounceTimer: null,
      googleReady: false,

      // Filter lokasi aktif / tidak
      geoFilterEnabled: true,
      // Geo guard: Kota Batu + radius ±40 km
      BATU_BOUNDS: {
        // West, South, East, North (EPSG:4326)
        west: 111.323639,
        south: -3.544408,
        east: 112.099411,
        north: -1.3378
      },
      // Enam kecamatan di Kobar
      BATU_KECAMATAN: ['Arut Selatan', 'Arut Utara', 'Kumai', 'Pangkalan Banteng', 'Pangkalan Lada', 'Kotawaringin Lama'],
    };
  },
  computed: {
    isItemModified() {
      const defaultItem = JSON.stringify(this.itemDefault);
      const modifiedItem = JSON.stringify(this.itemModified);
      return defaultItem !== modifiedItem;
    },
    googleApiKey(){
      return this.$store.state.secretKey.googleApiKey?? '';
    },
    isTooShort(){
      const len = (this.searchText || '').trim().length;
      return len > 0 && len < 4;
    }
  },
  watch: {},
  mounted() {
    // try to initialize (in case script already loaded)
    this.ensureGoogleReady();
  },
  beforeUnmount() {
    clearTimeout(this.debounceTimer);
  },
  methods: {
    showDialog() {
      const open = () => { this.dialogShow = true; this.$nextTick(() => this.ensureGoogleReady()); };
      this.loadGoogleScriptIfNeeded().then(open).catch(() => open());
    },
    setDialogState(value) {
      this.dialogShow = value;
    },
    closeForm() {
      this.dialogShow = false;
      this.searchText = '';
      this.predictions = [];
      this.$emit('closed');
    },

    ensureGoogleReady() {
      if (typeof window === 'undefined') return false;
      const hasImport = !!(window.google && window.google.maps && window.google.maps.importLibrary);
      // If importLibrary is already available, just init token and return
      if (hasImport) {
        if (!this.sessionToken) {
          // create session token lazily via importLibrary
          return window.google.maps.importLibrary('places').then(({ AutocompleteSessionToken }) => {
            this.sessionToken = new AutocompleteSessionToken();
            this.googleReady = true;
            return true;
          });
        }
        this.googleReady = true;
        return true;
      }

      // Inject inline bootstrap loader (best practice) if not loaded yet
      const injected = document.getElementById('gmap-inline-bootstrap');
      if (!injected) {
        const s = document.createElement('script');
        s.id = 'gmap-inline-bootstrap';
        s.type = 'text/javascript';
        s.innerHTML = `
          (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",
          q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),
          r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));
          e.set("key","${this.googleApiKey}");e.set("v","weekly");e.set("loading","async");
          a.src=\`https://maps.${'google'}apis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));
          a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));
          d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({});
        `;
        document.head.appendChild(s);
      }
      // After injection, attempt to init session token
      return new Promise((resolve) => {
        const check = async () => {
          if (window.google && window.google.maps && window.google.maps.importLibrary) {
            const { AutocompleteSessionToken } = await window.google.maps.importLibrary('places');
            this.sessionToken = new AutocompleteSessionToken();
            this.googleReady = true; resolve(true); return;
          }
          setTimeout(check, 30);
        };
        check();
      });
    },
    loadGoogleScriptIfNeeded() {
      return Promise.resolve(this.ensureGoogleReady());
    },
    onInputSearch() {
      // debounce to reduce quota
      clearTimeout(this.debounceTimer);
      if (!this.searchText || this.searchText.trim().length < 4) {
        this.predictions = [];
        return;
      }
      this.debounceTimer = setTimeout(() => {
        this.fetchPredictions(this.searchText.trim());
      }, 220);
    },
    clearSearch() {
      this.searchText = '';
      this.predictions = [];
    },
    async fetchPredictions(query) {
      const ready = await this.ensureGoogleReady();
      if (!ready) return;
      this.loadingPred = true;
      try {
        const { AutocompleteSuggestion } = await window.google.maps.importLibrary('places');
        // const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        //   input: query,
        //   language: 'id',
        //   // Prefer Indonesia; the new API uses ISO region codes
        //   includedRegionCodes: ['ID'],
        //   // Keep a tight box around Indonesia (optional but helps relevance)
        //   locationRestriction: { west: 95, south: -11, east: 141, north: 6 },
        //   // sessionToken must still be passed
        //   sessionToken: this.sessionToken,
        //   // Optionally narrow to geocode-like results (comment out if too strict)
        //   // includedPrimaryTypes: ['locality','administrative_area_level_3','administrative_area_level_2','administrative_area_level_1','postal_code','route','street_address']
        // });
        const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: query,
          language: 'id',
          includedRegionCodes: ['ID'],
          sessionToken: this.sessionToken,
          ...(this.geoFilterEnabled ? { locationRestriction: this.BATU_BOUNDS } : {})
        });

        const placeOnly = (suggestions || []).filter(s => s?.placePrediction && s.placePrediction.placeId);
        const norm = placeOnly.map((s) => ({
          raw: s,
          isPlace: true,
          placeId: s.placePrediction.placeId,
          // JS SDK: text is FormattableText; mainText/secondaryText also FormattableText
          title: s.placePrediction.text?.toString?.() || s.placePrediction.mainText?.text || '',
          subtitle: s.placePrediction.secondaryText?.text || '',
        }));
        this.predictions = norm;
      } catch (e) {
        console.error(e);
        this.predictions = [];
      } finally {
        this.loadingPred = false;
      }
    },
    async selectPrediction(pred) {
      // === Diagnostics: begin ===
      console.group('[GPlaces] selectPrediction');
      console.debug('pred raw:', pred?.raw);
      console.debug('pred.placePrediction exists:', !!pred?.raw?.placePrediction);
      // === Diagnostics: end ===

      if (!pred || !pred.raw) {
        console.warn('No prediction or raw');
        console.groupEnd();
        return;
      }
      const ready = await this.ensureGoogleReady();
      if (!ready) {
        console.warn('Google not ready');
        console.groupEnd();
        return;
      }
      console.debug('Google ready:', ready);
      try {
        // Ensure places lib is available
        try {
          await window.google.maps.importLibrary('places');
          console.debug('importLibrary(\'places\') OK');
        } catch (libErr) {
          console.error('importLibrary(\'places\') FAILED:', libErr);
          this.snackBarMessage = 'Gagal load library Places. Cek API key & koneksi.';
          this.snackbar = true;
          console.groupEnd();
          return;
        }

        // Prefer placeId stored at normalization time; fall back to raw
        const placeIdFromItem = pred?.placeId || pred?.raw?.placePrediction?.placeId || pred?.raw?.placePrediction?.id;
        console.debug('placeIdFromItem:', placeIdFromItem);

        let payload = null;

        // Path A: use JS SDK only if toPlace() is available and appears stable
        const pp = pred?.raw?.placePrediction ?? null;
        const hasToPlace = !!(pp && typeof pp.toPlace === 'function');
        console.debug('hasToPlace (SDK path):', hasToPlace);

        if (hasToPlace) {
          try {
            const place = pp.toPlace();
            console.debug('toPlace() returned:', place);
            await place.fetchFields({ fields: ['id','displayName','formattedAddress','location'] });
            const rawName = (place.displayName && (place.displayName.text || place.displayName.toString?.())) || place.displayName || '';
            const latVal = typeof place.location?.lat === 'function' ? place.location.lat() : (place.location?.lat ?? place.location?.latitude);
            const lngVal = typeof place.location?.lng === 'function' ? place.location.lng() : (place.location?.lng ?? place.location?.longitude);
            payload = {
              placeId: place.id,
              name: String(rawName || '').trim(),
              address: place.formattedAddress || '',
              lat: Number(latVal),
              lng: Number(lngVal),
              types: [],
            };
          } catch (sdkErr) {
            console.error('SDK path failed; will try REST:', sdkErr);
          }
        }

        // Path B: use REST v1 with placeId (supports CORS) if still no payload
        if (!payload) {
          if (!placeIdFromItem) {
            console.warn('No placeId on item; cannot fetch details.');
            this.snackBarMessage = 'Item tidak valid. Coba pilih item lain.';
            this.snackbar = true;
            console.groupEnd();
            return;
          }
          const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeIdFromItem)}?fields=id,displayName,formattedAddress,location&key=${encodeURIComponent(this.googleApiKey)}`;
          console.debug('REST URL (masked):', url.replace(/key=[^&]*/, 'key=***'));
          try {
            const res = await fetch(url);
            console.debug('REST status:', res.status);
            if (!res.ok) {
              console.error('REST not OK:', res.status, await res.text());
              this.snackBarMessage = 'Gagal mengambil detail tempat (REST).';
              this.snackbar = true;
              console.groupEnd();
              return;
            }
            const data = await res.json();
            const disp = data.displayName && (data.displayName.text || data.displayName.toString?.()) || data.displayName || '';
            const loc = data.location || data.latLng || {};
            const latLng = loc.latLng || loc;
            const latVal = latLng.latitude ?? latLng.lat ?? latLng.latDegrees;
            const lngVal = latLng.longitude ?? latLng.lng ?? latLng.lngDegrees;
            payload = {
              placeId: data.id,
              name: String(disp || '').trim(),
              address: data.formattedAddress || '',
              lat: Number(latVal),
              lng: Number(lngVal),
              types: [],
            };
          } catch (restErr) {
            console.error('REST fetch failed:', restErr);
            this.snackBarMessage = 'Gagal mengambil detail tempat (REST error).';
            this.snackbar = true;
            console.groupEnd();
            return;
          }
        }
        console.debug('Final payload:', payload);
        console.groupEnd();

        this.$emit('place-selected', payload);
        this.$emit('eventGooglePlacesSelect', payload);
        this.searchText = '';
        this.predictions = [];
        this.dialogShow = false;
        this.$emit('closed');
        // rotate session token after a successful details fetch
        const { AutocompleteSessionToken } = await window.google.maps.importLibrary('places');
        this.sessionToken = new AutocompleteSessionToken();
      } catch (e) {
        console.error(e);
        this.snackBarMessage = 'Gagal mengambil detail tempat';
        this.snackbar = true;
      }
    },
  },
};
</script>

<style scoped>

.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.sticky-bar { position: sticky; top: 0; z-index: 2; background: white; padding: 12px 12px 0 12px; }
.suggestion-item:hover { background: rgba(0,0,0,0.03); }

</style>