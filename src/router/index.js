import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        name: '',
        component: () => import('../views/public/HomeView.vue')
    },
    {
        path: '/home',
        name: 'Home',
        component: () => import('../views/public/HomeView.vue')
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("../views/public/LoginView.vue"),
    },
    {
        path: '/change-profile',
        name: 'ChangeProfile',
        component: () =>
            import ('../views/admin/ChangeProfile'),
    },


    // ADMIN
    {
        path: '/dashboard',
        name: 'AdminDashboardUtama',
        component: () => import('../views/admin/dashboard/DashboardView.vue')
    },
    {
        path: '/admin-berita-agenda',
        name: 'AdminBeritaAgenda',
        component: () => import('../views/admin/berita/BeritaAgendaView.vue')
    },
    {
        path: '/admin-sektor',
        name: 'AdminSektor',
        component: () => import('@/views/admin/setup/SektorView.vue')
    },
    {
        path: '/admin-satuan',
        name: 'AdminSatuan',
        component: () => import('@/views/admin/setup/SatuanView.vue')
    },
    {
        path: '/admin-division',
        name: 'AdminDivision',
        component: () => import('@/views/admin/setup/DivisionView.vue')
    },
    {
        path: '/admin-wilayah',
        name: 'AdminWilayah',
        component: () => import('../views/admin/setup/WilayahView.vue')
    },
    {
        path: '/admin-din-carousel',
        name: 'AdminDinCarousel',
        component: () => import('@/views/admin/setup/DinCarouselView.vue')
    },

    {
        path: '/admin-dayadukung-type',
        name: 'AdminDayaDukungType',
        component: () => import('@/views/admin/data-peta/DayaDukungTypeView.vue')
    },
    {
        path: '/data-peta-peta',
        name: 'AdminDataDukungPetaView',
        component: () => import('@/views/admin/data-peta/DataDukungPetaView.vue')
    },
    {
        path: '/admin-data-peta-dataset',
        name: 'AdminDataPetaDatasetView',
        component: () => import('@/views/admin/data-peta/DataPetaDatasetView.vue')
    },
    {
        path: '/admin-data-peta-tabular',
        name: 'AdminDataPetaTabularView',
        component: () => import('@/views/admin/data-peta/DataPetaTabularView.vue')
    },
    {
        path: '/admin-satuan',
        name: 'AdminSatuan',
        component: () => import('@/views/admin/data-peta/SatuanView.vue')
    },

    {
        path: '/admin-sistem',
        name: 'AdminSistem',
        component: () => import('../views/admin/setting/UserView.vue')
    },
    {
        path: '/admin-struktur-organisasi-sistem',
        name: 'AdminStrukturSistem',
        component: () => import('../views/admin/setting/StrukturSistemView.vue')
    },
    {
        path: '/admin-setting-one',
        name: 'AdminSettingOne',
        component: () => import('../views/admin/setting/SettingOneView.vue')
    },
    // ADMIN E-LIBRARY
    {
        path: '/admin-arsip-categ',
        name: 'AdminArsipCateg',
        component: () => import('../views/admin/e-library/ArticleCategView.vue')
    },
    {
        path: '/admin-arsip',
        name: 'AdminArsip',
        component: () => import('../views/admin/e-library/ArticleView.vue')
    },
    {
        path: '/test-google-maps',
        name: 'TestTabSectionView',
        component: () => import('../views/test/TesGoogleMaps.vue')
    },
    {
        path: '/test-leaflet-google-maps',
        name: 'TestTabSectionView',
        component: () => import('../views/test/TesLeafletGoogleMaps.vue')
    },
    {
        path: '/test-ensri-leaflet',
        name: 'TestRDTRView',
        component: () => import('../views/test/TestRDTRView.vue')
    },

    {
        path: '/public-peta-persebaran',
        name: 'PetaPersebaranView',
        component: () => import('../views/public/PetaPersebaranView.vue')
    },
    {
        path: '/public-map',
        name: 'PublicMapView',
        component: () => import('../views/public/PetaInteraktifView.vue')
    },
    {
        path: '/public-e-library',
        name: 'PublicElibrary',
        component: () => import('../views/public/e-library/ElibraryView.vue')
    },
    {
        path: "/public-dataset",
        name: "DatasetView",
        component: () => import("../views/public/DatasetView.vue"),
    },
    {
        path: '/public-e-library-detil/:id',
        name: 'PublicLibraryDetail',
        component: () =>
            import ('../views/public/e-library/ElibraryDetailView.vue')
    },
    {
        path: '/public-berita',
        name: 'PublicBerita',
        component: () => import('../views/public/berita/BeritaView.vue')
    },


];

const router = createRouter({
    // Ganti BASE_URL dengan process.env.BASE_URL
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;