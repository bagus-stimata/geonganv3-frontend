import axios from "axios";
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL;

class FtIndikatorTahunService {
  getApiUrl() {
    return API_URL;
  }
  getAllFtIndikatorTahun() {
    return axios.get(API_URL + `getAllFtIndikatorTahun`, {
      headers: authHeader(),
    });
  }
  getAllFtIndikatorTahunPublic() {
    return axios.get(API_URL + `public/getAllFtIndikatorTahun`, {
      headers: authHeader(),
    });
  }
  getAllFtIndikatorTahunContaining(page, pageSize, sortBy, order, search) {
    // return axios.get(API_URL + `getAllFtIndikatorTahun`, { headers: authHeaderMultipart() });
    return axios.get(
      API_URL +
        `getAllFtIndikatorTahunContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`,
      { headers: authHeader() }
    );
  }
  getAllFtIndikatorTahunByParent(FtIndikatorTahunBean) {
    return axios.get(
      API_URL + `getAllFtIndikatorTahunByParent/${FtIndikatorTahunBean}`,
      { headers: authHeader() }
    );
  }
  getFtIndikatorTahunById(id) {
    return axios.get(API_URL + `getFtIndikatorTahunById/${id}`, {
      headers: authHeader(),
    });
  }
  updateFtIndikatorTahun(item) {
    return axios.put(API_URL + `updateFtIndikatorTahun/${item.id}`, item, {
      headers: authHeader(),
    });
  }
  createFtIndikatorTahun(item) {
    return axios.post(API_URL + `createFtIndikatorTahun`, item, {
      headers: authHeader(),
    });
  }
  deleteFtIndikatorTahun(id) {
    return axios.delete(API_URL + `deleteFtIndikatorTahun/${id}`, {
      headers: authHeader(),
    });
  }
  deleteAllFtIndikatorTahun(itemIds) {
    // let user = JSON.parse(localStorage.getItem('user'));
    // return axios.delete(API_URL + `deleteAllFtIndikatorTahun`, {
    //     headers:  authHeaderMultipart(),
    //     data: {
    //         message: 'delete  success'
    //     }
    // });
    return axios.delete(API_URL + `deleteAllFtIndikatorTahun`, {
      headers: authHeader(),
      data: itemIds,
    });
  }
}
export default new FtIndikatorTahunService();
