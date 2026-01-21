export default class FtDataset {
    constructor(
        id = 0,
        kode1 = '',
        description = '',
        avatarImage = '',
        fdivisionBean = null,
        statusActive = true,
        markerImage = '',
        trDate = new Date(),
        privateData = false,
        relationKey = '',
        sumberData = '',
        tahun = 0,
        fsatuanBean = 0,
        datasetType = 'GEOJSON',
        tipePeta = 0,
        geojson = '{}',
        propertyKeys = '[]',
        propertiesMeta = '{}',
        propertyGroups = '[]',
        geom = null,
        featureCount = 0,
        centroid = null,
        created = new Date(),
        modified = new Date(),
        modifiedBy = '',
        listFtDataHeader = [],
        listFtDataDetil = [],
        showOnHome,
    ) {
        // Basic info
        this.id = id;
        this.kode1 = kode1;
        this.description = description;
        this.avatarImage = avatarImage;

        // Relasi & status
        this.fdivisionBean = fdivisionBean;  // biasanya object division
        this.statusActive = statusActive;
        this.markerImage = markerImage;

        // Tanggal & akses
        this.trDate = trDate;
        this.privateData = privateData;
        this.relationKey = relationKey;
        this.sumberData = sumberData;
        this.tahun = tahun;

        // Satuan & tipe dataset
        this.fsatuanBean = fsatuanBean;       // Int di backend
        this.datasetType = datasetType;       // EnumDataSpaType.GEOJSON

        // GeoJSON & properti
        this.tipePeta = tipePeta
        this.geojson = geojson;
        this.propertyKeys = propertyKeys;
        this.propertiesMeta = propertiesMeta;
        this.propertyGroups = propertyGroups;

        // Geometry (opsional, biasanya dari backend)
        this.geom = geom;
        this.featureCount = featureCount;
        this.centroid = centroid;

        // List detail (khusus frontend, tetap dipertahankan)
        this.listFtDataHeader = listFtDataHeader;
        this.listFtDataDetil = listFtDataDetil;
        this.showOnHome = showOnHome;

        // Audit fields
        this.created = created;
        this.modified = modified;
        this.modifiedBy = modifiedBy;
    }
}