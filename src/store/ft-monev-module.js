import FtMonev from "@/models/ft-monev";
import FtMonevPelanggaran from "@/models/ft-monev-pelanggaran";

export const FtMonevModule = {
  namespaced: true,
  state: {
    itemModifiedFtMonev: new FtMonev(),
    itemDefaultFtMonev: Object,
    itemDetilModifiedFtMonev: Object,
    itemDetilDefaultFtMonev: Object,
    itemDetilModifiedFtMonevPelanggaran: new FtMonevPelanggaran(),
    itemDetilDefaultFtMonevPelanggaran: Object,
    formModeFtMonev: String,
    formModeFtMonevPerson: String,
    formModeFtMonevPelanggaran: String,
    itemsFDivision: [],
    itemsFPegawai: [],
    itemsFJenisPelanggaran: [],
    itemsFJenisIzin: [],
    itemsFSubArea: [],
    itemsFPermitBank: [],
    itemsFMonevType: [],
    isAddNewPegawai: false,
    isAddNewJenisPelanggaran: false,
    centerMap: {
        id: 0,
        coordinates: [-7.6051, 111.9035],
    },
  },
  actions: {
    updateItemModifiedFtMonev({ commit }, payload) {
      commit("mutateItemModifiedFtMonev", payload);
    },
    updateItemDefaultFtMonev({ commit }, payload) {
      commit("mutateItemDefaultFtMonev", payload);
    },
    updateItemDetilModifiedFtMonev({ commit }, payload) {
      commit("mutateItemDetilModifiedFtMonev", payload);
    },
    updateItemDetilDefaultFtMonev({ commit }, payload) {
      commit("mutateItemDetilDefaultFtMonev", payload);
    },
    updateItemDetilModifiedFtMonevPelanggaran({ commit }, payload) {
      commit("mutateItemDetilModifiedFtMonevPelanggaran", payload);
    },
    updateItemDetilDefaultFtMonevPelanggaran({ commit }, payload) {
      commit("mutateItemDetilDefaultFtMonevPelanggaran", payload);
    },
    updateFormModeFtMonev({ commit }, payload) {
      commit("mutateFormModeFtMonev", payload);
    },
    updateFormModeFtMonevPerson({ commit }, payload) {
      commit("mutateFormModeFtMonevPerson", payload);
    },
    updateFormModeFtMonevPelanggaran({ commit }, payload) {
      commit("mutateFormModeFtMonevPelanggaran", payload);
    },
    updateItemsFDivision({ commit }, payload) {
      commit("mutateItemsFDivision", payload);
    },
    updateItemsFPegawai({ commit }, payload) {
      commit("mutateItemsFPegawai", payload);
    },
    updateItemsFJenisPelanggaran({ commit }, payload) {
      commit("mutateItemsFJenisPelanggaran", payload);
    },
    updateItemsFJenisIzin({ commit }, payload) {
      commit("mutateItemsFJenisIzin", payload);
    },
    updateItemsFSubArea({ commit }, payload) {
      commit("mutateItemsFSubArea", payload);
    },
    updateItemsFPermitBank({ commit }, payload) {
      commit("mutateItemsFPermitBank", payload);
    },
    updateItemsFMonevType({ commit }, payload) {
      commit("mutateItemsFMonevType", payload);
    },
    updateIsAddNewPegawai({ commit }, payload) {
      commit("mutateIsAddNewPegawai", payload);
    },
    updateIsAddNewJenisPelanggaran({ commit }, payload) {
      commit("mutateIsAddNewJenisPelanggaran", payload);
    },
  },

  mutations: {
    mutateItemModifiedFtMonev(state, payLoad) {
      state.itemModifiedFtMonev = payLoad;
    },
    mutateItemDefaultFtMonev(state, payLoad) {
      state.itemDefaultFtMonev = payLoad;
    },
    mutateItemDetilModifiedFtMonev(state, payLoad) {
      state.itemDetilModifiedFtMonev = payLoad;
    },
    mutateItemDetilDefaultFtMonev(state, payLoad) {
      state.itemDetilDefaultFtMonev = payLoad;
    },
    mutateItemDetilModifiedFtMonevPelanggaran(state, payLoad) {
      state.itemDetilModifiedFtMonevPelanggaran = payLoad;
    },
    mutateItemDetilDefaultFtMonevPelanggaran(state, payLoad) {
      state.itemDetilDefaultFtMonevPelanggaran = payLoad;
    },
    mutateFormModeFtMonev(state, payLoad) {
      state.formModeFtMonev = payLoad;
    },
    mutateFormModeFtMonevPerson(state, payLoad) {
      state.formModeFtMonevPerson = payLoad;
    },
    mutateFormModeFtMonevPelanggaran(state, payLoad) {
      state.formModeFtMonevPelanggaran = payLoad;
    },
    mutateItemsFDivision(state, payLoad) {
      state.itemsFDivision = payLoad;
    },
    mutateItemsFPegawai(state, payLoad) {
      state.itemsFPegawai = payLoad;
    },
    mutateItemsFJenisPelanggaran(state, payLoad) {
      state.itemsFJenisPelanggaran = payLoad;
    },
    mutateItemsFJenisIzin(state, payLoad) {
      state.itemsFJenisIzin = payLoad;
    },
    mutateItemsFPermitBank(state, payLoad) {
      state.itemsFPermitBank = payLoad;
    },
    mutateItemsFMonevType(state, payLoad) {
      state.itemsFMonevType = payLoad;
    },
    mutateItemsFSubArea(state, payLoad) {
      state.itemsFSubArea = payLoad;
    },
    mutateIsAddNewPegawai(state, payLoad) {
      state.isAddNewPegawai = payLoad;
    },
    mutateIsAddNewJenisPelanggaran(state, payLoad) {
      state.isAddNewJenisPelanggaran = payLoad;
    },
   
  },
};
