import axios from 'axios';
import ConstApiUrls from "../../services/const-api-urls";
import authHeaderMultipart from "../../services/auth-header-multipart"

const API_URL = ConstApiUrls.API_SERVICE_URL

class FileUploadService {

    uploadImage(file, onUploadProgress) {
        let formData = new FormData();

        formData.append("file", file);

        return axios.post(API_URL +"storage/upload_image", formData, {
            headers: authHeaderMultipart() ,
            onUploadProgress
        });
    }

    uploadDocument(file, onUploadProgress) {
        let formData = new FormData();
        formData.append("file", file);

        return axios.post(API_URL +"storage/upload_file", formData, {
            headers: authHeaderMultipart() ,
            onUploadProgress
        });
    }
    uploadSignature(file, onUploadProgress) {
        let formData = new FormData();
        formData.append("file", file);

        return axios.post(API_URL +"storage/upload_signature", formData, {
            headers: authHeaderMultipart() ,
            onUploadProgress
        });
    }

    uploadGeoJsonToGzip(file, onUploadProgress) {
        let formData = new FormData();

        formData.append("file", file);

        console.log("uploadGeoJsonToGzip: ", file.fileName);

        return axios.post(API_URL +"storage/upload-geojson-to-gzip", formData, {
            headers: authHeaderMultipart() ,
            onUploadProgress
        });
    }
    uploadGeoJsonGzip(file, onUploadProgress) {
        let formData = new FormData();

        formData.append("file", file);

        return axios.post(API_URL +"storage/upload-geojson-gzip", formData, {
            headers: authHeaderMultipart() ,
            onUploadProgress
        });
    }

    uploadArcgisToGeojsonGzip(fileShp, fileShx, fileDbf, onUploadProgress) {
        let formData = new FormData();

        formData.append("fileShp", fileShp);
        formData.append("fileShx", fileShx);
        formData.append("fileDbf", fileDbf);

        return axios.post(API_URL +"storage/upload-arcgis-to-geojson-gzip", formData, {
            headers: authHeaderMultipart() ,
            onUploadProgress
        });
    }

}

export default new FileUploadService();