import axios from 'axios';
import authHeader from './auth-header';
import ConstApiUrls from "../services/const-api-urls";

const API_URL = ConstApiUrls.TEST_SERVICE_URL
// const API_URL = 'http://localhost:8080/api/sastrodropship/';


class TestService {
  getApiUrl(){
      return API_URL
  }

  getPublicContent() {
    return axios.get(API_URL + 'all');
  }
  getUserBoard() {
    return axios.get(API_URL + 'user', { headers: authHeader() });
  }

  getModeratorBoard() {
    return axios.get(API_URL + 'mod', { headers: authHeader() });
  }

  getAdminBoard() {
    return axios.get(API_URL + 'admin', { headers: authHeader() });
  }
}

export default new TestService();
