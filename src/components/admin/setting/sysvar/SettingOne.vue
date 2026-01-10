<template>
  <div>
    <v-row class="mx-2">
      <v-col class="font-weight-bold text-blue">SETTING APLIKASI</v-col>
    </v-row>
    <v-row justify="center" class="mx-4">
      <v-expansion-panels variant="inset">
        <v-expansion-panel>
            <v-expansion-panel-title>
              <div>Fonnte Whatsapp Notifikasi dan Token</div>
            </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                    v-model="itemModified.tokenFonnte"
                    label="Token Whatsapp Fonnte"
                    variant="outlined"
                    density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                    v-model="itemModified.tokenFonntePublic"
                    :items="itemsStatusPublic"
                    item-title="status"
                    item-value="status"
                    Label="Penggunaan Public atau Private Token"
                    variant="outlined"
                    density="compact"
                ></v-select>
              </v-col>
            </v-row>
            <v-row no-gutters class="mt-4">
              <v-col cols="12" md="12">
                <v-text-field
                    v-model="itemModified.urlValidasiFonnte"
                    label="URL Utama untuk Aktifkasi Akun (Tidak dipakai untuk update terbaru)"
                    variant="outlined"
                    density="compact"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" md="12">
                <v-text-field
                    v-model="itemModified.msgValidasiFonnte1"
                    :label="tambahPesanTagarUntukAktifkan('Pesan Whatsapp untuk Permintaan Validasi Akun')"
                    variant="outlined"
                    density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field
                    v-model="itemModified.msgValidasiFonnte2"
                    label="Pesan penutup"
                    variant="outlined"
                    density="compact"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>
            <v-row no-gutters>
              <v-col cols="12" md="12">
                <v-textarea
                    rows="2"
                    v-model="itemModified.msgTokenRegFonnte1"
                    :label="tambahPesanTagarUntukAktifkan(itemModified.msgTokenRegFonnte0)"
                    variant="outlined"
                    density="compact"
                ></v-textarea>

              </v-col>
              <v-col cols="12" md="12">
                <v-text-field
                    v-model="itemModified.msgTokenRegFonnte2"
                    label="Pesan penutup"
                    variant="outlined"
                    density="compact"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" md="12">
                <v-textarea
                    rows="2"
                    v-model="itemModified.msgTokenVerFonnte1"
                    :label="tambahPesanTagarUntukAktifkan(itemModified.msgTokenVerFonnte0)"
                    variant="outlined"
                    density="compact"
                ></v-textarea>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field
                    v-model="itemModified.msgTokenVerFonnte2"
                    label="Pesan penutup"
                    variant="outlined"
                    density="compact"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-expansion-panel-text>

        </v-expansion-panel>
      </v-expansion-panels>
    </v-row>
    <v-row>
      <v-col class="mx-4">
        <v-btn variant="flat" color="primary" @click="saveSetting" :disabled="!isItemModified">Simpan</v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import FSysvarService from "@/services/apiservices/f-sysvar-service";

