

export const potensi = {
  namespaced: true,
  state: {
    showMenuBar: true,
    centerMap: {
      id: 0,
        coordinates: [-7.6051, 111.9035],
    },



    itemModified: {},
    itemsFPotensi: [],
    itemsFPotensiMarker: [],
    itemsFSectorType: [],
    itemsFKomoditiType: [],
    itemsFArea: [],
    itemsFSubArea: [],
    itemsFSatuan: [],

    itemsFInfrastructureType: [],
    itemsFInfrastructure: [],
    itemsFInfrastructureFiltered: [],
    itemsFDayaDukungType: [],

    itemsFDayaDukung: [],
    itemsFKomoditi: [],

    countBandara: 0,
    countPelabuhan: 0,
    countSaranaPendidikan: 0,
    countHotel: 0,
    countRumahSakit: 0,
    countWisata: 0,
    countPasar: 0,

    bandaraShow: false,
    pelabuhanShow: false,
    pendidikanShow: false,
    hotelShow: false,
    rumahSakitShow: false,
    wisataShow: false,
    pasarShow: false,

    komoditiShow: false,
    komoditiTypeSelected: "",
  },
  actions: {
    updateShowMenuBar({ commit }, payload) {
      commit("mutateShowMenuBar", payload);
    },
    updateItemModified({ commit }, payload) {
      commit("mutateItemModified", payload);
    },

    updateItemsFPotensi({ commit }, payload) {
      commit("mutateItemsFPotensi", payload);
    },
    updateItemsFPotensiMarker({ commit }, payload) {
      commit("mutateItemsFPotensiMarker", payload);
    },

    updateItemsFSectorType({ commit }, payload) {
      commit("mutateItemsFSectorType", payload);
    },
    updateItemsFKomoditiType({ commit }, payload) {
      commit("mutateItemsFKomoditiType", payload);
    },
    updateItemsFArea({ commit }, payload) {
      commit("mutateItemsFArea", payload);
    },
    updateItemsFSubArea({ commit }, payload) {
      commit("mutateItemsFSubArea", payload);
    },
    updateItemsFSatuan({ commit }, payload) {
      commit("mutateItemsFSatuan", payload);
    },

    updateItemsFInfrastructureType({ commit }, payload) {
      commit("mutateItemsFInfrastructureType", payload);
    },
    updateItemsFInfrastructure({ commit }, payload) {
      commit("mutateItemsFInfrastructure", payload);
    },
    updateItemsFInfrastructureFiltered({ commit }, payload) {
      commit("mutateItemsFInfrastructureFiltered", payload);
    },

    updateItemsFDayaDukungType({ commit }, payload) {
      commit("mutateItemsFDayaDukungType", payload);
    },
    updateItemsFDayaDukung({ commit }, payload) {
      commit("mutateItemsFDayaDukung", payload);
    },
    updateItemsFKomoditi({ commit }, payload) {
      commit("mutateItemsFKomoditi", payload);
    },

    updateBandaraShow({ commit }, payload) {
      commit("mutateBandaraShow", payload);
    },
    updatePelabuhanShow({ commit }, payload) {
      commit("mutatePelabuhanShow", payload);
    },
    updatePendidikanShow({ commit }, payload) {
      commit("mutatePendidikanShow", payload);
    },
    updateHotelShow({ commit }, payload) {
      commit("mutateHotelShow", payload);
    },
    updateRumahSakitShow({ commit }, payload) {
      commit("mutateRumahSakitShow", payload);
    },
    updateWisataShow({ commit }, payload) {
      commit("mutateWisataShow", payload);
    },
    updatePasarShow({ commit }, payload) {
      commit("mutatePasarShow", payload);
    },
    updateKomoditiShow({ commit }, payload) {
      commit("mutateKomoditiShow", payload);
    },

    updateKomoditiTypeSelected({ commit }, payload) {
      commit("mutateKomoditiTypeSelected", payload);
    },
  },
  mutations: {
    mutateShowMenuBar(state, payLoad) {
      state.showMenuBar = payLoad;
    },
    mutateItemModified(state, payLoad) {
      state.itemModified = payLoad;
    },
    mutateItemsFPotensi(state, payLoad) {
      state.itemsFPotensi = payLoad;
    },
    mutateItemsFPotensiMarker(state, payLoad) {
      state.itemsFPotensiMarker = payLoad;
    },
    mutateItemsFSectorType(state, payLoad) {
      state.itemsFSectorType = payLoad;
    },
    mutateItemsFKomoditiType(state, payLoad) {
      state.itemsFKomoditiType = payLoad;
    },
    mutateItemsFArea(state, payLoad) {
      state.itemsFArea = payLoad;
    },
    mutateItemsFSubArea(state, payLoad) {
      state.itemsFSubArea = payLoad;
    },
    mutateItemsFSatuan(state, payLoad) {
      state.itemsFSatuan = payLoad;
    },

    mutateItemsFInfrastructureType(state, payLoad) {
      state.itemsFInfrastructureType = payLoad;
    },
    mutateItemsFInfrastructure(state, payLoad) {
      state.itemsFInfrastructure = payLoad;
    },
    mutateItemsFInfrastructureFiltered(state, payLoad) {
      state.itemsFInfrastructureFiltered = payLoad;
    },

    mutateItemsFDayaDukungType(state, payLoad) {
      state.itemsFDayaDukungType = payLoad;
    },
    mutateItemsFDayaDukung(state, payLoad) {
      state.itemsFDayaDukung = payLoad;
    },
    mutateItemsFKomoditi(state, payLoad) {
      state.itemsFKomoditi = payLoad;
    },

    mutateBandaraShow(state, payLoad) {
      state.bandaraShow = payLoad;
    },
    mutatePelabuhanShow(state, payLoad) {
      state.pelabuhanShow = payLoad;
    },
    mutatePendidikanShow(state, payLoad) {
      state.pendidikanShow = payLoad;
    },
    mutateHotelShow(state, payLoad) {
      state.hotelShow = payLoad;
    },
    mutateRumahSakitShow(state, payLoad) {
      state.rumahSakitShow = payLoad;
    },
    mutateWisataShow(state, payLoad) {
      state.wisataShow = payLoad;
    },
    mutatePasarShow(state, payLoad) {
      state.pasarShow = payLoad;
    },
    mutateKomoditiShow(state, payLoad) {
      state.komoditiShow = payLoad;
    },

    mutateKomoditiTypeSelected(state, payLoad) {
      state.komoditiTypeSelected = payLoad;
    },
  },
};
