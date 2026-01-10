import axios from "axios";
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL;

class FArticleService {
  getApiUrl() {
    return API_URL;
  }
  getAllFArticle() {
    return axios.get(API_URL + `getAllFArticle`, {
      headers: authHeader(),
    });
  }
  getAllFArticleByDivision(fdivisionBean) {
    return axios.get(API_URL + `getAllFArticleByDivision/${fdivisionBean}`, {
      headers: authHeader(),
    });
  }
  getAllFArticlePublic() {
    return axios.get(API_URL + `public/getAllFArticle`, {
      headers: authHeader(),
    });
  }
  getAllFArticleContaining(page, pageSize, sortBy, order, search) {
    return axios.get(
      API_URL +
        `getAllFArticleContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`,
      { headers: authHeader() }
    );
  }
  getFArticleById(id) {
    return axios.get(API_URL + `getFArticleById/${id}`, {
      headers: authHeader(),
    });
  }
  getFArticleByIdPublic(id) {
    return axios.get(API_URL + `public/getFArticleById/${id}`, {
      headers: authHeader(),
    });
  }
  updateFArticle(item) {
    return axios.put(API_URL + `updateFArticle/${item.id}`, item, {
      headers: authHeader(),
    });
  }
  updateFArticleAddViewCount(item) {
    return axios.put(API_URL + `public/updateFArticleAddViewCount/${item.id}`, item, {
      headers: authHeader(),
    });
  }
  updateFArticleAddDownloadCount(item) {
    return axios.put(API_URL + `public/updateFArticleAddDownloadCount/${item.id}`, item, {
      headers: authHeader(),
    });
  }


  createFArticle(item) {
    return axios.post(API_URL + `createFArticle`, item, {
      headers: authHeader(),
    });
  }
  deleteFArticle(id) {
    return axios.delete(API_URL + `deleteFArticle/${id}`, {
      headers: authHeader(),
    });
  }
  deleteAllFArticle(itemIds) {
    return axios.delete(API_URL + `deleteAllFArticle`, {
      headers: authHeader(),
      data: itemIds,
    });
  }

  getAllFArticleContainingPublic(page, pageSize, sortBy, order, search) {
    return axios.get(
        API_URL +
        `public/getAllFArticleContaining?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`,
        { headers: authHeader() }
    );
  }

  getAllFArticleContainingExtPublic(extendedFilter){
    return axios.post(API_URL + `public/getAllFArticleContainingExt`, extendedFilter,{ headers: authHeader() });
  }
  getAllFArticleContainingYearsExtPublic(extendedFilter){
    return axios.post(API_URL + `public/getAllFArticleContainingYearsExt`, extendedFilter,{ headers: authHeader() });
  }
  getAllFArticleContainingYearsExtWithCategGroupPublic(extendedFilter){
    return axios.post(API_URL + `public/getAllFArticleContainingYearsExtWithCategGroup`, extendedFilter,{ headers: authHeader() });
  }


}
export default new FArticleService();
