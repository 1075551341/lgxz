<!--
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-03 17:30:16
 * @Description: 实时告警
-->
<script setup>
// import * as echarts from 'echarts'
import { valMaxMinFix, filterNumber, dateEndWith } from '../common/prefix.js'

onMounted(() => {
  queryListFn() //获取机组下拉框数据
})

const todayValue = formateDate(new Date())
//顶部切换tab
let btnType = ref('1')
const btnTypeClick = (val) => {
  btnType.value = val.props.name
  repeatInit()
}

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
  // console.log('date::: ', date)
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

// 选择时间，默认为1，day,month,year分别为1,2,3
const lastValue = ref([])
const dateChange = (visible, val) => {
  if (!visible) {
    if (dateValue.value == null || dateValue.value == '' || dateValue.value == void 0) {
      ElMessage({
        type: 'warning',
        message: '日期不能为空！'
      })
      return
    }

    startTime.value = formateDate(dateValue.value[0])
    endTime.value = formateDate(dateValue.value[1])
    lastValue.value = [formateDate(dateValue.value[0]), formateDate(dateValue.value[1])]
    repeatInit()
  }
}

// 切换下拉框处理
const repeatInit = () => {
  getRequestFn() // 表格
  queryStatisticsFn() // 统计
}

// 获取统计数据
let staticData1 = reactive({ data: {} })
let staticData2 = reactive({ data: {} })
const queryStatisticsFn = () => {
  axiosRequest('/glbecoPhyunitAlarmEntity/queryStatistics', {
    phyUnitId: btnType.value == 1 ? selectListId.value : null,
    dataType: btnType.value,
    beginDate: startTime.value,
    endDate: endTime.value,
    date: todayValue
  }).then((res) => {
    if (res && res.code == 200) {
      if (btnType.value == 1) {
        staticData1.data = res.data
      }
      if (btnType.value == 2) {
        staticData2.data = res.data
      }
    }
  })
}

// 指标告警--表格table和分頁配置
let tableAndPaginationConfig1 = reactive({
  value: {
    tableStyle: {
      height: '440'
    },
    pagesizeConfig: { current: 1, size: 10, total: 0 }
  }
})
// 指标告警--设置表格头部及数据格式
let tableData1 = reactive({
  column: [
    { label: '机组名称', field: 'phyunitId' },
    { label: '时间', field: 'dataTime' },
    { label: '告警类型', field: 'dataType', slotName: 'dataType' },
    { label: '指标类型', field: 'dataValue', slotName: 'dataValue' },
    { label: '告警等级', field: 'dataCase', slotName: 'dataCase' },
    { label: '告警内容', field: 'value' }
  ],
  data: []
})
//1,2分别为tabs子项，type根据形参类型获得val
const pageSize = ref(10)
const pageCurrent = ref(1)
const typeProvider = (type) => {
  let val = null
  if (btnType.value == 1) {
    pageSize.value = tableAndPaginationConfig1.value.pagesizeConfig.size
    pageCurrent.value = tableAndPaginationConfig1.value.pagesizeConfig.current
  }
  if (btnType.value == 2) {
    pageSize.value = tableAndPaginationConfig2.value.pagesizeConfig.size
    pageCurrent.value = tableAndPaginationConfig2.value.pagesizeConfig.current
  }
  val = type == 'size' ? pageSize.value : type == 'current' ? pageCurrent.value : null
  return val
}
// 获取表格数据
const getRequestFn = () => {
  axiosRequest('/glbecoPhyunitAlarmEntity/queryPage', {
    phyUnitId: btnType.value == 1 ? selectListId.value : null,
    beginDate: startTime.value,
    endDate: endTime.value,
    dataType: btnType.value,
    size: typeProvider('size'),
    current: typeProvider('current')
  }).then((res) => {
    if (res && res.code == 200) {
      if (btnType.value == 1) {
        tableData1.data = res.data.records
        tableAndPaginationConfig1.value = {
          pagesizeConfig: {
            current: res.data.current,
            size: res.data.size,
            total: res.data.total
          }
        }
      }
      if (btnType.value == 2) {
        tableData2.data = res.data.records
        tableAndPaginationConfig2.value = {
          pagesizeConfig: {
            current: res.data.current,
            size: res.data.size,
            total: res.data.total
          }
        }
      }
    }
  })
}

//指标告警--表格切換頁碼
const handelCurrentChange1 = (val) => {
  tableAndPaginationConfig1.value.pagesizeConfig.current = val
  btnType.value = '1'
  getRequestFn()
}

