/*
 * @Date: 2024-01-16 10:22:13
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-16 15:05:00
 * @Description: 事件throttle节流 (v-throttle 或{ fn: submitSave, event: 'click', delay: 500 })
 */
export default {
  mounted(el, binding) {
    let delay = null
    el._eventType = null
    el._timer = null
    el._handler = null
    /**指令后面为对象类型 */
    const { value } = binding
    if (value?.fn && typeof value.fn == 'function') {
      delay = Number(value.delay) || 1000 // 默认延迟时间
      el._eventType = value.event
    } else {
      delay = Number(value) || 1000
      el._eventType = 'click'
    }
    el._handler = function () {
      if (el._timer) return
      el._timer = setTimeout(() => {
        if (value?.fn && typeof value.fn == 'function') {
          value.fn.apply(this, arguments)
        }
        el._timer = null
      }, delay)
    }
    el.addEventListener(el._eventType, el._handler, true)
  },
  // 元素卸载前也记得清理定时器并且移除监听事件
  beforeUnmount(el) {
    if (el._timer) {
      clearTimeout(el._timer)
      el._timer = null
    }
    el.removeEventListener(el._eventType, el._handler)
  }
}
