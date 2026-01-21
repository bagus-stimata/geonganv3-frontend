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
        description: 'Polyline (Garis)'
    },
    {
        id: ETipePeta.POINT,
        description: 'Point (Titik)'
    },

])
export  {ETipePeta as default, ETipePetas}