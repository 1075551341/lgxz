/*
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-12 14:15:09
 * @Description: 路由配置
 */
// import axios from 'axios'
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './router.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // history: createWebHashHistory(import.meta.env.BASE_URL),
  base: import.meta.env.BASE_URL,
  routes: routes
})

// 全局路由导航配置
router.beforeEach((to, from, next) => {
  // console.log('to, from, next::: ', to)
  // if (to.name !== 'Login' && !isAuthenticated) {
  // next({ name: 'Login' })
  //  clearAllItem()
  // } else {
  next()
  // }

  // 返回 false 以取消导航
  // return false
})

export default router
