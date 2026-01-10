import axios from 'axios';
import authHeader from ".//auth-header";
import ConstApiUrls from ".//const-api-urls";

const API_URL = ConstApiUrls.AUTH_SERVICE_URL

class AuthService {
  login(user) {
    return axios
      .post(API_URL + 'signin', {
        username: user.username,
        password: user.password
      })
      .then(response => {
        if (response.data.accessToken) {
          localStorage.setItem('user', JSON.stringify(response.data));

          // /**
          //  * test
          //  */
          // axios.get("http://localhost:8080/api/test/user", {
          //   headers:{
          //     'Authorization': 'Bearer ' +response.data.accessToken
          //   }
          // })

          // console.log(response.data)
        }

        return response.data;
      });
  }

  logout() {
    localStorage.removeItem('user');
  }

  registerPublicUmkm(user) {
    return axios.post(
        API_URL + "public/signup_umkm",
        {
          username: user.username,
          email: user.email,
          password: user.password,
          fdivisionBean: user.fdivisionBean,
          roles: user.roles,
          organizationLevel: user.organizationLevel,
          phone: user.phone,
          contryCode: user.countryCode,
          avatarImage: user.avatarImage,
          birthDate: user.birthDate,
          fullName: user.fullName,
        },
        { headers: authHeader() }
    );
  }
  //REGISTERNYA MASIH HARUS OLEH AUTHENTICATOR
  register(user) {
    return axios.post(API_URL + 'signup', {
      username: user.username,
      email: user.email,
      password: user.password,
      fdivisionBean: user.fdivisionBean,
      roles: user.roles,
      organizationLevel: user.organizationLevel,
      phone: user.phone,
      contryCode: user.countryCode,
      avatarImage: user.avatarImage,
      birthDate: user.birthDate,
      fullName: user.fullName,
      salesmanOf: user.salesmanOf
    }, { headers: authHeader() });
  }

  updateUser(user) {
    // console.log(`${user.username} >> ${user.email} >> ${user.password}
    //   >> ${user.fdivisionBean} >> ${JSON.stringify(user.roles)} >> ${user.organizationLevel} >>
    //   ${user.fullName} >> ${user.phone} `)

    return axios.post(API_URL + 'updateUser', {
      username: user.username,
      email: user.email,
      password: user.password,
      fdivisionBean: user.fdivisionBean,
      roles: user.roles,
      organizationLevel: user.organizationLevel,
      phone: user.phone,
      contryCode: user.countryCode,
      avatarImage: user.avatarImage,
      birthDate: user.birthDate,
      fullName: user.fullName,
      salesmanOf: user.salesmanOf

    }, { headers: authHeader() });
  }
  updateUserPasswordX(user){
    // console.log(JSON.stringify(user))
    return axios.put(API_URL + `public/updateUserPassword/${user.id}`, user, {headers: authHeader()})
  }
  updateUserPassword(user){
    // console.log(JSON.stringify(user))
    const data = {
      username: user.username,
      email: user.email,
      password: user.password
    }
    return axios.put(API_URL + `public/updateUserPassword/${user.id}`, data, {headers: authHeader()})
  }
  /**
   * User Crud
   */
  getAllUser() {
    return axios.get(API_URL + 'user', { headers: authHeader() });
  }

}

export default new AuthService();
