<!--
 * @Date: 2024-01-08 16:07:25
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-17 10:34:14
 * @Description: 请填写简介
-->
<template>
  <!-- 模拟依次加载 -->
  <!-- <div class="container">
    <div class="item" v-for="item in 50000" :key="item">
      <div v-if="defer(item)">{{ item }}</div>
    </div>
  </div> -->

  <div id="call_state_marked" draggable="true" @mousedown="handleMouseDown">
    <span class="el-icon-phone"></span>
    <span>挂断</span>
  </div>
</template>
<script setup>
// const defer = useDefer()
// import { ref } from 'vue'

// function useDefer(max = 1000) {
//   const frameCount = ref(0)
//   const refreshFrame = () => {
//     requestAnimationFrame(() => {
//       frameCount.value++
//       if (frameCount.value < max) {
//         refreshFrame()
//       }
//     })
//   }
//   refreshFrame()
//   return function (n) {
//     return frameCount.value >= n
//   }
// }
const handleMouseDown = (e) => {
  let box = document.querySelector('#call_state_marked')
  let disx = e.pageX - box.offsetLeft
  let disy = e.pageY - box.offsetTop
  console.log('e::: ', e, box.offsetLeft, disx, disy)
  // document.addEventListener('mousemove', (e) => {
  //   console.log('mousemove e::: ', e.pageX, e.pageY)
  // })
  document.addEventListener('mouseup', (e) => {
    e.stopPropagation()
    // if () {

    // }
  })
}
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 1em;
  grid-auto-rows: 100px;

  .item {
    background: #999;
    display: flex;
    justify-content: center;
    align-content: center;
    /* content-visibility: auto;
    contain-intrinsic-size: 600px; */
  }
}

#call_state_marked {
  position: fixed;
  top: 50px;
  left: 100px;
  z-index: 9;
  color: #f00;
  background: #fff;
  font-size: 16px;
  width: 60px;
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow:
    -3px 0px 6px 0px #a9a9a980,
    3px 0px 6px 0px #a9a9a980;
  border-radius: 4px;
  border: 3px solid #ccc;
}
#call_state_marked span:nth-child(1) {
  font-size: 20px;
  font-weight: 600;
}
</style>
