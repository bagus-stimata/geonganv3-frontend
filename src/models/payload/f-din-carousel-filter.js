export default class FDinCarouselFilter {
  constructor(
      id = 0,
      pageNo= 0,
      pageSize = 0,
      sortBy="id",
      order="DESC",
      search="",

      fdivisionIds =[],
      fdinCarouselTypeIds = [],

  ) {
    this.id = id;
    this.pageNo = pageNo;
    this.pageSize = pageSize;
    this.sortBy = sortBy;
    this.order = order;
    this.search = search;

    this.fdivisionIds = fdivisionIds;
    this.fdinCarouselTypeIds = fdinCarouselTypeIds;
  }

}
