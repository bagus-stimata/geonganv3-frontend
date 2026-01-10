export default class FNews {
  constructor(
    id,
    fdivisionBean,

    title,
    contentMeta,
    contentBody,

    coverImage,

    typeNews,

    rating,
    viewer,
    showOnHome=false,
    showOnPemudaDesa=false,
    showOnDesaCantik=false,
    flagExposed=true,
    flagChecked1=false,
    flagChecked2=false,

    dateFrom,
    dateTo,

    created,
    modified,
    modifiedBy
  ) {

    this.id = id;
    this.fdivisionBean = fdivisionBean;

    this.title = title;
    this.contentMeta = contentMeta;
    this.contentBody = contentBody;

    this.coverImage = coverImage;

    this.typeNews = typeNews;

    this.rating = rating;
    this.viewer = viewer;
    this.showOnHome = showOnHome;
    this.showOnPemudaDesa = showOnPemudaDesa;
    this.showOnDesaCantik = showOnDesaCantik;
    this.flagExposed = flagExposed;
    this.flagChecked1 = flagChecked1;
    this.flagChecked2 = flagChecked2;

    this.dateFrom = dateFrom;
    this.dateTo = dateTo;

    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }

}
