import axios from "axios";
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL;

class FtDatasetExtService {
    getApiUrl() {
        return API_URL;
    }


    getPostViewportClippedPublic(reqViewport){
        return axios.post(
            API_URL + `ext/public/getPostViewportClipped`,
            reqViewport,
            {
                headers: authHeader(),
            }
        );
    }

    getFtDatasetById(id, includeGeojson = false) {
        return axios.get(
            API_URL + `ext/getFtDatasetById/${id}?includeGeojson=${includeGeojson}`,
            { headers: authHeader() }
        );
    }
    getFtDatasetByIdPublic(id, includeGeojson = false) {
        return axios.get(
            API_URL + `ext/public/getFtDatasetById/${id}?includeGeojson=${includeGeojson}`,
            { headers: authHeader() }
        );
    }
    getFtDatasetGeojsonOriById(id ) {
        return axios.get(
            API_URL + `ext/getFtDatasetGeojsonOriById/${id}`,
            { headers: authHeader() }
        );
    }


    getPostAllFtDatasetContainingExt(item, deepSearch = false) {
        return axios.post(
            API_URL + `ext/getPostAllFtDatasetContainingExt`,
            item,
            {
                headers: authHeader(),
                params: { deepSearch }
            }
        );
    }

    getPostAllFtDatasetContainingExtPublic(item, deepSearch = false) {
        return axios.post(
            `${API_URL}ext/public/getPostAllFtDatasetContainingExt`,
            item,
            {
                headers: authHeader(),
                params: { deepSearch }
            }
        );
    }


    /**
     * Update dataset-old.
     * Catatan:
     * - Kalau lo TIDAK kirim field `geojson` di `item`, maka backend akan
     *   mempertahankan geojson lama + geom + centroid (sesuai aturan prepareForSave).
     */
    updateFtDataset(payload, includeGeojson = false) {
        return axios.put(
            API_URL + `ext/updateFtDataset/${payload.id}`,
            payload,
            {
                headers: authHeader(),
                params: {
                    includeGeojson: includeGeojson === true,
                },
            }
        );
    }
    createFtDataset(item) {
        return axios.post(API_URL + `ext/createFtDataset`, item, {
            headers: authHeader(),
        });
    }




}

export default new FtDatasetExtService();