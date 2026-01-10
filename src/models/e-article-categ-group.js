const EArticleCategGroup = Object.freeze({
    DATA_PERENCANAAN : 1,
    PRODUK_HUKUM : 2,
    DATA_INFORMASI_LAIN: 3,
})
const EArticleCategGroups = Object.freeze([
    {
        id: EArticleCategGroup.DATA_PERENCANAAN,
        description: 'Dokumen Perencanaan'
    },
    {
        id: EArticleCategGroup.PRODUK_HUKUM,
        description: 'Produk Hukum'
    },
    {
        id: EArticleCategGroup.DATA_INFORMASI_LAIN,
        description: 'Data dan Informasi Lainnya'
    },

])
export  {EArticleCategGroup as default, EArticleCategGroups}