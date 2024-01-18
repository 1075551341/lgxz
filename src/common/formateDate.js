/*
 * @Date: 2023-11-06 14:21:21
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-12 14:37:41
 * @Description: 时间格式化+排序
 */

// 定义格式化封装函数,时间戳或当前时间
export function formateDate(timer = new Date(timer)) {
  const year = timer.getFullYear()
  const month = timer.getMonth() + 1 // 由于月份从0开始，因此需加1
  const day = timer.getDate()
  const hour = timer.getHours()
  const minute = timer.getMinutes()
  const second = timer.getSeconds()
  return `${pad(year, 4)}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`
}

//时间转标准时间
export function dateParseFormat(text) {
  return new Date(Date.parse(text)).format('yyyy-MM-dd hh:mm:ss')
}
//24小时(时间不足两位补0)
function pad(timeEl, total = 2, str = '0') {
  return timeEl.toString().padStart(total, str)
}
// 2012-02-02格式时间
export function formateTime(timer = new Date()) {
  return formateDate(timer).substring(0, 10)
}
// 02:02:02格式时间
export function formateTimes(timer = new Date()) {
  return formateDate(timer).substring(10)
}

//昨天的时间 格式2023-06-06 12:00:00
export function yesterdayDate(timer = new Date()) {
  timer.setDate(timer.getDate() - 1)
  return timer.format('yyyy-MM-dd hh:mm:ss')
}
//小时数n，返回当前时间n小时前
export function hourBeforeToday(n = 1, m = new Date()) {
  return new Date(Date.parse(m) - n * 1000 * 60 * 60).format('yyyy-MM-dd hh:mm:ss')
}

/**
 *对Date的扩展，将 Date 转化为指定格式的String
 *月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 *年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 *例子：
 *(new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 *(new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
 */
Date.prototype.format = function (fmt) {
  var o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'h+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds() //毫秒
  }
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
  return fmt
}

// 对x坐标轴 时间数据排序处理
// dates为时间数组，bol为布尔值，true升序，false降序
export function sortDate(dates, bol = true) {
  if (bol) {
    return dates.sort(function (a, b) {
      return new Date(a) - new Date(b)
    })
  } else {
    return dates.sort(function (a, b) {
      return new Date(b) - new Date(a)
    })
  }
}
/**获取当前时间 */
export const getCurrentDate = () => {
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  const day = String(currentDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
