export default class FtDataHeader {
  constructor(
    id,
    ftDataBean,
    columnIndex,
    columnTitle,
    dataType,
    width,

    created,
    modified,
    modifiedBy
  ) {
    this.id = id;
    this.ftDataBean = ftDataBean;
    this.columnIndex = columnIndex;
    this.columnTitle = columnTitle;
    this.dataType = dataType;
    this.width = width;

    this.created = created;
    this.modified = modified;
    this.modifiedBy = modifiedBy;
  }
}
