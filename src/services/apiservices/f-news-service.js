import axios from 'axios';
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FNewsService {
    getApiUrl() {
        return API_URL
    }
    getAllFNews(){
        return axios.get(API_URL + `getAllFNews`, { headers: authHeader() });
    }
    getAllFNewsShowHomeOnlyPublic(){
        return axios.get(API_URL + `public/getAllFNewsShowHomeOnly`, { headers: authHeader() });
    }
    getAllFNewsContaining(page, pageSize, sortBy, order, search){
        // return axios.get(API_URL + `getAllFNews`, { headers: authHeaderMultipart() });
        return axios.get(API_URL + `getAllFNewsContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getAllFNewsContainingPublic(page, pageSize, sortBy, order, search){
        return axios.get(API_URL + `public/getAllFNewsContainingPublic?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getAllFNewsContainingPublicAgenda(page, pageSize, sortBy, order, search){
        return axios.get(API_URL + `public/getAllFNewsContainingPublicAgenda?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getAllFNewsContainingPublicBerita(page, pageSize, sortBy, order, search){
        return axios.get(API_URL + `public/getAllFNewsContainingPublicBerita?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getPostAllFNewsContainingBeritaExtPublic(item){
        return axios.post(API_URL + `public/getPostAllFNewsContainingBeritaExt`, item, { headers: authHeader() });
    }
    getAllFNewsContainingPublicBeritaPemudaDesaOnly(page, pageSize, sortBy, order, search){
        return axios.get(API_URL + `public/getAllFNewsContainingPublicBeritaPemudaDesaOnly?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getAllFNewsContainingPublicBeritaDesaCantikOnly(page, pageSize, sortBy, order, search){
        return axios.get(API_URL + `public/getAllFNewsContainingPublicBeritaDesaCantikOnly?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getFNewsById(id){
        return axios.get(API_URL + `getFNewsById/${id}`, { headers: authHeader() });
    }
    getFNewsByIdPublic(id){
        return axios.get(API_URL + `public/getFNewsById/${id}`, { headers: authHeader() });
    }
    updateFNews(item){
        return axios.put(API_URL + `updateFNews/${item.id}`, item, {headers: authHeader()})
    }
    createFNews(item){
        return axios.post(API_URL + `createFNews`, item, {headers: authHeader()})
    }
    deleteFNews(id){
        return axios.delete(API_URL + `deleteFNews/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFNews(itemIds){
        return axios.delete(API_URL + `deleteAllFNews`, {
            headers:  authHeader(),
            data: itemIds
        });


    }
}
export default new FNewsService()