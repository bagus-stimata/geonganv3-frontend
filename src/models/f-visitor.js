export default class FVisitor {
  constructor(
    id,
    kode1,
    description,
    fdivisionBean=0,

    province,
    country,
    logDate,
    visitorCount
  ) {
    this.id = id;
    this.kode1 = kode1;
    this.description = description;
    this.fdivisionBean = fdivisionBean;

    this.province = province;
    this.country = country;
    this.logDate = logDate;
    this.visitorCount = visitorCount;
  }

}
