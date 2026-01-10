export default class FtMonevFile {
  constructor(
    id,
    ftMonevBean,
    fileName,
    description,
    jenis,
    /**
     * FILE
     * IMAGE
     * VIDEO
     * SPACIAL MAIN
     * SPACIAL EXT
     */
    fileType,
    /**
     * 1. POT INFOMEMO
     * 2. POT GALLERY
     * 3. POT VIDIO
     */

    flag,
    remark1,
    remark2,
    selected,

    created,
    modifiedBy,
    modifiedByFullname,
  ) {
    this.id = id;
    this.ftMonevBean = ftMonevBean;
    this.fileName = fileName;
    this.description = description;
    this.jenis = jenis;

    this.fileType = fileType;

    this.flag = flag;
    this.remark1 = remark1;
    this.remark2 = remark2;

    this.selected = selected;

    this.created = created;
    this.modifiedBy = modifiedBy;
    this.modifiedByFullname = modifiedByFullname;
  }
}
