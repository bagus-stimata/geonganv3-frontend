export default class UserDetil {
  constructor(
    id,
    fdivisionBean,
    userBean,
    statusActive,

    gender,
    countryCode,
    cityCode,
    district,
    address,
    companyName,

    coCountryCode,
    coCityCode,
    coDistrict,
    coAddress,
    coDepartment,

    created,
    modified,
    modifiedBy
  ) {
    this.id = id,

        this.fdivisionBean = fdivisionBean,
        this.userBean = userBean,
        this.statusActive = statusActive,

        this.gender = gender,
        this.countryCode = countryCode,
        this.cityCode = cityCode,
        this.district = district,
        this.address = address,
        this.companyName = companyName,

        this.coCountryCode = coCountryCode,
        this.coCityCode = coCityCode,
        this.coDistrict = coDistrict,
        this.coAddress = coAddress,
        this.coDepartment = coDepartment,

        this.created = created,
        this.modified = modified,
        this.modifiedBy = modifiedBy
  }
}