// 文件告警--表格table和分頁配置
let tableAndPaginationConfig2 = reactive({
  value: {
    tableStyle: {
      height: '440'
    },
    pagesizeConfig: { current: 1, size: 10, total: 0 }
  }
})
// 文件告警--设置表格头部及数据格式
let tableData2 = reactive({
  column: [
    { label: '机组名称', field: 'phyunitId' },
    { label: '时间', field: 'dataTime' },
    { label: '告警类型', field: 'dataType', slotName: 'dataType' },
    { label: '指标类型', field: 'dataValue', slotName: 'dataValue' },
    { label: '告警等级', field: 'dataCase', slotName: 'dataCase' },
    { label: '告警内容', field: 'value' }
  ],
  data: []
})
//文件告警--表格切換頁碼
const handelCurrentChange2 = (val) => {
  tableAndPaginationConfig2.value.pagesizeConfig.current = val
  btnType.value = '2'
  getRequestFn()
}
</script>

<template>
  <div class="realTimeAlarm">
    <el-tabs v-model="btnType" class="tabs" @tab-click="btnTypeClick">
      <el-tab-pane label="指标告警" name="1">
        <div class="tops">
          <div class="topLeft">
            <el-select
              v-show="btnType == 1"
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
                  @visible-change="dateChange($event, 1)"
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
                    <p>告警总数</p>
                    <p>
                      <span>{{ filterNumber(staticData1.data?.sum) }}</span>
                    </p>
                  </div>
                </div>
                <div class="under">
                  <div class="underLine">
                    <p>
                      严重<i>&nbsp;</i
                      ><span>{{ filterNumber(staticData1.data?.seriousCount) }}</span>
                    </p>
                    <p>
                      一般<i>&nbsp;</i
                      ><span>{{ filterNumber(staticData1.data?.commonlyCount) }}</span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- <div class="charts">
                <div id="chartBar" v-show="chartVisible" class="chartItem"></div>
              </div> -->
            </div>
            <div id="tables">
              <table-view
                :table-data="tableData1"
                :config="tableAndPaginationConfig1"
                @currentChange="handelCurrentChange1"
              >
              </table-view>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="文件告警" name="2">
        <div class="tops">
          <div class="topLeft">
            <div class="topsDatePicker">
              <div class="block blockRight">
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
                  @visible-change="dateChange($event, 2)"
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
                    <p>告警总数</p>
                    <p>
                      <span>{{ filterNumber(staticData2.data?.sum) }}</span>
                    </p>
                  </div>
                </div>
                <div class="under">
                  <div class="underLine">
                    <p>
                      严重<i>&nbsp;</i
                      ><span>{{ filterNumber(staticData2.data?.seriousCount) }}</span>
                    </p>
                    <p>
                      一般<i>&nbsp;</i
                      ><span>{{ filterNumber(staticData2.data?.commonlyCount) }}</span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- <div class="charts">
                <div id="chartBar" v-show="chartVisible" class="chartItem"></div>
              </div> -->
            </div>
            <div id="tables">
              <table-view
                :table-data="tableData2"
                :config="tableAndPaginationConfig2"
                @currentChange="handelCurrentChange2"
              >
                <!-- 告警类型:1文件通道;2考核预警 -->
                <template #dataType="scope">
                  <div>
                    {{
                      scope.row.dataType == 1
                        ? '文件通道'
                        : scope.row.dataType == 2
                          ? '考核预警'
                          : '告警类型异常'
                    }}
                  </div>
                </template>
                <!-- egAGC考核与补偿-可用率考核与补偿 -->
                <template #dataValue="scope">
                  <div>{{ scope.row.dataValue }}</div>
                </template>
                <!-- 等级:1紧急;2一般 -->
                <template #dataCase="scope">
                  <div>
                    {{
                      scope.row.dataCase == 1
                        ? '紧急'
                        : scope.row.dataCase == 2
                          ? '一般'
                          : '等级异常'
                    }}
                  </div>
                </template>
              </table-view>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<style scoped lang="less">
.realTimeAlarm {
  // tabs宽度
  :deep(.el-tabs__header, .is-top) {
    width: 60%;
  }
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

      .topsDatePicker {
        .block {
          margin-left: 10px;
          &.blockRight {
            margin-left: 0;
          }
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
        .charts {
          .chartItem {
            width: 800px;
            height: var(--height-200);
            //   height: 160px;
          }
        }
      }
      #tables {
        width: clamp(1200px, 80%, 1400px);
      }
      .chartItem {
        width: 1000px;
        height: 400px;
      }
    }
  }
}
</style>
