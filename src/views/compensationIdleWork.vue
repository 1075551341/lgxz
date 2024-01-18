<!--
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2023-12-27 13:32:25
 * @Description: 有偿无功补偿--有偿无功补偿
-->
<script setup>
//import { ElMessage } from 'element-plus'
import { filterNumber, dateEndWith } from '../common/prefix.js'

let todayValue = formateTime(new Date()).substring(0, 7)
onUnmounted(() => {
  watchSelect()
})

onMounted(() => {
  queryListFn() //获取机组下拉框数据
})

// 切换机组初始化
const initFn = () => {
  buttonMSg.type = 2
  dateValue.value = todayValue
  pickerDate.value = todayValue
  queryMonthStatisticsFn() //月统计数据
  getRequestFn() //获取表格1 日/月数据(同一接口)
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
  }
}
// 监听--机组切换
const watchSelect = watch(selectValue, (n, o) => {
  if (n !== o && o.length > 0) {
    repeatInit(buttonMSg.type)
  }
})

// button选中样式，默认为1，day,month,year分别为1,2,3
let buttonMSg = reactive({ type: 2 })
const tabClick = (val) => {
  buttonMSg.type = val

  if (!lastValue.value) {
    lastValue.value = dateEndWith(lastValue.value)
  }
  if (val == 1) {
    todayValue = dateEndWith(lastValue.value)
  }
  if (val == 2) {
    todayValue = dateEndWith(lastValue.value).substring(0, 7)
  }
  if (val == 3) {
    todayValue = dateEndWith(lastValue.value).substring(0, 4)
  }
  pickerDate.value = dateValue.value = todayValue
  repeatInit(val)
}

let dateValue = ref(todayValue)
let oldDateValue = ref('')
let lastValue = ref('')
let pickerDate = ref('')
// 指定day,month,year分别为1,2,3,day和month公用一个接口，year单独一个接口
const dateChange = (visible, val) => {
  if (!visible) {
    if (dateValue.value == null || dateValue.value == '' || dateValue.value == void 0) {
      ElMessage({
        type: 'warning',
        message: '日期不能为空！'
      })
      return
    }
    lastValue.value = dateValue.value
    repeatInit(val)
  }
}

// 根据buttonMSg切换处理
const repeatInit = (val) => {
  oldDateValue.value = dateValue.value
  pickerDate.value = oldDateValue.value
  oldDateValue.value = dateEndWith(oldDateValue.value)

  if (val == 3) {
    // 获取年统计数据
    queryYearStatisticsFn()
    // 获取表格1 年数据
    getYearRequestFn()
    return
  }
  // 获取表格1 日/月数据(同一接口)
  getRequestFn()
  if (val == 1) {
    // 获取日统计数据
    queryDayStatisticsFn()
    //获取表格2数据
    getQueryPageRequestFn()
  }

  //获取月柱状图
  if (val === 2) {
    // 获取月统计数据
    queryMonthStatisticsFn()
  }
}

// 获取日统计数据
let staticData = reactive({ data: {} })
const queryDayStatisticsFn = () => {
  axiosRequest('/glbecoPhyunitReactivepowerdayEntity/queryStatistics', {
    phyUnitId: selectListId.value,
    date: pickerDate.value
  }).then((res) => {
    if (res && res.code == 200) {
      staticData.data = res.data
    }
  })
}
//获取月统计数据
const queryMonthStatisticsFn = () => {
  axiosRequest('/glbecoPhyunitReactivepowerdayEntity/queryMonthStatistics', {
    phyUnitId: selectListId.value,
    date: pickerDate.value
  }).then((res) => {
    if (res && res.code == 200) {
      staticData.data = res.data
    }
  })
}
// 获取年统计数据
const queryYearStatisticsFn = () => {
  axiosRequest('/glbecoPhyunitReactivepowermonthlyEntity/queryStatistics', {
    phyUnitId: selectListId.value,
    date: pickerDate.value
  }).then((res) => {
    if (res && res.code == 200) {
      staticData.data = res.data
    }
  })
}

// 表格1table和分頁配置
let tableAndPaginationConfig1 = reactive({
  value: { tableStyle: {}, pagesizeConfig: { current: 1, size: 10, total: 0 } }
})
// 设置表格1头部及数据格式
let tableData1 = reactive({
  column: [
    { label: '时间', field: 'dataTime' },
    { label: '补偿分数', field: 'bcvalue' },
    { label: '无功电量/万千瓦时', field: 'wppower' },
    { label: '操作', slotName: 'operate1' }
  ],
  data: []
})

