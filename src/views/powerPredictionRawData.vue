<!--
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2023-12-27 17:27:12
 * @Description: 功率预测考核--原始数据
-->
<script setup>
onMounted(() => {
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

// 选择时间，默认为1，day,month,year分别为1,2,3
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
  // 获取表格1 日/月数据(同一接口)
  getRequestFn()
  //获取表格2数据
  getRequestFn2()
}

// 1,2,3分别表示短期功率预测、超短期功率预测、可用功率
let btnType = ref('1')
const btnTypeClick = (val) => {
  btnType.value = val.props.name
  getRequestFn() //获取表格1数据
  getRequestFn2() //获取表格2数据
  getRequestFn3() //获取表格3数据
}

// 表格1table和分頁配置
let tableAndPaginationConfig1 = reactive({
  value: {
    tableStyle: {
      height: '440'
    },
    styles: () => {},
    pagesizeConfig: { current: 1, size: 10, total: 0 }
  }
})

// 设置表格1头部及数据格式
let tableData1 = reactive({
  column: [
    { label: '时间戳', field: 'dataTime' },
    { label: '限电标识', field: 'avg' },
    { label: '实际功率', field: 'pvalue' },
    { label: '预测D1', field: 'iscount' },
    { label: '预测D2', field: 'llvalue' },
    { label: '预测D3', field: 'islargecount' },
    { label: '预测D4', field: 'islargecount' },
    { label: '预测D5', field: 'islargecount' },
    { label: '预测D6', field: 'islargecount' }
  ],
  data: []
})

// 获取表格1数据
const getRequestFn = () => {
  axiosRequest('/glbecoPhyunitFreDayEntity/queryPage', {
    phyUnitId: selectListId.value,
    startTime: startTime.value,
    endTime: endTime.value,
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
}

// 设置表格2头部及数据格式
let tableData2 = reactive({
  column: [
    { label: '时间戳', field: 'fctsttime' },
    { label: '限电标识', field: 'islarge' },
    { label: '实际功率', field: 'fmax' },
    { label: '预测V1', field: 'fmaxtime' },
    { label: '预测V2', field: 'fmaxtime' },
    { label: '预测V3', field: 'fmaxtime' },
    { label: '预测V4', field: 'fmaxtime' },
    { label: '预测V5', field: 'fmaxtime' },
    { label: '预测V6', field: 'fmaxtime' }
  ],
  data: []
})
// 表格2table和分頁配置
let tableAndPaginationConfig2 = reactive({
  value: {
    tableStyle: {
      height: '440'
    },
    styles: {},
    pagesizeConfig: { current: 1, size: 10, total: 0 }
  }
})

// 获取表格2数据
const getRequestFn2 = () => {
  axiosRequest('/glbecoPhyunitFreEntity/queryPage', {
    phyUnitId: selectListId.value,
    startTime: startTime.value,
    endTime: endTime.value,
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
    // console.log('getRequestFn2::: ', res.data, res.data.records, tableData2.data)
  })
}
// 表格2切換頁碼
const handelCurrentChange2 = (val) => {
  tableAndPaginationConfig2.value.pagesizeConfig.current = val
  getRequestFn2()
}

// 表格1table和分頁配置
let tableAndPaginationConfig3 = reactive({
  value: {
    tableStyle: {
      height: '440'
    },
    styles: {},
    pagesizeConfig: { current: 1, size: 10, total: 0 }
  }
})
// 设置表格3头部及数据格式
let tableData3 = reactive({
  column: [
    { label: '时间戳', field: 'dataTime' },
    { label: '限电标识', field: 'avg' },
    { label: '实际功率', field: 'value' },
    { label: '可用功率', field: 'islargevalue' }
  ],
  data: []
})

// 获取表格3数据
const getRequestFn3 = () => {
  axiosRequest('/glbecoPhyunitFreDayEntity/queryPage', {
    phyUnitId: selectListId.value,
    startTime: startTime.value,
    endTime: endTime.value,
    size: tableAndPaginationConfig3.value.pagesizeConfig.size || 10,
    current: tableAndPaginationConfig3.value.pagesizeConfig.current || 1
  }).then((res) => {
    if (res && res.code == 200) {
      tableAndPaginationConfig3.value = {
        pagesizeConfig: {
          current: res.data.current,
          size: res.data.size,
          total: res.data.total
        }
      }
      tableData3.data = res.data.records
    }
  })
}

// 表格1切換頁碼
const handelCurrentChange3 = (val) => {
  tableAndPaginationConfig3.value.pagesizeConfig.current = val
  getRequestFn3()
}
</script>

<template>
  <div class="powerPredictionRawData">
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
            <!-- :disabledDate="disableDateFn" -->
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
    </div>
    <div>
      <el-tabs v-model="btnType" class="tabs" @tab-click="btnTypeClick">
        <el-tab-pane label="短期功率预测" name="1">
          <table-view
            class="tableView"
            :table-data="tableData1"
            :config="tableAndPaginationConfig1"
            @currentChange="handelCurrentChange1"
          >
          </table-view>
        </el-tab-pane>
        <el-tab-pane label="超短期功率预测" name="2">
          <table-view
            class="tableView"
            :table-data="tableData2"
            :config="tableAndPaginationConfig2"
            @currentChange="handelCurrentChange2"
          >
          </table-view>
        </el-tab-pane>
        <el-tab-pane label="可用功率" name="3">
          <table-view
            class="tableView"
            :table-data="tableData3"
            :config="tableAndPaginationConfig3"
            @currentChange="handelCurrentChange3"
          >
          </table-view>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<style scoped lang="less">
.powerPredictionRawData {
  height: fit-content;
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
}
</style>
