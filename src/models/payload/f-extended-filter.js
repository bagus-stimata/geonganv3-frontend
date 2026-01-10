export default class FExtendedFilter {
  constructor(
      id = 0,
      pageNo= 0,
      pageSize = 10,
      sortBy="id",
      order="DESC",
      search="",

      fdivisionIds =[],
      typeIds=[],

      fareaIds=[],

      fArticleCategIds =[],

      yearFrom = 2010,
      yearTo = 2030,
      years = [],



  ) {
    this.id = id;
    this.pageNo = pageNo;
    this.pageSize = pageSize;
    this.sortBy = sortBy;
    this.order = order;
    this.search = search;

    this.fdivisionIds = fdivisionIds;
    this.typeIds = typeIds;

    this.fareaIds = fareaIds

    this.fArticleCategIds = fArticleCategIds;

    this.yearFrom = yearFrom;
    this.yearTo = yearTo;

    this.years = years;

  }

}