// 获取表格1 日/月数据
const getRequestFn = () => {
  axiosRequest('/glbecoPhyunitReactivepowerdayEntity/queryPage', {
    phyUnitId: selectListId.value,
    date: pickerDate.value,
    size: tableAndPaginationConfig1.value.pagesizeConfig.size,
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
      tableData1.data = res.data.records
    }
  })
}

// 获取表格1 年数据
const getYearRequestFn = () => {
  axiosRequest('/glbecoPhyunitReactivepowermonthlyEntity/queryPage', {
    phyUnitId: selectListId.value,
    date: pickerDate.value,
    size: tableAndPaginationConfig1.value.pagesizeConfig.size,
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
      tableData1.data = res.data.records
    }
  })
}

// 表格1点击查看
const handelItem1 = (index, row) => {
  // 当查看为月份时，将button切换到日，并获取数据
  if (buttonMSg.type == 1) {
    ElMessage({
      type: 'warning',
      message: '已经是当天信息啦！'
    })
    return
  }
  if (buttonMSg.type == 2) {
    buttonMSg.type = 1
    dateValue.value = row.dataTime //指定picker时间展示
    pickerDate.value = row.dataTime //指定请求数据
    // 获取type为日时的数据
    queryDayStatisticsFn() //日统计数据
    getQueryPageRequestFn() //获取表格2数据
  }
  if (buttonMSg.type == 3) {
    buttonMSg.type = 2
    dateValue.value = row.dataTime //指定picker时间展示
    pickerDate.value = row.dataTime //指定请求数据
    // 获取type为月时的数据
    queryMonthStatisticsFn() //月统计数据
  }
  // 获取表格数据
  getRequestFn() //获取表格1日/月数据(同一接口)
  console.log('handelItem1::: ', index, row, pickerDate.value)
}
// 表格1切換頁碼
const handelCurrentChange1 = (val) => {
  tableAndPaginationConfig1.value.pagesizeConfig.current = val
  if (buttonMSg.type != 3) {
    getRequestFn()
  } else {
    getYearRequestFn()
  }
}

// 设置表格2头部及数据格式
let tableData2 = reactive({
  column: [
    { label: '时间戳(1s)', field: 'dataTime' },
    { label: '有功功率', field: 'p' },
    { label: '无功功率', field: 'wp' },
    { label: '功率因数', field: 'factor' },
    { label: '视在功率', field: 'papparent' }
  ],
  data: []
})

// 表格2table和分頁配置
let tableAndPaginationConfig2 = reactive({
  value: {
    tableStyle: {
      height: '440'
    },
    pagesizeConfig: { current: 1, size: 10, total: 0 }
  }
})
// 获取表格2数据
const getQueryPageRequestFn = () => {
  axiosRequest('/glbecoPhyunitPowerEntity/querySecondPage', {
    phyUnitId: selectListId.value,
    date: pickerDate.value,
    size: tableAndPaginationConfig2.value.pagesizeConfig.size,
    current: tableAndPaginationConfig2.value.pagesizeConfig.current
  }).then((res) => {
    if (res && res.code == 200) {
      tableAndPaginationConfig2.value = {
        pagesizeConfig: {
          current: res.data.current,
          size: res.data.size,
          total: res.data.total
        }
      }
      tableData2.data = res.data.records
    }
  })
}
// 表格2切換頁碼
const handelCurrentChange2 = (val) => {
  tableAndPaginationConfig2.value.pagesizeConfig.current = val
  getQueryPageRequestFn()
}
</script>

