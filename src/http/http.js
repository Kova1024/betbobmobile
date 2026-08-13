import axios from 'axios' //引入
import { Dialog } from 'vant';
import router from './../router'

let baseURL = process.env.API_BASE_URL || 'https://devops.8888880.vip'

sessionStorage.setItem("baseURL", baseURL)

if (process.env.NODE_ENV === 'development') {
  baseURL = ''
}

let config = {
  baseURL: baseURL,
  timeout: 30000       //设置最大请求时间
}
const _axios = axios.create(config)

/* 请求拦截器（请求之前的操作） */
_axios.interceptors.request.use(
  config => {
    let token = sessionStorage.getItem('token') ? sessionStorage.getItem('token') : ''
    config.headers.Authorization = 'Bearer ' + token;
    return config;
  },
  err => Promise.reject(err)
);

/* 401 统一处理:弹窗后清登录态并跳登录页 */
function on401() {
  Dialog.alert({
    title: '认证失败',
    message: '您的账号登陆过期，请重新登陆',
  }).then(() => {
    localStorage.clear();
    sessionStorage.clear();
    router.replace('/login');
  });
}

/* 响应拦截器 */
_axios.interceptors.response.use(
  res => {
    // 兼容:个别接口若仍返回旧信封且 code=401,也走 401 逻辑
    if (res && res.data && res.data.code === 401) on401();
    return res;
  },
  err => {
    // 新后端:401 = HTTP 状态码
    if (err && err.response && err.response.status === 401) on401();
    return Promise.reject(err);
  }
);

/*
 * 新后端(Go+PostgreSQL)约定:成功=HTTP 2xx + 响应体即数据(无外层信封);
 * 失败=HTTP 状态码 + {error}。为不改动全部页面,这里统一适配回旧的 {code,data,message} 形态。
 */
function adaptSuccess(body) {
  // 若已是旧信封(个别接口可能仍返回)→ 原样透传
  if (body && typeof body === 'object' && typeof body.code === 'number' && ('data' in body || 'message' in body)) {
    return body;
  }
  let data = body;
  // 新分页 {list,total,page,size,pages} → 兼容旧 Laravel 分页对象(data/list/total/last_page/current_page/per_page)
  if (body && typeof body === 'object' && Array.isArray(body.list) && body.total !== undefined) {
    data = Object.assign({}, body, {
      data: body.list,
      last_page: body.pages,
      current_page: body.page,
      per_page: body.size,
    });
  }
  return { code: 200, message: '成功', data: data };
}

function adaptError(err) {
  let status = err && err.response ? err.response.status : 0;
  let respBody = err && err.response ? err.response.data : null;
  let msg = (respBody && (respBody.error || respBody.message)) || '网络请求失败，请稍后重试';
  return { code: status || 500, message: msg, data: null };
}

//封装 post,get 方法(始终 resolve,失败也返回错误信封,避免上层未 catch 导致的未处理异常)
const http = {
  get(url = '', params = {}) {
    return new Promise((resolve) => {
      _axios({
        url,
        params,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        method: 'GET'
      }).then(res => {
        resolve(adaptSuccess(res.data))
      }).catch(error => {
        resolve(adaptError(error))
      })
    })
  },
  post(url = '', params = {}) {
    if (url == '/api/register' || url == '/api/login_pc') {
      sessionStorage.setItem("baseURL", baseURL)
    }
    // multipart 上传(如 /api/uploadimg)必须让浏览器自带 boundary,不能强制 JSON 头
    let isFormData = (typeof FormData !== 'undefined') && (params instanceof FormData);
    return new Promise((resolve) => {
      _axios({
        url,
        data: params,
        headers: isFormData ? {} : { 'Content-Type': 'application/json;charset=UTF-8' },
        method: 'POST'
      }).then(res => {
        resolve(adaptSuccess(res.data))
      }).catch(error => {
        resolve(adaptError(error))
      })
    })
  }
}


export default http
