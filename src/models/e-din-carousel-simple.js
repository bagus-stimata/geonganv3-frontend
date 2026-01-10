const EDinCarouselSimple = Object.freeze({
    HOME : 1,
    PEMUDA_DESA: 2,
    DESA_CANTIK: 3,
})
const EDinCarouselSimples = Object.freeze([
    {
        id: EDinCarouselSimple.HOME,
        description: 'HOME'
    },
    {
        id: EDinCarouselSimple.PEMUDA_DESA,
        description: 'PEMUDA DESA'
    },
    {
        id: EDinCarouselSimple.DESA_CANTIK,
        description: 'DESA CANTIK'
    },

])
export  {EDinCarouselSimple as default, EDinCarouselSimples}