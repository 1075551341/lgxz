<!--
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-12 15:15:32
 * @Description: 统计分析--月度综合统计
-->
<script setup>
import * as echarts from 'echarts'
import { valMaxMinFix, filterNumber, dateEndWith } from '../common/prefix.js'

let todayValue = formateTime(new Date()).substring(0, 7)

onMounted(() => {
  queryListFn() //获取机组下拉框数据
})

// 切换机组初始化
const initFn = () => {
  getRequestFn() //获取数据（机组统计）
  getBcAndKhFn() //获取考核和补偿数据（综合统计）
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

    getBcAndKhFn() //获取考核和补偿数据（综合统计）
  }
}
let dateValue = ref(todayValue)
let pickerDate = ref(todayValue)
const dateChange = () => {
  pickerDate.value = dateValue.value
  // getRequestFn() // 获取数据（机组统计）
  initFn()
}

// 表格table和分頁配置
let tableAndPaginationConfig1 = reactive({
  value: {
    tableStyle: {}
  }
})
// 设置表格头部及数据格式
let tableData1 = reactive({
  column: [
    { label: '机组', field: 'caption' },
    { label: '考核分数', field: 'khScore' },
    { label: '补偿分数', field: 'bcScore' },
    { label: '合计', field: 'sumScore', slotName: 'sumScore' }
  ],
  data: []
})

// 获取数据（机组统计）
const getRequestFn = () => {
  axiosRequest('/comprehensiveStatisticsEntity/unitStatistics', {
    phyUnitId: selectListId.value,
    date: pickerDate.value
  }).then((res) => {
    if (res && res.code == 200) {
      tableData1.data = res.data
    }
  })
}
// 获取考核和补偿数据（综合统计）
let obj = reactive({ val: { bcList: [], khList: [] } })
const getBcAndKhFn = () => {
  axiosRequest('/comprehensiveStatisticsEntity/comprehensiveStatistics', {
    phyUnitId: selectListId.value,
    date: pickerDate.value
  }).then((res) => {
    if (res && res.code == 200) {
      tableData2.data = res.data.khList
      tableData3.data = res.data.bcList
      obj.val = { bcList: [], khList: [] }
      for (let kh of res.data.khList) {
        let o = { name: kh.itemName, value: kh.score }
        obj.val.khList.push(o)
      }
      for (let bc of res.data.bcList) {
        let o = { name: bc.itemName, value: bc.score }
        obj.val.bcList.push(o)
      }
      nextTick(() => {
        assessDrawPie() //考核项
        compensationDrawPie() //补偿项
      })
      //  console.log('obj::: ', obj)
    }
  })
}
// 设置考核项头部及数据格式
let tableData2 = reactive({
  column: [
    { label: '考核项', field: 'itemName' },
    { label: '考核分数', field: 'score' }
  ],
  data: []
})
// 考核项table和分頁配置
let tableAndPaginationConfig2 = reactive({
  value: {
    tableStyle: {
      height: '330'
    }
  }
})

