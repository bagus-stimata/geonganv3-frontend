import ConstApiUrls from "../../services/const-api-urls";
import axios from "axios";
import authHeader from "../../services/auth-header";

const API_URL = ConstApiUrls.API_SERVICE_URL

class FileService {
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
    deleteFile(file_name){
        return axios.delete(API_URL + `storage/deletefiles/${file_name}`, {
            headers: authHeader()
        });
    }
    deleteFileGeojsonGzip(file_name){
        return axios.delete(API_URL + `storage/delete-file-geojson-gzip/${file_name}`, {
            headers: authHeader()
        });
    }

    file_url(file_name){
        return API_URL + `storage/files/${file_name}`
    }
    signature_url(file_name){
        return API_URL + `storage/signatures/${file_name}`
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
    rotateCw90(file_name){
        return axios.get(API_URL + `storage/rotate-cw90/${file_name}`, {
            headers: authHeader()
        });
    }
    rotateCcw90(file_name){
        return axios.get(API_URL + `storage/rotate-ccw90/${file_name}`, {
            headers: authHeader()
        });
    }

    getImageTest(){
        return "http://localhost:8181/api/smartejakon/storage/files_image_medium/image_kegiatan_1.jpg";
    }

    generatePdfWasdalBapKonfirmasi(item){
        return API_URL + `public/itext/wasdal-bap-konfirmasi/${item.id}?t=${Date.now()}`
    }
    generatePdfWasdalBapKonfirmasiEncode(encodeText){
        return API_URL + `public/itext/wasdal-bap-konfirmasi-encode/${encodeText}?t=${Date.now()}`
    }
    downloadAndCompressFilesMonevById(ftMonevBean){
        return API_URL + `storage/file_monev/${ftMonevBean}`
    }
    generatePdfMediasiKlarifikasi(item){
        return API_URL + `public/itext/mediasi-klarifikasi/${item.id}?t=${Date.now()}`
    }
    generatePdfMediasiKlarifikasiEncode(encodeText){
        return API_URL + `public/itext/mediasi-klarifikasi-encode/${encodeText}?t=${Date.now()}`
    }

}
export default new FileService()