import { createStore } from 'vuex'
import { auth } from './auth-module'
import { helperModule } from './helper-module'
import {secretKey} from "@/store/secret-key";
import {potensi} from "@/store/potensi-module";
export default createStore({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    auth,
    helperModule,
    secretKey,
    potensi
  }
})
