<!--
 * @Date: 2024-01-17 15:50:01
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-17 16:01:32
 * @Description: 日发电计划考核--日发电计划考核
-->
<script setup>
import { shakeWorker, valMaxMinFix, filterNumber, dateEndWith } from '../common/prefix.js'
import { downLoad } from '../common/downloadFile'
import { ref } from 'vue'
// import { downloadFile } from '../common/request/request'
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
  axiosRequest('/glbecoPhyunitDfDayEntity/queryStatistics', {
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
  axiosRequest('/glbecoPhyunitDfDayEntity/queryMonthStatistics', {
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
  axiosRequest('/glbecoPhyunitDfMonthlyEntity/queryStatistics', {
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
    { label: '平均合格率', field: 'sum', slotName: 'sum' },
    { label: '考核分数', field: 'sumkhValue' },
    { label: '最大偏差', field: 'sumbcValue' },
    { label: '最小偏差', field: 'gfkhValue' },
    { label: '操作', slotName: 'operate1' }
  ],
  data: []
})

// 获取表格1 日/月数据
const getRequestFn = () => {
  axiosRequest('/glbecoPhyunitDfDayEntity/queryPage', {
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
  axiosRequest('/glbecoPhyunitDfMonthlyEntity/queryPage', {
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

// 设置表格2头部及数据格式（）
let tableData2 = reactive({
  column: [
    { label: '时间', field: 'dataTime' },
    { label: '实际有功', field: 'dfnl', slotName: 'dfnl' },
    { label: '计划有功', field: 'xtfnl', slotName: 'xtfnl' }
  ],
  showIndexColumn: true,
  data: []
})

// 表格2table和分頁配置
let tableAndPaginationConfig2 = reactive({
  value: {
    tableStyle: {
      height: '530'
    },
    pagesizeConfig: { current: 1, size: 10, total: 0 }
  }
})
// 获取表格2数据
const getQueryPageRequestFn = () => {
  axiosRequest('/glbecoPhyunitDfRnEntity/queryPage', {
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
      //   console.log('tableData2::: ', tableData2.data, res.data.records)
    }
  })
}
// 表格2切換頁碼
const handelCurrentChange2 = (val) => {
  tableAndPaginationConfig2.value.pagesizeConfig.current = val
  getQueryPageRequestFn()
}

// 上传文件变化时（上传文件并导入文件）
const uploadRef = ref()
const fileData = ref({})
let names = ''
let fileLists = ''
const onChange = (file, fileList) => {
  names = String(file.name.split('.')[file.name.split('.').length - 1]).toLowerCase()
  fileLists = fileList
  // console.log('file, fileList::: ', file, fileList)
  fileData.value = {
    phyUnitId: selectListId.value,
    file: file.raw
  }
}

// 上传文件判断
const verifyFile = (file, fileList) => {
  names = String(file.name.split('.')[file.name.split('.').length - 1])
    .toLowerCase()
    .trim()
  if (names == '' || names == void 0 || names == null) {
    ElMessage({
      type: 'warning',
      message: '请选择需要上传的Excel文件！'
    })
    return false
  }
  console.log('names::: ', names)
  // if (names != 'xls' || names != 'xlsx') {
  if (names != 'xls' && names != 'xlsx') {
    ElMessage({
      type: 'warning',
      message: '您上传的文件类型有误，文件必须是Excel格式(xls或xlsx后缀格式)！'
    })
    return false
  }
  //1、判断文件大小是否合法，文件限制不超过5M
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage({
      type: 'warning',
      message: '上传文件大小不能超过 5MB!'
    })
    fileList.splice(-1, 1) //移除当前超出大小的文件
    return false
  }
  return true
}
// 上传文件
const requestFn = (e) => {
  let formData = new FormData()
  formData.append('phyUnitId', selectListId.value)
  formData.append('file', fileData.value.file)
  console.warn('requestFn::: ', e, names, typeof names, formData)
  if (!verifyFile(fileData.value.file, fileLists)) {
    setTimeout(() => {
      uploadRef.value.clearFiles()
    }, 1000)
    return
  }
  postForm('/glbecoPhyunitDfRnEntity/importExcel', formData).then((res) => {
    if (res) {
      console.log('res::: ', res)
      if (res && res.code == 200) {
        ElMessage({
          type: 'success',
          message: '文件长传成功!'
        })
      }
      setTimeout(() => {
        uploadRef.value.clearFiles()
      }, 1000)
    }
  })
}
</script>

<template>
  <div class="dailyPowerExam">
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
                    >{{
                      filterNumber(staticData.data?.sumkhValue) || (buttonMSg.type == 1 ? '-' : 0)
                    }}
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
                  高峰时段：<i>&nbsp;</i><span>{{ filterNumber(staticData.data?.gfkhValue) }}</span>
                </p>
                <p>
                  其它时段：<i>&nbsp;</i><span>{{ filterNumber(staticData.data?.qtkhValue) }}</span>
                </p> -->
              </div>
            </div>
          </div>
          <div class="topAvatar">
            <div class="blow">
              <div>
                <img src="../assets/img/ico_parameter.png" />
              </div>
              <div>
                <p>补偿分数</p>
                <p>
                  <span
                    >{{
                      filterNumber(staticData.data?.sumbcValue) || (buttonMSg.type == 1 ? '-' : 0)
                    }}
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
              </div>
            </div>
          </div>
        </div>

        <table-view
          :table-data="tableData1"
          :config="tableAndPaginationConfig1"
          @currentChange="handelCurrentChange1"
        >
          <template #sum="scope">
            <div>
              {{ filterNumber(scope.row.sum, '%') }}
            </div>
          </template>
          <template #sumTime="scope">
            <div>
              {{ filterNumber(scope.row.stoptimevalue + scope.row.starttimevalue, '小时') }}
            </div>
          </template>
          <template #operate1="scope">
            <div @click="handelItem1(scope.$index, scope.row)" v-debounce class="colorRed">
              查看
            </div>
          </template>
        </table-view>
        <div class="exportAndDown" v-show="buttonMSg.type == 1">
          <div class="el_upload eadBtn">
            <el-upload
              ref="uploadRef"
              :limit="1"
              accept=".xls,.xlsx"
              :on-change="onChange"
              :http-request="requestFn"
            >
              <template #trigger>
                <el-tooltip placement="top">
                  <template #content>
                    文件格式 : Excel (xls/slxs)格式<br />
                    必须使用模板上传 <br />
                    上传文件大小不超过5M
                  </template>
                  <el-button type="primary">选择文件并导入</el-button>
                </el-tooltip>
              </template>
            </el-upload>
          </div>
        </div>
        <table-view
          class="tableView"
          v-show="buttonMSg.type == 1"
          :table-data="tableData2"
          :config="tableAndPaginationConfig2"
          @currentChange="handelCurrentChange2"
        >
          <template #dateType="scope">
            {{
              scope.row.dateType == 1
                ? '其它时段'
                : scope.row.dateType == 2
                  ? '新能源大发'
                  : scope.row.dateType == 3
                    ? '高峰时段'
                    : '类型错误'
            }}
          </template>
        </table-view>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.dailyPowerExam {
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
      .exportAndDown {
        display: flex;
        padding: 5px 0;
        position: relative;

        // button
        :deep(.el-button, .el-button:focus, .el-button:hover) {
          border-color: var(--colorRed);
          background: var(--colorRed);
          color: var(--background);
          margin-left: 10px;
        }
        .exportFile {
          position: absolute;
          left: 100px;
          top: 5px;
        }
      }

      .tableView {
        width: clamp(1000px, 80%, 1200px);
      }
    }
  }
}
</style>
