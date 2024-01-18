<!--
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-10 16:00:57
 * @Description: 嵌套路由--首页(新能源)
-->
<script setup>
import * as echarts from 'echarts'
import { valMaxMinFix, filterNumber, dateEndWith } from '../common/prefix.js'

onMounted(() => {
  queryListFn() //获取机组下拉框数据
})
let todayValue = formateTime(new Date()).substring(0, 7)
const initFn = () => {
  getLineChartFn() //实时曲线折线图
  getPerturbedFn() //扰动折线图
  drawLine()
  perturbedLineChart()
  queryStatisticsFn() //统计数据
  getRequestFn() //获取表格1日/月数据(同一接口)
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
    initFn()
  }
}

const systemMsg = [
  { id: 1, title: '9月6日，最大有功超出死区范围' },
  { id: 2, title: '9月15日，超出最大偏差' },
  { id: 3, title: '9月23日，最小有功超出死区范围' }
]

// 获取统计数据
let staticData = reactive({ data: {} })
const queryStatisticsFn = () => {
  axiosRequest('/glbecoPhyunitRegulationspeeddayEntity/queryMonthStatistics', {
    phyUnitId: selectListId.value,
    date: todayValue
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
    date: todayValue
  }).then((res) => {
    if (res && res.code == 200) {
      lineChartData.value = {
        dataTime: sortDate(res.data.dataTime),
        agcins: res.data.agcins,
        pst: res.data.pst
      }
      drawLine()
    }
  })
}

