const ETipePeta = Object.freeze({
    POLYGON : 0,
    POLYLINE : 1,
    POINT: 2,
})
const ETipePetas = Object.freeze([
    {
        id: ETipePeta.POLYGON,
        description: 'Polygon (Area)'
    },
    {
        id: ETipePeta.POLYLINE,
        description: 'Polyline (Garis: jaringan jalan, jaringan sungai etc)'
    },
    {
        id: ETipePeta.POINT,
        description: 'Point (Titik Koordinat)'
    },

])
export  {ETipePeta as default, ETipePetas}