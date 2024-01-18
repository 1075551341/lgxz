/*
 * @Date: 2023-10-19 09:56:58
 * @LastEditors: wjs
 * @LastEditTime: 2023-10-31 13:53:41
 * @Description: localStorage  +  cookie
 */

export function setItem(key, val) {
  //设置值
  window.localStorage.setItem(key, JSON.stringify(val))
}
export function getItem(key) {
  //获取值
  return JSON.parse(window.localStorage.getItem(key))
}
export function removeItem(key) {
  //删除对应值
  if (window.localStorage.getItem(key)) {
    window.localStorage.removeItem(key)
  }
}
export function clearAllItem() {
  //清除所有值
  window.localStorage.clear()
}

export function cookie() {
  return {
    // 设置cookie
    set: (name, value, day) => {
      const date = new Date()
      date.setDate(date.getDate() + day)
      document.cookie = name + '=' + value + ';expires=' + date
    },
    // 获取cookie
    get: (key) => {
      let arr = document.cookie.split('; ')
      for (let i = 0; i < arr.length; i++) {
        let arr1 = arr[i].split('=')
        if (arr1[0] == key) {
          return arr1[1]
        }
      }
      return ''
    },
    // 删除cookie
    remove: (name) => {
      this.set(name, '', -1)
    }
  }
}
