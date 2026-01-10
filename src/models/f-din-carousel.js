export default class FDinCarousel {
  constructor(
    id,
    kode1="",
    description ="",
    avatarImage ="",
    fdivisionBean,
    statusActive =true,
    notes ="",

    fdinCarouselTypeBean,
    
  ) {
    this.id = id;
    this.kode1 = kode1;
    this.description = description;
    this.avatarImage = avatarImage;
    this.statusActive = statusActive;
    this.fdivisionBean = fdivisionBean;
    this.statusActive = statusActive;
    this.fdinCarouselTypeBean = fdinCarouselTypeBean;
    this.notes = notes;
  }

}
