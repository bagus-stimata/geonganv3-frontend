import axios from 'axios';
import authHeader from "../../services/auth-header";
import ConstApiUrls from "../../services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FDayaDukungTypeService {
    getApiUrl() {
        return API_URL
    }
    getAllFDayaDukungTypePublic(){
        return axios.get(API_URL + `public/getAllFDayaDukungTypePublic`, { headers: authHeader() });
    }
    getAllFDayaDukungType(){
        return axios.get(API_URL + `getAllFDayaDukungType`, { headers: authHeader() });
    }
    getAllFDayaDukungTypeByOrgLevel(){
        return axios.get(API_URL + `getAllFDayaDukungTypeByOrgLevel`, { headers: authHeader() });
    }

    getAllFDayaDukungTypeContaining(page, pageSize, sortBy, order, search){
        // return axios.get(API_URL + `getAllFDayaDukungType`, { headers: authHeaderMultipart() });
        return axios.get(API_URL + `getAllFDayaDukungTypeContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getFDayaDukungTypeById(id){
        return axios.get(API_URL + `getFDayaDukungTypeById/${id}`, { headers: authHeader() });
    }
    updateFDayaDukungType(item){
        return axios.put(API_URL + `updateFDayaDukungType/${item.id}`, item, {headers: authHeader()})
    }
    createFDayaDukungType(item){
        return axios.post(API_URL + `createFDayaDukungType`, item, {headers: authHeader()})
    }
    deleteFDayaDukungType(id){
        return axios.delete(API_URL + `deleteFDayaDukungType/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFDayaDukungType(itemIds){
        // let user = JSON.parse(localStorage.getItem('user'));
        // return axios.delete(API_URL + `deleteAllFDayaDukungType`, {
        //     headers:  authHeaderMultipart(),
        //     data: {
        //         message: 'delete  success'
        //     }
        // });
        return axios.delete(API_URL + `deleteAllFDayaDukungType`, {
            headers:  authHeader(),
            data: itemIds
        });


    }
}
export default new FDayaDukungTypeService()