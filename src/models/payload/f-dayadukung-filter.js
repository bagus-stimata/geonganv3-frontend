export default class FDayaDukungFilter {
  constructor(
      id = 0,
      pageNo= 0,
      pageSize = 0,
      sortBy="id",
      order="DESC",
      search="",

      city="",

      fdivisionIds =[],
      fareaIds = [],
      fdayaDukungTypeIds=[]

  ) {
    this.id = id;
    this.pageNo = pageNo;
    this.pageSize = pageSize;
    this.sortBy = sortBy;
    this.order = order;
    this.search = search;

    this.city = city;

    this.fdivisionIds = fdivisionIds;
    this.fareaIds = fareaIds;
    this.fdayaDukungTypeIds = fdayaDukungTypeIds;
  }

}
