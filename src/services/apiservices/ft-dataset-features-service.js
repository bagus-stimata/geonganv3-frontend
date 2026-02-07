import axios from "axios";
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL;

class FtDatasetFeaturesFeaturesService {
    getApiUrl() {
        return API_URL;
    }

    getFtDatasetFeaturesById(id) {
        return axios.get(
            API_URL + `getFtDatasetFeaturesById/${id}`,
            { headers: authHeader() }
        );
    }
    getFtDatasetFeaturesByIdPublic(id) {
        return axios.get(
            API_URL + `public/getFtDatasetFeaturesById/${id}`,
            { headers: authHeader() }
        );
    }


    getPostAllFtDatasetContainingExt(item) {
        return axios.post(
            API_URL + `getPostAllFtDatasetContainingExt`,
            item,
            {
                headers: authHeader(),
            }
        );
    }


    updateFtDatasetFeatures(payload) {
        // console.log(JSON.stringify(payload))
        return axios.put(
            API_URL + `updateFtDatasetFeatures/${payload.id}`,
            payload,
            {
                headers: authHeader(),
            }
        );
    }
    deleteFtDatasetFeatures(id){
        return axios.delete(API_URL + `deleteFtDatasetFeatures/${id}`, {
            headers: authHeader()
        });
    }
    createFtDatasetFeatures(item) {
        return axios.post(API_URL + `createFtDatasetFeatures`, item, {
            headers: authHeader(),
        });
    }




}

export default new FtDatasetFeaturesFeaturesService();