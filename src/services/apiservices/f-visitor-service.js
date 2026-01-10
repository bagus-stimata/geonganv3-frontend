import axios from 'axios';
import authHeader from "../../services/auth-header";
import ConstApiUrls from "../../services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FVisitorService {
    getApiUrl() {
        return API_URL
    }
    getAllFVisitor(){
        return axios.get(API_URL + `getAllFVisitor`, { headers: authHeader() });
    }
    getAllFVisitorPublic(){
        return axios.get(API_URL + `public/getAllFVisitor`, { headers: authHeader() });
    }
    getAllFVisitorByCompany(){
        return axios.get(API_URL + `getAllFVisitorByCompany`, { headers: authHeader() });
    }
    getAllFVisitorContaining(page, pageSize, sortBy, order, search){
        return axios.get(API_URL + `getAllFVisitorContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getAllFVisitorContainingPublic(page, pageSize, sortBy, order, search){
        return axios.get(API_URL + `public/getAllFVisitorContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }

    getFVisitorById(id){
        return axios.get(API_URL + `getFVisitorById/${id}`, { headers: authHeader() });
    }
    updateFVisitor(item){
        return axios.put(API_URL + `updateFVisitor/${item.id}`, item, {headers: authHeader()})
    }
    createFVisitor(item){
        return axios.post(API_URL + `createFVisitor`, item, {headers: authHeader()})
    }
    deleteFVisitor(id){
        return axios.delete(API_URL + `deleteFVisitor/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFVisitor(itemIds){
        return axios.delete(API_URL + `deleteAllFVisitor`, {
            headers:  authHeader(),
            data: itemIds
        });
    }

    addFVisitorCount(item){
        // console.log(item);
        return axios.post(API_URL + `public/addVisitorCount`, item, {headers: authHeader()})
    }
    countVisitorIndonesiaAndOtherCountry(item){
        return axios.post(API_URL + `public/countVisitorIndonesiaAndOtherCountry`, item, {headers: authHeader()})
    }
    countVisitorByCity(item){
        return axios.post(API_URL + `public/countVisitorByCity`, item, {headers: authHeader()})
    }
    countVisitorByCityAndYear(item){
        return axios.post(API_URL + `public/countVisitorByCityAndYear`, item, {headers: authHeader()})
    }

    getVisitorCountByCityAndMonth(startDateLong, endDateLong){
        return axios.get(API_URL + `public/getVisitorCountByCityAndMonth?startDateLong=${startDateLong}&endDateLong=${endDateLong}`, { headers: authHeader() });
    }
    getVisitorCountByCityAndWeek(startDateLong, endDateLong){
        return axios.get(API_URL + `public/getVisitorCountByCityAndWeek?startDateLong=${startDateLong}&endDateLong=${endDateLong}`, { headers: authHeader() });
    }
    getVisitorCountByCityAndDate(startDateLong, endDateLong){
        return axios.get(API_URL + `public/getVisitorCountByCityAndDate?startDateLong=${startDateLong}&endDateLong=${endDateLong}`, { headers: authHeader() });
    }


}
export default new FVisitorService()