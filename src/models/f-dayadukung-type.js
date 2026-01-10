export default class FDayaDukungTypeType {
  constructor(
    id,
    kode1,
    description,
    fdivisionBean,
    statusActive,
    avatarImage,
    markerImage1,

    created,
    modified,
    modifiedBy
  ) {
    this.id = id;
    this.kode1 = kode1;
    this.description = description;
    this.statusActive = statusActive;
    this.fdivisionBean = fdivisionBean;
    this.avatarImage = avatarImage;
    this.markerImage1 = markerImage1;

    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }

}
