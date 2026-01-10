export const secretKey = {
  namespaced: true,
  state: {
    hashSecretKey: 'DESGREEN#1',
    googleApiKey: 'AIzaSyD2vhXA1FTKx75AnUF82Y4Rr6qXPnX_Lnk',

  },
  actions: {
    updateSecretKey({ commit }, payload) {
      commit("mutateSecretKey", payload);
    },
    updateGoogleApiKey({ commit }, payload) {
      commit("mutateGoogleApiKey", payload);
    }
  },
  mutations: {
    mutateSecretKey(state, payLoad){
      state.hashSecretKey = payLoad
    },
    mutateGoogleApiKey(state, payLoad){
      state.googleApiKey = payLoad
    }

  },

}
