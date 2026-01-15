export default class FtTematik {
    constructor(
        id = 0,
        kode1 = "",
        description = "",
        avatarImage = "",

        notes = "",
        categ = "",

        fdivisionBean=0,

        statusActive = true,
        showOnHome,

        created = new Date(),
        modified = new Date(),
        modifiedBy = ""
    ) {
        this.id = id;

        this.kode1 = kode1;
        this.description = description;
        this.avatarImage = avatarImage;

        this.notes = notes;
        this.categ = categ;

        this.fdivisionBean = fdivisionBean;
        this.statusActive = statusActive;
        this.showOnHome = showOnHome;

        this.created = created;
        this.modified = modified;
        this.modifiedBy = modifiedBy;
    }
}