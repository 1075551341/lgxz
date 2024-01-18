<!--
 * @Date: 2023-11-01 11:07:40
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-09 13:14:54
 * @Description: 顶部header
-->
<script setup>
import { CircleCheck } from '@element-plus/icons-vue'
const emit = defineEmits(['dropdown-click', 'fullscreen-click', 'message-click'])
const props = defineProps({
  headerMsg: Object
})
const { systemMsg, title } = props.headerMsg.value

// 点击下拉框,1,2,3分别表示我的，实时告警，退出
const dropdownClick = (val) => {
  emit('dropdown-click', val)
  // console.log('dropdown::: ', val)
}
// 全屏
let fullContent = ref('全屏'),
  full = ref(false)
const fullscreenClick = () => {
  full.value = !full.value
  !full.value ? (fullContent.value = '全屏') : (fullContent.value = '退出全屏')
  emit('fullscreen-click')
}
// 点击消息
const messageClick = () => {
  emit('message-click', 123)
}
</script>
<template>
  <header class="header">
    <div class="headerLeft">
      <img src="../assets/img/logo.png" :alt="title" />
      <text>{{ title }}</text>
    </div>
    <div class="headerCenter">
      <!-- <div class="headerDangerText">
        <div class="dangerText">最新告警：</div>
        <el-carousel
          height="60px"
          direction="vertical"
          indicator-position="none"
          :autoplay="true"
          :interval="parseInt(5000)"
        >
          <el-carousel-item v-for="item in systemMsg" :key="item.id">
            <div>
              <p class="item">{{ item.title }}</p>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div> -->
    </div>
    <div class="headerRight">
      <!-- <p class="headerMenu">
        <el-dropdown>
          <span class="el-dropdown-link">
            <img src="../assets/img/ico_user-default.png" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="CircleCheck" @click="dropdownClick(1)"
                >我的</el-dropdown-item
              >
              <el-dropdown-item :icon="CircleCheck" @click="dropdownClick(2)"
                >实时告警
              </el-dropdown-item>
              <el-dropdown-item :icon="CircleCheck" @click="dropdownClick(3)"
                >退出</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </p> -->
      <p class="headerMenu" @click="fullscreenClick">
        <el-tooltip class="box-item" effect="dark" :content="fullContent" placement="bottom">
          <img src="../assets/img/ico_full-screen.png" />
        </el-tooltip>
      </p>
      <!-- <p class="headerMenu" @click="messageClick">
        <el-tooltip class="box-item" effect="dark" content="消息" placement="bottom">
          <el-badge class="item" value="20">
            <img src="../assets/img/ico_message.png" />
          </el-badge>
        </el-tooltip>
      </p> -->
    </div>
  </header>
</template>

<style lang="less" scoped>
.header {
  height: var(--height-60);
  background: var(--backgroundBlack);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
  color: var(--colorWhite);
  border-bottom: 2px solid var(--colorRed);
  animation: showup 1s forwards;
  .headerLeft {
    padding: 0 10px;
    display: flex;
    img {
      width: 40px;
      height: 30px;
      padding-right: 5px;
      display: block;
    }
  }
  @keyframes showup {
    from {
      letter-spacing: -50px;
      filter: blur(10px);
    }
    to {
      letter-spacing: 1px;
      filter: blur(0px);
    }
  }
  .headerCenter {
    .headerDangerText {
      display: flex;
      align-items: center;
      .el-carousel.el-carousel--vertical {
        width: clamp(450px, 30%, 550px);
        line-height: var(--height-60);
        color: var(--colorGold);
      }
    }
  }
  .headerRight {
    display: flex;
    width: clamp(300px, 30%, 400px);
    flex-direction: row-reverse;
    .headerMenu {
      padding: 0 20px 2px;
      cursor: pointer;
      display: flex;
      align-items: center;
      height: var(--height-60);
      .item {
        display: flex;
        align-items: center;
      }
      img {
        width: 20px;
        height: 20px;
      }
    }
  }
}
</style>
