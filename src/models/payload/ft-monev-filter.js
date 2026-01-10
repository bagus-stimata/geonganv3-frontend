export default class FtMonevFilter {
  constructor(
      id = 0,
      pageNo= 0,
      pageSize = 0,
      sortBy="id",
      order="DESC",
      search="",

      fdivisionIds =[],
      enumMonevStatusIds= [],
      enumTlStatusIds=[],
      dateFrom =new Date(),
      dateTo =new Date(),
) {
    this.id = id;
    this.pageNo = pageNo;
    this.pageSize = pageSize;
    this.sortBy = sortBy;
    this.order = order;
    this.search = search;

    this.fdivisionIds = fdivisionIds;
    this.enumMonevStatusIds = enumMonevStatusIds;
    this.enumTlStatusIds = enumTlStatusIds;
    this.dateFrom = dateFrom;
    this.dateTo = dateTo;
  }

}
