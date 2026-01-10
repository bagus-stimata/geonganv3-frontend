import axios from "axios";
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL;

class FtDataDetilService {
  getApiUrl() {
    return API_URL;
  }
  getAllFtDataDetil() {
    return axios.get(API_URL + `getAllFtDataDetil`, { headers: authHeader() });
  }
  getAllFtDataDetilPublic() {
    return axios.get(API_URL + `public/getAllFtDataDetil`, {
      headers: authHeader(),
    });
  }
  getAllFtDataDetilContaining(page, pageSize, sortBy, order, search) {
    // return axios.get(API_URL + `getAllFtDataDetil`, { headers: authHeaderMultipart() });
    return axios.get(
      API_URL +
        `getAllFtDataDetilContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`,
      { headers: authHeader() }
    );
  }
  getAllFtDataDetilByParent(FtDataDetilBean) {
    return axios.get(API_URL + `getAllFtDataDetilByParent/${FtDataDetilBean}`, {
      headers: authHeader(),
    });
  }
  getAllFtDataDetilByFtDataHeader(ftDataHeaderBean) {
    return axios.get(API_URL + `getAllFtDataDetilByFtDataHeader/${ftDataHeaderBean}`, {
      headers: authHeader(),
    });
  }
  getPostFtDataDetilByFtDataHeaderIds(ftDataHeaderIds) {
    return axios.post(API_URL + `getPostFtDataDetilByFtDataHeaderIds`, ftDataHeaderIds, {
      headers: authHeader(),
    });
  }
  getPostFtDataDetilByFtDataHeaderIdsPublic(ftDataHeaderIds) {
    return axios.post(API_URL + `public/getPostFtDataDetilByFtDataHeaderIds`, ftDataHeaderIds, {
      headers: authHeader(),
    });
  }

  getFtDataDetilById(id) {
    return axios.get(API_URL + `getFtDataDetilById/${id}`, {
      headers: authHeader(),
    });
  }


  updateFtDataDetil(item) {
    return axios.put(API_URL + `updateFtDataDetil/${item.id}`, item, {
      headers: authHeader(),
    });
  }
  createFtDataDetil(item) {
    return axios.post(API_URL + `createFtDataDetil`, item, {
      headers: authHeader(),
    });
  }
  deleteFtDataDetil(id) {
    return axios.delete(API_URL + `deleteFtDataDetil/${id}`, {
      headers: authHeader(),
    });
  }
  deleteAllFtDataDetil(itemIds) {
    return axios.delete(API_URL + `deleteAllFtDataDetil`, {
      headers: authHeader(),
      data: itemIds,
    });
  }
}
export default new FtDataDetilService();
