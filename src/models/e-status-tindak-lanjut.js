const EStatusTl = Object.freeze({
    MENUNGGU_TL: 0,
    REKOM_TL: 1,
    ON_PROCESS: 2,
    SUDAH_TL: 3,
    VALIDATED: 4,
})

const EStatusTls = Object.freeze([
    {
        id: EStatusTl.MENUNGGU_TL,
        description: 'Menunggu Rekom TL'
    },
    {
        id: EStatusTl.REKOM_TL,
        description: 'Rekomendasi TL'
    },
    {
        id: EStatusTl.ON_PROCESS,
        description: 'On Process'
    },
    {
        id: EStatusTl.SUDAH_TL,
        description: 'Sudah TL'
    },
    {
        id: EStatusTl.VALIDATED,
        description: 'Tervalidasi'
    },

])
export {EStatusTl as default, EStatusTls}