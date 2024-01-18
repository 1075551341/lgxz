/*
 * @Date: 2023-10-19 09:02:37
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-13 13:33:22
 * @Description: 请求封装{get,post,downloadFile}
 */
import request from './index'
import { downLoad } from '../downloadFile'
/**
 * 封装get请求
 * @param {string} url
 * @param {object} params
 * @param {boolean | object} loadings
 * @returns  {axios}
 */
export function axiosRequest(url, params, loadings = true) {
  return request(
    {
      method: 'get',
      url: url,
      params: params || {},
      headers: {
        'cache-control': 'no-cache',
        Pragma: 'no-cache'
      }
      // signal: controller.signal
    },
    loadings
  ).catch(function (error) {
    // 请求失败处理
    ElMessage({
      type: 'warning',
      message: error.message || error.msg || '哎呀，出错了'
    })
  })
}

/**
 * 封装post请求
 * @param {string} url
 * @param {object} params
 * @param {boolean} loadings
 * @returns {axios}
 */
export function postJSON(url, params, loadings = true) {
  return request({
    method: 'post',
    url: url,
    data: params,
    headers: {
      'content-type': 'application/json; charset=utf-8'
    },
    loadings
  })
}
/**
 * form表单提交
 * @param {string} url
 * @param {object} params
 * @param {boolean} loadings
 * @returns {axios}
 */
export function postForm(url, params, loadings = true) {
  return request({
    method: 'post',
    url: url,
    data: params || {},
    headers: {
      'content-type': 'multipart/form-data'
    },
    loadings
  })
}
/**
 * 原生form表单
 * @param {string} url
 * @param {string} params
 * @param {boolean} loadings
 * @returns {axios}
 */
export function postRawForm(url, params, loadings = true) {
  return request({
    method: 'post',
    url: url,
    data: params,
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset:UTF-8'
    },
    loadings
  })
}

/**
 * 下载文件（blob类型），大小限制10M(未测试)
 * @param {string} url
 * @param {string} filename
 * @param {object} params
 * @param {boolean} loadings
 * @returns {axios}
 */

export async function downloadFile(url, filename = 'download', params = {}, loadings = true) {
  const response = await request(
    {
      method: 'get',
      url: url,
      responseType: 'blob',
      params: params,
      headers: { 'cache-control': 'no-cache', Pragma: 'no-cache' }
    },
    loadings
  )
  return response
}
