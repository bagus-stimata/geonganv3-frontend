import axios from "axios";
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL;

class FtDataService {
  getApiUrl() {
    return API_URL;
  }
  getAllFtData() {
    return axios.get(API_URL + `getAllFtData`, { headers: authHeader() });
  }
  getAllFtDataPublic() {
    return axios.get(API_URL + `public/getAllFtData`, {
      headers: authHeader(),
    });
  }
  getAllFtDataContaining(page, pageSize, sortBy, order, search) {
    // return axios.get(API_URL + `getAllFtData`, { headers: authHeaderMultipart() });
    return axios.get(
      API_URL +
        `getAllFtDataContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`,
      { headers: authHeader() }
    );
  }
  getPostAllFtDataContainingExt(item){
    return axios.post(API_URL + `getPostAllFtDataContainingExt`, item, { headers: authHeader() });
  }
  
  getFtDataById(id) {
    return axios.get(API_URL + `getFtDataById/${id}`, {
      headers: authHeader(),
    });
  }
  getFtDataByIdPublic(id) {
    return axios.get(API_URL + `public/getFtDataById/${id}`, {
      headers: authHeader(),
    });
  }
  getFtDataByIdWithChilds(id) {
    return axios.get(API_URL + `getFtDataByIdWithChilds/${id}`, {
      headers: authHeader(),
    });
  }
  getFtDataByIdWithChildsPublic(id) {
    return axios.get(API_URL + `public/getFtDataByIdWithChilds/${id}`, {
      headers: authHeader(),
    });
  }

  createCopyYearFtData(toYear) {
    return axios.post(API_URL + `createCopyYearFtData`, toYear, {
      headers: authHeader(),
    });
  }

  updateFtData(item) {
    return axios.put(API_URL + `updateFtData/${item.id}`, item, {
      headers: authHeader(),
    });
  }
  createFtData(item) {
    return axios.post(API_URL + `createFtData`, item, {
      headers: authHeader(),
    });
  }
  deleteFtData(id) {
    return axios.delete(API_URL + `deleteFtData/${id}`, {
      headers: authHeader(),
    });
  }
  deleteAllFtData(itemIds) {
    return axios.delete(API_URL + `deleteAllFtData`, {
      headers: authHeader(),
      data: itemIds,
    });
  }
}
export default new FtDataService();
