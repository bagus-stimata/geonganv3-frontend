export default class FCompany {
  constructor(
    id,
    kode1,
    description,
    statusActive = true,

    created,
    modified,
    modifiedBy
  ) {
    this.id = id;
    this.kode1 = kode1;
    this.description = description;
    this.statusActive = statusActive;
    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }

}
