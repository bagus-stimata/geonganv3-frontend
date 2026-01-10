import axios from 'axios';
import authHeader from "../../services/auth-header";
import ConstApiUrls from "../../services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FSektorService {
    getApiUrl() {
        return API_URL
    }
    getAllFSektorPublic(){
        return axios.get(API_URL + `public/getAllFSektor`, { headers: authHeader() });
    }
    getAllFSektor(){
        return axios.get(API_URL + `getAllFSektor`, { headers: authHeader() });
    }
    getAllFSektorByOrgLevel(){
        return axios.get(API_URL + `getAllFSektorByOrgLevel`, { headers: authHeader() });
    }

    getAllFSektorContaining(page, pageSize, sortBy, order, search){
        // return axios.get(API_URL + `getAllFSektor`, { headers: authHeaderMultipart() });
        return axios.get(API_URL + `getAllFSektorContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getFSektorById(id){
        return axios.get(API_URL + `getFSektorById/${id}`, { headers: authHeader() });
    }
    getFSektorByIdPublic(id){
        return axios.get(API_URL + `public/getFSektorById/${id}`, { headers: authHeader() });
    }
    updateFSektor(item){
        return axios.put(API_URL + `updateFSektor/${item.id}`, item, {headers: authHeader()})
    }
    createFSektor(item){
        return axios.post(API_URL + `createFSektor`, item, {headers: authHeader()})
    }
    deleteFSektor(id){
        return axios.delete(API_URL + `deleteFSektor/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFSektor(itemIds){
        // let user = JSON.parse(localStorage.getItem('user'));
        // return axios.delete(API_URL + `deleteAllFSektor`, {
        //     headers:  authHeaderMultipart(),
        //     data: {
        //         message: 'delete  success'
        //     }
        // });
        return axios.delete(API_URL + `deleteAllFSektor`, {
            headers:  authHeader(),
            data: itemIds
        });


    }
}
export default new FSektorService()