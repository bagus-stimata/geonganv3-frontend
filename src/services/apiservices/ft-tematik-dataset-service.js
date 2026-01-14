import axios from 'axios';
import authHeader from "../../services/auth-header";
import ConstApiUrls from "../../services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FtTematikDatasetService {
    getApiUrl() {
        return API_URL
    }
    getAllFtTematikDataset(){
        return axios.get(API_URL + `getAllFtTematikDataset`, { headers: authHeader() });
    }

    getFtTematikDatasetById(id){
        return axios.get(API_URL + `getFtTematikDatasetById/${id}`, { headers: authHeader() });
    }
    getFtTematikDatasetByIdPublic(id){
        return axios.get(API_URL + `public/getFtTematikDatasetById/${id}`, { headers: authHeader() });
    }

    updateFtTematikDataset(item){
        return axios.put(API_URL + `updateFtTematikDataset/${item.id}`, item, {headers: authHeader()})
    }
    createFtTematikDataset(item){
        return axios.post(API_URL + `createFtTematikDataset`, item, {headers: authHeader()})
    }

    createFtTematikDatasetMultiple(listItems){
        return axios.post(API_URL + `createFtTematikDatasetMultiple`, listItems, {headers: authHeader()})
    }
    deleteFtTematikDataset(id){
        return axios.delete(API_URL + `deleteFtTematikDataset/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFtTematikDataset(itemIds){
        return axios.delete(API_URL + `deleteAllFtTematikDataset`, {
            headers:  authHeader(),
            data: itemIds
        });
    }

    getAllFtTematikDatasetByFtTematik(ftTematikBean){
        return axios.get(API_URL + `getAllFtTematikDatasetByFtTematik/${ftTematikBean}`, { headers: authHeader() });
    }
    getAllFtTematikDatasetByFtTematikPublic(ftTematikBean){
        return axios.get(API_URL + `public/getAllFtTematikDatasetByFtTematik/${ftTematikBean}`, { headers: authHeader() });
    }

    getAllFtTematikDatasetByFtDataset(ftDatasetBean){
        return axios.get(API_URL + `getAllFtTematikDatasetByFtDataset/${ftDatasetBean}`, { headers: authHeader() });
    }
    getAllFtTematikDatasetByFtDatasetPublic(ftDatasetBean){
        return axios.get(API_URL + `public/getAllFtTematikDatasetByFtDataset/${ftDatasetBean}`, { headers: authHeader() });
    }

    getAllFtTematikDatasetByFtTematikForDatasets(ftTematikBean){
        return axios.get(API_URL + `public/getAllFtTematikDatasetByFtTematikForDatasets/${ftTematikBean}`, { headers: authHeader() });
    }
}

export default new FtTematikDatasetService()