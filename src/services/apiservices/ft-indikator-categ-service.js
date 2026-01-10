import axios from "axios";
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL;

class FtIndikatorCategService {
  getApiUrl() {
    return API_URL;
  }
  getAllFtIndikatorCateg() {
    return axios.get(API_URL + `getAllFtIndikatorCateg`, {
      headers: authHeader(),
    });
  }
  getAllFtIndikatorCategPublic() {
    return axios.get(API_URL + `public/getAllFtIndikatorCateg`, {
      headers: authHeader(),
    });
  }
  getAllFtIndikatorCategContaining(page, pageSize, sortBy, order, search) {
    // return axios.get(API_URL + `getAllFtIndikatorCateg`, { headers: authHeaderMultipart() });
    return axios.get(
      API_URL +
        `getAllFtIndikatorCategContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`,
      { headers: authHeader() }
    );
  }
  getAllFtIndikatorCategByParent(FtIndikatorCategBean) {
    return axios.get(
      API_URL + `getAllFtIndikatorCategByParent/${FtIndikatorCategBean}`,
      { headers: authHeader() }
    );
  }
  getFtIndikatorCategById(id) {
    return axios.get(API_URL + `getFtIndikatorCategById/${id}`, {
      headers: authHeader(),
    });
  }
  updateFtIndikatorCateg(item) {
    return axios.put(API_URL + `updateFtIndikatorCateg/${item.id}`, item, {
      headers: authHeader(),
    });
  }
  createFtIndikatorCateg(item) {
    return axios.post(API_URL + `createFtIndikatorCateg`, item, {
      headers: authHeader(),
    });
  }
  deleteFtIndikatorCateg(id) {
    return axios.delete(API_URL + `deleteFtIndikatorCateg/${id}`, {
      headers: authHeader(),
    });
  }
  deleteAllFtIndikatorCateg(itemIds) {
    // let user = JSON.parse(localStorage.getItem('user'));
    // return axios.delete(API_URL + `deleteAllFtIndikatorCateg`, {
    //     headers:  authHeaderMultipart(),
    //     data: {
    //         message: 'delete  success'
    //     }
    // });
    return axios.delete(API_URL + `deleteAllFtIndikatorCateg`, {
      headers: authHeader(),
      data: itemIds,
    });
  }
}
export default new FtIndikatorCategService();
