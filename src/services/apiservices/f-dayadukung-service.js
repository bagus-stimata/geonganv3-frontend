import axios from 'axios';
import authHeader from "../../services/auth-header";
import ConstApiUrls from "../../services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FDayaDukungService {
    getApiUrl() {
        return API_URL
    }

    getAllFDayaDukungByTypePetaPublic(){
        return axios.get(API_URL + `public/getAllFDayaDukungByTypePetaPublic`, { headers: authHeader() });
    }
    getAllFDayaDukungPublic(){
        return axios.get(API_URL + `public/getAllFDayaDukungPublic`, { headers: authHeader() });
    }
    getAllFDayaDukungWithParentPublic(){
        return axios.get(API_URL + `public/getAllFDayaDukungWithParentPublic`, { headers: authHeader() });
    }

    getAllFDayaDukungByTypePublic(typeBean){
        return axios.get(API_URL + `public/getAllFDayaDukungByTypePublic/${typeBean}`, { headers: authHeader() });
    }
    getAllFDayaDukungByCityPublic(city){
        return axios.get(API_URL + `public/getAllFDayaDukungByCityPublic/${city}`, { headers: authHeader() });
    }
    getAllFDayaDukungByFareaPublic(fAreaBean){
        return axios.get(API_URL + `public/getAllFDayaDukungByFareaPublic/${fAreaBean}`, { headers: authHeader() });
    }
    getAllFDayaDukungShotToMapOnly(){
        return axios.get(API_URL + `public/getAllFDayaDukungShotToMapOnly`, { headers: authHeader() });
    }
    getAllFDayaDukungShowToPublicOnly(){
        return axios.get(API_URL + `public/getAllFDayaDukungShowToPublicOnly`, { headers: authHeader() });
    }

    getAllFDayaDukung(){
        return axios.get(API_URL + `getAllFDayaDukung`, { headers: authHeader() });
    }
    getAllFDayaDukungByOrgLevel(){
        return axios.get(API_URL + `getAllFDayaDukungByOrgLevel`, { headers: authHeader() });
    }

    getAllFDayaDukungContaining(page, pageSize, sortBy, order, search){
        // return axios.get(API_URL + `getAllFDayaDukung`, { headers: authHeaderMultipart() });
        return axios.get(API_URL + `getAllFDayaDukungContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getPostAllFDayaDukungContainingExt(item){
        return axios.post(API_URL + `getPostAllFDayaDukungContainingExt`, item, { headers: authHeader() });
    }
    getPostAllFDayaDukungContainingExtNonGeojson(item){
        return axios.post(API_URL + `getPostAllFDayaDukungContainingExtNonGeojson`, item, { headers: authHeader() });
    }
    getPostAllFDayaDukungContainingExtGeojson(item){
        return axios.post(API_URL + `getPostAllFDayaDukungContainingExtGeojson`, item, { headers: authHeader() });
    }

    getFDayaDukungById(id){
        return axios.get(API_URL + `getFDayaDukungById/${id}`, { headers: authHeader() });
    }
    updateFDayaDukung(item){
        return axios.put(API_URL + `updateFDayaDukung/${item.id}`, item, {headers: authHeader()})
    }
    createFDayaDukung(item){
        return axios.post(API_URL + `createFDayaDukung`, item, {headers: authHeader()})
    }
    createFDayaDukungMultiple(item){
        return axios.post(API_URL + `createFDayaDukungMultiple`, item, {headers: authHeader()})
    }
    deleteFDayaDukung(id){
        return axios.delete(API_URL + `deleteFDayaDukung/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFDayaDukung(itemIds){
        // let user = JSON.parse(localStorage.getItem('user'));
        // return axios.delete(API_URL + `deleteAllFDayaDukung`, {
        //     headers:  authHeaderMultipart(),
        //     data: {
        //         message: 'delete  success'
        //     }
        // });
        return axios.delete(API_URL + `deleteAllFDayaDukung`, {
            headers:  authHeader(),
            data: itemIds
        });


    }
}
export default new FDayaDukungService()