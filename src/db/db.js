import Dexie from 'dexie';

export const db = new Dexie('desgreen_db');
db.version(1).stores({
    daya_dukung_peta: 'id, fileNameLow'
});