export default {
  name: "SettingOne",
  components: {},
  data() {
    return {
      itemModified: {
        tokenFonnte: '',
        tokenFonntePublic: '',
        urlValidasiFonnte: '',
        msgValidasiFonnte1: '',
        msgValidasiFonnte2: '',

        msgTokenRegFonnte1: '',
        msgTokenRegFonnte2: '',
        msgTokenVerFonnte1: '',
        msgTokenVerFonnte2: '',

      },
      itemDefault: undefined,

      itemsStatusPublic: [
        {status: 'Public'},
        {status: 'Private'},
      ],
      itemsFSysvarCompany: []
    }
  },
  computed: {
    isItemModified() {
      const defaultItem = JSON.stringify(this.itemDefault);
      const modifiedItem = JSON.stringify(this.itemModified);
      return defaultItem !== modifiedItem;
    },
  },
  methods: {
    saveSetting() {
      const tokenFonnteItem = this.itemsFSysvarCompany.filter(x => x.kode1 === 'FN_TOKEN')[0]
      const urlValidasiFonnteItem = this.itemsFSysvarCompany.filter(x => x.kode1 === 'FN_VAL_URL')[0]
      const msgValidasiFonnteItem = this.itemsFSysvarCompany.filter(x => x.kode1 === 'FN_VAL_ACC_MSG')[0]

      const msgTokenRegFonnteItem = this.itemsFSysvarCompany.filter(x => x.kode1 === 'FN_TKN_REG_MSG')[0]
      const msgTokenVerFonnteItem = this.itemsFSysvarCompany.filter(x => x.kode1 === 'FN_TKN_VER_MSG')[0]

      tokenFonnteItem.nilaiString1 = this.itemModified.tokenFonnte
      tokenFonnteItem.nilaiString2 = this.itemModified.tokenFonntePublic

      urlValidasiFonnteItem.nilaiString1 = this.itemModified.urlValidasiFonnte

      msgValidasiFonnteItem.nilaiString1 = this.itemModified.msgValidasiFonnte1
      msgValidasiFonnteItem.nilaiString2 = this.itemModified.msgValidasiFonnte2

      msgTokenRegFonnteItem.nilaiString1 = this.itemModified.msgTokenRegFonnte1
      msgTokenRegFonnteItem.nilaiString2 = this.itemModified.msgTokenRegFonnte2

      msgTokenVerFonnteItem.nilaiString1 = this.itemModified.msgTokenVerFonnte1
      msgTokenVerFonnteItem.nilaiString2 = this.itemModified.msgTokenVerFonnte2

      const listFSysvarToSave = []
      listFSysvarToSave.push(tokenFonnteItem)
      listFSysvarToSave.push(urlValidasiFonnteItem)
      listFSysvarToSave.push(msgValidasiFonnteItem)

      listFSysvarToSave.push(msgTokenRegFonnteItem)
      listFSysvarToSave.push(msgTokenVerFonnteItem)

      FSysvarService.updateAllFSysvarCompany(listFSysvarToSave).then(
          () => {
            this.fetchData()
          }
      )

    },

    fetchData() {
      this.itemsFSysvarCompany = []
      FSysvarService.getAllFSysvarCompany().then(
          response => {
            this.itemsFSysvarCompany = response.data

            if (this.itemsFSysvarCompany.length > 0) {
              const item = {

                tokenFonnte: this.itemsFSysvarCompany.filter(x => x.kode1 === 'FN_TOKEN')[0].nilaiString1,
                tokenFonntePublic: this.itemsFSysvarCompany.filter(x => x.kode1 === 'FN_TOKEN')[0].nilaiString2,
                urlValidasiFonnte: this.itemsFSysvarCompany.filter(x => x.kode1 === 'FN_VAL_URL')[0].nilaiString1,
                msgValidasiFonnte1: this.itemsFSysvarCompany.filter(x => x.kode1 === 'FN_VAL_ACC_MSG')[0].nilaiString1,
                msgValidasiFonnte2: this.itemsFSysvarCompany.filter(x => x.kode1 === 'FN_VAL_ACC_MSG')[0].nilaiString2,

                msgTokenRegFonnte0: this.itemsFSysvarCompany.filter(x => x.kode1 === 'FN_TKN_REG_MSG')[0].description,
                msgTokenRegFonnte1: this.itemsFSysvarCompany.filter(x => x.kode1 === 'FN_TKN_REG_MSG')[0].nilaiString1,
                msgTokenRegFonnte2: this.itemsFSysvarCompany.filter(x => x.kode1 === 'FN_TKN_REG_MSG')[0].nilaiString2,

                msgTokenVerFonnte0: this.itemsFSysvarCompany.filter(x => x.kode1 === 'FN_TKN_VER_MSG')[0].description,
                msgTokenVerFonnte1: this.itemsFSysvarCompany.filter(x => x.kode1 === 'FN_TKN_VER_MSG')[0].nilaiString1,
                msgTokenVerFonnte2: this.itemsFSysvarCompany.filter(x => x.kode1 === 'FN_TKN_VER_MSG')[0].nilaiString2,

              }

              this.itemDefault = Object.assign({}, item)
              this.itemModified = item

            }

          }
      )
    },

    tambahPesanTagarUntukAktifkan(value) {
      var newValue = value
      newValue += " (Beri tanda # (Tagar) didepan untuk mengaktifkan)"
      return newValue;
    }
  },
  mounted() {
    this.fetchData()
  }
}

</script>


<style scoped>

</style>