/*
 * @Date: 2023-10-19 09:02:37
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-13 12:45:36
 * @Description: 统一封装(axios + loading + 终止请求)
 */
import axios from 'axios'
import { msgOnce, showLoading, hideLoading, typeIs } from '../elModal.js'
import { addPending } from './abortPending.js'

/**全局配置 */
if (import.meta.env.MODE == 'development') {
  axios.defaults.baseURL = import.meta.env.VITE_BASEURL
  // console.log('import.meta.env::: ', import.meta.env?.VITE_BASEURL, import.meta.env)
}
axios.defaults.withCredentials = false
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
// let token = localStorage.getItem('token')
let apiUrl = axios.defaults.baseURL
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*' // 允许跨域

/**
 * 自定义axios
 * @param {object} axiosConfig
 * @param {boolean|object} loadings
 * @param {number} timeout
 * @returns axios
 */
function myAxios(axiosConfig, loadings, timeout) {
  const service = axios.create({
    baseURL: apiUrl || '/', // 设置统一的请求前缀
    withCredentials: false,
    timeout: timeout || 30000 // 设置统一的超时时长
  })

  let errorMsg = null
  /**请求拦截器 */
  service.interceptors.request.use(
    (config) => {
      /**添加请求等待 */
      addPending(config)

      /**loading配置 */
      config = {
        loadingHide: typeIs(loadings),
        loadingText: typeIs(loadings)?.text,
        ...config
      }

      if (config.loadingHide) {
        showLoading(config.loadingText)
      }

      // 若是有做鉴权token , 就给头部带上token
      // if (token) {
      //   headers ? (headers.Authorization = token) : (headers = null)
      // }
      return config
    },
    (error) => {
      errorMsg = error.data.error.message || error.data.error.msg
      return msgOnce('warning', errorMsg)
    }
  )

  // 响应拦截器
  service.interceptors.response.use(
    (res) => {
      if (res.config.loadingHide) {
        setTimeout(() => {
          hideLoading()
        }, 1000)
        res.config.loadingHide = true
      }

      if (res.data.code == -1) {
        errorMsg = res.data.msg
        return msgOnce('warning', errorMsg)
      }
      if (res.status == 200 || res) {
        return Promise.resolve(res.data)
      }

      return Promise.reject(res)
    },
    (error) => {
      if (error.config.loadingHide) {
        setTimeout(() => {
          hideLoading()
        }, 1000)
        error.config.loadingHide = true
      }

      /**自定义后台报错提示信息 */
      const statusTextMap = {
        400: '发出的请求有错误，服务器没有进行新建或修改数据的操作',
        401: '登录失效，请重新登录',
        403: '用户得到授权，但是访问是被禁止的',
        404: '网络请求不存在',
        406: '请求的格式不可得',
        410: '请求的资源被永久删除，且不会再得到的',
        422: '当创建一个对象时，发生一个验证错误',
        500: '后台出错了，服务器发生错误，请检查服务器',
        502: '后台出错了，网关错误',
        503: '后台出错了，服务不可用，服务器暂时过载或维护',
        504: '后台出错了，网关超时'
      }

      if (error.response && error.response.status) {
        const statusText = statusTextMap[error.response.status] ?? '其他错误'

        /**报错显示后台提示 */
        if (error.response.data.code == -1) {
          errorMsg = error.response.data.msg
          return msgOnce('warning', errorMsg)
        }
        /**报错显示自定义提示 */
        errorMsg = `${statusText}(${error.response.status})` || '哎呀，出错了'
        return msgOnce('warning', errorMsg)
      }
      errorMsg = '网络请求失败或超时，请稍后重试'
      return msgOnce('warning', errorMsg)
    }
  )
  return service(axiosConfig)
}

export default myAxios
