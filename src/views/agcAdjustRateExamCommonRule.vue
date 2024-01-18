<!--
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-16 15:05:34
 * @Description: agc--调节速率考核(常规)
-->
<script setup>
import * as echarts from 'echarts'
import { valMaxMinFix, filterNumber, dateEndWith } from '../common/prefix.js'
//import { ElMessage } from 'element-plus'

let todayValue = formateTime(new Date()).substring(0, 7)
onUnmounted(() => {
  watchSelect()
})

onMounted(() => {
  drawBar() //无数据时展示
  queryListFn() //获取机组下拉框数据
})

const initFn = () => {
  buttonMSg.type = 2
  lineChartVisible.value = false
  chartVisible.value = true
  dateValue.value = todayValue
  pickerDate.value = todayValue
  // getHostRequestFn() //获取配置信息
  queryMonthStatisticsFn() //月统计数据
  queryMonthChartFn() //获取月柱状图数据
  getRequestFn() //获取表格1日/月数据(同一接口)
}

// 获取配置项信息
let selectListId = ref(0)
let hostMsg = reactive({ value: 120 })
// const getHostRequestFn = () => {
//   axiosRequest('/glbecoPhyunitParamvalueEntity/getParamValue', {
//     unitId: selectListId.value,
//     key: 'AgcTime'
//   }).then((res) => {
//     if (res) {
//       hostMsg.value = res.data
//     }
//   })
// }

// 获取机组下拉框数据
let selectValue = ref('')
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
let chartVisible = ref(true)
let lineChartVisible = ref(false)
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
    // 获取年柱状图数据
    queryYearBarChartFn()
    // 获取表格1 年数据
    getYearRequestFn()
    lineChartVisible.value = false
    // 显示柱状图
    chartVisible.value = true

    return
  }
  // 获取表格1 日/月数据(同一接口)
  getRequestFn()
  if (val == 1) {
    chartVisible.value = false
    //获取折线图
    lineChartVisible.value = true
    getLineChartFn()
    // 获取日统计数据
    queryDayStatisticsFn()
    //获取表格2数据
    getQueryPageRequestFn()
  }

  //获取月柱状图
  if (val === 2) {
    // 获取月统计数据
    queryMonthStatisticsFn()
    lineChartVisible.value = false
    // 显示月柱状图
    queryMonthChartFn()
    chartVisible.value = true
  }
}

