import axios from "axios";
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL;

class FtDataHeaderService {
  getApiUrl() {
    return API_URL;
  }
  getAllFtDataHeader() {
    return axios.get(API_URL + `getAllFtDataHeader`, { headers: authHeader() });
  }
  getAllFtDataHeaderPublic() {
    return axios.get(API_URL + `public/getAllFtDataHeader`, {
      headers: authHeader(),
    });
  }
  getAllFtDataHeaderContaining(page, pageSize, sortBy, order, search) {
    // return axios.get(API_URL + `getAllFtDataHeader`, { headers: authHeaderMultipart() });
    return axios.get(
      API_URL +
        `getAllFtDataHeaderContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`,
      { headers: authHeader() }
    );
  }
  getAllFtDataHeaderByParent(FtDataHeaderBean) {
    return axios.get(
      API_URL + `getAllFtDataHeaderByParent/${FtDataHeaderBean}`,
      { headers: authHeader() }
    );
  }
  getFtDataHeaderById(id) {
    return axios.get(API_URL + `getFtDataHeaderById/${id}`, {
      headers: authHeader(),
    });
  }
  updateFtDataHeader(item) {
    return axios.put(API_URL + `updateFtDataHeader/${item.id}`, item, {
      headers: authHeader(),
    });
  }
  createFtDataHeader(item) {
    return axios.post(API_URL + `createFtDataHeader`, item, {
      headers: authHeader(),
    });
  }
  deleteFtDataHeader(id) {
    return axios.delete(API_URL + `deleteFtDataHeader/${id}`, {
      headers: authHeader(),
    });
  }
  deleteAllFtDataHeader(itemIds) {
    // let user = JSON.parse(localStorage.getItem('user'));
    // return axios.delete(API_URL + `deleteAllFtDataHeader`, {
    //     headers:  authHeaderMultipart(),
    //     data: {
    //         message: 'delete  success'
    //     }
    // });
    return axios.delete(API_URL + `deleteAllFtDataHeader`, {
      headers: authHeader(),
      data: itemIds,
    });
  }
}
export default new FtDataHeaderService();
