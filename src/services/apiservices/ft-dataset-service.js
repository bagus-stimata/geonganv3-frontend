import axios from "axios";
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL;

class FtDatasetService {
    getApiUrl() {
        return API_URL;
    }


    getAllFtDatasetShowOnHomeOnlyPublic(includeGeojson = false) {
        return axios.get(
            API_URL + `public/getAllFtDatasetShowOnHomeOnly?includeGeojson=${includeGeojson}`,
            { headers: authHeader() }
        );
    }
    exportGeojsonFtDatasetZip(datasetIds) {
        return axios.post(
            API_URL + `public/exportMultipleGeojsonFtDataset`,
            datasetIds,
            {
                headers: authHeader(),
                responseType: "blob",
            }
        );
    }

    /**
     * Ambil satu dataset by id (private, pakai auth, role-aware).
     */
    getFtDatasetById(id, includeGeojson = false) {
        return axios.get(
            API_URL + `getFtDatasetById/${id}?includeGeojson=${includeGeojson}`,
            { headers: authHeader() }
        );
    }

    /**
     * Ambil satu dataset by id (public).
     */
    getFtDatasetByIdPublic(id, includeGeojson = false) {
        return axios.get(
            API_URL + `public/getFtDatasetById/${id}?includeGeojson=${includeGeojson}`,
            { headers: authHeader() }
        );
    }
    getFtDatasetByIdsPublic(ids, includeGeojson = false) {
        return axios.get(
            API_URL + `public/getFtDatasetByIds/${ids}?includeGeojson=${includeGeojson}`,
            { headers: authHeader() }
        );
    }


    /**
     * Utility: copy dataset per tahun.
     */
    createCopyYearFtDataset(toYear) {
        return axios.post(API_URL + `createCopyYearFtDataset`, toYear, {
            headers: authHeader(),
        });
    }

    /**
     * Update dataset.
     * Catatan:
     * - Kalau lo TIDAK kirim field `geojson` di `item`, maka backend akan
     *   mempertahankan geojson lama + geom + centroid (sesuai aturan prepareForSave).
     */
    updateFtDataset(payload, includeGeojson = false) {
        // note: includeGeojson true = backend boleh balikin field `geojson`
        // (berguna kalau setelah save lo mau langsung refresh data lengkap)

        // console.log(payload.propertyGroups);

        return axios.put(
            API_URL + `updateFtDataset/${payload.id}`,
            payload,
            {
                headers: authHeader(),
                params: {
                    includeGeojson: includeGeojson === true,
                },
            }
        );
    }

    /**
     * Create dataset baru (id = 0).
     */
    createFtDataset(item) {
        return axios.post(API_URL + `createFtDataset`, item, {
            headers: authHeader(),
        });
    }

    deleteFtDataset(id) {
        return axios.delete(API_URL + `deleteFtDataset/${id}`, {
            headers: authHeader(),
        });
    }

    deleteAllFtDataset(itemIds) {
        return axios.delete(API_URL + `deleteAllFtDataset`, {
            headers: authHeader(),
            data: itemIds,
        });
    }
}

export default new FtDatasetService();