// 获取日统计数据
let staticData = reactive({ data: {} })
const queryDayStatisticsFn = () => {
  axiosRequest('/glbecoPhyunitRegulationspeeddayEntity/queryStatistics', {
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
  axiosRequest('/glbecoPhyunitRegulationspeeddayEntity/queryMonthStatistics', {
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
  axiosRequest('/glbecoPhyunitRegulationspeedmonthlyEntity/queryStatistics', {
    phyUnitId: selectListId.value,
    date: pickerDate.value
  }).then((res) => {
    if (res && res.code == 200) {
      staticData.data = res.data
    }
  })
}

// 获取实时曲线(AGC+负荷)折线图
let lineChartData = reactive({
  value: { dataTime: [], agcins: [], pst: [] }
})

const getLineChartFn = () => {
  axiosRequest('/glbecoPhyunitAgcTimevalueEntity/queryRealTimeCurve', {
    phyUnitId: selectListId.value,
    date: pickerDate.value
  }).then((res) => {
    if (res && res.code == 200) {
      lineChartData.value = {
        dataTime: sortDate(res.data.dataTime),
        agcins: res.data.agcins,
        pst: res.data.pst
      }
      nextTick(() => {
        drawLine()
      })
    }
  })
}

// 折线图
const drawLine = () => {
  let chartDom = document.getElementById('chartLine')
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
      text: '实时曲线(AGC+负荷)',
      textStyle: {
        fontWeight: 'normal'
      },
      padding: [0, 0, 20, 20]
    },
    tooltip: {
      trigger: 'axis',
      position: ['100%', '10%'],
      formatter: function (params) {
        return `
        <div style="margin:10px 10px;width:160px;">
            <div style="padding:0 0 10px;">
              <div style="padding:5px 0;">时间: <span>${
                params[0]?.axisValue || params[1]?.axisValue
              }</span></div>
              <div style="display:${params[0] ? 'block' : 'none'}">
                <div style="display:inline-block;width:10px;height:10px;border-radius:10px;background-color:${
                  params[0]?.color
                };"></div>
              ${params[0]?.seriesName}:<span style="color:${params[0]?.color};">${
                params[0]?.value
              }</span>
              </div>
              <div style="display:${params[1] ? 'block' : 'none'}">
                <div style="display:inline-block;width:10px;height:10px;border-radius:10px;background-color:${
                  params[1]?.color
                };"></div>
              ${params[1]?.seriesName}:<span style="color:${params[1]?.color};">${
                params[1]?.value
              }</span>
              </div>
              </div>
        </div> `
      }
    },
    legend: {
      data: ['AGC指令', '负荷']
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
    graphic: {
      type: 'text', // 类型：文本
      left: '40%',
      top: 'middle',
      silent: true, // 不响应事件
      invisible: lineChartData.value.agcins.length || lineChartData.value.pst.length > 0, // 有数据就隐藏
      style: {
        fill: '#909399',
        fontWeight: 'normal',
        text: '暂无数据',
        fontFamily: 'Microsoft YaHei',
        fontSize: '20px'
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,

      data: lineChartData.value?.dataTime || [],
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
      }
    },
    yAxis: {
      type: 'value',
      name: '千瓦/KW',
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
        symbolOffset: 15,
        symbolSize: [5, 15], // 轴线两端箭头大小，数值一表示宽度，数值二表示高度
        lineStyle: {
          color: '#999',
          shadowOffsetY: -15, //利用阴影进行反向延长
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
    series: [
      {
        name: 'AGC指令',
        // position: [10, 10],
        showSymbol: false,
        type: 'line',

        // data: [30.7817, 30.8101, 30.8669, 30.8669]
        data: lineChartData.value?.agcins
      },
      {
        name: '负荷',
        // position: [10, 10],
        showSymbol: false,
        type: 'line',
        // yAxisIndex: 1, //指定需要使用的Y轴
        // data: [20, 30, 13, 11, 12, 42, 29],
        data: lineChartData.value?.pst
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

// 获取月柱状图
let barChartData = reactive({
  data: { dataTime: [], sl: [] }
})
const queryMonthChartFn = () => {
  axiosRequest('/glbecoPhyunitRegulationspeeddayEntity/queryPassRateBarChart', {
    phyUnitId: selectListId.value,
    date: pickerDate.value
  }).then((res) => {
    if (res && res.code == 200) {
      barChartData.data = {
        dataTime: sortDate(res.data.dataTime), //横坐标
        sl: res.data.sl //合格率
      }
      nextTick(() => {
        drawBar()
      })
    }
  })
}

// 获取年柱状图数据
const queryYearBarChartFn = () => {
  axiosRequest('/glbecoPhyunitRegulationspeedmonthlyEntity/queryPassRateBarChart', {
    phyUnitId: selectListId.value,
    date: pickerDate.value
  }).then((res) => {
    if (res && res.code == 200) {
      barChartData.data = {
        dataTime: sortDate(res.data.dataTime), //横坐标
        sl: res.data.sl //合格率
      }
      nextTick(() => {
        drawBar()
      })
    }
  })
}

// 柱状图
const drawBar = () => {
  let chartDom = document.getElementById('chartBar')
  let myChart = null
  if (chartDom.getAttribute('_echarts_instance_')) {
    chartDom.setAttribute('_echarts_instance_', '')
  }
  if (!echarts.getInstanceByDom(chartDom)) {
    myChart = echarts.init(chartDom)
  }
  let option = null
  let graphic = new echarts.graphic.LinearGradient(
    0,
    1,
    0,
    0,
    [
      {
        offset: 0,
        color: '#1268f3' // 0% 处的颜色
      },
      {
        offset: 0.6,
        color: '#08a4fa' // 60% 处的颜色
      },
      {
        offset: 1,
        color: '#01ccfe' // 100% 处的颜色
      }
    ],
    false
  )
  option = {
    // title: {
    //   text: '合格率',
    //   textStyle: {
    //     fontWeight: 'normal'
    //   },
    //   padding: [0, 0, 20, 40]
    //   // x: 'center'
    // },
    tooltip: {
      trigger: 'axis',
      position: ['80%', 0],
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        let res = params[0]
        return `<div>
            <span>${res.marker}${res.name}</span>&nbsp;&nbsp;<span>${res.seriesName} : ${res.value} %</span>
          </div>`
      }
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
    graphic: {
      type: 'text', // 类型：文本
      left: '40%',
      top: 'middle',
      silent: true, // 不响应事件
      invisible: barChartData.data?.sl.length > 0, // 有数据就隐藏
      style: {
        fill: '#909399',
        fontWeight: 'normal',
        text: '暂无数据',
        fontFamily: 'Microsoft YaHei',
        fontSize: '20px'
      }
    },
    xAxis: [
      {
        type: 'category',

        data: barChartData.data.dataTime || [],
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
        }
      }
    ],
    yAxis: {
      type: 'value',
      name: '合格率/%',
      scale: true, //自适应
      min: function (value) {
        return value.min * 0.5
      },
      max: function (value) {
        //console.log('value.max::: ', value, value.max)
        return value.max * 1.2 >= 100 ? 100 : value.max * 1.2
      },
      axisLabel: {
        showMinLabel: true, //显示最小刻度线值
        showMaxLabel: true, //显示最大刻度线值
        formatter: function (v) {
          return v.toFixed(1) + '%' //1位小数
        }
      },
      axisLine: {
        show: true,
        symbol: ['none', 'arrow'], // 轴线两端箭头，两个值，none表示没有箭头，arrow表示有箭头
        symbolOffset: 15,
        symbolSize: [5, 15], // 轴线两端箭头大小，数值一表示宽度，数值二表示高度
        lineStyle: {
          color: '#999',
          shadowOffsetY: -15, //利用阴影进行反向延长
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
    series: [
      {
        name: '合格率',
        type: 'bar',
        barWidth: '25',
        itemStyle: {
          color: graphic
        },
        // data: [10, 52, 200, 334, 390, 330, 220]
        data: barChartData.data?.sl || []
      }
    ]
  }
  // 绘制图表
  option && myChart.setOption(option, true)
  // echarts 自适应
  window.addEventListener('resize', () => {
    myChart.resize()
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
    { label: '平均调节速率', field: 'sl', slotName: 'sl' },
    { label: '考核分数', field: 'sumassess', slotName: 'sumassess' },
    { label: '总指令次数', field: 'sumcount' },
    { label: '合格次数', field: 'iscount' },
    { label: '不合格次数', field: 'nocount', slotName: 'nocount' },
    { label: '不合格平均调节速率', field: 'nosl', slotName: 'nosl' },
    { label: '操作', slotName: 'operate1' }
  ],
  data: []
})

// 获取表格1 日/月数据
const getRequestFn = () => {
  axiosRequest('/glbecoPhyunitRegulationspeeddayEntity/queryPage', {
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
  axiosRequest('/glbecoPhyunitRegulationspeedmonthlyEntity/queryPage', {
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
    chartVisible.value = false
    lineChartVisible.value = true
    getLineChartFn() //获取AGC折线图数据
  }
  if (buttonMSg.type == 3) {
    buttonMSg.type = 2
    dateValue.value = row.dataTime //指定picker时间展示
    pickerDate.value = row.dataTime //指定请求数据

    // 获取type为月时的数据
    queryMonthStatisticsFn() //月统计数据
    queryMonthChartFn() //获取月柱状图数据
    chartVisible.value = true
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
}

// 设置表格2头部及数据格式
let tableData2 = reactive({
  column: [
    { label: 'AGC指令下发时刻', field: 'agcsttime' },
    { label: 'AGC调节指令', field: 'agcins' },

    { label: '指令下发时刻有功', field: 'pst' },
    { label: '调节速率', field: 'rateavg', slotName: 'rateavg' },
    { label: '响应时间', field: 'restime', slotName: 'restime' },
    { label: '响应开始时刻', field: 'ressttime' },
    { label: '响应开始时刻有功', field: 'presst' },
    {
      label: '指令差/装机占比',
      field: 'instructionDifference',
      slotName: 'instructionDifference'
    },
    { label: '是否合格(合格不合格)', field: 'isres', slotName: 'isres' },
    { label: '不合格原因', field: 'resreason', slotName: 'resreason' },
    { label: '操作', slotName: 'operate2' }
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
  axiosRequest('/glbecoPhyunitAgcTimevalueEntity/queryPage', {
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
  //tooltipData1.val = {}
  //tooltipData2.val = {}
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
  axiosRequest('/api/glbecoPHPUnitAgcEntity/queryAgcAndPImplCurve', {
    phyUnitId: selectListId.value,
    date: pickerDate.value,
    beginDate: modalLineChartData.row.agcsttime,
    endDate: modalLineChartData.row.agcendtime
  }).then((res) => {
    if (res && res.code == 200) {
      modalLineChartData.value = res.data
    }
  })
}

// 声明弹窗中echarts函数
let tooltipData1 = reactive({})
let tooltipData2 = reactive({})
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
      formatter: function (params) {
        tooltipData1.val = params[0]
        tooltipData2.val = params[1]
      }
    },
    legend: {
      data: ['AGC指令', '负荷']
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
    yAxis: {
      type: 'value',
      name: '千瓦/KW',
      scale: true, //自适应
      min: function (value) {
        let num = valMaxMinFix(value, 'min', 0.995)
        return num
      },
      max: function (value) {
        let num = valMaxMinFix(value, 'max', 1.005)
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
        symbolOffset: 15,
        symbolSize: [5, 15], // 轴线两端箭头大小，数值一表示宽度，数值二表示高度
        lineStyle: {
          color: '#999',
          shadowOffsetY: -15, //利用阴影进行反向延长
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
    series: [
      {
        name: 'AGC指令',
        // position: [10, 10],
        showSymbol: false,
        type: 'line',
        markLine: {
          symbol: ['none', 'none'],
          label: { show: false },
          lineStyle: {
            color: '#d7231d',
            width: 1
          },
          data: [
            { xAxis: modalLineChartData.value.dataTime.length > 15 && 15 },
            {
              xAxis:
                modalLineChartData.value.dataTime.length > 30 &&
                modalLineChartData.value.dataTime.length - 15
            }
          ]
        },
        // data: [30.7817, 30.8101, 30.8669, 30.8669]
        data: modalLineChartData.value.agcins || []
      },
      {
        name: '负荷',
        // position: [10, 10],
        showSymbol: false,
        type: 'line',
        // yAxisIndex: 1, //指定需要使用的Y轴
        // data: [20, 30, 13, 11, 12, 42, 29],
        data: modalLineChartData.value.pst || []
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
  <div class="agcAdjustRateExamCommonRule">
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
      <div class="topRight">
        <text><i>响应合格时间：</i>{{ filterNumber(hostMsg.value, '秒') }}</text>
      </div>
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
                <p>考核分数/平均调节速率</p>
                <p>
                  <span
                    >{{
                      filterNumber(staticData.data?.sumassess) || (buttonMSg.type == 1 ? '-' : 0)
                    }}/{{ filterNumber(staticData.data?.sl) }}</span
                  >
                  %
                </p>
              </div>
            </div>
            <div class="under">
              <div class="underLine">
                <p>
                  同比<i>&nbsp;</i><span>{{ filterNumber(staticData.data?.tb, '%') }}</span>
                </p>
                <p>
                  <i>&nbsp;</i>环比<span>{{ filterNumber(staticData.data?.hb, '%') }}</span>
                </p>
              </div>
            </div>
          </div>
          <div class="topAvatar">
            <div class="blow">
              <div>
                <img src="../assets/img/ico_parameter.png" />
              </div>
              <div>
                <p>AGC指令次数</p>
                <p>
                  <span>{{ filterNumber(staticData.data?.sumcount) }}</span
                  >次
                </p>
              </div>
            </div>
            <div class="under">
              <div class="underLine">
                <p>
                  不合格<i>&nbsp;</i><span>{{ filterNumber(staticData.data?.nocount) }}</span>
                </p>
                <p>
                  <i>&nbsp;</i>合格<span>{{ filterNumber(staticData.data?.iscount) }}</span>
                </p>
              </div>
            </div>
          </div>
          <div class="charts">
            <div id="chartLine" v-if="lineChartVisible" class="chartItem"></div>
            <div id="chartBar" v-if="chartVisible" class="chartItem"></div>
          </div>
        </div>
        <table-view
          class="tableView tableFit"
          :table-data="tableData1"
          :config="tableAndPaginationConfig1"
          @currentChange="handelCurrentChange1"
        >
          <template #sl="scope">
            <div>{{ filterNumber(scope.row.sl, '%') }}</div>
          </template>
          <template #sumassess="scope">
            <div>{{ filterNumber(scope.row.sumassess) }}</div>
          </template>
          <template #nocount="scope">
            <div :class="[scope.row.nocount > 0 && 'colorRed']">
              {{ filterNumber(scope.row.nocount) }}
            </div>
          </template>
          <template #nosl="scope">
            <div :class="[scope.row.nosl > 0 && 'colorRed']">
              {{ filterNumber(scope.row.nosl, '%') }}
            </div>
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
          <template #rateavg="scope">
            <div>{{ filterNumber(scope.row.rateavg, '%') }}</div>
          </template>
          <template #restime="scope">
            <div>{{ filterNumber(scope.row.restime, '秒') }}</div>
          </template>
          <template #instructionDifference="scope">
            <div>
              {{ filterNumber(scope.row.instructionDifference) }} /
              {{ filterNumber(scope.row.cap, '%') }}
            </div>
          </template>
          <template #isres="scope">
            <div :class="[scope.row.isres != 1 && 'colorRed']">
              {{ scope.row.isres == 1 ? '合格' : scope.row.isres == 0 ? '不合格' : '状态异常' }}
            </div>
          </template>
          <template #resreason="scope">
            <div :class="[scope.row.isres != 1 && 'colorRed']">
              {{ scope.row.resreason || '--' }}
            </div>
          </template>
          <template #operate2="scope">
            <div @click="handelItem2(scope.$index, scope.row)" class="colorRed">查看曲线</div>
          </template>
        </table-view>

        <div class="tableDialog">
          <el-dialog
            v-model="dialogVisible"
            title="AGC执行曲线"
            center
            width="1000px"
            @open="open"
            draggable
          >
            <div class="stateModal">
              <div>
                <p>状态：</p>
                <p class="text" v-if="modalLineChartData.row.isres == 1">合格</p>
                <p class="text" v-else-if="modalLineChartData.row.isres == 0">不合格</p>
                <p class="text" v-else>状态异常</p>
              </div>
              <div v-show="modalLineChartData.row?.isres != 1">
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
                      <td class="td">AGC指令下发时刻</td>
                      <td class="td">{{ modalLineChartData.row?.agcsttime || '--' }}</td>
                    </tr>
                    <tr>
                      <td class="td">AGC调节指令</td>
                      <td class="td">{{ filterNumber(modalLineChartData.row?.agcins) }}</td>
                    </tr>
                    <tr>
                      <td class="td">指令下发时刻有功</td>
                      <td class="td">{{ filterNumber(modalLineChartData.row?.pst) }}</td>
                    </tr>
                    <tr>
                      <td class="td">指令差/装机占比</td>
                      <td class="td">
                        {{ filterNumber(modalLineChartData.row?.instructionDifference) }}/{{
                          filterNumber(modalLineChartData.row?.cap, '%')
                        }}
                      </td>
                    </tr>
                    <tr>
                      <td class="td">响应时间</td>
                      <td class="td">{{ filterNumber(modalLineChartData.row?.restime, '秒') }}</td>
                    </tr>
                    <tr>
                      <td class="td">响应开始时刻</td>
                      <td class="td">{{ modalLineChartData.row?.ressttime || '--' }}</td>
                    </tr>
                    <tr>
                      <td class="td">响应开始时刻有功</td>
                      <td class="td">{{ filterNumber(modalLineChartData.row?.presst) }}</td>
                    </tr>
                    <tr>
                      <td class="td">AGC指令结束时刻</td>
                      <td class="td">{{ modalLineChartData.row?.agcendtime || '--' }}</td>
                    </tr>
                    <tr>
                      <td class="td">指令结束时刻有功</td>
                      <td class="td">{{ filterNumber(modalLineChartData.row?.pend) }}</td>
                    </tr>
                    <tr>
                      <td class="td">10%有功</td>
                      <td class="td">{{ filterNumber(modalLineChartData.row?.p10agctime) }}</td>
                    </tr>
                    <tr>
                      <td class="td">10%有功时刻</td>
                      <td class="td">{{ modalLineChartData.row?.agctime10 || '--' }}</td>
                    </tr>
                    <tr>
                      <td class="td">90%有功</td>
                      <td class="td">{{ filterNumber(modalLineChartData.row?.p90agctime) }}</td>
                    </tr>
                    <tr>
                      <td class="td">90%有功时刻</td>
                      <td class="td">{{ modalLineChartData.row?.agctime90 || '--' }}</td>
                    </tr>
                    <tr>
                      <td class="td">最大有功</td>
                      <td class="td">{{ filterNumber(modalLineChartData.row?.pmax) }}</td>
                    </tr>
                    <tr>
                      <td class="td">最大有功时刻</td>
                      <td class="td">{{ modalLineChartData.row?.pmaxtime || '--' }}</td>
                    </tr>
                    <tr>
                      <td class="td">最小有功</td>
                      <td class="td">{{ filterNumber(modalLineChartData.row?.pmin) }}</td>
                    </tr>
                    <tr>
                      <td class="td">最小有功时刻</td>
                      <td class="td">{{ modalLineChartData.row?.pmintime || '--' }}</td>
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
.agcAdjustRateExamCommonRule {
  height: fit-content;
  :deep(.el-select) {
    width: 200px;
  }
  .colorRed {
    color: var(--colorRed);
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
                margin: 0 10px 0 10px;
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
        &.tableFit {
          width: clamp(1000px, 80%, 1200px);
        }
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
