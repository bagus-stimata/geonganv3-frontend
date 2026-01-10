import axios from "axios";
import authHeader from "@/services/auth-header";
import ConstApiUrls from "@/services/const-api-urls";

const API_URL = ConstApiUrls.API_SERVICE_URL;

class FtDatasetsetService {
    getApiUrl() {
        return API_URL;
    }

    /**
     * Ambil semua dataset (sesuai role user).
     * @param {boolean} includeGeojson - kalau true, backend kirim field `geojson`
     */
    getAllFtDataset(includeGeojson = false) {
        return axios.get(
            API_URL + `getAllFtDataset?includeGeojson=${includeGeojson}`,
            { headers: authHeader() }
        );
    }

    /**
     * Versi public: semua dataset yang boleh diakses publik.
     */
    getAllFtDatasetPublic(includeGeojson = false) {
        return axios.get(
            API_URL + `public/getAllFtDataset?includeGeojson=${includeGeojson}`,
            { headers: authHeader() }
        );
    }

    /**
     * Pencarian + paging untuk dataset (sesuai role user).
     */
    getAllFtDatasetContaining(
        page,
        pageSize,
        sortBy,
        order,
        search,
        includeGeojson = false
    ) {
        const qSearch = encodeURIComponent(search ?? "");
        const qSortBy = encodeURIComponent(sortBy ?? "");
        const qOrder = encodeURIComponent(order ?? "");

        return axios.get(
            API_URL +
            `getAllFtDatasetContaining` +
            `?page=${page}` +
            `&pageSize=${pageSize}` +
            `&sortBy=${qSortBy}` +
            `&order=${qOrder}` +
            `&search=${qSearch}` +
            `&includeGeojson=${includeGeojson}`,
            { headers: authHeader() }
        );
    }

    /**
     * Versi POST dengan filter lebih kompleks (FIndikatorFilter).
     * `includeGeojson` tetap lewat query param.
     */
    getPostAllFtDatasetContainingExt(item, includeGeojson = false) {
        return axios.post(
            API_URL + `getPostAllFtDatasetContainingExt?includeGeojson=${includeGeojson}`,
            item,
            { headers: authHeader() }
        );
    }

    /**
     * Ambil satu dataset by id (private, pakai auth, role-aware).
     */
    getFtDatasetById(id, includeGeojson = false) {
        return axios.get(
            API_URL + `getFtDatasetById/${id}?includeGeojson=${includeGeojson}`,
            { headers: authHeader() }
        );
    }

    /**
     * Ambil satu dataset by id (public).
     */
    getFtDatasetByIdPublic(id, includeGeojson = false) {
        return axios.get(
            API_URL + `public/getFtDatasetById/${id}?includeGeojson=${includeGeojson}`,
            { headers: authHeader() }
        );
    }

    // -- endpoint with childs: belum kita ubah karena controller belum pakai includeGeojson --

    getFtDatasetByIdWithChilds(id) {
        return axios.get(API_URL + `getFtDatasetByIdWithChilds/${id}`, {
            headers: authHeader(),
        });
    }

    getFtDatasetByIdWithChildsPublic(id) {
        return axios.get(API_URL + `public/getFtDatasetByIdWithChilds/${id}`, {
            headers: authHeader(),
        });
    }

    /**
     * Utility: copy dataset per tahun.
     */
    createCopyYearFtDataset(toYear) {
        return axios.post(API_URL + `createCopyYearFtDataset`, toYear, {
            headers: authHeader(),
        });
    }

    /**
     * Update dataset.
     * Catatan:
     * - Kalau lo TIDAK kirim field `geojson` di `item`, maka backend akan
     *   mempertahankan geojson lama + geom + centroid (sesuai aturan prepareForSave).
     */
    updateFtDataset(item) {
        return axios.put(API_URL + `updateFtDataset/${item.id}`, item, {
            headers: authHeader(),
        });
    }

    /**
     * Create dataset baru (id = 0).
     */
    createFtDataset(item) {
        return axios.post(API_URL + `createFtDataset`, item, {
            headers: authHeader(),
        });
    }

    deleteFtDataset(id) {
        return axios.delete(API_URL + `deleteFtDataset/${id}`, {
            headers: authHeader(),
        });
    }

    deleteAllFtDataset(itemIds) {
        return axios.delete(API_URL + `deleteAllFtDataset`, {
            headers: authHeader(),
            data: itemIds,
        });
    }
}

export default new FtDatasetsetService();