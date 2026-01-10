export default class FtMonev {
    constructor(
        id,
        kode1,
        description,
        fdivisionBean,
        statusActive = true,

        enumSumberInfo,
        trDate = new Date(),
        fpermitBankBean,
        nib ,
        objName,
        objAddress,
        fsubAreaBean,
        cname,
        cphone,
        peruntukan,

        kname,
        kphone,

        latitude,
        longitude,

        fmonevTypeBean,
        enumMonevStatus,
        enumTlStatus,
        rekomTlNotes,

        listFtMonevFile = [],
        listFtMonevPelanggaran = [],
        listFtMonevIzin = [],
        listFtKlarifikasiRes=[],
        listFtWasdalRes=[],

        firstResp = new  Date(),
        allowSubmitAt = new Date(),

        created = new Date(),
        modified = new Date(),
        modifiedBy
    ) {
      this.id = id;
      this.kode1 = kode1;
      this.description = description;
      this.fdivisionBean = fdivisionBean;
      this.statusActive = statusActive;

      this.enumSumberInfo = enumSumberInfo;
      this.trDate = trDate;
      this.fpermitBankBean = fpermitBankBean;
      this.nib = nib;
      this.objName = objName;
      this.objAddress = objAddress;
      this.fsubAreaBean = fsubAreaBean;
      this.cname = cname;
      this.cphone = cphone;
      this.peruntukan = peruntukan;

        this.kname = kname;
        this.kphone = kphone;

        this.latitude = latitude;
      this.longitude = longitude;

      this.fmonevTypeBean = fmonevTypeBean;
      this.enumMonevStatus = enumMonevStatus;
      this.enumTlStatus = enumTlStatus;
      this.rekomTlNotes = rekomTlNotes;

        this.listFtMonevFile = listFtMonevFile;
        this.listFtMonevPelanggaran = listFtMonevPelanggaran;
        this.listFtMonevIzin = listFtMonevIzin;
        this.listFtKlarifikasiRes = listFtKlarifikasiRes;
        this.listFtWasdalRes = listFtWasdalRes;

        this.firstResp = firstResp;
        this.allowSubmitAt = allowSubmitAt;

      this.created = created;
      this.modified = modified;
      this.modifiedBy = modifiedBy;
    }
  
  }
  