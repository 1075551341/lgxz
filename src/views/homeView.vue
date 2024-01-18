<!--
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-15 17:43:04
 * @Description: 首页
-->
<script setup>
import menu from '../common/json/menu.json' //左侧总菜单
// import heatMenu from '../common/json/heatMenu.json' //火电
// import newMenu from '../common/json/newMenu.json' //新能源

import { getItem, setItem } from '../common/storage'
import { beFull, exitFull, toggleFull } from 'be-full' //全屏

onMounted(() => {
  getJsonFn()
  setItem('navText', navText.data)
  lastQueryDataTimeFn() //最后获取数据时间
})

// 全屏
const fullscreenFn = () => {
  toggleFull()
}

// let menuJSON = heatMenu
let menuJSON = []
let jsonUrl = ref('') //左侧总菜单
const getJsonFn = async () => {
  try {
    let res = null
    /**生产环境 */
    if (import.meta.env.MODE == 'production') {
      jsonUrl.value = '/menu.json'
      res = await axiosRequest(jsonUrl.value, {}, false)
      menuJSON = res
    } else {
      menuJSON = menu
    }
    // console.log('import.meta.env.DEV::: ', import.meta.env, import.meta.env.DEV)
    // console.log('import.meta.env::: ', res, import.meta.env, 111)
    navLink.val = menuJSON
  } catch (error) {
    // menuJSON = menu
    // navLink.val = menuJSON
    console.log('error::: ', error)
  }
}

let navLink = reactive([]) // 获取menu菜单
navLink.val = menuJSON
let headerMsg = reactive({
  value: {
    systemMsg: [
      { id: 1, title: '9月6日，最大有功超出死区范围' },
      { id: 2, title: '9月15日，超出最大偏差' },
      { id: 3, title: '9月23日，最小有功超出死区范围' }
    ],
    title: import.meta.env.VITE_TITLE
  }
})

// header信息
const headerMsgFn = (val) => {
  console.log('val::: ', val)
}

// 左侧导航菜单  ---打开menu
const handleOpen = (key, keyPath, menutitle) => {
  // console.log(key, keyPath, menutitle)
}
// 关闭menu
const handleClose = (key, keyPath) => {
  // console.log(key, keyPath)
}

// 点击menu
let navText = reactive({
  data: {
    title: getItem('navText')?.title || '首页',
    link: getItem('navText')?.link || '',
    text: getItem('navText')?.text || '',
    child: getItem('navText')?.child || 1
  }
})
const linkClick = (menu, child) => {
  if (menu.children && menu.children.length > 0) {
    navText.data = {
      title: menu.title,
      text: child.text,
      link: child.link,
      child: menu.children.length
    }
  } else {
    navText.data = {
      title: menu.title,
      text: menu.title,
      link: menu.link,
      child: 0
    }
  }
  setItem('navText', navText.data)
}

// 最后获取数据时间
let lastQueryData = reactive({})
const lastQueryDataTimeFn = () => {
  axiosRequest('/glbecoPhyunitPowerEntity/queryDataDeadline', {}, false).then((res) => {
    if (res) {
      lastQueryData.value = res.data
    }
  })
}
// 每30秒获取数据
setInterval(() => {
  lastQueryDataTimeFn()
}, 30000)

// 获取机组，判断能源类型
// const energyType = ref()
// const queryListFn = () => {
//   axiosRequest('/api/commonDictEntity/queryList', {}, false).then((res) => {
//     if (res && res.code == 200) {
//       //101火电，其他新能源（201水电，301风电，302光伏）
//       // energyType.value = res.data[0].type || res.data[1].type
//       // if (energyType.value == 101) {
//       //   menuJSON = heatMenu
//       // } else {
//       //   menuJSON = newMenu
//       // }
//       // menuJSON = menu
//       navLink.val = menuJSON
//     }
//   })
// }
</script>

<template>
  <div id="energySystem">
    <div class="energyContent" style="height: 100%">
      <header-view
        :headerMsg="headerMsg"
        @headerMsgFn="headerMsgFn"
        @fullscreenClick="fullscreenFn"
      />
      <div id="content">
        <menu-nav
          @open="handleOpen"
          @close="handleClose"
          @clickItem="linkClick"
          :navData="navLink.val"
          class="test"
        />
        <div class="content" id="loadingTarget">
          <div id="breadcrumb">
            <div class="breadcrumb">
              <img src="../assets/img/unfold-over.png" />
              <el-breadcrumb separator="/">
                <el-breadcrumb-item v-show="navText.data.child >= 1">{{
                  navText.data ? navText.data.title : getItem('navText').title
                }}</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: navText.data.link }">{{
                  navText.data ? navText.data.text : getItem('navText').text
                }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <div class="lastTimeQuery">
              <p v-show="lastQueryData.value">
                <span>数据截止时间：</span>{{ lastQueryData.value }}
              </p>
            </div>
          </div>

          <el-scrollbar height="calc(100vh - 100px)" class="scroll">
            <RouterView />
          </el-scrollbar>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
@import url('../assets/customStyle.less');
#energySystem {
  color: var(--color333);
  font-size: var(--fontsize16);
  background: var(--background);
  box-sizing: border-box;
  --heightContent: calc(100vh - var(--height-60)-2px);
  height: 100%;

  .header {
    height: var(--height-60);
    background: var(--backgroundBlack);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
    color: var(--colorWhite);
    box-sizing: border-box;
    .headerLeft {
      padding: 0 10px;
      display: flex;
      img {
        width: 30px;
        display: block;
      }
    }
    .headerCenter {
      .headerDangerText {
        display: flex;
        align-items: center;
        .el-carousel.el-carousel--vertical {
          width: 500px;
          line-height: var(--height-60);
          color: #e2d691;
        }
      }
    }
    .headerRight {
      display: flex;
      width: 400px;
      flex-direction: row-reverse;
      p {
        padding: 0 20px 2px;
        cursor: pointer;
        display: flex;
        align-items: center;
        height: var(--height-60);
        img {
          width: 40px;
          height: 40px;
        }
      }
    }
  }
  #content {
    display: flex;
    flex-direction: row;
    height: 100%;
    box-sizing: border-box;
    .el-table--scrollable-y .el-table__body-wrapper {
      overflow-y: auto;
    }
    .nav {
      flex: 2;
      min-width: 200px;
      max-width: 240px;
      text-align: center;
      background: var(--background3c);
      height: var(--heightContent);
      overflow-y: auto;
      padding-bottom: 60px;
      box-sizing: border-box;
    }
    .content {
      flex: 10;
      height: var(--heightContent);
      // overflow-y: auto;
      padding: 0 10px 10px 10px;
      position: relative;
      box-sizing: border-box;
      #breadcrumb {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #ebeef5;
        height: 30px;
        .breadcrumb {
          display: flex;
          align-items: center;
          img {
            width: 20px;
            margin-right: 10px;
          }
        }
        .lastTimeQuery {
          p {
            color: var(--colorRed);
            span {
              font-weight: bold;
              color: var(--color333);
            }
          }
        }
      }
      .scroll {
        padding-top: 5px;
        box-sizing: border-box;
      }
    }
  }
}
</style>
