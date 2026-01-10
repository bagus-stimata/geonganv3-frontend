export default class FtData {
  constructor(
    id,
    kode1,
    description,
    avatarImage,
    tahun,
    fdivisionBean,

    listFtDataHeader = [],
    listFtDataDetil =[],

    created,
    modified,
    modifiedBy
  ) {
    this.id = id;
    this.kode1 = kode1;
    this.description = description;
    this.avatarImage = avatarImage;
    this.tahun = tahun;
    this.fdivisionBean = fdivisionBean;

    this.listFtDataHeader = listFtDataHeader;
    this.listFtDataDetil = listFtDataDetil;

    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }
}
