<!--
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-05 16:09:22
 * @Description: AVC考核与补偿--avc补偿
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
  queryListFn() //获取机组下拉框数据
})

// 切换机组初始化
const initFn = () => {
  buttonMSg.type = 2
  dateValue.value = todayValue
  pickerDate.value = todayValue
  chartVisible.value = false
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
  axiosRequest('/glbecoPhyunitAvcCompensationDayEntity/queryStatistics', {
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
  axiosRequest('/glbecoPhyunitAvcCompensationDayEntity/queryMonthStatistics', {
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
  axiosRequest('/glbecoPhyunitAvcCompensationMonthlyEntity/queryStatistics', {
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
    { label: '补偿分数', field: 'cmvalue' },
    { label: '补偿电量', field: 'cmpower' },
    { label: '平均投运率', field: 'avgvalue', slotName: 'avgvalue' },
    { label: '平均合格率', field: 'avgisvalue', slotName: 'avgisvalue' },
    { label: '投入时长', field: 'starttime', slotName: 'starttime' },
    { label: '退出时长', field: 'stoptime', slotName: 'stoptime' },
    { label: '总时长', field: 'sumTime', slotName: 'sumTime' },
    { label: '操作', slotName: 'operate1' }
  ],
  data: []
})

// 获取表格1 日/月数据
const getRequestFn = () => {
  axiosRequest('/glbecoPhyunitAvcCompensationDayEntity/queryPage', {
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
  axiosRequest('/glbecoPhyunitAvcCompensationMonthlyEntity/queryPage', {
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
    { label: '时间戳(5分钟)', field: 'dataTime' },
    { label: 'AVC指令值', field: 'avcins' },
    { label: '母线电压', field: 'vgen' },
    { label: '偏差', field: 'pc', slotName: 'pc' },
    // { label: '偏差占比', field: 'pczb' },
    { label: '是否合格(合格不合格)', field: 'stat', slotName: 'stat' },
    { label: '不合格原因', field: 'cause', slotName: 'cause' },
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
  axiosRequest('/glbecoPhyunitAvcIsupRnEntity/queryPage', {
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
  axiosRequest('/glbecoPhyunitAvcEntity/queryImplementCurve', {
    phyUnitId: selectListId.value,
    date: pickerDate.value,
    beginDate: modalLineChartData.row.beginDate,
    endDate: modalLineChartData.row.endDate
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
  //tooltipData1.val = {}
  //tooltipData2.val = {}
  // 取当前行时间加5分钟
  let date = Date.parse(row.dataTime) + 1000 * 60 * 5
  modalLineChartData.row.beginDate = row.dataTime
  modalLineChartData.row.endDate = new Date(date).format('yyyy-MM-dd hh:mm:ss')
  getLineChartRequestFn()
  open()
}
const open = () => {
  setTimeout(() => {
    chart()
  }, 1000)
}
let tooltipData1 = reactive({})
let tooltipData2 = reactive({})
// 声明弹窗中echarts函数
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
      // position: ['100%', '-20%'],
      formatter: function (params) {
        // console.log('params::: ', params)
        tooltipData1.val = params[0]
        tooltipData2.val = params[1]
      }
    },
    legend: {
      data: ['AVC曲线', '母线电压曲线']
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

      data: modalLineChartData.value?.dataTime || []
    },
    yAxis: {
      type: 'value',
      name: '千伏/kV',
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
        name: 'AVC指令',
        // position: [10, 10],
        showSymbol: false,
        type: 'line',
        // yAxisIndex: 0, //指定需要使用的Y轴
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
        data: modalLineChartData.value?.avcins || []
      },
      {
        name: '母线电压曲线',
        // position: [10, 10],
        showSymbol: false,
        type: 'line',
        // yAxisIndex: 1, //指定需要使用的Y轴
        // data: [20, 30, 13, 11, 12, 42, 29],
        data: modalLineChartData.value?.vgen || []
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
  <div class="avcCompensation">
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
                  <span>{{ staticData.data?.cmvalue || 0 }}</span
                  >分
                </p>
              </div>
            </div>
            <div class="under">
              <div class="underLine">
                <p>
                  同比<i>&nbsp;</i><span>{{ staticData.data?.cmvalueTb || 0 }}</span> %
                </p>
                <p>
                  <i>&nbsp;</i>环比<span>{{ staticData.data?.cmvalueHb || 0 }}</span> %
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
                <p>累计平均投运率</p>
                <p>
                  <span>{{ staticData.data?.avgvalue || 0 }} </span> %
                </p>
              </div>
            </div>
            <div class="under">
              <div class="underLine">
                <p>
                  同比<i>&nbsp;</i><span>{{ staticData.data?.avgvalueTb || 0 }}</span> %
                </p>
                <p>
                  <i>&nbsp;</i>环比<span>{{ staticData.data?.avgvalueHb || 0 }}</span> %
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
                <p>平均合格率</p>
                <p>
                  <span>{{ staticData.data?.avgisvalue || 0 }}</span> %
                </p>
              </div>
            </div>
            <div class="under">
              <div class="underLine">
                <p>
                  同比<i> &nbsp;</i><span>{{ staticData.data?.avgisvalueTb || 0 }}</span> %
                </p>
                <p>
                  环比<i> &nbsp;</i><span>{{ staticData.data?.avgisvalueHb || 0 }}</span> %
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
                <p>补偿电量</p>
                <p>
                  <span>{{ staticData.data?.cmpower || 0 }}</span
                  >万千瓦乏时
                </p>
              </div>
            </div>
            <div class="under">
              <div class="underLine">
                <p>&nbsp;</p>
                <!-- <p>
                  <i> &nbsp;</i><span></span> 不合格<i> &nbsp;</i
                  ><span>{{ staticData.data?.cmvalue || 0 }}</span>
                </p>
                <p>
                  <i> &nbsp;</i><span></span> 合格<i> &nbsp;</i
                  ><span>{{ staticData.data?.cmvalue || 0 }}</span>
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
          <template #avgvalue="scope">
            <div>{{ filterNumber(scope.row.avgvalue, '%') }}</div>
          </template>
          <template #avgisvalue="scope">
            <div>{{ filterNumber(scope.row.avgisvalue, '%') }}</div>
          </template>
          <template #starttime="scope">
            <div>{{ filterNumber(scope.row.starttime, '小时') }}</div>
          </template>
          <template #stoptime="scope">
            <div>{{ filterNumber(scope.row.stoptime, '小时') }}</div>
          </template>
          <template #sumTime="scope">
            <div>{{ filterNumber(scope.row.sumTime, '小时') }}</div>
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
          <template #stat="scope">
            <div :class="[scope.row.stat != 1 && 'colorRed']">
              {{ scope.row.stat == 1 ? '合格' : scope.row.stat == 0 ? '不合格' : '状态异常' }}
            </div>
          </template>
          <template #cause="scope">
            <div :class="[scope.row.stat != 1 && 'colorRed']">
              {{ scope.row.cause || '--' }}
            </div>
          </template>
          <template #operate2="scope">
            <div @click="handelItem2(scope.$index, scope.row)" class="colorRed">查看曲线</div>
          </template>
        </table-view>
        <div class="tableDialog">
          <el-dialog
            v-model="dialogVisible"
            title="AVC曲线(AVC指令+母线电压)"
            width="1000px"
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
                <p class="text">{{ modalLineChartData.row.cause || '--' }}</p>
              </div>
            </div>
            <div class="modals">
              <div id="modalChart"></div>
              <div class="modalTable">
                <div class="radius" :style="tooltipData1.val?.color"></div>
                <span
                  :style="{ color: tooltipData1.val?.color }"
                  v-show="tooltipData1.val?.seriesName"
                  >{{ tooltipData1.val?.seriesName }}:</span
                ><span>{{ tooltipData1.val?.value }}</span
                >&nbsp;&nbsp;
                <div class="radius" :style="tooltipData1.val?.color"></div>
                <span
                  :style="{ color: tooltipData2.val?.color }"
                  v-show="tooltipData2.val?.seriesName"
                  >{{ tooltipData2.val?.seriesName }}:</span
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
                      <td class="td">时间戳</td>
                      <td class="td">
                        {{ modalLineChartData.row?.dataTime }}
                      </td>
                    </tr>
                    <tr>
                      <td class="td">AVC指令</td>
                      <td class="td">
                        {{ modalLineChartData.row?.avcins }}
                      </td>
                    </tr>
                    <tr>
                      <td class="td">母线电压</td>
                      <td class="td">
                        {{ modalLineChartData.row?.vgen }}
                      </td>
                    </tr>
                    <tr>
                      <td class="td">偏差</td>
                      <td class="td">
                        {{ modalLineChartData.row?.pc }}
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
.avcCompensation {
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
          .blow {
            display: flex;
            border-bottom: 1px solid #dcdfe6;
            // box-shadow: 0 0 1px rgba(0, 0, 0, 0.3) inset;

            align-items: center;
            padding: 10px 0 10px;
            div {
              &:nth-child(1) {
                margin: 0 20px 0 20px;
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
            height: 400px;
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
