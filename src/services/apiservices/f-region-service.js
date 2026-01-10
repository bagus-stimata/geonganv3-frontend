import axios from 'axios';
import authHeader from "../../services/auth-header";
import ConstApiUrls from "../../services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FRegionService {
    getApiUrl() {
        return API_URL
    }

    getAllFRegion(){
        return axios.get(API_URL + `getAllFRegion`, { headers: authHeader() });
    }
    getAllFRegionPublic(){
        return axios.get(API_URL + `public/getAllFRegion`, { headers: authHeader() });
    }

    getAllFRegionByCompany(){
        return axios.get(API_URL + `getAllFRegionByCompany`, { headers: authHeader() });
    }

    getAllFRegionContaining(page, pageSize, sortBy, order, search){
        // return axios.get(API_URL + `getAllFRegion`, { headers: authHeaderMultipart() });
        return axios.get(API_URL + `getAllFRegionContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getFRegionById(id){
        return axios.get(API_URL + `getFRegionById/${id}`, { headers: authHeader() });
    }
    updateFRegion(item){
        return axios.put(API_URL + `updateFRegion/${item.id}`, item, {headers: authHeader()})
    }
    createFRegion(item){
        return axios.post(API_URL + `createFRegion`, item, {headers: authHeader()})
    }
    deleteFRegion(id){
        return axios.delete(API_URL + `deleteFRegion/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFRegion(itemIds){
        return axios.delete(API_URL + `deleteAllFRegion`, {
            headers:  authHeader(),
            data: itemIds
        });


    }
}
export default new FRegionService()