/*
 * @Date: 2024-01-16 10:20:02
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-16 10:40:22
 * @Description: hide (v-hide="{fn: function}")
 */
export default {
  mounted(el, binding) {
    el.handler = function (e) {
      // 如果点击范围在绑定的元素范围内
      if (el.contains(e.target)) return
      if (typeof binding.value.fn === 'function') {
        // 绑定给指令的如果是一个函数，那么将回调并指定this
        binding.value.fn.apply(this, arguments)
        // 解除事件绑定
        document.removeEventListener('click', el.handler)
      }
    }
    // 监听全局的点击事件
    document.addEventListener('click', el.handler)
    // 如果同步绑定全局事件不生效，可以采用异步的方式
    // setTimeout(() => {
    // document.addEventListener('click', el.handler)
    // }, 0);
  },
  // 解除事件绑定
  beforeUnmount(el) {
    document.removeEventListener('click', el.handler)
  }
}
