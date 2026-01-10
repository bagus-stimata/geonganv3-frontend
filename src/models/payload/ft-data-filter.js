export default class FtDataFilter {
  constructor(
      id = 0,
      pageNo= 0,
      pageSize = 0,
      sortBy="id",
      order="DESC",
      search="",

      listIds = [],
      fdivisionIds =[],
      fareaIds= [],
      kelompokDataBeanIds=[],
      statusDataIds =[],

      periodeTahunIds = [],

      periodeTahun = 0,
      periodeBulan = 0,

      trDateFrom= new Date(),
      trDateTo = new Date(),

      isSektoral = false,
      isDda = false,
      isIki = false,
      isSdgs = false,
      isSpm = false,

      showHome= false,


) {
    this.id = id;
    this.pageNo = pageNo;
    this.pageSize = pageSize;
    this.sortBy = sortBy;
    this.order = order;
    this.search = search;

    this.listIds = listIds;
    this.fdivisionIds = fdivisionIds;
    this.fareaIds = fareaIds;
    this.kelompokDataBeanIds = kelompokDataBeanIds;
    this.statusDataIds = statusDataIds;

    this.periodeTahunIds = periodeTahunIds;

    this.periodeTahun = periodeTahun;
    this.periodeBulan = periodeBulan;

    this.trDateFrom = trDateFrom;
    this.trDateTo = trDateTo;

    this.isSektoral = isSektoral;
    this.isDda = isDda;
    this.isIki = isIki;
    this.isSdgs = isSdgs;
    this.isSpm = isSpm;

    this.showHome = showHome;

  }

}
