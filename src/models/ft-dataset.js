export default class FtDataset {
    constructor(
        id = 0,
        kode1 = '',
        description = '',
        avatarImage = '',
        tahun = 0,
        fdivisionBean = null,

        listFtDataHeader = [],
        listFtDataDetil = [],

        created = new Date(),
        modified = new Date(),
        modifiedBy = ''
    ) {
        // Basic info
        this.id = id;
        this.kode1 = kode1;
        this.description = description;
        this.avatarImage = avatarImage;
        this.tahun = tahun;

        // Relasi & status
        this.fdivisionBean = fdivisionBean;  // biasanya object division
        this.statusActive = true;
        this.markerImage = '';

        // Tanggal & akses
        this.trDate = new Date();
        this.privateData = false;
        this.relationKey = '';
        this.sumberData = '';

        // Satuan & tipe dataset
        this.fsatuanBean = 0;                 // Int di backend
        this.datasetType = 'GEOJSON';         // EnumDataSpaType.GEOJSON

        // GeoJSON & properti
        this.geojson = '{}';
        this.propertyKeys = '[]';
        this.propertiesMeta = '{}';

        // Geometry (opsional, biasanya dari backend)
        this.geom = null;
        this.featureCount = 0;
        this.centroid = null;

        // List detail (khusus frontend, tetap dipertahankan)
        this.listFtDataHeader = listFtDataHeader;
        this.listFtDataDetil = listFtDataDetil;

        // Audit fields
        this.created = created;
        this.modified = modified;
        this.modifiedBy = modifiedBy;
    }
}