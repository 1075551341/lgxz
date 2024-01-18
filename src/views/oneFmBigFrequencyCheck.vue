<!--
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-10 15:58:35
 * @Description: 一次调频考核--大频差扰动考核
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
  drawBar()
  queryListFn() //获取机组下拉框数据
})

// 切换机组初始化
const initFn = () => {
  buttonMSg.type = 2
  dateValue.value = todayValue
  pickerDate.value = todayValue
  chartVisible.value = true
  queryMonthChartFn() //获取月柱状图
  queryMonthStatisticsFn() //月统计数据
  getRequestFn() //获取表格1日/月数据(同一接口)
}

// 获取机组下拉框数据
let selectListId = ref(0)
let hostMsg = reactive({}) // 配置项信息
let selectValue = ref('')
let selectOptions = reactive({ data: {} })
const queryListFn = () => {
  axiosRequest('/api/commonDictEntity/queryList').then((res) => {
    if (res && res.code == 200) {
      selectOptions.data = res.data
      selectListId.value = res.data[0].id //默认机组id
      selectValue.value = res.data[0].caption //默认机组展示内容
      hostMsg.value = res.data[0]?.maxCap //默认装机容量
      initFn()
    }
  })
}
// 切换机组
const changeListFn = (id, val) => {
  if (val) {
    selectListId.value = val.id
    selectValue.value = val.caption
    hostMsg.value = val?.maxCap
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
    // 获取年柱状图数据
    queryYearBarChartFn()
    chartVisible.value = true
    // 获取表格1 年数据
    getYearRequestFn()
    return
  }
  // 获取表格1 日/月数据(同一接口)
  getRequestFn()
  if (val == 1) {
    chartVisible.value = false
    // 获取日统计数据
    queryDayStatisticsFn()
    //获取表格2数据
    getQueryPageRequestFn()
  }

  //获取月柱状图
  if (val === 2) {
    // 获取月统计数据
    queryMonthStatisticsFn()
    // 显示月柱状图
    queryMonthChartFn()
    chartVisible.value = true
  }
}

