<!--
 * @Date: 2023-10-25 09:09:04
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-16 15:45:01
 * @Description: 主页左侧导航
-->
<script setup>
import { useRoute } from 'vue-router'
import { Document, Menu as IconMenu, Setting } from '@element-plus/icons-vue'
const route = useRoute()
const emit = defineEmits([
  'open', // 展开
  'close', // 关闭
  'clickItem', // 点击menu 子项
  'navData' // menu数据
])
// 接收顶部数据
const props = defineProps({
  navData: {
    type: Array,
    require: true
  }
})

// 打开menu
const handleOpen = (key, keyPath, menutitle) => {
  emit('open', key, keyPath, menutitle)
  //   console.log(key, keyPath, menutitle)
}
// 关闭menu
const handleClose = (key, keyPath) => {
  emit('close', key, keyPath)
  //   console.log(key, keyPath)
}
// 点击menu 子项
const linkClick = (menu, child) => {
  emit('clickItem', menu, child)
}
</script>

<template>
  <nav class="nav">
    <!-- <div @click="clicks">collapse</div> -->

    <el-row>
      <el-col>
        <el-menu
          :default-active="route.fullPath"
          :default-openeds="['0']"
          class="el-menu-vertical-demo"
          background-color="#ddd"
          text-color="#333"
          active-text-color="#333"
          @open="handleOpen"
          @close="handleClose"
          router
        >
          <div v-for="menu in props.navData" :key="String(menu.id)">
            <el-sub-menu :key="String(menu.id)" :index="String(menu.id)" v-if="menu.children">
              <template #title>
                <el-icon><document /></el-icon>
                <span>{{ menu.title }}</span>
              </template>
              <el-menu-item-group v-show="menu.children">
                <template #title>
                  <el-menu-item
                    v-for="child in menu.children"
                    :key="String(child.id)"
                    :index="child.link"
                    @click="linkClick(menu, child)"
                    v-debounce
                  >
                    {{ child.text }}
                  </el-menu-item>
                </template>
              </el-menu-item-group>
            </el-sub-menu>
            <el-menu-item
              :index="String(menu.link)"
              v-else
              class="menuTitle"
              @click="linkClick(menu, child)"
            >
              <!-- <el-icon><icon-menu /></el-icon> -->
              <el-icon><setting /></el-icon>
              <span>{{ menu.title }}</span>
            </el-menu-item>
          </div>
        </el-menu>
      </el-col>
    </el-row>
  </nav>
</template>

<style lang="less" scoped>
.nav {
  height: calc(100vh - var(--height-60));
  text-align: center;
  background: var(--background3c);
  animation: showup 1s forwards;
}
@keyframes showup {
  from {
    letter-spacing: -50px;
    filter: blur(10px);
  }
  to {
    letter-spacing: 0px;
    filter: blur(0px);
  }
}
</style>
