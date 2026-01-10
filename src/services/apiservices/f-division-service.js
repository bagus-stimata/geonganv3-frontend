import axios from 'axios';
import authHeader from "../../services/auth-header";
import ConstApiUrls from "../../services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FDivisonService {
    getApiUrl() {
        return API_URL
    }
    getAllFDivision(){
        return axios.get(API_URL + `getAllFDivision`, { headers: authHeader() });
    }
    getAllFDivisionPublic(){
        return axios.get(API_URL + `public/getAllFDivision`, { headers: authHeader() });
    }
    getAllFDivisionByOrgLevel(){
        return axios.get(API_URL + `getAllFDivisionByOrgLevel`, { headers: authHeader() });
    }

    getAllFDivisionContaining(page, pageSize, sortBy, order, search){
        // return axios.get(API_URL + `getAllFDivision`, { headers: authHeaderMultipart() });
        return axios.get(API_URL + `getAllFDivisionContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getFDivisionById(id){
        return axios.get(API_URL + `getFDivisionById/${id}`, { headers: authHeader() });
    }
    updateFDivision(item){
        return axios.put(API_URL + `updateFDivision/${item.id}`, item, {headers: authHeader()})
    }
    createFDivision(item){
        return axios.post(API_URL + `createFDivision`, item, {headers: authHeader()})
    }
    deleteFDivision(id){
        return axios.delete(API_URL + `deleteFDivision/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFDivision(itemIds){
        // let user = JSON.parse(localStorage.getItem('user'));
        // return axios.delete(API_URL + `deleteAllFDivision`, {
        //     headers:  authHeaderMultipart(),
        //     data: {
        //         message: 'delete  success'
        //     }
        // });
        return axios.delete(API_URL + `deleteAllFDivision`, {
            headers:  authHeader(),
            data: itemIds
        });


    }
}
export default new FDivisonService()