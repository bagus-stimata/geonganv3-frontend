import axios from "axios";
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL;

class FIndikatorService {
  getApiUrl() {
    return API_URL;
  }
  getAllFIndikator() {
    return axios.get(API_URL + `getAllFIndikator`, { headers: authHeader() });
  }
  getAllFIndikatorPublic() {
    return axios.get(API_URL + `public/getAllFIndikator`, {
      headers: authHeader(),
    });
  }
  getAllFIndikatorContaining(page, pageSize, sortBy, order, search) {
    // return axios.get(API_URL + `getAllFIndikator`, { headers: authHeaderMultipart() });
    return axios.get(
      API_URL +
        `getAllFIndikatorContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`,
      { headers: authHeader() }
    );
  }
  getPostAllFIndikatorContainingExt(item) {
    return axios.post(API_URL + `getPostAllFIndikatorContainingExt`, item, {
      headers: authHeader(),
    });
  }
  getPostAllFIndikatorContainingExtPublic(item) {
    return axios.post(API_URL + `public/getPostAllFIndikatorContainingExt`, item, {
      headers: authHeader(),
    });
  }

  getPostAllFIndikatorContainingYearsExt(item) {
    return axios.post(API_URL + `getPostAllFIndikatorContainingYearsExt`, item, {
      headers: authHeader(),
    });
  }
  getPostAllFIndikatorContainingYearsExtPublic(item) {
    return axios.post(API_URL + `public/getPostAllFIndikatorContainingYearsExt`, item, {
      headers: authHeader(),
    });
  }
  getPostAllFIndikatorContainingYearsShowHomePublic(item) {
    return axios.post(API_URL + `public/getPostAllFIndikatorContainingYearsShowHome`, item, {
      headers: authHeader(),
    });
  }

  getFIndikatorById(id) {
    return axios.get(API_URL + `getFIndikatorById/${id}`, {
      headers: authHeader(),
    });
  }
  updateFIndikator(item) {
    return axios.put(API_URL + `updateFIndikator/${item.id}`, item, {
      headers: authHeader(),
    });
  }
  createFIndikator(item) {
    return axios.post(API_URL + `createFIndikator`, item, {
      headers: authHeader(),
    });
  }
  createFIndikatorMultiple(item) {
    return axios.post(API_URL + `createFIndikatorMultiple`, item, {
      headers: authHeader(),
    });
  }
  deleteFIndikator(id) {
    return axios.delete(API_URL + `deleteFIndikator/${id}`, {
      headers: authHeader(),
    });
  }
  deleteAllFIndikator(itemIds) {
    return axios.delete(API_URL + `deleteAllFIndikator`, {
      headers: authHeader(),
      data: itemIds,
    });
  }
}
export default new FIndikatorService();
