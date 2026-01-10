import axios from "axios";
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL;

class UserDetilService {
  getApiUrl() {
    return API_URL;
  }
  getAllUserDetil() {
    return axios.get(API_URL + `getAllUserDetil`, {
      headers: authHeader(),
    });
  }
  getAllUserDetilContaining(page, pageSize, sortBy, order, search) {
    // return axios.get(API_URL + `getAllUserDetil`, { headers: authHeaderMultipart() });
    return axios.get(
      API_URL +
        `getAllUserDetilContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`,
      { headers: authHeader() }
    );
  }
  getAllUserDetilByParent(userBean) {
    return axios.get(
      API_URL + `getAllUserDetilByParent/${userBean}`,
      {
        headers: authHeader(),
      }
    );
  }
  getAllUserDetilByParentPublic(userBean) {
    return axios.get(
        API_URL + `public/getAllUserDetilByParent/${userBean}`,
        {
          headers: authHeader(),
        }
    );
  }

  getAllUserDetilByParentIn(userBeanIds) {
    return axios.get(
      API_URL + `getAllUserDetilByParentIn/${userBeanIds}`,
      { headers: authHeader() }
    );
  }
  getUserDetilById(id) {
    return axios.get(API_URL + `getUserDetilById/${id}`, {
      headers: authHeader(),
    });
  }
  updateUserDetil(item) {
    return axios.put(API_URL + `updateUserDetil/${item.id}`, item, {
      headers: authHeader(),
    });
  }
  createUserDetil(item) {
    return axios.post(API_URL + `createUserDetil`, item, {
      headers: authHeader(),
    });
  }
  deleteUserDetil(id) {
    return axios.delete(API_URL + `deleteUserDetil/${id}`, {
      headers: authHeader(),
    });
  }
  deleteAllUserDetil(itemIds) {
    // let user = JSON.parse(localStorage.getItem('user'));
    // return axios.delete(API_URL + `deleteAllUserDetil`, {
    //     headers:  authHeaderMultipart(),
    //     data: {
    //         message: 'delete  success'
    //     }
    // });
    return axios.delete(API_URL + `deleteAllUserDetil`, {
      headers: authHeader(),
      data: itemIds,
    });
  }
}
export default new UserDetilService();
