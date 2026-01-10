export default class FtDataDetil {
  constructor(
    id,
    ftDataBean,
    columnIndex,
    ftDataHeaderBean,

    rowIndex,
    valDouble,
    valString,
    valInt,
    valGeoJson,
    fareaBean,
    fsubAreaBean,

    created,
    modified,
    modifiedBy
  ) {
    this.id = id;
    this.ftDataBean = ftDataBean;
    this.columnIndex = columnIndex;
    this.ftDataHeaderBean = ftDataHeaderBean;

    this.rowIndex = rowIndex;
    this.valDouble = valDouble;
    this.valString = valString;
    this.valInt = valInt;
    this.valGeoJson = valGeoJson;
    this.fareaBean = fareaBean;
    this.fsubAreaBean = fsubAreaBean;

    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }
}