// 实时曲线折线图
const drawLine = () => {
  let chartDom = document.getElementById('chart1')
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
      position: ['100%', '-30%'],
      formatter: function (params) {
        // let res = lineChartData
        // console.log('params::: ', params, res.seriesName, res.value)
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

// 扰动折线图
let perturbedLineChartData = reactive({
  value: { dataTime: [], agcins: [], pst: [] }
})
const getPerturbedFn = () => {
  axiosRequest('/glbecoPhyunitAgcTimevalueEntity/queryRealTimeCurve', {
    phyUnitId: selectListId.value,
    date: todayValue
  }).then((res) => {
    if (res && res.code == 200) {
      perturbedLineChartData.value = {
        dataTime: sortDate(res.data.dataTime),
        agcins: res.data.agcins,
        pst: res.data.pst
      }
      perturbedLineChart()
    }
    // console.log('getPerturbedFn::: ', res.data, lineChartData)
  })
}
// 扰动折线图
const perturbedLineChart = () => {
  let chartDom = document.getElementById('chart2')
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
      text: '功率预测偏差',
      textStyle: {
        fontWeight: 'normal'
      },
      padding: [0, 0, 20, 20]
    },
    tooltip: {
      trigger: 'axis',
      position: ['100%', '-30%'],
      formatter: function (params) {
        // let res = lineChartData
        // console.log('params::: ', params, res.seriesName, res.value)
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
    //   data: ['AGC指令', '负荷']
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
      invisible:
        perturbedLineChartData.value?.agcins.length || perturbedLineChartData.value?.pst.length > 0, // 有数据就隐藏
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
      data: perturbedLineChartData.value?.dataTime || []
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
        data: perturbedLineChartData.value?.agcins || []
      },
      {
        name: '负荷',
        // position: [10, 10],
        showSymbol: false,
        type: 'line',
        // yAxisIndex: 1, //指定需要使用的Y轴
        // data: [20, 30, 13, 11, 12, 42, 29],
        data: perturbedLineChartData.value?.pst || []
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

// 表格1table和分頁配置
let tableAndPaginationConfig1 = reactive({
  value: {
    tableStyle: {
      height: 440
    },
    pagesizeConfig: { current: 1, size: 10, total: 0 }
  }
})
// 设置表格1头部及数据格式
let tableData1 = reactive({
  column: [
    { label: '起止时间', field: 'dataTime' },
    { label: '告警内容', field: 'avg' },
    { label: '操作', slotName: 'operate1' }
  ],
  data: []
})

// 获取表格1 日/月数据
const getRequestFn = () => {
  axiosRequest('/glbecoPhyunitFreDayEntity/queryPage', {
    phyUnitId: selectListId.value,
    size: tableAndPaginationConfig1.value.pagesizeConfig.size,
    current: tableAndPaginationConfig1.value.pagesizeConfig.current,
    date: todayValue
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
  console.log('handelItem1::: ', index, row)
}
// 表格1切換頁碼
const handelCurrentChange1 = (val) => {
  tableAndPaginationConfig1.value.pagesizeConfig.current = val
  getRequestFn()
}

// 设置表格2头部及数据格式
let tableData2 = reactive({
  column: [
    { label: '起止时间', field: 'fctsttime' },
    { label: '告警内容', field: 'islarge' },
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

// 表格2点击查看
const handelItem2 = (index, row) => {
  console.log('handelItem2::: ', index, row)
}
</script>

<template>
  <div class="homePageNewEnergy">
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
        <div class="headerDangerText">
          <div class="dangerText">1小时内的告警：</div>
          <el-carousel
            height="32px"
            direction="vertical"
            indicator-position="none"
            :autoplay="true"
          >
            <el-carousel-item v-for="item in systemMsg" :key="item.id">
              <div>
                <p class="item">{{ item.title }}</p>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>
    </div>
    <div class="avatar">
      <div class="topAvatar">
        <div class="blow">
          <div>
            <img src="../assets/img/ico_parameter.png" />
          </div>
          <div>
            <p>月累计考核分数</p>
            <p>
              <span>{{ staticData.data?.sumassess || 0 }}</span>
            </p>
          </div>
        </div>
        <div class="under">
          <div class="underLine">
            <p>
              周同比<i>&nbsp;</i><span>{{ staticData.data?.mincount || 0 }}</span> %
            </p>
            <p>
              日<i>&nbsp;</i>环比<span>{{ staticData.data?.sumassess || 0 }}</span> %
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
            <p>月累计补偿分数</p>
            <p>
              <span>{{ staticData.data?.avgyield || 0 }} </span>
            </p>
          </div>
        </div>
        <div class="under">
          <div class="underLine">
            <p>
              AVC<i>&nbsp;</i><span>{{ staticData.data?.pvalue || 0 }}</span>
            </p>
            <p>
              有偿无功<i>&nbsp;</i><span>{{ staticData.data?.llvalue || 0 }}</span>
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
            <p>月累计限电时长</p>
            <p>
              <span>{{ staticData.data?.avgyield || 0 }} </span> 分钟
            </p>
          </div>
        </div>
        <div class="under">
          <div class="underLine">
            <p>
              <!-- AVC<i>&nbsp;</i><span>{{ staticData.data?.pvalue || 0 }}</span> -->
              <i>&nbsp;</i><span></span>
            </p>
            <p>
              <!-- 有偿无功<i>&nbsp;</i><span>{{ staticData.data?.llvalue || 0 }}</span> -->
              <i>&nbsp;</i><span></span>
            </p>
          </div>
        </div>
      </div>
      <div class="topAvatar">
        <div class="blow">
          <div>
            <img src="../assets/img/ico_percent.png" />
          </div>

          <div>
            <p>月累计告警数量</p>
            <p>
              <span>{{ staticData.data ? staticData.data.iscount : 0 }}</span
              >个
            </p>
          </div>
        </div>
        <div class="under">
          <div class="underLine">
            <p>
              运行<i> &nbsp;</i><span>{{ staticData.data?.mincount || 0 }}</span>
            </p>
            <p>
              文件<i> &nbsp;</i><span>{{ staticData.data?.sumassess || 0 }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div id="topsContent">
      <div class="topsContent">
        <div class="chartFit">
          <div id="chart1" class="chart"></div>
          <div id="chart2" class="chart"></div>
        </div>
        <div class="tablesContent">
          <div class="tableFit">
            <div class="agcDanger">
              <p class="agcDangerText">运行性能告警</p>
            </div>
            <table-view
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
          </div>
          <div class="tableFit">
            <div class="agcDanger">
              <p class="agcDangerText">文件通道告警</p>
            </div>
            <table-view
              :table-data="tableData2"
              :config="tableAndPaginationConfig2"
              @currentChange="handelCurrentChange2"
            >
              <template #operate2="scope">
                <div @click="handelItem2(scope.$index, scope.row)" class="colorRed">查看</div>
              </template>
            </table-view>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.homePageNewEnergy {
  height: fit-content;
  :deep(.el-carousel.el-carousel--vertical) {
    width: 500px;
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

      .headerDangerText {
        display: flex;
        align-items: center;
        line-height: 32px;
        margin: 0 10px 0 10px;
      }
    }
  }
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
  #topsContent {
    .topsContent {
      .chartFit {
        display: grid;
        /*  声明列的宽度  */
        grid-template-columns: repeat(2, 48%);
        /*  声明行间距和列间距  */
        grid-gap: 20px;
        /*  声明行的高度  */
        grid-template-rows: 300px;
        .chart {
          width: 100%;
          height: 300px;
        }
      }
      .tablesContent {
        display: grid;
        /*  声明列的宽度  */
        grid-template-columns: repeat(2, 48%);
        /*  声明行间距和列间距  */
        grid-gap: 20px;
        /*  声明行的高度  */
        grid-template-rows: 500px;

        .tableFit {
          flex: 1;
          .agcDanger {
            padding-top: 10px;
          }
        }
      }
    }
  }
}
</style>
