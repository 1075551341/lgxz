<!--
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2023-12-27 13:37:21
 * @Description: 功率预测考核--短期功率预测
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
  queryMonthStatisticsFn() //月统计数据
  getRequestFn() //获取表格1日/月数据(同一接口)
  queryMonthChartFn() //月柱状图
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
let lineChartVisible = ref(false)
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
  axiosRequest('/glbecoPhyunitDqglycDayEntity/queryStatistics', {
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
  axiosRequest('/glbecoPhyunitDqglycDayEntity/queryMonthStatistics', {
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
  axiosRequest('/glbecoPhyunitDqglycDayMonthlyEntity/queryStatistics', {
    phyUnitId: selectListId.value,
    date: pickerDate.value
  }).then((res) => {
    if (res && res.code == 200) {
      staticData.data = res.data
    }
  })
}

// 获取实时曲线(限电曲线)折线图
let lineChartData = reactive({
  value: { dataTime: [], isxd: [] }
})
const getLineChartFn = () => {
  axiosRequest('/glbecoPhyunitDqglycRnEntity/queryCurve', {
    phyUnitId: selectListId.value,
    date: pickerDate.value
  }).then((res) => {
    if (res && res.code == 200) {
      lineChartData.value = {
        dataTime: sortDate(res.data.dataTime),
        isxd: res.data.isxd
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
    // title: {
    //   text: '实时曲线(AVC+负荷)',
    //   textStyle: {
    //     fontWeight: 'normal'
    //   },
    //   padding: [0, 0, 20, 20]
    // },
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
    // legend: {
    //   data: ['日限电']
    // },
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
      invisible: lineChartData.value.isxd.length > 0, // 有数据就隐藏
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
      name: '小时',
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
        name: '日限电',
        // position: [10, 10],
        showSymbol: false,
        type: 'line',
        // data: [30.7817, 30.8101, 30.8669, 30.8669]
        data: lineChartData.value.isxd || []
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
let barChartData = reactive({ data: { dataTime: [], limitime: [] } })
const queryMonthChartFn = () => {
  axiosRequest('/glbecoPhyunitDqglycDayEntity/queryPassRateBarChart', {
    phyUnitId: selectListId.value,
    date: pickerDate.value
  }).then((res) => {
    if (res && res.code == 200) {
      barChartData.data = {
        dataTime: sortDate(res.data.dataTime), //横坐标
        limitime: res.data.limitime //合格率
      }
      nextTick(() => {
        drawBar()
      })
    }
  })
}

// 获取年柱状图数据
const queryYearBarChartFn = () => {
  axiosRequest('/glbecoPhyunitDqglycDayMonthlyEntity/queryPassRateBarChart', {
    phyUnitId: selectListId.value,
    date: pickerDate.value
  }).then((res) => {
    if (res && res.code == 200) {
      barChartData.data = {
        dataTime: sortDate(res.data.dataTime), //横坐标
        limitime: res.data.limitime //合格率
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
  if (chartDom.getAttribute('_echarts_instance_')) {
    chartDom.setAttribute('_echarts_instance_', '')
  }
  let myChart = echarts.init(chartDom)
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
      left: '6%',
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
      invisible: barChartData.data.limitime.length > 0, // 有数据就隐藏
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
      name: '日/月限电时长',
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
        data: barChartData.data.limitime || []
      }
    ]
  }
  // 绘制图表
  option && myChart.setOption(option, true)
  // echarts 自适应
  window.addEventListener('resize', () => {
    myChart.resize()
  })

  myChart.on('click', function (event) {
    console.log('event::: ', event)
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
    { label: '总考核电量', field: 'sumvalue' },
    { label: '考核分数', field: 'sum' },
    { label: 'D-1考核电量(0.6)', field: 'd1value' },
    { label: 'D-2考核电量(0.3)', field: 'd2value' },
    { label: 'D-3考核电量(0.1)', field: 'd3value' },
    { label: '限电时长', field: 'limitime', slotName: 'limitime' },
    { label: '操作', slotName: 'operate1' }
  ],
  data: []
})

// 获取表格1 日/月数据
const getRequestFn = () => {
  axiosRequest('/glbecoPhyunitDqglycDayEntity/queryPage', {
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
  axiosRequest('/glbecoPhyunitDqglycDayMonthlyEntity/queryPage', {
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
}

// 设置表格2头部及数据格式
let tableData2 = reactive({
  column: [
    { label: '时间点', field: 'dataTime' },
    { label: '是否限电', field: 'isxd', slotName: 'isxd' },
    { label: '总考核电量', field: 'sum' },
    { label: '实际有功', field: 'p' },
    { label: 'D-1预测', field: 'd1' },
    { label: '误差值', field: 'DeviationD1' },
    { label: '考核电量(0.6)', field: 'khd1' },
    { label: 'D-2预测', field: 'd2' },
    { label: '误差值', field: 'DeviationD2' },
    { label: '考核电量(0.3)', field: 'khd2' },
    { label: 'D-3预测', field: 'd3' },
    { label: '误差值', field: 'DeviationD3' },
    { label: '考核电量(0.1)', field: 'khd3' }
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
  axiosRequest('/glbecoPhyunitDqglycRnEntity/queryPage', {
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
  <div class="shortPowerPrediction">
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
                <img src="../assets/img/ico_battery.png" />
              </div>
              <div>
                <p>累计考核电量</p>
                <p>
                  <span>{{ staticData.data?.sumvalue || 0 }} </span>万千瓦时
                </p>
              </div>
            </div>
            <div class="under">
              <div class="underLine">
                <p>
                  同比<i>&nbsp;</i><span>{{ staticData.data?.sumvalueTb || 0 }}</span>
                </p>
                <p>
                  <i>&nbsp;</i>环比<span>{{ staticData.data?.sumvalueHb || 0 }}</span>
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
                <p>考核分数</p>
                <p>
                  <span>{{ staticData.data?.sum || 0 }}</span
                  >分
                </p>
              </div>
            </div>
            <div class="under">
              <div class="underLine">
                <p>
                  同比<i>&nbsp;</i><span>{{ staticData.data?.sumTb || 0 }}</span> %
                </p>
                <p>
                  <i>&nbsp;</i>环比<span>{{ staticData.data?.sumHb || 0 }}</span> %
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
                <p>限电时长</p>
                <p>
                  <span>{{ filterNumber(staticData.data?.limitime) }}</span> 小时
                </p>
              </div>
            </div>
            <div class="under">
              <div class="underLine">
                <p>
                  同比<i>&nbsp;</i><span>{{ staticData.data?.limitimeTb || 0 }}</span> %
                </p>
                <p>
                  <i>&nbsp;</i>环比<span>{{ staticData.data?.limitimeHb || 0 }}</span> %
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="charts">
          <div id="chartLine" v-show="lineChartVisible" class="chartItem"></div>
          <div id="chartBar" v-show="chartVisible" class="chartItem"></div>
        </div>
        <table-view
          class="tableView"
          :table-data="tableData1"
          :config="tableAndPaginationConfig1"
          @command="handelItem1"
          @currentChange="handelCurrentChange1"
        >
          <template #limitime="scope">
            <div>{{ filterNumber(scope.row.limitime, '小时') }}</div>
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
          <template #isxd="scope">
            <div :class="[scope.row.isxd != 1 && 'colorRed']">
              {{ scope.row.isxd == 1 ? '是' : scope.row.isxd == 0 ? '否' : '状态异常' }}
            </div>
          </template>
        </table-view>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.shortPowerPrediction {
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
                margin: 0 30px 0 30px;
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
      }
      .charts {
        .chartItem {
          width: 1000px;
          height: var(--height-300);
        }
      }
      .tableView {
        width: 100%;
      }
      .tableDialog {
        .stateModal {
          div {
            display: flex;
            justify-content: flex-end;
            padding-right: 30px;
          }
        }
      }
    }
  }
}
</style>
