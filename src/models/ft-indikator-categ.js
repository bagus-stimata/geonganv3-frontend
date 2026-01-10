export default class FtIndikatorCateg {
  constructor(
    id,
    findikatorBean,
    fcategBean,

    created,
    modified,
    modifiedBy
  ) {
    this.id = id;
    this.findikatorBean = findikatorBean;
    this.fcategBean = fcategBean;

    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }
}
