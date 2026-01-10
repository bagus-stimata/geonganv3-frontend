import axios from 'axios';
import authHeader from "../../services/auth-header";
import ConstApiUrls from "../../services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FSubAreaService {
    getApiUrl() {
        return API_URL
    }

    getAllFSubArea(){
        return axios.get(API_URL + `getAllFSubArea`, { headers: authHeader() });
    }
    getAllFSubAreaPublic(){
        return axios.get(API_URL + `public/getAllFSubAreaPublic`, { headers: authHeader() });
    }
    getAllFSubAreaByParentPublic(id){
        return axios.get(API_URL + `public/getAllFSubAreaByParent/${id}`, { headers: authHeader() });
    }

    getAllFSubAreaByCompany(){
        return axios.get(API_URL + `getAllFSubAreaByCompany`, { headers: authHeader() });
    }

    getAllFSubAreaContaining(page, pageSize, sortBy, order, search){
        return axios.get(API_URL + `getAllFSubAreaContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    fetchTest(){
        return fetch('abc')
    }
    fetchAllFSubAreaContaining(page, pageSize, sortBy, order, search){
        return fetch(API_URL + `getAllFSubAreaContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() })
    }

    getFSubAreaById(id){
        return axios.get(API_URL + `getFSubAreaById/${id}`, { headers: authHeader() });
    }
    getFSubAreaByIdPublic(id){
        return axios.get(API_URL + `public/getFSubAreaById/${id}`, { headers: authHeader() });
    }
    updateFSubArea(item){
        return axios.put(API_URL + `updateFSubArea/${item.id}`, item, {headers: authHeader()})
    }
    createFSubArea(item){
        return axios.post(API_URL + `createFSubArea`, item, {headers: authHeader()})
    }
    createFSubAreaMultiple(items){
        return axios.post(API_URL + `createFSubAreaMultiple`, items, {headers: authHeader()})
    }
    deleteFSubArea(id){
        return axios.delete(API_URL + `deleteFSubArea/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFSubArea(itemIds){
        // let user = JSON.parse(localStorage.getItem('user'));
        // return axios.delete(API_URL + `deleteAllFSubArea`, {
        //     headers:  authHeaderMultipart(),
        //     data: {
        //         message: 'delete  success'
        //     }
        // });
        return axios.delete(API_URL + `deleteAllFSubArea`, {
            headers:  authHeader(),
            data: itemIds
        });


    }
}
export default new FSubAreaService()