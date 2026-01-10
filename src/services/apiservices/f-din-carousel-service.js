import axios from 'axios';
import authHeader from "../../services/auth-header";
import ConstApiUrls from "../../services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FDinCarouselService {
    getApiUrl() {
        return API_URL
    }

    getAllFDinCarousel(){
        return axios.get(API_URL + `getAllFDinCarousel`, { headers: authHeader() });
    }
    getAllFDinCarouselByOrgLevel(){
        return axios.get(API_URL + `getAllFDinCarouselByOrgLevel`, { headers: authHeader() });
    }

    getAllFDinCarouselContainingExt(fdinCarouselFilter){
        return axios.post(API_URL + `getAllFDinCarouselContainingExt`, fdinCarouselFilter,{ headers: authHeader() });
    }
    getAllFDinCarouselContaining(page, pageSize, sortBy, order, search){
        // return axios.get(API_URL + `getAllFDinCarousel`, { headers: authHeaderMultipart() });
        return axios.get(API_URL + `getAllFDinCarouselContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getPostAllFDinCarouselContainingExt(item){
        return axios.post(API_URL + `getPostAllFDinCarouselContainingExt`, item, { headers: authHeader() });
    }

    getFDinCarouselById(id){
        return axios.get(API_URL + `getFDinCarouselById/${id}`, { headers: authHeader() });
    }
    updateFDinCarousel(item){
        return axios.put(API_URL + `updateFDinCarousel/${item.id}`, item, {headers: authHeader()})
    }
    createFDinCarousel(item){
        return axios.post(API_URL + `createFDinCarousel`, item, {headers: authHeader()})
    }
    createFDinCarouselMultiple(item){
        return axios.post(API_URL + `createFDinCarouselMultiple`, item, {headers: authHeader()})
    }
    deleteFDinCarousel(id){
        return axios.delete(API_URL + `deleteFDinCarousel/${id}`, {
            headers: authHeader()
        });
    }
    deleteAllFDinCarousel(itemIds){

        return axios.delete(API_URL + `deleteAllFDinCarousel`, {
            headers:  authHeader(),
            data: itemIds
        });
    }

    getAllFDinCarouselByTypePublic(tipe){
        return axios.get(API_URL + `public/getAllFDinCarouselByTypePublic/${tipe}`, { headers: authHeader() });
    }

}
export default new FDinCarouselService()