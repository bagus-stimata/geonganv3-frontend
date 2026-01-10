import axios from 'axios';
import authHeader from "../../services/auth-header";
import ConstApiUrls from "../../services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FCompanyService {
    getApiUrl() {
        return API_URL
    }
    getAllFCompany(){
        return axios.get(API_URL + `getAllFCompany`, { headers: authHeader() });
    }
    getAllFCompanyContaining(page, pageSize, sortBy, order, search){
        // return axios.get(API_URL + `getAllFCompany`, { headers: authHeaderMultipart() });
        return axios.get(API_URL + `getAllFCompanyContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getFCompanyById(id){
        return axios.get(API_URL + `getFCompanyById/${id}`, { headers: authHeader() });
    }
    updateFCompany(item){
        return axios.put(API_URL + `updateFCompany/${item.id}`, item, {headers: authHeader()})
    }
    createFCompany(item){
        return axios.post(API_URL + `createFCompany`, item, {headers: authHeader()})
    }
    deleteFCompany(id){
        return axios.delete(API_URL + `deleteFCompany/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFCompany(itemIds){
        // let user = JSON.parse(localStorage.getItem('user'));
        // return axios.delete(API_URL + `deleteAllFCompany`, {
        //     headers:  authHeaderMultipart(),
        //     data: {
        //         message: 'delete  success'
        //     }
        // });
        return axios.delete(API_URL + `deleteAllFCompany`, {
            headers:  authHeader(),
            data: itemIds
        });


    }
}
export default new FCompanyService()