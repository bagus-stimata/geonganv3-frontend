export default class FCountry {
  constructor(
    id,
    kode1,
    description,
    fdivisionBean,
    statusActive=true,
    countryCode

  ) {
    this.id = id;
    this.kode1 = kode1;
    this.description = description;
    this.statusActive = statusActive;
    this.fdivisionBean = fdivisionBean;
    this.countryCode = countryCode
  }

}
