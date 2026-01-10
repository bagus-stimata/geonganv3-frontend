<template>
  <v-container>
    <v-card>
      <v-card-text>

        <v-row>
          <v-col
            cols="12"
            sm="6"
            md="6"
          >

            <header>
              <h3>
                <v-icon small>mdi-account</v-icon> <strong>username: {{currentUser.username}}</strong> <span class="font-weight-light caption">*{{currentUser.id}}</span>
              </h3>
              <p>
                <v-icon small>mdi-email</v-icon> <strong>email: </strong>
                {{currentUser.email}}
              </p>
            </header>
            <div class="caption">
              <strong>Token:</strong>
              {{currentUser.accessToken.substring(0, 20)}} ... {{currentUser.accessToken.substr(currentUser.accessToken.length - 20)}}
            </div>

            <strong>Authorities:</strong>
            <ul class="subtitle-2">
              <li v-for="(role,index) in currentUser.roles" :key="index">{{role}}</li>
            </ul>

            <div class="mt-4">
              <strong>Division/Bidang: </strong>
              {{lookupFDivision(currentUser.fdivisionBean)}} <span class="font-weight-light caption">*{{currentUser.fdivisionBean}}</span>
            </div>
            <div>
              <strong>Level Organisasi: </strong>
              {{currentUser.organizationLevel}}
            </div>

          </v-col>

          <v-col
              cols="12"
              sm="6"
              md="6"
          >

            <v-container class="text-center">
              <v-row
                  class="fill-height"
                  align="center"
                  justify="center"
              >
                <template>
                  <v-col
                      cols="12"
                      md="6"
                      sm="6"
                  >
                    <v-hover v-slot="{ hover }">
                      <v-card
                          :elevation="hover ? 10 : 1"
                          :class="[{ 'on-hover': hover }, hover?'card-hover-opacity':'card-not-hover-opacity']"
                      >
                        <v-img
                            :lazy-src="lookupImageUrlLazy(itemModified)"
                            :src="lookupImageUrl(itemModified)"
                            height="225px"
                        >
                          <v-card-title class="text-h6 white--text fill-height">

                            <v-row
                                class="fill-height flex-column"
                                justify="space-between"
                            >
                              <v-spacer/>
                              <div class="align-self-center">
                                <v-btn
                                    :class="{ 'show-btns': hover }"
                                    :color="transparent"
                                    icon
                                    large
                                    dark
                                    outlined
                                    @click="showDialogUpload"
                                >
                                  <v-icon
                                      :class="{ 'show-btns': hover }"
                                      :color="transparent"
                                      large
                                  >
                                    mdi-upload
                                  </v-icon>
                                </v-btn>
                              </div>
                            </v-row>

                          </v-card-title>
                        </v-img>

                      </v-card>
                    </v-hover>
                  </v-col>
                </template>
              </v-row>
            </v-container>

          </v-col>


        </v-row>

      </v-card-text>

    </v-card>

    <v-form ref="form" v-model="valid" >
      <v-card class="mt-4">
        <v-card-title>
          Ubah Password <span class="subtitle-2 font-weight-light"> *{{itemModified.id}}</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
              v-model="itemModified.password"
              label="Password"
              :rules="[required, min5]"
              :counter="5"
              hide-details="auto"
              @click:append="showPassword = !showPassword"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPassword ? 'text' : 'password'"
              clearable
          >
          </v-text-field>

          <v-text-field
              v-model="confirmPassword"
              label="Confirm Password"
              hide-details="auto"
              type="password"
              counter="5"
              :rules="[required, min5_password, matchingPasswords ]"
              clearable
          ></v-text-field>
        </v-card-text>
      </v-card>

      <v-card class="mt-4">
        <v-card-text>
          <v-text-field
              v-model="itemModified.fullName"
              label="Nama Lengkap"
              hide-details="auto"
              type="text"
          ></v-text-field>
          <v-text-field
              v-model="itemModified.phone"
              label="Phone"
              hide-details="auto"
              prepend-inner-icon="mdi-phone"
              prefix="+62"
          ></v-text-field>
        </v-card-text>

      </v-card>

      <v-container>
        <v-btn color="primary" block
        @click="save"
       :disabled="!valid || isItemModified===false"
        ><v-icon color="red">mdi-content-save</v-icon>Save</v-btn>
      </v-container>
    </v-form>

    <InfoDialog
        ref="refInfoDialog"
        :infoDialogTitle="infoDialogTitle"
        :infoDialogMessage="infoDialogMessage"
    ></InfoDialog>

    <UploadImageDialog
        ref="refUploadDialog"
        @eventUploadSuccess="completeUploadSuccess"
    >
    </UploadImageDialog>

    <v-snackbar
        v-model="snackbar"
    >
      {{ snackBarMesage }}
      <template v-slot:action="{ attrs }">
        <v-btn
            text
            v-bind="attrs"
            @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

  </v-container>
</template>

<script>
import FDivisionService from "@/services/apiservices/f-division-service";
import UserService from "@/services/user-service";
import AuthService from "@/services/auth-service";
import InfoDialog from "@/components/utils/ConfirmDialog.vue";
import FileService from "@/services/apiservices/file-service";
import UploadImageDialog from "@/components/utils/UploadImageDialog";

