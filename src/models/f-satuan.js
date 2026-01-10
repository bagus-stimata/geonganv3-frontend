export default class FSatuan {
  constructor(
    id,
    kode1,
    description,
    statusActive=true,
    baseId,
    lang,

    created,
    modified,
    modifiedBy
  ) {
    this.id = id;
    this.kode1 = kode1;
    this.description = description;
    this.statusActive = statusActive;
    this.baseId = baseId;
    this.lang = lang;


    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }

}
