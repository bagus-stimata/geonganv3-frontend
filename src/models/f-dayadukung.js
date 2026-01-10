export default class FDayaDukung {
  constructor(
    id,
    kode1,
    description ,
    fdivisionBean,
    statusActive =true,
    baseId,
    lang,

    fdayaDukungTypeBean,

    fareaBean,
    tahun,
    lat=0.0,
    lon=0.0,
    notes = "",

    nilai1 = 0.0,
    nilai2 = 0.0,
    nilai3 = 0.0,
    nilai4 = 0.0,
    nilai5 = 0.0,

    nilaiInt1 = 0,
    nilaiInt2 = 0,

    city ="",

    showToPublic  =true,
    showToMap  =false,
    /**
     * GeoJSON PolyLine
     * GeoJSON Line
     * GeoJSON Point (Koordinat)
     * SHP PolyLine
     * SHP Line
     * SHP Point (Koordinat)
     */
    fileType  ="",
    fileNameLow = "",
    fileNameHigh = "",
    fileSize  =0,
    autoColor  =true,
    color1  ="",
    color2  ="",
    selected  =false,

    created,
    modified,
    modifiedBy
  ) {
    this.id = id;
    this.kode1 = kode1;
    this.description = description;
    this.statusActive = statusActive;
    this.fdivisionBean = fdivisionBean;
    this.statusActive = statusActive;
    this.baseId = baseId;
    this.lang = lang;

    this.fdayaDukungTypeBean = fdayaDukungTypeBean;
    this.fareaBean = fareaBean;
    this.tahun = tahun;
    this.lat = lat;
    this.lon = lon;
    this.notes = notes;

    this.nilai1 = nilai1;
    this.nilai2 = nilai2;
    this.nilai3 = nilai3;
    this.nilai4 = nilai4;
    this.nilai5 = nilai5;

    this.nilaiInt1 = nilaiInt1;
    this.nilaiInt2 = nilaiInt2;

    this.city = city;

    this.showToPublic = showToPublic;
    this.showToMap = showToMap;
    this.fileType = fileType;
    this.fileNameLow = fileNameLow;
    this.fileNameHigh = fileNameHigh;
    this.fileSize = fileSize;
    this.autoColor = autoColor;
    this.color1 = color1;
    this.color2 = color2;
    this.selected = selected;

    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }

}
