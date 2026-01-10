import axios from "axios";
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL;

class FArticleCategService {
  getApiUrl() {
    return API_URL;
  }
  getAllFArticleCateg() {
    return axios.get(API_URL + `getAllFArticleCateg`, {
      headers: authHeader(),
    });
  }
  getAllFArticleCategByDivision(fdivisionBean) {
    return axios.get(API_URL + `getAllFArticleCategByDivision/${fdivisionBean}`, {
      headers: authHeader(),
    });
  }
  getAllFArticleCategPublic() {
    return axios.get(API_URL + `public/getAllFArticleCateg`, {
      headers: authHeader(),
    });
  }
  getAllFArticleCategContaining(page, pageSize, sortBy, order, search) {
    return axios.get(
        API_URL +
        `getAllFArticleCategContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`,
        { headers: authHeader() }
    );
  }
  getFArticleCategById(id) {
    return axios.get(API_URL + `getFArticleCategById/${id}`, {
      headers: authHeader(),
    });
  }
  getFArticleCategByIdPublic(id) {
    return axios.get(API_URL + `public/getFArticleCategById/${id}`, {
      headers: authHeader(),
    });
  }
  updateFArticleCateg(item) {
    return axios.put(API_URL + `updateFArticleCateg/${item.id}`, item, {
      headers: authHeader(),
    });
  }
  createFArticleCateg(item) {
    return axios.post(API_URL + `createFArticleCateg`, item, {
      headers: authHeader(),
    });
  }
  deleteFArticleCateg(id) {
    return axios.delete(API_URL + `deleteFArticleCateg/${id}`, {
      headers: authHeader(),
    });
  }
  deleteAllFArticleCateg(itemIds) {
    // let user = JSON.parse(localStorage.getItem('user'));
    // return axios.delete(API_URL + `deleteAllFArticleCateg`, {
    //     headers:  authHeaderMultipart(),
    //     data: {
    //         message: 'delete  success'
    //     }
    // });
    return axios.delete(API_URL + `deleteAllFArticleCateg`, {
      headers: authHeader(),
      data: itemIds,
    });
  }

  getAllFArticleCategContainingPublic(page, pageSize, sortBy, order, search) {
    return axios.get(
        API_URL +
        `public/getAllFArticleCategContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`,
        { headers: authHeader() }
    );
  }

}
export default new FArticleCategService();
