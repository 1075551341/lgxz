/*
 * @Date: 2024-01-16 09:05:56
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-16 16:29:18
 * @Description: resize 指令 (v-resize ="handler")
 */
const map = new WeakMap()
const ob = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const handler = map.get(entry.target)
    const { width, height } = entry.contentRect
    // console.log('entries::: ', handler, entry)
    if (handler) {
      handler({
        width: width,
        height: height
      })
    }
  }
})

export default {
  mounted(el, binding) {
    ob.observe(el)
    map.set(el, binding.value)
    // console.log('el, binding::: ', binding.value, map)
  },
  beforeUnmount(el) {
    ob.unobserve(el)
  }
}
