import axios from 'axios';
import authHeader from "../../services/auth-header";
import ConstApiUrls from "../../services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FCountryService {
    getApiUrl() {
        return API_URL
    }

    getAllFCountry(){
        return axios.get(API_URL + `getAllFCountry`, { headers: authHeader() });
    }
    getAllFCountryByCompany(){
        return axios.get(API_URL + `getAllFCountryByCompany`, { headers: authHeader() });
    }

    getAllFCountryContaining(page, pageSize, sortBy, order, search){
        // return axios.get(API_URL + `getAllFCountry`, { headers: authHeaderMultipart() });
        return axios.get(API_URL + `getAllFCountryContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getFCountryById(id){
        return axios.get(API_URL + `getFCountryById/${id}`, { headers: authHeader() });
    }
    updateFCountry(item){
        return axios.put(API_URL + `updateFCountry/${item.id}`, item, {headers: authHeader()})
    }
    createFCountry(item){
        return axios.post(API_URL + `createFCountry`, item, {headers: authHeader()})
    }
    deleteFCountry(id){
        return axios.delete(API_URL + `deleteFCountry/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFCountry(itemIds){
        // let user = JSON.parse(localStorage.getItem('user'));
        // return axios.delete(API_URL + `deleteAllFCountry`, {
        //     headers:  authHeaderMultipart(),
        //     data: {
        //         message: 'delete  success'
        //     }
        // });
        return axios.delete(API_URL + `deleteAllFCountry`, {
            headers:  authHeader(),
            data: itemIds
        });


    }
}
export default new FCountryService()