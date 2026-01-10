import axios from 'axios';
import authHeader from "../../services/auth-header";
import ConstApiUrls from "../../services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FAreaService {
    getApiUrl() {
        return API_URL
    }
    getAllFArea(){
        return axios.get(API_URL + `getAllFArea`, { headers: authHeader() });
    }
    getAllFAreaPublic(){
        return axios.get(API_URL + `public/getAllFArea`, { headers: authHeader() });
    }
    getAllFAreaByCompany(){
        return axios.get(API_URL + `getAllFAreaByCompany`, { headers: authHeader() });
    }

    getAllFAreaContaining(page, pageSize, sortBy, order, search){
        // return axios.get(API_URL + `getAllFArea`, { headers: authHeaderMultipart() });
        return axios.get(API_URL + `getAllFAreaContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getFAreaById(id){
        return axios.get(API_URL + `getFAreaById/${id}`, { headers: authHeader() });
    }
    updateFArea(item){
        return axios.put(API_URL + `updateFArea/${item.id}`, item, {headers: authHeader()})
    }
    createFArea(item){
        return axios.post(API_URL + `createFArea`, item, {headers: authHeader()})
    }
    createFAreaMultiple(items){
        return axios.post(API_URL + `createFAreaMultiple`, items, {headers: authHeader()})
    }
    deleteFArea(id){
        return axios.delete(API_URL + `deleteFArea/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFArea(itemIds){
        // let user = JSON.parse(localStorage.getItem('user'));
        // return axios.delete(API_URL + `deleteAllFArea`, {
        //     headers:  authHeaderMultipart(),
        //     data: {
        //         message: 'delete  success'
        //     }
        // });
        return axios.delete(API_URL + `deleteAllFArea`, {
            headers:  authHeader(),
            data: itemIds
        });


    }
}
export default new FAreaService()