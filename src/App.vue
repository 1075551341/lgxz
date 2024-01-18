<!--
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-16 09:43:51
 * @Description: 全屏--首页
-->
<script setup>
// import { axiosRequest } from './common/request/request'

onMounted(() => {
  // console.log('globalProperties', getCurrentInstance().appContext.config.globalProperties)
  // console.log('getCurrentInstance::: ', getCurrentInstance())
})
</script>
<template>
  <router-view v-cloak />
</template>
<style lang="less">
[v-cloak] {
  display: none;
}
// 加载中模态框
.el-loading-spinner .path {
  -webkit-animation: loading-dash 1.5s ease-in-out infinite;
  animation: loading-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-width: 2;
  /* stroke: var(--el-color-primary); */
  stroke-linecap: round;
  stroke: #e6a23c !important;
}
.el-loading-spinner .el-loading-text {
  /* color: var(--el-color-primary); */
  color: #e6a23c !important;
  margin: 3px 0;
  font-size: 14px;
}
</style>
