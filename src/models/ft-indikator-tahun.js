export default class FtIndikatorTahun {
  constructor(
    id,
    findikatorBean,
    tahun,
    nilai,

    created,
    modified,
    modifiedBy
  ) {
    this.id = id;
    this.findikatorBean = findikatorBean;
    this.tahun = tahun;
    this.nilai = nilai;

    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }
}
