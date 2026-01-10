import axios from 'axios';
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class SippoinDayaDukungService {
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


}
export default new SippoinDayaDukungService()