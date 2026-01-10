import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import store from './store'
import 'leaflet/dist/leaflet.css';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
// import './registerServiceWorker'
// import 'primevue/resources/themes/saga-blue/theme.css';  // Import theme
// import 'primevue/resources/primevue.min.css';  // Import core styles
// import 'primeicons/primeicons.css';  // Import icons

loadFonts()

createApp(App).use(store)
  .use(router)
  .use(vuetify)
  .use(PrimeVue, {
    theme: {
        preset: Aura
    }
  })
  .mount('#app')
