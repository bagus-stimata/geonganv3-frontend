import axios from 'axios';
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL

class ApiFonnteService {
    getApiUrl() {
        return API_URL
    }
    postFonnteSendMessagePublic(simpleMessage){
        return axios.post(API_URL + `public/postFonnteSendMessage`, simpleMessage,{ headers: authHeader() });
    }
    postFonnteSendMessages(simpleMessages){
        return axios.post(API_URL + `postFonnteSendMessages`, simpleMessages,{ headers: authHeader() });
    }

}
export default new ApiFonnteService()