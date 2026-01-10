import axios from 'axios';
import authHeader from "../../services/auth-header";
import ConstApiUrls from "../../services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FSatuanService {
    getApiUrl() {
        return API_URL
    }
    getAllFSatuanPublic(){
        return axios.get(API_URL + `public/getAllFSatuanPublic`, { headers: authHeader() });
    }
    getAllFSatuan(){
        return axios.get(API_URL + `getAllFSatuan`, { headers: authHeader() });
    }
    getAllFSatuanByOrgLevel(){
        return axios.get(API_URL + `getAllFSatuanByOrgLevel`, { headers: authHeader() });
    }

    getAllFSatuanContaining(page, pageSize, sortBy, order, search){
        // return axios.get(API_URL + `getAllFSatuan`, { headers: authHeaderMultipart() });
        return axios.get(API_URL + `getAllFSatuanContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getFSatuanById(id){
        return axios.get(API_URL + `getFSatuanById/${id}`, { headers: authHeader() });
    }
    updateFSatuan(item){
        return axios.put(API_URL + `updateFSatuan/${item.id}`, item, {headers: authHeader()})
    }
    createFSatuan(item){
        return axios.post(API_URL + `createFSatuan`, item, {headers: authHeader()})
    }
    deleteFSatuan(id){
        return axios.delete(API_URL + `deleteFSatuan/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFSatuan(itemIds){
        // let user = JSON.parse(localStorage.getItem('user'));
        // return axios.delete(API_URL + `deleteAllFSatuan`, {
        //     headers:  authHeaderMultipart(),
        //     data: {
        //         message: 'delete  success'
        //     }
        // });
        return axios.delete(API_URL + `deleteAllFSatuan`, {
            headers:  authHeader(),
            data: itemIds
        });


    }
}
export default new FSatuanService()