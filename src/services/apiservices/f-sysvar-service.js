import axios from 'axios';
import authHeader from "../auth-header";
import ConstApiUrls from "../const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FSysvarService {
    getApiUrl() {
        return API_URL
    }
    getAllFSysvar(){
        return axios.get(API_URL + `getAllFSysvar`, { headers: authHeader() });
    }
    getAllFSysvarCompany(){
        return axios.get(API_URL + `getAllFSysvarCompany`, { headers: authHeader() });
    }

    getAllFSysvarContaining(page, pageSize, sortBy, order, search){
        // return axios.get(API_URL + `getAllFSysvar`, { headers: authHeaderMultipart() });
        return axios.get(API_URL + `getAllFSysvarContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getFSysvarById(id){
        return axios.get(API_URL + `getFSysvarById/${id}`, { headers: authHeader() });
    }
    updateFSysvar(item){
        return axios.put(API_URL + `updateFSysvar/${item.id}`, item, {headers: authHeader()})
    }
    createFSysvar(item){
        return axios.post(API_URL + `createFSysvar`, item, {headers: authHeader()})
    }
    deleteFSysvar(id){
        return axios.delete(API_URL + `deleteFSysvar/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFSysvar(itemIds){
        return axios.delete(API_URL + `deleteAllFSysvar`, {
            headers:  authHeader(),
            data: itemIds
        });
    }
    updateAllFSysvarCompany(items) {
        return axios.put(API_URL + `updateAllFSysvarCompany`, items, {
            headers: authHeader(),
        });
    }


}
export default new FSysvarService()