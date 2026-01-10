// src/models/e-data-spa-type.js
export const EnumDataSpaType = Object.freeze({
    GEOJSON: { code: "GEOJSON", description: "GEOJSON" },
    GEOMETRY_WKT: { code: "GEOMETRY_WKT", description: "GEOMETRY_WKT" },
    POSTGIS_GEOMETRY: { code: "POSTGIS_GEOMETRY", description: "POSTGIS_GEOMETRY" },
    POSTGIS_TABLE: { code: "POSTGIS_TABLE", description: "POSTGIS_TABLE" },
    CSV_POINT: { code: "CSV_POINT", description: "CSV_POINT" },
    RASTER: { code: "RASTER", description: "RASTER" }
});

export const EnumDataSpaTypeList = Object.values(EnumDataSpaType);