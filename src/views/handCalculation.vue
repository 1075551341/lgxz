<!--
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-12 15:12:20
 * @Description: 手动计算
-->
<script setup>
import * as echarts from 'echarts'
import { valMaxMinFix, filterNumber, dateEndWith } from '../common/prefix.js'
import menuJSON from '../common/json/menu.json'

onMounted(() => {
  queryListFn() //获取机组下拉框数据
})

const todayValue = formateDate(new Date())

// 切换机组初始化
const initFn = () => {
  dateValue.value = [hourBeforeToday(1), todayValue]
  startTime.value = hourBeforeToday(1)
  endTime.value = todayValue
  getRequestFn() //获取表格数据
}

// 获取机组下拉框数据
let selectValue = ref('')
let selectListId = ref(0)
let selectOptions = reactive({ data: {} })
const queryListFn = () => {
  axiosRequest('/api/commonDictEntity/queryList').then((res) => {
    if (res && res.code == 200) {
      selectOptions.data = res.data
      selectListId.value = res.data[0].id //默认机组id
      selectValue.value = res.data[0].caption //默认机组展示内容
      initFn()
    }
  })
}
// 切换机组
const changeListFn = (id, val) => {
  if (val) {
    selectListId.value = val.id
    selectValue.value = val.caption
    getRequestFn() // 表格
  }
}

const dateValue = ref([])
const startTime = ref(hourBeforeToday(1))
const endTime = ref(todayValue)
// 打开时默认显示的时间起止
const defaultTime = [
  new Date(2000, 1, 1, hourBeforeToday(1).substr(11, 2), hourBeforeToday(1).substr(14, 2), 0),
  new Date(2000, 2, 1, todayValue.substr(11, 2), todayValue.substr(14, 2), 0)
]

// 在日历所选日期更改时
const firstSelectedDayRef = ref(null)
const oneDay = 1000 * 60 * 60 * 24 * 1
const calendar = (date) => {
  // console.log('date::: ', date, formateDate(new Date(date[0].getTime())))
  const [minDate, maxDate] = date
  if (minDate && !maxDate) {
    firstSelectedDayRef.value = minDate //记录选中的首个日期
  } else {
    firstSelectedDayRef.value = null
  }
}
// 设置日期禁止时间
const disabledDateFn = (time) => {
  // console.log('dateValue::: ', startTime.value, endTime.value)
  const firstSelectedDay = firstSelectedDayRef.value
  if (firstSelectedDay) {
    return (
      time.getTime() < firstSelectedDay.getTime() - oneDay ||
      time.getTime() > firstSelectedDay.getTime() + oneDay
    )
  }
  return false
}

const lastValue = ref([])
const dateChange = () => {
  startTime.value = formateDate(dateValue.value[0])
  endTime.value = formateDate(dateValue.value[1])
  lastValue.value = [formateDate(dateValue.value[0]), formateDate(dateValue.value[1])]
  getRequestFn() // 表格
}

// 表格table和分頁配置
let tableAndPaginationConfig1 = reactive({
  value: {
    tableStyle: {
      height: '600'
    },
    treeExpandAll: true,
    pagesizeConfig: {
      size: 100
    }
  }
})
const allId = ref([])
let set = new Set(),
  beforeLen = 0,
  beforeArr = [0]
const getMenuText = () => {
  let menu = []
  for (let [index, item] of menuJSON.entries()) {
    let obj = {
      title: item.title,
      children: [],
      link: '/'
    }
    if (item.children) {
      for (let [i, j] of item.children.entries()) {
        if (
          j.text.endsWith('原始数据') ||
          j.text.endsWith('告警') ||
          j.text.endsWith('告警') ||
          j.text.endsWith('计算') ||
          j.text.startsWith('首页')
        ) {
          continue
        }

        obj.children[i] = {
          title: j.text,
          id: i + 1,
          link: j.link
        }

        // console.log('menu2::: ', menuJSON, j)
      }
    } else {
      if (
        item.title.endsWith('原始数据') ||
        item.title.endsWith('告警') ||
        item.title.endsWith('告警') ||
        item.title.endsWith('计算') ||
        item.title.startsWith('首页')
      ) {
        continue
      }

      obj = {
        id: index + 1,
        title: item.title,
        link: item.link,
        children: [{ title: '', id: -1, link: '' }]
      }
    }
    menu.push(obj)
  }

  // 获取checkbox值，allId
  for (let [index, item] of menu.entries()) {
    for (let [i, j] of item.children.entries()) {
      allId.value.push(index + '-' + i)

      // 获取table 点击行数据，三个参数
      //index+1 menu序号，i+1 menu子项，j子项内容
      set.add([index + 1, i + 1, j])
    }
    beforeLen += item.children.length
    beforeArr.push(beforeLen)
  }
  // console.log('menu::: ', menu, set, set.size)
  return menu
}
// getMenuText()
// 设置表格头部及数据格式
let tableData = reactive({
  data: getMenuText()
})

// 获取表格数据
const getRequestFn = () => {
  axiosRequest('/api/glbecoPHPUnitAgcEntity/queryPage', {
    phyUnitId: selectListId.value,
    beginDate: startTime.value,
    endDate: endTime.value,
    size: tableAndPaginationConfig1.value.pagesizeConfig.size || 50,
    current: tableAndPaginationConfig1.value.pagesizeConfig.current
  }).then((res) => {
    if (res && res.code == 200) {
      tableAndPaginationConfig1.value = {
        pagesizeConfig: {
          current: res.data.current,
          size: res.data.size,
          total: res.data.total
        }
      }
    }
  })
}

