import axios from "axios"
import authHeader from "@/services/auth-header"
import ConstApiUrls from "./const-api-urls"


const API_URL = ConstApiUrls.AUTH_SERVICE_URL

class RoleService {
    getApiUrl() {
        return API_URL
    }
    getAllRole(){
        return axios.get(API_URL + `getAllRole`, { headers: authHeader() });
    }
    getRoleById(id){
        return axios.get(API_URL + `getRoleById/${id}`, { headers: authHeader() });
    }

}

export default new RoleService()
