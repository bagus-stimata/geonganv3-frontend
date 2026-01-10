import axios from 'axios';
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class ApiFonnteService {
    getApiUrl() {
        return API_URL
    }
    getGoogleApiKey(simpleMessage){
        return axios.post(API_URL + `ext/google/googleApiKey`, simpleMessage,{ headers: authHeader() });
    }

}
export default new ApiFonnteService()