// 获取日统计数据
let staticData = reactive({ data: {} })
const queryDayStatisticsFn = () => {
  axiosRequest('/glbecoPhyunitFreDayEntity/queryStatistics', {
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
  axiosRequest('/glbecoPhyunitFreDayEntity/queryMonthStatistics', {
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
  axiosRequest('/glbecoPhyunitFreMonthlyEntity/queryStatistics', {
    phyUnitId: selectListId.value,
    date: pickerDate.value
  }).then((res) => {
    if (res && res.code == 200) {
      staticData.data = res.data
    }
  })
}

// 获取月柱状图
let barChartData = reactive({ data: { dataTime: [], avgyield: [] } })
const queryMonthChartFn = () => {
  axiosRequest('/glbecoPhyunitFreDayEntity/queryPassRateBarChart', {
    phyUnitId: selectListId.value,
    date: pickerDate.value
  }).then((res) => {
    if (res && res.code == 200) {
      barChartData.data = {
        dataTime: sortDate(res.data.dataTime), //横坐标
        avgyield: res.data.avgyield //合格率
      }
      nextTick(() => {
        drawBar()
      })
    }
  })
}

// 获取年柱状图数据
const queryYearBarChartFn = () => {
  axiosRequest('/glbecoPhyunitFreMonthlyEntity/queryPassRateBarChart', {
    phyUnitId: selectListId.value,
    date: pickerDate.value
  }).then((res) => {
    if (res && res.code == 200) {
      barChartData.data = {
        dataTime: sortDate(res.data.dataTime), //横坐标
        avgyield: res.data.avgyield //合格率
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
      invisible: barChartData.data.avgyield.length > 0, // 有数据就隐藏
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
          symbolSize: [5, 15], // 轴线两端箭头大小，数值一表示宽度，数值二表示高度
          lineStyle: {
            color: '#999'
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
        data: barChartData.data.avgyield || []
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
    { label: '大频差扰动考核分数', field: 'islargevalue' },
    { label: '大频差不合格次数', field: 'islargecount', slotname: 'islargecount' },
    { label: '大频差扰动总数', field: 'maxcount' },
    { label: '操作', slotName: 'operate1' }
  ],
  data: []
})
// 获取表格1 日/月数据
const getRequestFn = () => {
  axiosRequest('/glbecoPhyunitFreDayEntity/queryPage', {
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
  axiosRequest('/glbecoPhyunitFreMonthlyEntity/queryPage', {
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
    // pickerDate.value = row.dataTime.substr(0, 7)
    // 获取type为日时的数据
    queryDayStatisticsFn() //日统计数据
    getQueryPageRequestFn() //获取表格2数据
    chartVisible.value = false
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
    { label: '扰动开始时刻', field: 'fctsttime' },
    { label: '频率极值', field: 'fmax' },
    { label: '频率极值时刻', field: 'fmaxtime' },
    { label: '开始时刻有功', field: 'pfctst' },
    { label: '扰动结束时刻', field: 'fctendtime' },
    { label: '扰动结束时刻有功', field: 'pfctend' },
    { label: '贡献电量合格率', field: 'pvalue', slotname: 'pvalue' },
    { label: '出力响应合格率', field: 'llvalue', slotname: 'llvalue' },
    { label: '是否合格', field: 'stat', slotName: 'stat' },
    { label: '不合格原因', field: 'novalue', slotName: 'novalue', width: 200 },
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
  axiosRequest('/glbecoPhyunitFreEntity/queryPage', {
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

// 表格2弹框显示折线图
let modalLineChartData = reactive({ row: {}, value: {} }) //保存行数据和折线图数据
const getLineChartRequestFn = () => {
  axiosRequest('/glbecoPhyunitFreEntity/queryImplementCurve', {
    phyUnitId: selectListId.value,
    date: pickerDate.value,
    beginDate: modalLineChartData.row.fctsttime,
    endDate: modalLineChartData.row.fctendtime
  }).then((res) => {
    if (res && res.code == 200) {
      modalLineChartData.value = res.data
    }
  })
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
      position: ['100%', '-20%'],
      formatter: function (params) {
        tooltipData1.val = params[0]
        tooltipData2.val = params[1]
        tooltipData3.val = params[2]
      }
    },
    legend: {
      data: ['有功曲线', '理论有功曲线', '频率曲线']
    },
    grid: {
      // top: '5%',
      left: '5%',
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
        name: '兆瓦/MW',
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
        alignTicks: true, // ！！配置多坐标轴标签对齐
        name: '赫兹/Hz',
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
        name: '有功曲线',
        // position: [10, 10],
        showSymbol: false,
        type: 'line',
        yAxisIndex: 0, //指定需要使用的Y轴
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
        data: modalLineChartData.value.power || []
      },
      {
        name: '理论有功曲线',
        // position: [10, 10],
        showSymbol: false,
        type: 'line',
        yAxisIndex: 0, //指定需要使用的Y轴
        // data: [20, 30, 13, 11, 12, 42, 29],
        data: modalLineChartData.value.theoryPower || []
      },
      {
        name: '频率曲线',
        // position: [10, 10],
        showSymbol: false,
        type: 'line',
        yAxisIndex: 1, //指定需要使用的Y轴
        // data: [20, 30, 13, 11, 12, 42, 29],
        data: modalLineChartData.value.frequency || []
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
  <div class="oneFmBigFrequencyCheck">
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
        <text><i>死区范围：</i>{{ hostMsg.value }} * 3% = {{ hostMsg.value * 0.03 }}MW</text>
      </div>
    </div>
    <div id="topsContent">
      <div class="topsContent">
        <div class="topsBlow">
          <div class="avatar">
            <div class="topAvatar">
              <div class="blow">
                <div>
                  <img src="../assets/img/ico_parameter.png" />
                </div>
                <div>
                  <p>考核分数</p>
                  <p>
                    <span>{{
                      filterNumber(staticData.data?.islargevalue) || (buttonMSg.type == 1 ? '-' : 0)
                    }}</span>
                    分
                  </p>
                </div>
              </div>
              <div class="under">
                <div class="underLine">
                  <p>
                    不合格<i>&nbsp;</i
                    ><span>{{ filterNumber(staticData.data?.islargecount) }}</span>
                  </p>
                  <p>
                    <i>&nbsp;</i>总数<span>{{ filterNumber(staticData.data?.maxcount) }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="charts">
            <div id="chartBar" v-show="chartVisible" class="chartItem"></div>
          </div>
        </div>
        <table-view
          class="tableView"
          :table-data="tableData1"
          :config="tableAndPaginationConfig1"
          @currentChange="handelCurrentChange1"
        >
          <template #islargecount="scope">
            <div :class="[scope.row.islargecount > 0 && 'colorRed']">
              {{ filterNumber(scope.row.islargecount) }}
            </div>
          </template>
          <template #operate1="scope">
            <div @click="handelItem1(scope.$index, scope.row)" v-debounce class="colorRed">
              查看
            </div>
          </template>
        </table-view>

        <table-view
          v-show="buttonMSg.type == 1"
          :table-data="tableData2"
          :config="tableAndPaginationConfig2"
          @currentChange="handelCurrentChange2"
        >
          <template #pvalue="scope">
            <div>{{ filterNumber(scope.row.pvalue, '%') }}</div>
          </template>
          <template #llvalue="scope">
            <div>{{ filterNumber(scope.row.llvalue, '%') }}</div>
          </template>
          <template #stat="scope">
            <div :class="[scope.row.stat != 1 && 'colorRed']">
              {{ scope.row.stat == 1 ? '合格' : scope.row.stat == 0 ? '不合格' : '状态异常' }}
            </div>
          </template>
          <template #novalue="scope">
            <div :class="[scope.row.stat != 1 && 'colorRed']">{{ scope.row.novalue || '--' }}</div>
          </template>
          <template #operate2="scope">
            <div @click="handelItem2(scope.$index, scope.row)" class="colorRed">查看曲线</div>
          </template>
        </table-view>
        <div class="tableDialog">
          <el-dialog
            v-model="dialogVisible"
            title="一次调频性能曲线"
            width="1300px"
            @open="open"
            center
            draggable
          >
            <div class="stateModal">
              <div>
                <p>状态：</p>
                <p class="text" v-if="modalLineChartData.row.stat == 1">合格</p>
                <p class="text" v-else-if="modalLineChartData.row.stat == 0">不合格</p>
                <p class="text" v-else>状态异常</p>
              </div>
              <div v-show="modalLineChartData.row?.stat != 1">
                <p>不合格原因：</p>
                <p class="text">{{ modalLineChartData.row?.novalue || '--' }}</p>
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
                ><br />
                <div class="radius" :style="tooltipData2.val?.color"></div>
                <span
                  :style="{ color: tooltipData2.val?.color }"
                  v-show="tooltipData2.val?.seriesName"
                  >{{ tooltipData2.val?.seriesName }}: </span
                ><span>{{ tooltipData2.val?.value }}</span
                ><br />
                <div class="radius" :style="tooltipData3.val?.color"></div>
                <span
                  :style="{ color: tooltipData3.val?.color }"
                  v-show="tooltipData3.val?.seriesName"
                  >{{ tooltipData3.val?.seriesName }}: </span
                ><span>{{ tooltipData3.val?.value.toFixed(2) }}</span>
                <div class="tableBw">
                  <table>
                    <thead>
                      <tr>
                        <th class="th">机场名称/场站名称</th>
                        <th class="th">值</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="td">扰动开始时刻</td>
                        <td class="td">{{ modalLineChartData.row?.fctsttime || '--' }}</td>
                      </tr>
                      <tr>
                        <td class="td">扰动开始时刻频率</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.ffctst) }}</td>
                      </tr>
                      <tr>
                        <td class="td">扰动开始时刻有功</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.pfctst) }}</td>
                      </tr>
                      <tr>
                        <td class="td">扰动结束时刻</td>
                        <td class="td">{{ modalLineChartData.row?.fctendtime || '--' }}</td>
                      </tr>
                      <tr>
                        <td class="td">扰动结束时刻频率</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.ffctend) }}</td>
                      </tr>
                      <tr>
                        <td class="td">扰动结束时刻有功</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.pfctend) }}</td>
                      </tr>
                      <tr>
                        <td class="td">前15秒理论积分电量</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.th15) }}</td>
                      </tr>
                      <tr>
                        <td class="td">前30秒理论积分电量</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.th30) }}</td>
                      </tr>
                      <tr>
                        <td class="td">前45秒理论积分电量</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.th45) }}</td>
                      </tr>
                      <tr>
                        <td class="td">前60秒理论积分电量</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.th60) }}</td>
                      </tr>
                      <tr>
                        <td class="td">本次扰动理论积分电量</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.th) }}</td>
                      </tr>
                      <tr>
                        <td class="td">前15秒理论实际贡献电量</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.rea15) }}</td>
                      </tr>
                      <tr>
                        <td class="td">前30秒理论实际贡献电量</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.rea30) }}</td>
                      </tr>
                      <tr>
                        <td class="td">前45秒理论实际贡献电量</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.rea45) }}</td>
                      </tr>
                      <tr>
                        <td class="td">前60秒理论实际贡献电量</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.rea60) }}</td>
                      </tr>
                      <tr>
                        <td class="td">理论贡献电量</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.llvalue) }}</td>
                      </tr>
                      <tr>
                        <td class="td">频率极值</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.fmax) }}</td>
                      </tr>
                      <tr>
                        <td class="td">频率极值时刻</td>
                        <td class="td">{{ modalLineChartData.row?.fmaxtime || '--' }}</td>
                      </tr>
                      <tr>
                        <td class="td">理论最大出力调整量</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.pthmax) }}</td>
                      </tr>
                      <tr>
                        <td class="td">实际最大出力调整量</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.preamax) }}</td>
                      </tr>
                      <tr>
                        <td class="td">实际最大出力调整时刻</td>
                        <td class="td">{{ modalLineChartData.row?.preamaxtime || '--' }}</td>
                      </tr>
                      <tr>
                        <td class="td">前15秒频率极值</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.f15max) }}</td>
                      </tr>
                      <tr>
                        <td class="td">前15秒频率极值时刻</td>
                        <td class="td">{{ modalLineChartData.row?.f15maxtime || '--' }}</td>
                      </tr>
                      <tr>
                        <td class="td">是否大频差扰动</td>
                        <td class="td" :class="[modalLineChartData.row.islarge != 1 && 'colorRed']">
                          {{
                            modalLineChartData.row?.islarge == 1
                              ? '是'
                              : modalLineChartData.row?.islarge == 0
                                ? '否'
                                : '状态异常'
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td class="td">出力响应合格率</td>
                        <td class="td">
                          {{ filterNumber(modalLineChartData.row?.planvalue, '%') }}
                        </td>
                      </tr>
                      <tr>
                        <td class="td">贡献电量合格率</td>
                        <td class="td">
                          {{ filterNumber(modalLineChartData.row?.powervalue, '%') }}
                        </td>
                      </tr>
                      <tr>
                        <td class="td">平均动作合格率</td>
                        <td class="td">{{ filterNumber(modalLineChartData.row?.avgrage, '%') }}</td>
                      </tr>
                      <tr>
                        <td class="td">是否合格</td>
                        <td class="td" :class="[modalLineChartData.row.stat != 1 && 'colorRed']">
                          {{
                            modalLineChartData.row?.stat == 1
                              ? '是'
                              : modalLineChartData.row?.stat == 0
                                ? '否'
                                : '状态异常'
                          }}
                        </td>
                      </tr>
                      <tr v-show="modalLineChartData.row?.stat != 1">
                        <td class="td">不合格原因</td>
                        <td class="td" :class="[modalLineChartData.row.stat != 1 && 'colorRed']">
                          {{ modalLineChartData.row?.novalue || '--' }}
                        </td>
                      </tr>
                      <tr>
                        <td class="td">动作合格率考核分数</td>
                        <td class="td">
                          {{ filterNumber(modalLineChartData.row?.khvalue) }}
                        </td>
                      </tr>
                      <tr>
                        <td class="td">是否过调节</td>
                        <td class="td" :class="[modalLineChartData.row.istj != 1 && 'colorRed']">
                          {{
                            modalLineChartData.row?.istj == 1
                              ? '是'
                              : modalLineChartData.row?.istj == 0
                                ? '否'
                                : '状态异常'
                          }}
                        </td>
                      </tr>
                      <tr v-show="modalLineChartData.row?.istj == 1">
                        <td class="td">过调节考核分数</td>
                        <td class="td">
                          {{ filterNumber(modalLineChartData.row?.gtjkhvalue) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </el-dialog>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.oneFmBigFrequencyCheck {
  height: fit-content;
  .colorRed {
    color: var(--colorRed);
  }
  :deep(.el-select) {
    width: 200px;
  }
  .el-table--scrollable-y .el-table__body-wrapper {
    overflow-y: auto;
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
        margin: 0 15px;
        line-height: 20px;
      }
      .topsDatePicker {
        .block > span {
          margin: 0 5px;
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
      .topsBlow {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        .avatar {
          display: flex;
          align-items: center;
          justify-content: space-between;
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
            // &:nth-child(4) {
            //   margin: 0 0 10px 10px;
            // }
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
                    margin-left: 10px;
                  }
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
            margin-top: -30px;
            .radius {
              display: inline-block;
              width: 10px;
              height: 10px;
              border-radius: 10px;
            }
            .tableBw {
              height: 600px;
              overflow-y: auto;
              padding-right: 10px;
              table {
                border-collapse: collapse;
                margin-top: 10px;
                width: 100%;
                color: #333;

                thead {
                  background: var(--backgrounde5);
                  th {
                    border: 1px solid #ebeef5;
                    padding: 8px 2px 8px 10px;
                    box-sizing: border-box;
                  }
                }
                tbody {
                  height: 100%;
                  // overflow-y: auto;
                  td {
                    border: 1px solid #ebeef5;
                    padding: 5px 2px 5px 10px;
                    box-sizing: border-box;
                    width: fit-content;
                    min-width: 150px;
                  }
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
