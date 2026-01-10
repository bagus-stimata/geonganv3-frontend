
export const helperModule = {
  namespaced: true,
  state: {
    itemModified: {},
    itemDefault: {},

    sumOfItem: 9999999,

  },
  actions: {
    updateItemModified({ commit }, payload) {
      commit("mutateItemModified", payload);
    },
    updateItemDefault({ commit }, payload) {
      commit("mutateItemDefault", payload);
    },
    setSumOfItem({commit}, payload){
      commit('mutateSumOfItem', payload)
    },
  },
  mutations: {
    mutateItemModified(state, payLoad){
      state.itemModified = payLoad
    },
    mutateItemDefault(state, payLoad){
      state.itemDefault = payLoad
    },
    mutateSumOfItem(state, payLoad){
      state.sumOfItem = payLoad
    },

  },

}
