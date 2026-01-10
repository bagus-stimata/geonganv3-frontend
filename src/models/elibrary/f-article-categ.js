export default class FArticleCateg {
  constructor(
    id,
    kode1,
    description,
    statusActive = true,
    fdivisionBean,
    articleCategGroup,

  ) {
    this.id = id;
    this.kode1 = kode1;
    this.description = description;
    this.statusActive = statusActive;
    this.fdivisionBean = fdivisionBean;
    this.articleCategGroup = articleCategGroup;

  }
}
