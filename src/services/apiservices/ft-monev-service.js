import axios from 'axios';
import authHeader from "../auth-header";
import ConstApiUrls from "../const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FtMonevService {
    getApiUrl() {
        return API_URL
    }
    getAllFtMonev(){
        return axios.get(API_URL + `getAllFtMonev`, { headers: authHeader() });
    }
    getAllFtMonevPublic(){
        return axios.get(API_URL + `public/getAllFtMonev`, { headers: authHeader() });
    }
    getAllFtMonevContaining(page, pageSize, sortBy, order, search){
        // return axios.get(API_URL + `getAllFtMonev`, { headers: authHeaderMultipart() });
        return axios.get(API_URL + `getAllFtMonevContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getAllFtMonevContainingPublic(page, pageSize, sortBy, order, search){
        // return axios.get(API_URL + `getAllFtMonev`, { headers: authHeaderMultipart() });
        return axios.get(API_URL + `public/getAllFtMonevContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getFtMonevById(id){
        return axios.get(API_URL + `getFtMonevById/${id}`, { headers: authHeader() });
    }
    getFtMonevByIdPublic(id){
        return axios.get(API_URL + `public/getFtMonevById/${id}`, { headers: authHeader() });
    }
    getFtMonevByIds(ids){
        return axios.get(API_URL + `getFtMonevByIds/${ids}`, { headers: authHeader() });
    }
    getAllFtMonevByParent(fdivisionBean){
        return axios.get(API_URL + `getAllFtMonevByParent/${fdivisionBean}`, { headers: authHeader() });
    }
    getPostAllFtMonevContainingExt(item){
        return axios.post(API_URL + `getPostAllFtMonevContainingExt`, item, { headers: authHeader() });
    }
    getPostAllFtMonevWithDateRangeContainingExt(item){
        return axios.post(API_URL + `getPostAllFtMonevWithDateRangeContainingExt`, item, { headers: authHeader() });
    }
    getAllFtMonevSimpleExcel(item){
        return axios.post(API_URL + `getAllFtMonevSimpleExcel`, item, { headers: authHeader(), responseType: 'blob' });
    }
    getAllFtMonevOnlyExcel(item){
        return axios.post(API_URL + `getAllFtMonevOnlyExcel`, item, { headers: authHeader(), responseType: 'blob' });
    }
    getAllFtMonevWithDetailExcel(item){
        return axios.post(API_URL + `getAllFtMonevWithDetailExcel`, item, { headers: authHeader(), responseType: 'blob' });
    }
    countAllDataWithDateRangeContainingExt(item){
        return axios.post(API_URL + `countAllDataWithDateRangeContainingExt`, item, { headers: authHeader() });
    }
    countPersonTopPerform(item){
        return axios.post(API_URL + `countPersonTopPerform`, item, { headers: authHeader() });
    }

    getPostAllFtMonevContainingExtPublic(item){
        // console.log(JSON.stringify(item))
        return axios.post(API_URL + `public/getPostAllFtMonevContainingExt`, item, { headers: authHeader() });
    }
    createFtMonev(item){
        return axios.post(API_URL + `createFtMonev`, item, {headers: authHeader()})
    }
    createFtMonevMultiple(items){
        return axios.post(API_URL + `createFtMonevMultiple`, items, {headers: authHeader()})
    }
    updateFtMonev(item){
        return axios.put(API_URL + `updateFtMonev/${item.id}`, item, {headers: authHeader()})
    }
    updateFtMonevResponse(item){
        return axios.put(API_URL + `updateFtMonevResponse/${item.id}`, item, {headers: authHeader()})
    }
    updateFtMonevAllowSubmit(item){
        return axios.put(API_URL + `updateFtMonevAllowSubmit/${item.id}`, item, {headers: authHeader()})
    }
    updateFtMonevSelesaiKasus(item){
        return axios.put(API_URL + `updateFtMonevSelesaiKasus/${item.id}`, item, {headers: authHeader()})
    }

    deleteFtMonev(id){
        return axios.delete(API_URL + `deleteFtMonev/${id}`, {
            headers: authHeader()
        });
    }
    deleteFtMonevAndChildren(id){
        return axios.delete(API_URL + `deleteFtMonevAndChildren/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFtMonev(itemIds){
        // let user = JSON.parse(localStorage.getItem('user'));
        // return axios.delete(API_URL + `deleteAllFtMonev`, {
        //     headers:  authHeaderMultipart(),
        //     data: {
        //         message: 'delete  success'
        //     }
        // });
        return axios.delete(API_URL + `deleteAllFtMonev`, {
            headers:  authHeader(),
            data: itemIds
        });


    }
}
export default new FtMonevService()