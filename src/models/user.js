export default class User {
  constructor(username, email, password, isAccountNonLocked = true, fdivisionBean, roles, organizationLevel,
              phone, countryCode, avatarImage, birthDate, fullName) {
    this.username = username;
    this.email = email;
    this.password = password;

    this.isAccountNonLocked = isAccountNonLocked;
    this.fdivisionBean = fdivisionBean;
    this.roles = roles;
    this.organizationLevel = organizationLevel;
    this.phone = phone;
    this.countryCode = countryCode;
    this.avatarImage = avatarImage;
    this.birthDate = birthDate;

    this.fullName = fullName;

  }
}
