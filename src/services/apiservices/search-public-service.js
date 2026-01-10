import axios from 'axios';
import authHeader from "../../services/auth-header";
import ConstApiUrls from "../../services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class SearchPublicService {

    getSearchResult(sortBy, order, search){
        return axios.get(API_URL + `public/getSearchResult?sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }
    getSearchDatasetResult(sortBy, order, search){
        return axios.get(API_URL + `public/getSearchDatasetResult?sortBy=${sortBy}&order=${order}&search=${search}`, { headers: authHeader() });
    }

}
export default new SearchPublicService()