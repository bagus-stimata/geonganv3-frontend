export default class FNews {
  constructor(
    id,
    fdivisionBean,

    title,
    contentMeta,
    contentBody,
    categ,

    coverImage,

    typeNews,

    rating,
    viewer,
    flagExposed=true,
    flagChecked1=false,
    flagChecked2=false,

    publishTime,
    editorial,
    nomorUrut,

    created,
    modified,
    modifiedBy
  ) {

    this.id = id;
    this.fdivisionBean = fdivisionBean;

    this.title = title;
    this.contentMeta = contentMeta;
    this.contentBody = contentBody;
    this.categ = categ;

    this.coverImage = coverImage;

    this.typeNews = typeNews;

    this.rating = rating;
    this.viewer = viewer;
    this.flagExposed = flagExposed;
    this.flagChecked1 = flagChecked1;
    this.flagChecked2 = flagChecked2;

    this.publishTime = publishTime;
    this.editorial = editorial;
    this.nomorUrut = nomorUrut;

    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }

}
