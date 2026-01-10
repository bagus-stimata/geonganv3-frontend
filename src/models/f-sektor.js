export default class FSektor {
  constructor(
    id,
    kode1,
    description,
    fdivisionBean,
    statusActive,
    avatarImage,

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

    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }

}
