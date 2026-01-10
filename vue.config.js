const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    productionSourceMap: false,

  transpileDependencies: true,
    // publicPath: process.env.NODE_ENV === 'production'
    //     ? '/public-cek-lokasi-usaha/'
    //     : '/',

  pluginOptions: {
    vuetify: {
			// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
		}
  },
    // === Tambahkan ini! === nanti pindah ke public/manifest.json untuk menambahkan Icon Custome PWA
    // pwa: {
    //     name: 'Monev Perizinan',
    //     themeColor: '#2196f3',
    //     msTileColor: '#2196f3',
    //     manifestOptions: {
    //         background_color: '#fff'
    //     }
    //     // Bisa tambah config lain sesuai kebutuhan
    // }


})
