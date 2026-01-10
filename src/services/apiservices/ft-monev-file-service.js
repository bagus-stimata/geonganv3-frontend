import axios from "axios";
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL;

class FtMonevFileService {
  getApiUrl() {
    return API_URL;
  }
  getAllFtMonevFile() {
    return axios.get(API_URL + `getAllFtMonevFile`, { headers: authHeader() });
  }
  getFtMonevFileById(id) {
    return axios.get(API_URL + `getFtMonevFileById/${id}`, {
      headers: authHeader(),
    });
  }
  getFtMonevFileByIdPublic(id) {
    return axios.get(API_URL + `public/getFtMonevFileById/${id}`, {
      headers: authHeader(),
    });
  }
  getAllFtMonevFileByParent(id) {
    return axios.get(API_URL + `getAllFtMonevFileByParent/${id}`, {
      headers: authHeader(),
    });
  }
  getAllFtMonevFileByParentPublic(id) {
    return axios.get(API_URL + `public/getAllFtMonevFileByParent/${id}`, {
      headers: authHeader(),
    });
  }

  updateFtMonevFile(item) {
    return axios.put(API_URL + `updateFtMonevFile/${item.id}`, item, {
      headers: authHeader(),
    });
  }
  createFtMonevFile(item) {
    return axios.post(API_URL + `createFtMonevFile`, item, {
      headers: authHeader(),
    });
  }
  deleteFtMonevFile(id) {
    return axios.delete(API_URL + `deleteFtMonevFile/${id}`, {
      headers: authHeader(),
    });
  }
  deleteAllFtMonevFile(itemIds) {
    return axios.delete(API_URL + `deleteAllFtMonevFile`, {
      headers: authHeader(),
      data: itemIds,
    });
  }
}
export default new FtMonevFileService();