<template>
  <div class="compensationIdleWork">
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
        <div class="topsDateSelect">
          <el-radio-group v-model="buttonMSg.type">
            <el-radio-button @click="tabClick(1)" label="1">日</el-radio-button>
            <el-radio-button @click="tabClick(2)" label="2">月</el-radio-button>
            <el-radio-button @click="tabClick(3)" label="3">年</el-radio-button>
          </el-radio-group>
        </div>
        <div class="topsDatePicker">
          <div class="block" v-show="buttonMSg.type == 1">
            <el-date-picker
              :clearable="false"
              v-model="dateValue"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择某一天"
              @visible-change="dateChange($event, 1)"
            />
          </div>
          <div class="block" v-show="buttonMSg.type == 2">
            <el-date-picker
              :clearable="false"
              v-model="dateValue"
              type="month"
              value-format="YYYY-MM"
              placeholder="请选择某一月份"
              @visible-change="dateChange($event, 2)"
            />
          </div>
          <div class="block" v-show="buttonMSg.type == 3">
            <el-date-picker
              :clearable="false"
              v-model="dateValue"
              type="year"
              value-format="YYYY"
              placeholder="请选择某一年份"
              @visible-change="dateChange($event, 3)"
            />
          </div>
        </div>
      </div>
      <!-- <div class="topRight">
        <text><i>死区范围：</i>装机容量 * 3% = 6MW</text>
      </div> -->
    </div>
    <div id="topsContent">
      <div class="topsContent">
        <div class="avatar">
          <div class="topAvatar">
            <div class="blow">
              <div>
                <img src="../assets/img/ico_parameter.png" />
              </div>
              <div>
                <p>补偿分数</p>
                <p>
                  <span>{{ staticData.data?.bcvalue || (buttonMSg.type == 1 ? '-' : 0) }} </span>
                  分
                </p>
              </div>
            </div>
            <div class="under">
              <div class="underLine">
                <p>
                  同比<i>&nbsp;</i><span>{{ filterNumber(staticData.data?.bcvalueTb, '%') }}</span>
                </p>
                <p>
                  <i>&nbsp;</i>环比<span>{{ filterNumber(staticData.data?.bcvalueHb, '%') }}</span>
                </p>
              </div>
            </div>
          </div>
          <div class="topAvatar">
            <div class="blow">
              <div>
                <img src="../assets/img/ico_battery.png" />
              </div>
              <div>
                <p>无功电量</p>
                <p>
                  <span>{{ staticData.data?.wppower || 0 }}</span
                  >万千瓦时
                </p>
              </div>
            </div>
            <div class="under">
              <div class="underLine">
                <p>
                  同比<i>&nbsp;</i><span>{{ staticData.data?.wppowerTb || 0 }}</span> %
                </p>
                <p>
                  <i>&nbsp;</i>环比<span>{{ staticData.data?.wppowerHb || 0 }}</span> %
                </p>
              </div>
            </div>
          </div>
        </div>
        <table-view
          class="tableView"
          :table-data="tableData1"
          :config="tableAndPaginationConfig1"
          @currentChange="handelCurrentChange1"
        >
          <template #operate1="scope">
            <div @click="handelItem1(scope.$index, scope.row)" v-debounce class="colorRed">
              查看
            </div>
          </template>
        </table-view>

        <table-view
          class="tableView"
          v-show="buttonMSg.type == 1"
          :table-data="tableData2"
          :config="tableAndPaginationConfig2"
          @currentChange="handelCurrentChange2"
        >
        </table-view>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.compensationIdleWork {
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
      .topsDateSelect {
        margin: 0 10px;
        line-height: 20px;
      }
      .topsDatePicker {
        .block {
          margin-left: 10px;
          .text {
            padding: 0 8px;
          }
        }
      }
    }
    .topRight {
      display: flex;
      align-items: center;
      i {
        font-weight: bold;
      }
    }
  }
  #topsContent {
    .topsContent {
      .avatar {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        .topAvatar {
          width: 280px;
          border: 1px solid #dcdfe6;
          border-radius: 3px;
          box-sizing: border-box;
          margin: 0 10px 10px 0;
          padding: 20px 30px;
          background: var(--backgroundBoxF9);
          text-wrap: nowrap;
          &:nth-child(3) {
            margin: 0 0 10px 10px;
          }
          .blow {
            display: flex;
            border-bottom: 1px solid #dcdfe6;
            // box-shadow: 0 0 1px rgba(0, 0, 0, 0.3) inset;
            align-items: center;
            padding: 10px 0 10px;
            div {
              &:nth-child(1) {
                margin: 0 20px 0 10px;
              }
              p {
                font-size: 14px;
                text-wrap: nowrap;
                span {
                  font-size: 28px;
                }
              }
              img {
                width: 50px;
                height: 50px;
              }
            }
          }
          .under {
            .underLine {
              display: flex;
              justify-content: space-around;
              align-items: center;
              margin-top: 10px;
              p {
                font-size: 14px;
                span {
                  margin-left: 5px;
                }
              }
            }
          }
        }
        .charts {
          .chartItem {
            width: 800px;
            height: var(--height-200);
            //   height: 160px;
          }
        }
      }
      .tableView {
        width: clamp(1000px, 80%, 1200px);
      }
    }
  }
}
</style>
