/*
 * @Date: 2024-01-16 10:24:19
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-16 16:12:13
 * @Description: directives配置
 */
import debounce from './debounce'
import hide from './hide'
import throttle from './throttle'
import resize from './resize'
const directives = {
  debounce,
  hide,
  throttle,
  resize
}
export default {
  install(app) {
    // console.log('app::: ', app)
    Object.keys(directives).forEach((key) => {
      app.directive(key, directives[key])
    })
  }
}
