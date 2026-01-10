export default class FRegion {
  constructor(
    id,
    kode1,
    description,
    fdivisionBean,
    statusActive=true,

    created,
    modified,
    modifiedBy
  ) {
    this.id = id;
    this.kode1 = kode1;
    this.description = description;
    this.statusActive = statusActive;
    this.fdivisionBean = fdivisionBean;
    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }

}
