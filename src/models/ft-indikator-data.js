export default class FtIndikatorData {
  constructor(
    id,
    findikatorBean,
    ftDataBean,
    tahun,
    nilai,

    created,
    modified,
    modifiedBy
  ) {
    this.id = id;
    this.findikatorBean = findikatorBean;
    this.ftDataBean = ftDataBean;
    this.tahun = tahun;
    this.nilai = nilai;

    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }
}
