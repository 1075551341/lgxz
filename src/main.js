/*
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-16 10:31:17
 * @Description: main.js
 */
import './assets/main.css' //全局css
import App from './App.vue'
import router from './router'
import directives from './directives'
// import * as echarts from 'echarts'
import ElementPlus from 'element-plus'
import zhCn from './common/paginationOption' //分页配置
const app = createApp(App)
// app.config.globalProperties.$echarts = echarts
app.use(router)
app.use(ElementPlus, { locale: zhCn })
app.use(directives)
app.mount('#app')