// 选择全部
const checkedAll = ref([])
const checkedId = ref([])
const checkedAllFn = () => {
  if (checkedAll.value == 'all') {
    checkedId.value = allId.value
  } else {
    checkedId.value = []
  }
}
const checkedIdsFn = (i, j) => {
  // 当前下标
  let index = beforeArr[i] + j

  // console.log(`checkedIdsFn  第 ${beforeArr[i - 1] + j} 行`, index, checkedId.value)
}
// 计算
// length menu总数 ，i menu序号，j menu子项
const calculateFn = (length, i, j) => {
  for (let [index, item] of set.entries()) {
    if (index[0] == i && j == index[1]) {
      // console.log(`calculateFn  第${beforeArr[i - 1] + j}行`, item, length, i, j)
    }
  }
}
</script>

<template>
  <div class="handCalculation">
    <div class="tops">
      <div class="topLeft">
        <el-select
          v-model="selectValue"
          :value-key="String(selectListId)"
          class="topsSelect"
          :placeholder="selectOptions.data > 0 ? 请选择机组 : '暂无机组数据'"
          loading-text="加载中。。。"
          fit-input-width
          @change="changeListFn(selectListId, selectValue)"
        >
          <el-option
            v-for="item in selectOptions.data"
            :key="item.id"
            :label="item.caption"
            :value="item"
          />
        </el-select>

        <div class="topsDatePicker">
          <div class="block">
            <!-- :disabledDate="disableDateFn" -->
            <el-date-picker
              :clearable="false"
              v-model="dateValue"
              type="datetimerange"
              range-separator="至"
              start-placeholder="请选择开始时间"
              end-placeholder="请选择结束时间"
              :default-time="defaultTime"
              format="YYYY-MM-DD HH:mm:ss"
              :disabledDate="disabledDateFn"
              @calendar-change="calendar"
              @change="dateChange()"
            />
          </div>
        </div>
        <el-button class="btn">计算</el-button>
      </div>
    </div>
    <div id="topsContent">
      <div class="topsContent">
        <div id="tables">
          <table id="calculateTable">
            <tr class="th">
              <td>
                <input
                  type="checkbox"
                  name=""
                  id="checkAll"
                  value="all"
                  v-model="checkedAll"
                  @change="checkedAllFn"
                />
              </td>
              <td>计算类型</td>
              <td style="min-width: 200px">细则</td>
              <td>操作</td>
              <td>计算情况</td>
              <td>分数</td>
            </tr>
            <tr v-for="(item, i) in tableData.data" :key="'item' + i">
              <table class="calculateTable">
                <tr v-for="(list, j) in item.children" :key="'list' + j">
                  <td>
                    <input
                      type="checkbox"
                      :name="i + '-' + j"
                      :value="i + '-' + j"
                      v-model="checkedId"
                      @change="checkedIdsFn(i, j + 1)"
                    />
                  </td>
                  <td>
                    <div v-if="j == 0" class="menu">{{ item.title }}</div>
                  </td>
                  <td style="min-width: 200px">
                    <div v-if="list">
                      <RouterLink :to="list.link">{{ list.title }}</RouterLink>
                    </div>
                  </td>
                  <td>
                    <el-button class="btn" @click="calculateFn(tableData.data.length, i + 1, j + 1)"
                      >计算</el-button
                    >
                  </td>
                  <td>1</td>
                  <td>2</td>
                </tr>
              </table>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.handCalculation {
  height: fit-content;
  .colorRed {
    color: var(--colorRed);
  }
  :deep(.el-select) {
    width: 200px;
  }
  .tops {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    height: 35px;
    .topLeft {
      display: flex;
      align-items: center;

      .topsDatePicker {
        .block {
          margin-left: 10px;
          .text {
            padding: 0 8px;
          }
        }
      }
      .btn {
        border: 1px solid #dcdfe6;
        padding: 0 15px;
        line-height: 32px;
        height: 32px;
        border-radius: 3px;
        margin-left: 10px;
        background: var(--colorRed);
        color: #fff;
        cursor: pointer;
      }
    }
  }
  #topsContent {
    .topsContent {
      #tables {
        width: clamp(1200px, 80%, 1400px);
        table {
          border-collapse: collapse;
          width: 100%;
          color: #606266;
          &#calculateTable {
            border-top: 1px solid #ebeef5;
          }
          .th {
            background: #e5e5e5;
          }
          tr {
            display: flex;
            input[type='checkbox'] {
              border: 1px solid #ebeef5;
              width: 14px;
              height: 14px;
              border-radius: 2px;
              cursor: pointer;
            }
            td {
              flex: 1;
              border-bottom: 1px solid #ebeef5;
              border-right: 1px solid #ebeef5;
              height: 40px;
              line-height: 40px;
              padding: 0 10px;
              box-sizing: border-box;
              width: fit-content;
              min-width: 150px;
              font-size: 14px;
              text-wrap: nowrap;
              align-items: center;
              display: flex;
              &:nth-child(1) {
                border-left: 1px solid #ebeef5;
                font-size: 16px;
              }
              a {
                color: var(--colorRed);
                text-decoration: underline;
              }
            }
          }
        }
      }
    }
  }
}
</style>
