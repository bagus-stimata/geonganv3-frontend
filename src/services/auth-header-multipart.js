export default function authHeaderMultipart() {
  let user = JSON.parse(localStorage.getItem('user'));

  if (user && user.accessToken) {
    return {
      'Authorization': 'Bearer ' + user.accessToken,
      // 'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'multipart/form-data'
    };
    // return { 'x-access-token': user.accessToken };       // for Node.js Express back-end
  } else {
    return {};
  }
}
