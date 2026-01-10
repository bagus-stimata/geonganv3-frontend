import axios from "axios";
import authHeader from "@/services/auth-header";
import ConstApiUrls from "./const-api-urls";

const API_URL = ConstApiUrls.AUTH_SERVICE_URL;

class UserService {
  getApiUrl() {
    return API_URL;
  }
  getAllUserSimple() {
    return axios.get(API_URL + `getAllUserSimple`, { headers: authHeader() });
  }
  getAllUserContaining(page, pageSize, sortBy, order, search) {
    // return axios.get(API_URL + `getAllUser`, { headers: authHeaderMultipart() });
    return axios.get(
      API_URL +
        `getAllUserContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`,
      { headers: authHeader() }
    );
  }
  getUserBasicInfo(id) {
    return axios.get(API_URL + `getUserBasicInfo/${id}`, { headers: authHeader() });
  }
  getUserById(id) {
    return axios.get(API_URL + `getUserById/${id}`, { headers: authHeader() });
  }

  getUserByUsername(username) {
    return axios.get(API_URL + `getUserByUsername/${username}`, {
      headers: authHeader(),
    });
  }
  getIdByWhatsappNumber(whatsApp) {
    return axios.get(API_URL + `public/getIdByWhatsappNumber/${whatsApp}`, {
      headers: authHeader(),
    });
  }

  updateUser(item) {
    return axios.put(API_URL + `updateUser/${item.id}`, item, {
      headers: authHeader(),
    });
  }
  updateUserRemark1(item) {
    return axios.put(API_URL + `public/updateUserRemark1/${item.id}`, item, {
      headers: authHeader(),
    });
  }
  updateUserEnroll(item) {
    return axios.put(API_URL + `updateUserEnroll/${item.id}`, item, {
      headers: authHeader(),
    });
  }
  createUser(item) {
    return axios.post(API_URL + `createUser`, item, { headers: authHeader() });
  }
  deleteUser(id) {
    return axios.delete(API_URL + `deleteUser/${id}`, {
      headers: authHeader(),
    });
  }
  deleteAllUser(itemIds) {
    // let user = JSON.parse(localStorage.getItem('user'));
    // return axios.delete(API_URL + `deleteAllUser`, {
    //     headers:  authHeaderMultipart(),
    //     data: {
    //         message: 'delete  success'
    //     }
    // });
    return axios.delete(API_URL + `deleteAllUser`, {
      headers: authHeader(),
      data: itemIds,
    });
  }
}

export default new UserService();
