export default class FArticle {
  constructor(
    id,
    kode1,
    description,
    avatarImage,
    statusActive= true,
    fdivisionBean,

    fileName,
    fileType,
    farticleCategBean,
    articleCategGroup,
    authors,

    notes,
    publicationDate,
    publisher,

    volume,
    issues,
    pages,
    doi,
    viewCount,
    downloadCount

  ) {
    this.id = id;
    this.kode1 = kode1;
    this.description = description;
    this.avatarImage = avatarImage;
    this.statusActive = statusActive;
    this.fdivisionBean = fdivisionBean;

    this.fileName = fileName;
    this.fileType = fileType;
    this.farticleCategBean = farticleCategBean;
    this.articleCategGroup = articleCategGroup;
    this.authors = authors;

    this.notes = notes;
    this.publicationDate = publicationDate;
    this.publisher = publisher;

    this.volume = volume;
    this.issues = issues;
    this.pages = pages;
    this.doi = doi;
    this.viewCount = viewCount;
    this.downloadCount = downloadCount;

  }
}
