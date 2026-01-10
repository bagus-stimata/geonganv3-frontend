export default class FArea {
  constructor(
    id,
    kode1,
    description,
    avatarImage,
    markerImage1,
    alias1,

    fdivisionBean,
    fregionBean,
    statusActive = true,

    lat,
    lon,

    created,
    modified,
    modifiedBy
  ) {
    this.id = id;
    this.kode1 = kode1;
    this.description = description;
    this.avatarImage = avatarImage;
    this.markerImage1 = markerImage1;
    this.alias1 = alias1;

    this.statusActive = statusActive;
    this.fregionBean = fregionBean;
    this.fdivisionBean = fdivisionBean;

    this.lat = lat;
    this.lon = lon;

    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }
}
