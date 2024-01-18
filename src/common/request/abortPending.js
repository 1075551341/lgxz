/*
 * @Date: 2024-01-11 17:05:33
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-13 12:46:38
 * @Description: 终止等待请求
 */

let pendingMap = new Map()
const getPendingUrl = (config) => {
  /**Map 中的key(string) -- 路由地址&请求方法&请求地址 */
  return [location.pathname, config.method, config.url].join('&')
}

/**取消请求等待(删除非当前界面请求) */
const removePending = () => {
  pendingMap.forEach((abortController, key) => {
    if (location.pathname != key.split('&')[0]) {
      pendingMap.has(key) && pendingMap.delete(key)
      abortController && abortController.abort()
    }
  })
}
/**添加请求等待 */
export const addPending = (config) => {
  removePending(config)
  const url = getPendingUrl(config)
  const controller = new AbortController()
  config.signal = controller.signal
  if (!pendingMap.has(url)) {
    pendingMap.set(url, controller)
  }
  // console.log('pendingMap::: ', pendingMap)
  return pendingMap
}
/**清空请求等待 */
export const clearPending = () => {
  pendingMap.clear()
}
