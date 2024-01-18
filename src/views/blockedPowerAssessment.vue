<!--
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2023-12-27 13:31:58
 * @Description: 有偿调峰与顶峰能力--受阻电力考核
-->
<script setup>
import * as echarts from 'echarts'
import { valMaxMinFix, filterNumber, dateEndWith } from '../common/prefix.js'
import { ElMessage } from 'element-plus'

onUnmounted(() => {
  watchSelect()
})

onMounted(() => {
  queryListFn() //获取机组下拉框数据
})

let todayValue = formateTime(new Date()).substring(0, 7)
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

// 选择时间，默认为1，day,month,year分别为1,2,3
let dateValue = ref(todayValue)
let oldDateValue = ref('')
let lastValue = ref('')
let pickerDate = ref('')
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
  axiosRequest('/glbecoPhyunitDfObstructedDayEntity/queryStatistics', {
    phyUnitId: selectListId.value,
    date: pickerDate.value
  }).then((res) => {
    if (res && res.code == 200) {
      staticData.data = res.data
    }
  })
}

// 获取月统计数据
const queryMonthStatisticsFn = () => {
  axiosRequest('/glbecoPhyunitDfObstructedDayEntity/queryMonthStatistics', {
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
  axiosRequest('/glbecoPhyunitDfObstructedMonthlyEntity/queryStatistics', {
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
  value: {
    tableStyle: {},
    pagesizeConfig: { current: 1, size: 10, total: 0 }
  }
})
// 设置表格1头部及数据格式
let tableData1 = reactive({
  column: [
    { label: '时间', field: 'dataTime' },
    { label: '考核分数', field: 'khValue' },
    { label: '受阻次数', field: 'obstructedCount' },
    { label: '总受阻时长(h)', field: 'OBSTRUCTEDTIME', slotName: 'OBSTRUCTEDTIME' },
    { label: '申报次数', field: 'declareCount' },
    { label: '小于2h申报次数', field: 'declareCount2' },
    { label: '2h-4h申报次数', field: 'declareCount24' },
    { label: '4h以上申报次数', field: 'declareCount4' },
    { label: '操作', slotName: 'operate1' }
  ],
  data: []
})

// 获取表格1 日/月数据
const getRequestFn = () => {
  axiosRequest('/glbecoPhyunitDfObstructedDayEntity/queryPage', {
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
  axiosRequest('/glbecoPhyunitDfObstructedMonthlyEntity/queryPage', {
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
    //
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
  //
}
// 表格1切換頁碼
const handelCurrentChange1 = (val) => {
  tableAndPaginationConfig1.value.pagesizeConfig.current = val
  if (buttonMSg.type != 3) {
    getRequestFn()
  } else {
    getYearRequestFn()
  }
  //
}

// 设置表格2头部及数据格式
let tableData2 = reactive({
  column: [
    { label: '开始时间', field: 'startTime' },
    { label: '结束时间', field: 'endTime' },
    { label: 'AGC最大偏差', field: 'agcpcMax' },
    { label: 'AGC最小偏差', field: 'agcpcMin' },
    { label: '受阻时长(h)', field: 'OBSTRUCTEDTIME', slotName: 'OBSTRUCTEDTIME' },
    { label: '考核分数', field: 'khValue' },
    { label: '申报时间', field: 'declareTime', slotName: 'declareTime' },
    { label: '操作', slotName: 'operate2' }
  ],
  showIndexColumn: true,
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
  axiosRequest('/glbecoPhyunitDfObstructedRnEntity/queryPage', {
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

// 操作
const dialogVisible = ref(false)
const handelItem2 = (index, row) => {
  dialogVisible.value = true
  // 查看时获取当前行
  modalLineChartData.row = {}
  modalLineChartData.row = row
  getLineChartRequestFn()
  open()
}

const open = () => {
  setTimeout(() => {
    chart()
  }, 1000)
}

// 表格2弹框显示折线图(执行曲线)
let modalLineChartData = reactive({ row: {}, value: {} }) //保存行数据和折线图数据
const getLineChartRequestFn = () => {
  axiosRequest('/glbecoPhyunitDfObstructedRnEntity/queryImplCurve', {
    phyUnitId: selectListId.value,
    date: pickerDate.value,
    beginDate: modalLineChartData.row.dataTime,
    endDate: modalLineChartData.row.endtime
  }).then((res) => {
    if (res && res.code == 200) {
      modalLineChartData.value = res.data
    }
  })
}

// 声明弹窗中echarts函数
let tooltipData1 = reactive({})
let tooltipData2 = reactive({})
let tooltipData3 = reactive({})
const chart = () => {
  let chartDom = document.getElementById('modalChart')
  let myChart = null
  if (chartDom.getAttribute('_echarts_instance_')) {
    chartDom.setAttribute('_echarts_instance_', '')
  }
  if (!echarts.getInstanceByDom(chartDom)) {
    myChart = echarts.init(chartDom)
  }
  let option = null
  option = {
    tooltip: {
      trigger: 'axis',
      // position: ['100%', '-25%'],
      formatter: function (params) {
        tooltipData1.val = params[0]
        tooltipData2.val = params[1]
        tooltipData3.val = params[2]
      }
    },
    legend: {
      data: ['AGC指令', '有功功率', '偏差值ABS']
    },
    grid: {
      // top: '5%',
      left: '4%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    dataZoom: [
      {
        start: 0,
        end: 100,
        show: false
      },
      {
        type: 'inside'
      }
    ],
    xAxis: {
      type: 'category',
      boundaryGap: false,

      axisLine: {
        show: true,
        symbol: ['none', 'arrow'], // 轴线两端箭头，两个值，none表示没有箭头，arrow表示有箭头
        symbolOffset: 15,
        symbolSize: [5, 15], // 轴线两端箭头大小，数值一表示宽度，数值二表示高度
        lineStyle: {
          color: '#999',
          shadowOffsetX: 15, //利用阴影进行反向延长
          shadowColor: '#999' //设置阴影的颜色
        }
      },

      data: modalLineChartData.value.dataTime || []
    },
    yAxis: [
      {
        type: 'value',
        scale: true, //自适应
        min: function (value) {
          let num = valMaxMinFix(value, 'min', 0.95)
          return num
        },
        max: function (value) {
          let num = valMaxMinFix(value, 'max', 1.05)
          return num
        },
        axisLabel: {
          showMinLabel: true, //显示最小刻度线值
          showMaxLabel: true, //显示最大刻度线值
          formatter: function (v) {
            return v.toFixed(2)
          }
        },
        axisLine: {
          show: true,
          symbol: ['none', 'arrow'], // 轴线两端箭头，两个值，none表示没有箭头，arrow表示有箭头
          symbolOffset: 20,
          symbolSize: [5, 15], // 轴线两端箭头大小，数值一表示宽度，数值二表示高度
          lineStyle: {
            color: '#999',
            shadowOffsetY: -20, //利用阴影进行反向延长
            shadowColor: '#999' //设置阴影的颜色
          }
        },
        splitLine: {
          // gird 区域中的分割线
          show: true, // 是否显示
          lineStyle: {
            color: '#dcdfe6',
            width: 1,
            type: 'dashed'
          }
        }
      },
      {
        type: 'value',
        name: '赫兹/Hz',
        position: 'left',
        offset: 50,
        scale: true, //自适应
        min: function (value) {
          let num = valMaxMinFix(value, 'min', 0.95)
          return num
        },
        max: function (value) {
          let num = valMaxMinFix(value, 'max', 1.05)
          return num
        },
        axisLabel: {
          showMinLabel: true, //显示最小刻度线值
          showMaxLabel: true, //显示最大刻度线值
          formatter: function (v) {
            return v.toFixed(2)
          }
        },
        axisLine: {
          show: true,
          symbol: ['none', 'arrow'], // 轴线两端箭头，两个值，none表示没有箭头，arrow表示有箭头
          symbolOffset: 20,
          symbolSize: [5, 15], // 轴线两端箭头大小，数值一表示宽度，数值二表示高度
          lineStyle: {
            color: '#999',
            shadowOffsetY: -20, //利用阴影进行反向延长
            shadowColor: '#999' //设置阴影的颜色
          }
        },
        splitLine: {
          // gird 区域中的分割线
          show: true, // 是否显示
          lineStyle: {
            color: '#dcdfe6',
            width: 1,
            type: 'dashed'
          }
        }
      },
      {
        type: 'value',
        // alignTicks: true, // ！！配置多坐标轴标签对齐
        name: '兆瓦/MW',
        scale: true, //自适应
        min: function (value) {
          let num = valMaxMinFix(value, 'min', 0.9995)
          return num
        },
        max: function (value) {
          let num = valMaxMinFix(value, 'max', 1.0005)
          return num
        },
        axisLabel: {
          showMinLabel: true, //显示最小刻度线值
          showMaxLabel: true, //显示最大刻度线值
          formatter: function (v) {
            return v.toFixed(2)
          }
        },
        axisLine: {
          show: true,
          symbol: ['none', 'arrow'], // 轴线两端箭头，两个值，none表示没有箭头，arrow表示有箭头
          symbolOffset: 20,
          symbolSize: [5, 15], // 轴线两端箭头大小，数值一表示宽度，数值二表示高度
          lineStyle: {
            color: '#999',
            shadowOffsetY: -20, //利用阴影进行反向延长
            shadowColor: '#999' //设置阴影的颜色
          }
        },
        splitLine: {
          // gird 区域中的分割线
          show: true, // 是否显示
          lineStyle: {
            color: '#dcdfe6',
            width: 1,
            type: 'dashed'
          }
        }
      }
    ],
    series: [
      {
        name: 'AGC指令',
        // position: [10, 10],
        showSymbol: false,
        type: 'line',
        yAxisIndex: 0, //指定需要使用的Y轴
        // data: [30.7817, 30.8101, 30.8669, 30.8669]
        data: modalLineChartData.value.agcins || []
      },
      {
        name: '有功功率',
        // position: [10, 10],
        showSymbol: false,
        type: 'line',
        yAxisIndex: 1, //指定需要使用的Y轴
        // data: [20, 30, 13, 11, 12, 42, 29],
        data: modalLineChartData.value.p || []
      },
      {
        name: '偏差值',
        // position: [10, 10],
        showSymbol: false,
        type: 'line',
        yAxisIndex: 2, //指定需要使用的Y轴
        // data: [20, 30, 13, 11, 12, 42, 29],
        data: modalLineChartData.value.abs || []
      }
    ]
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
</script>

<template>
  <div class="blockedPowerAssessment">
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
                <p>考核分数</p>
                <p>
                  <span
                    >{{ filterNumber(staticData.data?.khValue) || (buttonMSg.type == 1 ? '-' : 0) }}
                  </span>
                  分
                </p>
              </div>
            </div>
            <div class="under">
              <div class="underLine">
                <p>
                  <i>&nbsp;</i>
                </p>
                <!-- <p>
                  高峰时段：<i>&nbsp;</i><span>{{ staticData.data?.gfkhValue || 0 }}</span>
                </p>
                <p>
                  其它时段：<i>&nbsp;</i><span>{{ staticData.data?.qtkhValue || 0 }}</span>
                </p> -->
              </div>
            </div>
          </div>
        </div>

        <table-view
          :table-data="tableData1"
          :config="tableAndPaginationConfig1"
          @currentChange="handelCurrentChange1"
        >
          <template #OBSTRUCTEDTIME="scope">
            <div>{{ filterNumber(scope.row.OBSTRUCTEDTIME, '小时') }}</div>
          </template>
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
          <template #OBSTRUCTEDTIME="scope">
            <div>{{ filterNumber(scope.row.OBSTRUCTEDTIME, '小时') }}</div>
          </template>
          <template #operate2="scope">
            <div @click="handelItem2(scope.$index, scope.row)" class="colorRed">查看曲线</div>
          </template>
        </table-view>

        <div class="tableDialog">
          <el-dialog
            v-model="dialogVisible"
            title="AGC执行曲线+有功功率+偏差值ABS(AGC-有功功率)"
            center
            width="1000px"
            @open="open"
            draggable
          >
            <div class="stateModal">
              <div>
                <p>状态：</p>
                <p class="text" v-if="modalLineChartData.row.isstat == 1">合格</p>
                <p class="text" v-else-if="modalLineChartData.row.isstat == 0">不合格</p>
                <p class="text" v-else>状态异常</p>
              </div>
              <div v-show="modalLineChartData.row?.isstat != 1">
                <p>不合格原因：</p>
                <p class="text">{{ modalLineChartData.row.resreason || '--' }}</p>
              </div>
            </div>
            <div class="modals">
              <div id="modalChart"></div>
              <div class="modalTable">
                <div class="radius" :style="tooltipData1.val?.color"></div>
                <span
                  :style="{ color: tooltipData1.val?.color }"
                  v-show="tooltipData1.val?.seriesName"
                  >{{ tooltipData1.val?.seriesName }}: </span
                ><span>{{ tooltipData1.val?.value }}</span
                >&nbsp;&nbsp;
                <div class="radius" :style="tooltipData2.val?.color"></div>
                <span
                  :style="{ color: tooltipData2.val?.color }"
                  v-show="tooltipData2.val?.seriesName"
                  >{{ tooltipData2.val?.seriesName }}: </span
                ><span>{{ tooltipData2.val?.value }}</span>

                <table>
                  <thead style="background: #f2f2f2">
                    <tr>
                      <th class="th">字段</th>
                      <th class="th">值</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="td">开始时间</td>
                      <td class="td">{{ modalLineChartData.row?.startTime || '--' }}</td>
                    </tr>

                    <tr>
                      <td class="td">结束时间</td>
                      <td class="td">{{ modalLineChartData.row?.endTime || '--' }}</td>
                    </tr>
                    <tr>
                      <td class="td">考核分数</td>
                      <td class="td">{{ filterNumber(modalLineChartData.row?.khValue) }}</td>
                    </tr>
                    <tr>
                      <td class="td">申报时间</td>
                      <td class="td">{{ modalLineChartData.row?.declareTime || '--' }}</td>
                    </tr>
                    <tr>
                      <td class="td">AGC最大偏差</td>
                      <td class="td">{{ filterNumber(modalLineChartData.row?.agcpcMax) }}</td>
                    </tr>
                    <tr>
                      <td class="td">AGC最小偏差</td>
                      <td class="td">{{ filterNumber(modalLineChartData.row?.agcpcMin) }}</td>
                    </tr>
                    <tr>
                      <td class="td">受阻时长</td>
                      <td class="td">
                        {{ filterNumber(modalLineChartData.row?.OBSTRUCTEDTIME, '小时') }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </el-dialog>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.blockedPowerAssessment {
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
                margin: 0 30px 0 30px;
              }
              p {
                font-size: 14px;
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
      }

      .tableView {
        width: 100%;
      }
      .tableDialog {
        .stateModal {
          padding-left: 30px;
          div {
            display: flex;
            p.text {
              color: var(--colorRed);
            }
          }
        }
        .modals {
          display: flex;
          justify-items: center;
          #modalChart {
            width: 70%;
            height: 600px;
          }
          .modalTable {
            width: 30%;
            .radius {
              display: inline-block;
              width: 10px;
              height: 10px;
              border-radius: 10px;
            }
            table {
              border-collapse: collapse;
              margin-top: 10px;
              width: 100%;
              color: #333;

              tr {
                th {
                  border: 1px solid #ebeef5;
                  padding: 8px 2px 8px 10px;
                  width: fit-content;
                  min-width: 130px;
                }
                td {
                  border: 1px solid #ebeef5;
                  padding: 5px 2px 5px 10px;
                  box-sizing: border-box;
                  width: fit-content;
                  min-width: 130px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
