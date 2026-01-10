export default class FIndikator {
  constructor(
    id,
    kode1,
    description,
    fsatuanBean,
    sdgsGroup,
    fsektorBean,
    fdivisionBean,
    sektoral = false,
    dda = false,
    iki = false,
    sdgs = false,
    spm = false,

    listFindikatorData = [],

    created,
    modified,
    modifiedBy
  ) {
    this.id = id;
    this.kode1 = kode1;
    this.description = description;
    this.fsatuanBean = fsatuanBean;
    this.sdgsGroup = sdgsGroup;
    this.fsektorBean = fsektorBean;
    this.fdivisionBean = fdivisionBean;
    this.sektoral = sektoral;
    this.dda = dda;
    this.iki = iki;
    this.sdgs = sdgs;
    this.spm = spm;

    this.listFindikatorData = listFindikatorData;

    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }
}
