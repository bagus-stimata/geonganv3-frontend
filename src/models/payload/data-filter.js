export default class DataFilter {
  constructor(
      id = 0,
      pageNo= 0,
      pageSize = 0,
      sortBy="id",
      order="DESC",
      search="",

      fdivisionIds =[],
      ftopikIds= [],
      fsoalIds=[],
      ftTesIds=[],
      ftTesSoalIds =[],
) {
    this.id = id;
    this.pageNo = pageNo;
    this.pageSize = pageSize;
    this.sortBy = sortBy;
    this.order = order;
    this.search = search;

    this.fdivisionIds = fdivisionIds;
    this.ftopikIds = ftopikIds;
    this.fsoalIds = fsoalIds;
    this.ftTesIds = ftTesIds;
    this.ftTesSoalIds = ftTesSoalIds;
  }

}
