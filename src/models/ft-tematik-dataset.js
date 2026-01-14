export default class FtTematikDataset {
    constructor(
        id = 0,
        ftTematikBean = 0,
        ftDatasetBean = 0,

        ftDataset, //Transient

        created = new Date(),
        modifiedBy = ""
    ) {
        this.id = id;

        this.ftTematikBean = ftTematikBean;   // id atau object, sesuai kebutuhan API
        this.ftDatasetBean = ftDatasetBean;   // id atau object

        this.ftDataset = ftDataset;

        this.created = created;
        this.modifiedBy = modifiedBy;
    }
}