export default class FDivision {
  constructor(
    id,
    kode1,
    description,
    fcompanyBean,
    statusActive = true,

    created,
    modified,
    modifiedBy
  ) {
    this.id = id;
    this.kode1 = kode1;
    this.description = description;
    this.statusActive = statusActive;
    this.fcompanyBean = fcompanyBean;
    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }

}
