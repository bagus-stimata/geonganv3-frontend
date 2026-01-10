export default class FSubArea {
  constructor(
    id= 0,
    kode1 ="",
    kode2 ="",
    description ="",
    alias1 ="",

    fareaBean =0,
    statusActive=true,
    zipCode ="",

    lat =0.0,
    lon =0.0,

    created,
    modified,
    modifiedBy
  ) {
    this.id = id;
    this.kode1 = kode1;
    this.kode2 =kode2;
    this.description = description;
    this.alias1 = alias1;

    this.statusActive = statusActive;
    this.fareaBean = fareaBean;
    this.zipCode = zipCode;

    this.lat = lat;
    this.lon = lon;

    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }

}
