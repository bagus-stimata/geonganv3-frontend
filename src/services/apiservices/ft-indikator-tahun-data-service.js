import axios from "axios";
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL;

class FtIndikatorTahunDataService {
  getApiUrl() {
    return API_URL;
  }
  getAllFtIndikatorTahunData() {
    return axios.get(API_URL + `getAllFtIndikatorTahunData`, {
      headers: authHeader(),
    });
  }
  getAllFtIndikatorTahunDataPublic() {
    return axios.get(API_URL + `public/getAllFtIndikatorTahunData`, {
      headers: authHeader(),
    });
  }
  getAllFtIndikatorTahunDataContaining(page, pageSize, sortBy, order, search) {
    // return axios.get(API_URL + `getAllFtIndikatorTahunData`, { headers: authHeaderMultipart() });
    return axios.get(
      API_URL +
        `getAllFtIndikatorTahunDataContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`,
      { headers: authHeader() }
    );
  }
  getAllFtIndikatorTahunDataByParent(FtIndikatorTahunDataBean) {
    return axios.get(
      API_URL +
        `getAllFtIndikatorTahunDataByParent/${FtIndikatorTahunDataBean}`,
      { headers: authHeader() }
    );
  }
  getFtIndikatorTahunDataById(id) {
    return axios.get(API_URL + `getFtIndikatorTahunDataById/${id}`, {
      headers: authHeader(),
    });
  }
  updateFtIndikatorTahunData(item) {
    return axios.put(API_URL + `updateFtIndikatorTahunData/${item.id}`, item, {
      headers: authHeader(),
    });
  }
  createFtIndikatorTahunData(item) {
    return axios.post(API_URL + `createFtIndikatorTahunData`, item, {
      headers: authHeader(),
    });
  }
  deleteFtIndikatorTahunData(id) {
    return axios.delete(API_URL + `deleteFtIndikatorTahunData/${id}`, {
      headers: authHeader(),
    });
  }
  deleteAllFtIndikatorTahunData(itemIds) {
    // let user = JSON.parse(localStorage.getItem('user'));
    // return axios.delete(API_URL + `deleteAllFtIndikatorTahunData`, {
    //     headers:  authHeaderMultipart(),
    //     data: {
    //         message: 'delete  success'
    //     }
    // });
    return axios.delete(API_URL + `deleteAllFtIndikatorTahunData`, {
      headers: authHeader(),
      data: itemIds,
    });
  }
}
export default new FtIndikatorTahunDataService();
