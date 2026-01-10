export default class FtIndikatorTahunData {
  constructor(
    id,
    ftIndikatorTahunBean,
    ftDataBean,

    created,
    modified,
    modifiedBy
  ) {
    this.id = id;
    this.ftIndikatorTahunBean = ftIndikatorTahunBean;
    this.ftDataBean = ftDataBean;

    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }
}
