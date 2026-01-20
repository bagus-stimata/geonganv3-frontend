export default class FGeoDownload {
    constructor(
        id = 0,
        kode1 = "",
        description = "",
        fdivisionBean=0,
        statusActive = true,
        email = "",
        notes = "",
        instansi = "",
        ftDatasetBean = 0,

        created = new Date(),
        modified = new Date(),
        modifiedBy = ""
    ) {
        this.id = id;

        this.kode1 = kode1;
        this.description = description;

        this.fdivisionBean = fdivisionBean;
        this.statusActive = statusActive;
        this.email = email;
        this.notes = notes;
        this.instansi = instansi;
        this.ftDatasetBean = ftDatasetBean;

        this.created = created;
        this.modified = modified;
        this.modifiedBy = modifiedBy;
    }
}