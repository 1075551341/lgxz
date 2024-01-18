/*
 * @Date: 2023-12-22 15:28:16
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-12 15:05:16
 * @Description: msgOnce + loading + typeIs
 */

/**
 *msgOnce对多次请求只展示一个弹出框
 * @param {string} type
 * @param {string} message
 * @param {boolean} signal
 * @returns {ElMessage}
 */
export const msgOnce = (type = 'warning', message, signal = true) => {
  let els = ref(document.getElementsByClassName('el-message').length)
  if (signal) {
    if (els.value === 0) {
      return ElMessage({ type, message })
    }
  } else {
    return ElMessage({ type, message })
  }
}

let loadingInstance = null // 记录页面中存在的loading
let loadingCount = 0 // 记录当前正在请求的数量
/**
 * 显示loading
 * @param {string} data
 * @param {boolean} loadingType
 * @returns {number} loadingCount
 */
export function showLoading(data, loadingType = false) {
  if (loadingCount === 0) {
    loadingInstance = ElLoading.service({
      lock: true,
      fullscreen: true,
      target: document.querySelector('#loadingTarget'),
      text: data || '。。。加载中。。。'
    })
    // 全局loading
    // if (loadingType) {
    //   loadingInstance = ElLoading.service({
    //     lock: true,
    //     fullscreen: true,
    //     text: '加载中。。。'
    //   })
    // } else {
    //   // 不遮蔽菜单位置
    //   loadingInstance = ElLoading.service({
    //     lock: true,
    //     fullscreen: true,
    //     target: document.querySelector('#loadingTarget'),
    //     text: data || '。。。加载中。。。'
    //   })
    // }
  }
  loadingCount++
  return loadingCount
}
/**
 * 隐藏loading
 * @returns {number} loadingCount
 */
export function hideLoading() {
  loadingCount--
  if (loadingInstance && loadingCount === 0) {
    // console.log('loadingInstance::: ', loadingInstance, loadingCount)
    loadingInstance.close()
    loadingInstance = null
  }
  return loadingCount
}

/**
 * 判断弹框输入内容类型
 * @param {string|obj} loadings
 * @returns {boolean} flags
 */
export function typeIs(loadings) {
  const type_is = Object.prototype.toString.apply(loadings)
  const isBoolean = type_is.lastIndexOf('Boolean') > -1
  const isObject = type_is.lastIndexOf('Object') > -1
  let flags = null
  isBoolean && (flags = loadings)
  if (isObject) {
    flags = {
      loadingHide: loadings?.loadingHide,
      text: loadings?.text
    }
  }
  return flags
}
