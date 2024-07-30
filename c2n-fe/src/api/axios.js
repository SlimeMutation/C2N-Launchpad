import axios from 'axios'
const qs = require('qs');
const { API_DOMAIN } = require('@src/config')

function convertBaseURL() {
  return API_DOMAIN;
}


axios.defaults.baseURL = convertBaseURL();
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

// Create axios instance
const http = axios.create({
  timeout: 150000,
})

http.interceptors.request.use(function(config) {
  const method = config.method || 'get';
  // Add headers here
  return config;
}, function(error) {
  console.error(error);
  return Promise.reject(error);
});

// reponse interceptor
http.interceptors.response.use(function(response) {
  let config = response.config;
  const method = config.method || 'get';

  if (response.data) {
    if(!response.data.code) {
      return response.data;
    }
    switch (response.data.code) {
      case 200: // success
        break;
      default:
        return Promise.reject(response.data);
    }
  }
  return response ? response.data : {}
}, function(error) {
  return Promise.reject()
});


http.postRequest = (url, params, config) => {
  return new Promise((resolve, reject) => {
    const dataStr = qs.stringify(params, {
      arrayFormat: 'brackets'
    });

    http.post(url, dataStr, config)
      .then(response => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      })
  })
};

http.getRequest = (url, params) => {
  let querystr = params.params ? params.params : {};

  if(url !== '') { // xx接口不需要phone和token
    params.params = querystr;
  }

  return new Promise((resolve, reject) => {
    http.get(url, params)
      .then(response => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      })
  })
};

http.putRequest = (url, params, config) => {
  return new Promise((resolve, reject) => {
    const dataStr = qs.stringify(params, {
      arrayFormat: 'brackets'
    });

    http.put(url, dataStr, config)
      .then(response => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};


export default http;