// 考核项饼图
const assessDrawPie = () => {
  let chartDom = document.getElementById('pieChart1')
  let myChart = null
  if (chartDom.getAttribute('_echarts_instance_')) {
    chartDom.setAttribute('_echarts_instance_', '')
  }
  if (!echarts.getInstanceByDom(chartDom)) {
    myChart = echarts.init(chartDom)
  }
  let option = null
  option = {
    title: {
      text: '考核项',
      top: '2%',
      left: '10%'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 0,
      top: 10
    },

    series: {
      name: '考核项',
      type: 'pie',
      radius: [20, 120],
      center: ['40%', '55%'],
      roseType: 'radius',
      itemStyle: {
        borderRadius: 5
      },
      label: {
        show: false
      },
      data: obj.val.khList
    }
  }
  // 绘制图表
  if (myChart) {
    option && myChart.setOption(option, true)
  }

  // echarts 自适应
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

// 设置补偿项头部及数据格式
let tableData3 = reactive({
  column: [
    { label: '考核项', field: 'itemName' },
    { label: '考核分数', field: 'score' }
  ],
  data: []
})
// 补偿项table和分頁配置
let tableAndPaginationConfig3 = reactive({
  value: {
    tableStyle: {
      height: '330'
    }
  }
})

// 补偿项饼图
const compensationDrawPie = () => {
  let chartDom = document.getElementById('pieChart2')
  let myChart = null
  if (chartDom.getAttribute('_echarts_instance_')) {
    chartDom.setAttribute('_echarts_instance_', '')
  }
  if (!echarts.getInstanceByDom(chartDom)) {
    myChart = echarts.init(chartDom)
  }
  let option = null
  option = {
    title: {
      text: '补偿项',
      top: '2%',
      left: '10%'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 0,
      top: 10
    },
    series: {
      name: '补偿项',
      type: 'pie',
      radius: [20, 120],
      center: ['40%', '55%'],
      roseType: 'radius',
      itemStyle: {
        borderRadius: 5
      },
      label: {
        show: false
      },
      data: obj.val.bcList
      // data: [
      //   { value: 40, name: 'rose 1' },
      //   { value: 33, name: 'rose 2' },
      //   { value: 28, name: 'rose 3' },
      //   { value: 22, name: 'rose 4' },
      //   { value: 20, name: 'rose 5' },
      //   { value: 15, name: 'rose 6' },
      //   { value: 12, name: 'rose 7' },
      //   { value: 10, name: 'rose 8' }
      // ]
    }
  }
  // 绘制图表
  if (myChart) {
    option && myChart.setOption(option, true)
  }

  // echarts 自适应
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}
// 切换tabs
let btnType = ref('1')
const btnTypeClick = (val) => {
  btnType.value = val.props.name
}
</script>

<template>
  <div class="monthlyGeneralStatic">
    <div class="tops">
      <div class="topLeft">
        <div class="topsDatePicker">
          <div class="block">
            <el-date-picker
              :clearable="false"
              v-model="dateValue"
              type="month"
              value-format="YYYY-MM"
              placeholder="请选择某一月份"
              @change="dateChange()"
            />
          </div>
        </div>
      </div>
    </div>

    <div id="topsContent">
      <div class="topsContent">
        <div id="tables">
          <table-view :table-data="tableData1" :config="tableAndPaginationConfig1">
            <template #sumScore="scope">
              <div class="colorRed">
                {{ scope.row.sumScore }}
              </div>
            </template>
          </table-view>
        </div>
        <div style="padding: 5px 0">
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
        </div>
        <div class="tablesContent">
          <table-view class="con" :table-data="tableData2" :config="tableAndPaginationConfig2">
          </table-view>
          <div class="pieChart con" id="pieChart1" v-if="tableData2.data.length > 0"></div>
          <div class="alignCenter con" v-else>暂无数据</div>
          <table-view class="con" :table-data="tableData3" :config="tableAndPaginationConfig3">
          </table-view>
          <div class="pieChart con" id="pieChart2" v-if="tableData3.data.length > 0"></div>
          <div class="alignCenter con" v-else>暂无数据</div>
        </div>
        <div id="assessContent">
          <div class="assessContent">
            <div class="assessType">
              <el-tabs v-model="btnType" class="demo-tabs" @tab-click="btnTypeClick">
                <el-tab-pane label="考核分数" name="1">
                  <div>
                    <div class="assessCompensation" v-show="btnType == 1">
                      <div class="assess" v-for="(item, i) in tableData2.data" :key="i">
                        <div class="assess_title">{{ item.itemName }}</div>
                        <table class="calculateTable">
                          <tr>
                            <td>考核细则</td>
                            <td>考核分数</td>
                          </tr>
                          <tr v-for="(list, l) in item.childList" :key="'list' + l">
                            <td>{{ list.itemName }}</td>
                            <td>{{ list.score }}</td>
                          </tr>
                        </table>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="补偿" name="2">
                  <div>
                    <div class="assessCompensation" v-show="btnType == 2">
                      <div class="assess" v-for="(item, i) in tableData3.data" :key="i">
                        <div class="assess_title">{{ item.itemName }}</div>
                        <table class="calculateTable">
                          <tr>
                            <td>考核细则</td>
                            <td>考核分数</td>
                          </tr>
                          <tr v-for="(list, l) in item.childList" :key="'list' + l">
                            <td>{{ list.itemName }}</td>
                            <td>{{ list.score }}</td>
                          </tr>
                        </table>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.monthlyGeneralStatic {
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
    }
  }
  #topsContent {
    .topsContent {
      #tables {
        width: clamp(800px, 80%, 1000px);
      }

      @media screen and (max-width: 1440px) {
        .tablesContent {
          display: grid;
          /*  声明列的宽度  */
          grid-template-columns: repeat(2, 49%);
          /*  声明行间距和列间距  */
          grid-gap: 20px 10px;
          /*  声明行的高度  */
          grid-template-rows: 350px;
          grid-auto-flow: dense;

          .con {
            min-width: 250px;
            padding-top: 10px;
            &.alignCenter {
              display: flex;
              align-items: center;
              justify-content: center;
              color: #909399;
              font-size: 14px;
            }
          }
        }
      }
      @media screen and (min-width: 1441px) {
        .tablesContent {
          display: grid;
          /*  声明列的宽度  */
          grid-template-columns: repeat(4, 24%);
          /*  声明行间距和列间距  */
          grid-gap: 20px 10px;
          /*  声明行的高度  */
          grid-template-rows: 350px;
          grid-auto-flow: dense;
          .con {
            min-width: 250px;
            padding-top: 10px;
            &.alignCenter {
              display: flex;
              align-items: center;
              justify-content: center;
              color: #909399;
              font-size: 14px;
            }
          }
        }
      }
      #assessContent {
        .assessContent {
          .calculateTable {
            border: 1px solid #ebeef5;
            border-collapse: collapse;
            color: #606266;
            font-size: 14px;
            width: 100%;
            margin-top: 10px;
            tr {
              &:nth-child(1) {
                background: #e5e5e5;
              }
              td {
                border: 1px solid #ebeef5;
                border-collapse: collapse;
                padding: 8px 10px;
              }
            }
          }

          @media screen and (max-width: 1440px) {
            .assessCompensation {
              display: grid;
              /*  声明列的宽度  */
              grid-template-columns: repeat(2, 49%);
              /*  声明行间距和列间距  */
              grid-gap: 10px;
              /*  声明行的高度  */
              // grid-template-rows: 300px;
              grid-auto-rows: max-content;
              grid-auto-flow: dense;
              .assess {
                min-width: 250px;
                padding-top: 10px;
              }
            }
          }
          @media screen and (min-width: 1441px) {
            .assessCompensation {
              display: grid;
              /*  声明列的宽度  */
              grid-template-columns: repeat(4, 24%);
              /*  声明行间距和列间距  */
              grid-gap: 20px;
              /*  声明行的高度  */
              // grid-template-rows: 300px;
              grid-auto-rows: max-content;
              grid-auto-flow: dense;
              .assess {
                min-width: 250px;
                padding-top: 10px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
