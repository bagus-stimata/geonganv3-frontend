import axios from "axios";
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL;

class FtIndikatorDataService {
  getApiUrl() {
    return API_URL;
  }
  getAllFtIndikatorData() {
    return axios.get(API_URL + `getAllFtIndikatorData`, {
      headers: authHeader(),
    });
  }
  getAllFtIndikatorDataPublic() {
    return axios.get(API_URL + `public/getAllFtIndikatorData`, {
      headers: authHeader(),
    });
  }
  getAllFtIndikatorDataContaining(page, pageSize, sortBy, order, search) {
    // return axios.get(API_URL + `getAllFtIndikatorData`, { headers: authHeaderMultipart() });
    return axios.get(
      API_URL +
        `getAllFtIndikatorDataContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`,
      { headers: authHeader() }
    );
  }
  getAllFtIndikatorDataByParent(FtIndikatorDataBean) {
    return axios.get(
      API_URL + `getAllFtIndikatorDataByParent/${FtIndikatorDataBean}`,
      { headers: authHeader() }
    );
  }
  getFtIndikatorDataById(id) {
    return axios.get(API_URL + `getFtIndikatorDataById/${id}`, {
      headers: authHeader(),
    });
  }
  updateFtIndikatorData(item) {
    return axios.put(API_URL + `updateFtIndikatorData/${item.id}`, item, {
      headers: authHeader(),
    });
  }
  createFtIndikatorData(item) {
    console.log(JSON.stringify(item))
    return axios.post(API_URL + `createFtIndikatorData`, item, {
      headers: authHeader(),
    });
  }
  deleteFtIndikatorData(id) {
    return axios.delete(API_URL + `deleteFtIndikatorData/${id}`, {
      headers: authHeader(),
    });
  }
  deleteAllFtIndikatorData(itemIds) {

    return axios.delete(API_URL + `deleteAllFtIndikatorData`, {
      headers: authHeader(),
      data: itemIds,
    });
  }
}
export default new FtIndikatorDataService();
