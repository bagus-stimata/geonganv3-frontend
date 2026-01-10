import ConstApiUrls from "../../services/const-api-urls";
import axios from "axios";
import authHeader from "../../services/auth-header";

const API_URL = ConstApiUrls.API_SERVICE_URL

class SippoinFileService {
    getApiUrl() {
        return API_URL
    }
    image_url_ori(file_name){
        return API_URL + `storage/files_image_ori/${file_name}`
    }
    image_url_verylow(file_name){
        return API_URL + `storage/files_image_verylow/${file_name}`
    }
    image_url_low(file_name){
        return API_URL + `storage/files_image_low/${file_name}`
    }
    image_url_medium(file_name){
        return API_URL + `storage/files_image_medium/${file_name}`
    }
    image_url_high(file_name){
        return API_URL + `storage/files_image_high/${file_name}`
    }
    downloadAndCompressFilesPotensi(ids) {
        return axios.post(API_URL + `storage/files_potensi`, ids, {
            responseType: 'arraybuffer',  // Set responseType to handle binary data
        });
    }
    deleteImage(file_name){
        return axios.delete(API_URL + `storage/deleteimage/${file_name}`, {
            headers: authHeader()
        });
    }

    file_url(file_name){
        return API_URL + `storage/files/${file_name}`
    }
    fileGeojsonGzip(file_name){
        return API_URL + `storage/encode/geojsongzip/${file_name}`
    }

    fileStreamMp4File(file_name){
        return API_URL + `storage/stream/mp4/${file_name}`
    }
    downloadImage(file_name){
        return axios.get(API_URL + `storage/files_image_high/${file_name}`, { headers: authHeader(), responseType:'blob' });
    }
    getImageTest(){
        return "http://localhost:8181/api/smartejakon/storage/files_image_medium/image_kegiatan_1.jpg";
    }

}
export default new SippoinFileService()