export default {
  name: "FChangeProfile",
  components:{
    InfoDialog, UploadImageDialog
  },
  data(){
    return{
      snackBarMesage: '',
      snackbar: false,

      showPassword: false,
      confirmPassword: '',

      infoDialogTitle: '',
      infoDialogMessage: '',

      itemModified: '',
      itemsFDivision: [
        { id: 0, kode1: '', description: '-' },
      ],
      itemsFSalesman:[
        {id:0, kode1:'', description: '-'}
      ],

      valid: false,
      rulesLenght: [
        v => !!v || ' Tidak Boleh Kosong',
        v => v.length <= 255 || 'Maksimal 255 Karakter',
        v => v.length > 3 || 'Harus lebih besar dari 3 karakter'
      ],
      rulesNotEmtpy: [
        v => !!v || 'Tidak boleh kosong'
      ],

      transparent: 'rgba(255, 255, 255, 0)',
    }
  },
  computed:{
    currentUser() {
      return this.$store.state.auth.user;
    },
    isItemModified() {
      const defaultItem = JSON.stringify(this.itemDefault)
      const modifiedItem = JSON.stringify(this.itemModified)
      return defaultItem !== modifiedItem
    },

    isPasswordModified(){
      if (this.itemDefault===undefined || this.itemDefault.password===undefined){
        return false
      }
      const defaultPassword = JSON.stringify(this.itemDefault?.password??'')
      const modifiedPassword = JSON.stringify(this.itemModified.password)
      return defaultPassword !== modifiedPassword
    }


  },
  methods:{
    save(){
      //di proses di server -> Jika kosong maka tidak akan dirubah di server
      // this.itemModified.password = ''
      if (this.$refs.form.validate()){
        AuthService.updateUser(this.itemModified).then(
            response => {
              console.log(response.data)

              this.infoDialogTitle = 'Info'
              this.infoDialogMessage = 'Sukses simpan user'
              this.$refs.refInfoDialog.showDialog()

            },
            error => {
              console.log(error.message);
              // this.formDialogOptions.errorMessage = error.response.data
            }
        )
      }

    },


    fetchUsers() {
      if (this.currentUser !==undefined) {
        UserService.getUserByUsername(this.currentUser.username).then(
            response => {


              this.itemModified = response.data
              this.itemModified.roles = this.rolesToArray(this.itemModified.roles)
              this.itemDefault = Object.assign({}, response.data)
              // this.itemDefault.roles = this.rolesToArray(this.itemDefault.roles)

              // console.log(`${this.itemDefault} >> ${this.itemModified}`)

            },
            error => {
              console.log(error.response)
              // if (error.response.statusCode === 401) {
              //   this.snackBarMesage = "Anda tidak mempunyai Akses!!"
              //   this.snackbar = true
              // }
            }
        )
      }
    },

    showDialogUpload(){
      if (this.itemModified.username !==undefined &&
          this.itemModified.fdivisionBean !==undefined){

        if (this.itemModified.id===0){
          // this.$emit('eventSaveItemWithoutClose', false)
          this.saveCreateOnly()
        }
        this.$refs.refUploadDialog.showDialog()

      }else{
        this.snackBarMesage = 'Deskripsi dan Divisi harus diisi dahulu'
        this.snackbar = true
      }

    },
    completeUploadSuccess: function (val){

      // console.log(val)
      //Hapus Dulu yang lama
      // console.log(this.itemModified.avatarImage)
      if (this.itemModified.avatarImage !==undefined && this.itemModified.avatarImage !== '' ) {
        FileService.deleteImage(this.itemModified.avatarImage).then(
            response => {
              console.log(response.data)
            },
            error => {
              console.log(error.response)
            }
        )
      }

      if (val.fileName !==""){
        this.$refs.refUploadDialog.closeDialog()
        this.itemModified.avatarImage = val.fileName
        // this.saveUpdateOnly()
        this.save()
      }

    },

    fetchParent() {
      FDivisionService.getAllFDivision().then(
          response => {
            this.itemsFDivision = response.data
          },
          error => {
            console.log(error.response)
          }
      )
    },

    lookupFDivision (fdivisionBean) {
      const str = this.itemsFDivision.filter(x => x.id===fdivisionBean)
      if (str.length>0){
        return str[0].description
      }else {
        return '-'
      }
    },
    lookupImageUrl(item){
      if (item.avatarImage===undefined || item.avatarImage===""){
        return require('@/assets/images/no_image_available.jpeg')
      }else {
        return FileService.image_url_medium(item.avatarImage)
      }
    },
    lookupImageUrlLazy(){
      return  require('@/assets/images/no_image_available.jpeg')
    },

    rolesToArray(roles){
      let arrRoles = []
      roles.forEach(
          role=>{
            arrRoles.push(role.name);
          }
      )
      return arrRoles
    },



    required: function(value) {
      if (value!==undefined) {
        return true;
      } else {
        return 'This field is required.';
      }
    },
    min5: function(value) {
      if (value.length >= 5 ) {
        return true;
      } else {
        return 'Password should have more than 5 characters.';
      }
    },
    min5_password: function(value) {
      if (this.isPasswordModified) {
        if (value.length >= 5) {
          return true;
        } else {
          return 'Password should have more than 5 characters.';
        }
      }else {
        return true
      }
    },

    matchingPasswords: function() {
      if (this.isPasswordModified){
        if (this.itemModified.password === this.confirmPassword) {
          return true;
        } else if(this.itemModified.password !== this.confirmPassword) {
          return 'Passwords does not match.';
        }

      }else {
        return true
      }

    },



  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push('/login');
    }else{
      this.fetchParent();
      this.fetchUsers();
    }

  }


}
</script>

<style scoped>
  .card-hover-opacity{
    opacity: 0.4;
  }
  .card-not-hover-opacity{
    opacity: 1;
    transition: opacity .4s ease-in-out;
  }

  .show-btns {
    color: blue !important;
    opacity: 1;
  }
</style>