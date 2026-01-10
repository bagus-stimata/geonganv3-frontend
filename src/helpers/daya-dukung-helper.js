import {db} from '@/db/db.js'
import FileService from "@/services/apiservices/file-service";

// Fungsi sync cache ke Dexie
export async function syncDayaDukungGeojson({ id, fileNameLow, restApiFetch }) {
    try {
        const local = await db.daya_dukung_peta.get(id);

        if (local && local.fileNameLow === fileNameLow && local.dataGeoJson) {
            console.log(`Using cached data for id: ${id}, fileNameLow: ${fileNameLow}`);
            return local.dataGeoJson;
        } else {
            if (local) {
                await db.daya_dukung_peta.delete(id);
            }
            console.log(`Fetching new data for id: ${id}, fileNameLow: ${fileNameLow}`);
            const geoJsonObject = await restApiFetch(fileNameLow);
            await db.daya_dukung_peta.put({
                id,
                fileNameLow,
                dataGeoJson: geoJsonObject
            });
            return geoJsonObject;
        }

    }catch (e) {
        return await restApiFetch(fileNameLow);
    }

}

// Fungsi handle valueChanged (perlu passing context/data array)
export async function valueChangedSpaMainGeoJson({
                                                     value,
                                                     itemSpaDayaDukungGeojson,
                                                     syncFn // inject syncDayaDukungGeojson (biar bisa mock/test juga)
                                                 }) {
    const startTime = new Date();
    console.log(`*** Start: valueChangedSpaMainGeoJson ${startTime.toISOString()}`);

    if (!value.fileNameLow) return;

    if (value.selected !== true) {
        const index = itemSpaDayaDukungGeojson.findIndex(item => item.id === value.id);
        if (index !== -1) itemSpaDayaDukungGeojson.splice(index, 1);
        return;
    }

    const geojsonResponse = await syncFn({
        id: value.id,
        fileNameLow: value.fileNameLow,
        restApiFetch: async (fileName) => {
            let response;
            if (value.fileType === 'geojson-gzip' || fileName.endsWith('.geojson.gz')) {
                response = await fetch(FileService.fileGeojsonGzip(fileName));
            } else {
                response = await fetch(FileService.file_url(fileName));
            }
            return await response.json();
        }
    });

    if (geojsonResponse && geojsonResponse.features) {
        console.log(geojsonResponse.features.length + " features loaded");
        console.log(`=== End: valueChangedSpaMainGeoJson ${new Date().toISOString()}: Time taken: ${new Date().getTime() - startTime.getTime()} ms`);
        const existIndex = itemSpaDayaDukungGeojson.findIndex(item => item.id === value.id);
        if (existIndex !== -1) {
            itemSpaDayaDukungGeojson.splice(existIndex, 1);
        }
        itemSpaDayaDukungGeojson.push({
            id: value.id,
            data: {
                ...geojsonResponse,
                features: geojsonResponse.features.map(f => ({
                    ...f,
                    properties: {
                        ...f.properties,
                        "Sumber Data": value.notes,
                    }
                }))
            },
            lineColor: value.remark1,
            fillColor: value.remark2
        });
    }
}