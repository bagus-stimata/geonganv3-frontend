import axios from 'axios';
import authHeader from "../auth-header";
import ConstApiUrls from "../const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FGeoDownloadService {
    getApiUrl() {
        return API_URL
    }
    getAllFGeoDownload(){
        return axios.get(API_URL + `getAllFGeoDownload`, { headers: authHeader() });
    }
    getAllFGeoDownloadPublic(){
        return axios.get(API_URL + `public/getAllFGeoDownload`, { headers: authHeader() });
    }
    getAllFGeoDownloadContaining(page, pageSize, sortBy, order, search){
        // return axios.get(API_URL + `getAllFGeoDownload`, { headers: authHeaderMultipart() });
        return axios.get(API_URL + `getAllFGeoDownloadContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getAllFGeoDownloadContainingPublic(page, pageSize, sortBy, order, search){
        // return axios.get(API_URL + `getAllFGeoDownload`, { headers: authHeaderMultipart() });
        return axios.get(API_URL + `public/getAllFGeoDownloadContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getFGeoDownloadById(id){
        return axios.get(API_URL + `getFGeoDownloadById/${id}`, { headers: authHeader() });
    }
    getFGeoDownloadByIds(ids){
        return axios.get(API_URL + `getFGeoDownloadByIds/${ids}`, { headers: authHeader() });
    }
    getAllFGeoDownloadByParent(fdivisionBean){
        return axios.get(API_URL + `getAllFGeoDownloadByParent/${fdivisionBean}`, { headers: authHeader() });
    }
    getPostAllFGeoDownloadContainingExt(item){
        // console.log(JSON.stringify(item))
        return axios.post(API_URL + `getPostAllFGeoDownloadContainingExt`, item, { headers: authHeader() });
    }
    getPostAllFGeoDownloadContainingExtPublic(item){
        // console.log(JSON.stringify(item))
        return axios.post(API_URL + `public/getPostAllFGeoDownloadContainingExt`, item, { headers: authHeader() });
    }
    createFGeoDownload(item){
        return axios.post(API_URL + `createFGeoDownload`, item, {headers: authHeader()})
    }
    createFGeoDownloadPublik(item){
        return axios.post(API_URL + `public/createFGeoDownload`, item, {headers: authHeader()})
    }
    createFGeoDownloadMultiple(items){
        return axios.post(API_URL + `public/createFGeoDownloadMultiple`, items, {headers: authHeader()})
    }
    updateFGeoDownload(item){
        return axios.put(API_URL + `updateFGeoDownload/${item.id}`, item, {headers: authHeader()})
    }
    deleteFGeoDownload(id){
        return axios.delete(API_URL + `deleteFGeoDownload/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFGeoDownload(itemIds){
        // let user = JSON.parse(localStorage.getItem('user'));
        // return axios.delete(API_URL + `deleteAllFGeoDownload`, {
        //     headers:  authHeaderMultipart(),
        //     data: {
        //         message: 'delete  success'
        //     }
        // });
        return axios.delete(API_URL + `deleteAllFGeoDownload`, {
            headers:  authHeader(),
            data: itemIds
        });


    }
}
export default new FGeoDownloadService()