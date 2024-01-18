/*
 * @Date: 2023-11-17 13:47:03
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-12 14:20:35
 * @Description: 公用函数
 */

/**
 * @param {number} val
 * @param {string,'min'和'max'} type
 * @param {number,精确度} precision
 * @param {number,小数位数} precis
 * @returns
 */
export const valMaxMinFix = (val, type, precision, precis = 2) => {
  let num = null
  if (type == 'min') {
    precision = precision || 0.9
    if (val.min > 0) {
      num = val.min * precision
    }

    if (val.min < 0) {
      num = -(Math.abs(val.min) * (2 - precision))
    }
    if (val.min === 0) {
      num = -0.1
    }
  } else if (type == 'max') {
    precision = precision || 1.1
    if (val.max > 0) {
      num = val.max * precision
    }

    if (val.max < 0) {
      num = -(Math.abs(val.max) * (2 - precision))
    }
    if (val.max === 0) {
      num = 0.1
    }
  }
  // 防止精度导致小数位数太多
  // if (!Number.isInteger(num)) {
  //   num = num.toFixed(precis)
  // }
  // console.log('valMaxMinFix num::: ', num)
  return num
}

/**
 *
 * @param {*} num 原数据
 * @param {string} unit 后缀单位，如5.0% ==> filterNumber(5,'%',1)
 * @param {number} precision 保留小数位数
 * @returns
 */
export const filterNumber = (num, unit = '', precision = 2) => {
  if (num === null || num === void 0 || num === '' || num === -1) {
    return '--'
  }

  if (isNumber(num)) {
    if (num === 0) {
      return `${num} `
    }
    // 如果初始值！=0，精度过滤后为0，精度+2
    if (num !== 0 && Number(num.toFixed(precision)) === 0) {
      return filterNumber(num, (unit = ''), precision + 2)
    }
    // 如果是整数，
    if (Number.isInteger(num)) {
      return `${num} ${unit}`
    } else {
      return `${num.toFixed(precision)} ${unit}` // 如果是小数，保留两位小数
    }
  }
}

/**
 *通用表格数据过滤，对默认slot内容有效，非默认slot用filterNumber函数
 * @param {*} val
 * @returns {number} value
 */
export const dataPreFix = (val) => {
  let value = null
  if (val === null || val === void 0 || val === '' || val === -1) {
    return (value = '--')
  }
  if (isNumber(val)) {
    // 对数字类型处理，小数保留两位，整数不保留
    value = filterNumber(val)
    return value
    // console.log('dataPreFix value::: ', val, value)
  } else {
    value = val
    return value
  }
}
/**
 *  是否为数字类型,对自定义表格数据过滤,表格中数据过滤,slot中的数据无效
 * @param {*} val
 * @returns {boolean}
 */
export const isNumber = (val) => {
  const num = Object.prototype.toString.call(val).lastIndexOf('Number')
  return num > -1 && true
}

/**
 * 判断数据小数位数
 * @param {number} num
 * @returns {number} length
 */
export function getDecimalDigits(num) {
  if (Number.isInteger(num)) {
    return 0
  } else {
    var decimalPart = num.toString().split('.')[1]
    return decimalPart.length
  }
}

/**
 * 日期datepicker处理，str为选择日期后的 暂存日期(oldDateValue)
 * @param {string} str
 * @returns {string} strings
 */
export const dateEndWith = (str) => {
  let strings = null
  // 空值或不合法日期取当前时间
  if (str == null || str == void 0 || str.length < 4) {
    strings = formateTime(new Date())
  }
  if (str.trim().length === 4 || str.trim().length === 7) {
    strings = str.trim() + formateTime(new Date()).substring(str.trim().length)
  }
  if (str.trim().length === 10) {
    strings = str.trim()
  }
  // 完整年月日时间
  return strings
}

let isClicked = false
/**
 * 节流，防止多次点击
 * @param {fn} fn
 * @returns
 */
export function shakeWorker(fn) {
  if (isClicked) {
    return
  }
  isClicked = true
  let t = null
  if (t != null) {
    clearTimeout(t)
  }
  t = setTimeout(function () {
    fn()
    isClicked = false
  }, 1000)
}
