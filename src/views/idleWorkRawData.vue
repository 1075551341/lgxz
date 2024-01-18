<!--
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2023-12-27 16:03:51
 * @Description: 有偿无功补偿--无功原始数据
-->
<script setup>
import * as echarts from 'echarts'
import { valMaxMinFix, filterNumber, dateEndWith } from '../common/prefix.js'

onMounted(() => {
  drawLine()
  queryListFn() //获取机组下拉框数据
})

const todayValue = formateDate(new Date())
// 切换机组初始化
const initFn = () => {
  dateValue.value = [hourBeforeToday(1), todayValue]
  startTime.value = hourBeforeToday(1)
  endTime.value = todayValue
  repeatInit()
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
    repeatInit()
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
  repeatInit()
}

// 切换下拉框处理
const repeatInit = () => {
  getRequestFn() // 表格
  getLineChartRequestFn() // 折线图
}

// 获取折线图数据
let lineChartData = reactive({
  value: { dataTime: [], p: [], wp: [], factor: [], papparent: [] }
})
const getLineChartRequestFn = () => {
  axiosRequest('/glbecoPhyunitPowerEntity/queryImplementCurve', {
    phyUnitId: selectListId.value,
    beginDate: startTime.value,
    endDate: endTime.value
  }).then((res) => {
    if (res && res.code == 200) {
      lineChartData.value = {
        dataTime: sortDate(res.data.dataTime),
        p: res.data.p,
        wp: res.data.wp,
        factor: res.data.factor,
        papparent: res.data.papparent
      }
      nextTick(() => {
        drawLine()
      })
    }
    // console.log('queryDayAndMonthChartFn::: ', lineChartData)
  })
}

// 折线图
let drawLine = () => {
  let chartDom = document.getElementById('chart')
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
      position: ['100%', '10%'],
      formatter: function (params) {
        return `
        <div style="margin:10px 10px;width:160px;">
            <div style="padding:0 0 10px;">
              <div style="padding:5px 0;">时间: <span>${
                params[0]?.axisValue || params[1]?.axisValue || params[2]?.axisValue
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
              <div  style="display:${params[2] ? 'block' : 'none'}">
                <div style="display:inline-block;width:10px;height:10px;border-radius:10px;background-color:${
                  params[2]?.color
                };"></div>
              ${params[2]?.seriesName}:<span style="color:${params[2]?.color};">${
                params[2]?.value
              }</span>
              </div>

            </div>
        </div> `
      }
    },
    legend: {
      data: ['有功功率', '视在功率', '无功功率']
    },
    grid: {
      left: '7%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,

      data: lineChartData.value?.dataTime || [],
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        // name: '兆瓦/MW',
        position: 'left',
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
      {
        type: 'value',
        position: 'left',
        offset: 50,
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
      {
        type: 'value',
        //alignTicks: true, // ！！配置多坐标轴标签对齐
        name: 'MVar',
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
      }
    ],
    series: [
      {
        name: '有功功率',
        // position: [10, 10],
        showSymbol: false,
        type: 'line',
        yAxisIndex: 0, //指定需要使用的Y轴
        // data: [30.7817, 30.8101, 30.8669, 30.8669]
        data: lineChartData.value?.p || []
      },
      {
        name: '视在功率',
        // position: [10, 10],
        showSymbol: false,
        type: 'line',
        yAxisIndex: 1, //指定需要使用的Y轴
        // data: [20, 30, 13, 11, 12, 42, 29],
        data: lineChartData.value?.papparent || []
      },
      {
        name: '无功功率',
        // position: [10, 10],
        showSymbol: false,
        type: 'line',
        yAxisIndex: 2, //指定需要使用的Y轴
        // data: [20, 30, 13, 11, 12, 42, 29],
        data: lineChartData.value?.wp || []
      }
      // {
      //   name: '功率因数',
      //   // position: [10, 10],
      //   showSymbol: false,
      //   type: 'line',
      //   yAxisIndex: 1, //指定需要使用的Y轴
      //   // data: [20, 30, 13, 11, 12, 42, 29],
      //   data: lineChartData.value?.factor || []
      // }
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
  value: {
    tableStyle: {
      height: '440'
    },
    pagesizeConfig: { current: 1, size: 10, total: 0 }
  }
})
// 设置表格1头部及数据格式
let tableData1 = reactive({
  column: [
    { label: '时间戳', field: 'dataTime' },
    { label: '有功功率', field: 'p' },
    { label: '无功功率', field: 'wp' },
    { label: '功率因数', field: 'factor' },
    { label: '视在功率', field: 'papparent' }
  ],
  data: []
})

// 获取表格数据
const getRequestFn = () => {
  axiosRequest('/glbecoPhyunitPowerEntity/queryPage', {
    phyUnitId: selectListId.value,
    beginDate: startTime.value,
    endDate: endTime.value,
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

// 表格1切換頁碼
const handelCurrentChange1 = (val) => {
  tableAndPaginationConfig1.value.pagesizeConfig.current = val
  getRequestFn()
  //
}
</script>

<template>
  <div class="idleWorkRawData">
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
      </div>
      <!-- <div class="topRight">
        <text><i>死区范围：</i>装机容量 * 3% = 6MW</text>
      </div> -->
    </div>
    <div id="topsContent">
      <div class="topsContent">
        <div class="charts">
          <div id="chart" class="chartItem"></div>
        </div>
        <div id="tables">
          <table-view
            :table-data="tableData1"
            :config="tableAndPaginationConfig1"
            @currentChange="handelCurrentChange1"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.idleWorkRawData {
  height: fit-content;
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
      #tables {
        width: clamp(1000px, 80%, 1200px);
      }
      .chartItem {
        width: 1200px;
        height: 400px;
      }
    }
  }
}
</style>
