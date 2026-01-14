import axios from 'axios';
import authHeader from "../../services/auth-header";
import ConstApiUrls from "../../services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FtTematikService {
    getApiUrl() {
        return API_URL
    }
    getAllFtTematik(){
        return axios.get(API_URL + `getAllFtTematik`, { headers: authHeader() });
    }
    getAllFtTematikPublic(){
        return axios.get(API_URL + `public/getAllFtTematik`, { headers: authHeader() });
    }

    getAllFtTematikContaining(page, pageSize, sortBy, order, search){
        return axios.get(API_URL + `getAllFtTematikContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getAllFtTematikContainingPublic(page, pageSize, sortBy, order, search){
        return axios.get(API_URL + `public/getAllFtTematikContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getAllFtTematikShowOnHomeOnly(){
        return axios.get(API_URL + `public/getAllFtTematikShowOnHomeOnly`, { headers: authHeader() });
    }
    getPostAllFtTematikContainingExt(item) {
        return axios.post(
            API_URL + `getPostAllFtTematikContainingExt`,
            item,
            { headers: authHeader() }
        );
    }
    getPostAllFtTematikContainingExtPublic(item) {
        return axios.post(
            API_URL + `public/getPostAllFtTematikContainingExt`,
            item,
            { headers: authHeader() }
        );
    }

    getFtTematikById(id){
        return axios.get(API_URL + `getFtTematikById/${id}`, { headers: authHeader() });
    }
    getFtTematikByIdPublic(id){
        return axios.get(API_URL + `public/getFtTematikById/${id}`, { headers: authHeader() });
    }


    updateFtTematik(item){
        return axios.put(API_URL + `updateFtTematik/${item.id}`, item, {headers: authHeader()})
    }
    createFtTematik(item){
        return axios.post(API_URL + `createFtTematik`, item, {headers: authHeader()})
    }
    deleteFtTematik(id){
        return axios.delete(API_URL + `deleteFtTematik/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFtTematik(itemIds){
        return axios.delete(API_URL + `deleteAllFtTematik`, {
            headers:  authHeader(),
            data: itemIds
        });
    }

}
export default new FtTematikService()