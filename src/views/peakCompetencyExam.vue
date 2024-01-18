<!--
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-18 09:11:38
 * @Description: 有偿调峰与顶峰能力--顶峰能力考核
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
    { label: '合计', field: 'sum', slotName: 'sum' },
    { label: '总考核分数', field: 'sumkhValue' },
    { label: '总补偿分数', field: 'sumbcValue' },
    { label: '高峰时段考核', field: 'gfkhValue' },
    { label: '其它时段考核', field: 'qtkhValue' },
    // { label: '80%-95%考核', field: 'sumTime', slotName: 'sumTime' },
    // { label: '小于80%考核', field: 'sumTime', slotName: 'sumTime' },
    { label: '下调峰能力考核', field: 'xtfkhValue' },
    { label: '高峰时段补偿', field: 'gfbcValue' },
    { label: '其它时段补偿', field: 'qtbcValue' },
    // { label: '大于98%补偿', field: 'sumTime', slotName: 'sumTime' },
    // { label: '95%-98%补偿', field: 'sumTime', slotName: 'sumTime' },
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
    { label: '时间点', field: 'dataTime', slotName: 'dataTime' },
    { label: '顶峰能力', field: 'dfnl', slotName: 'dfnl' },
    { label: '下调峰能力', field: 'xtfnl', slotName: 'xtfnl' },
    { label: '时段类型', field: 'dateType', slotName: 'dateType' },
    { label: '考核分数', field: 'khValue' },
    { label: '补偿分数', field: 'bcValue' }
  ],
  showIndexColumn: true,
  data: []
})
/**
 *
 * @param {array} data 存储96条数据(固定)
 * @param {number} current 当前页
 * @param {number} size  每页条数
 */
const getTableDataTime = (total) => {
  // 96条数据
  // let current = 1,
  //   size = 10
  let hour = null
  let min = null
  let hourMinTime = null
  let data = []
  // let start = (current - 1) * size
  // let end = size * current

  for (let i = 1; i < total + 1; i++) {
    let hourNum = Math.floor(i / 4),
      minNum = (i % 4) * 15
    hour = hourNum < 10 ? `0${hourNum}` : hourNum

    min = minNum === 0 ? `0${minNum}` : minNum
    hourMinTime = `${hour.toString()}:${min.toString()}`
    data.push({
      id: i,
      dataTime: hourMinTime,
      dfnl: 0,
      xtfnl: 0
    })

    // console.log('hour,min::: ', hour, min, hourMinTime)
  }

  // end > total && (end = total)
  // return data.slice(start, end)
  return data
}
// 表格2table和分頁配置
let tableAndPaginationConfig2 = reactive({
  value: {
    tableStyle: {
      height: '530'
    },
    pagesizeConfig: { current: 1, size: 1000, total: 96 }
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
      // let { current, size, total } = tableAndPaginationConfig2.value.pagesizeConfig
      // current = res.data.current
      // size = res.data.size

      /**修改时间格式：10:50 */
      // res.data.records.map((item) => {
      //   if (item.dataTime && String(item.dataTime).trim().length == 19) {
      //     item.dataTime = item.dataTime.substr(11, 5)
      //   }
      // })
      /**96条数据（固定） */
      // let getTableDataTimeData = getTableDataTime(current, size, total)
      let getTableDataTimeData = getTableDataTime(96)

      getTableDataTimeData.map((item, i) => {
        if (res.data.records[i]) {
          /** 循环获取所有列表属性,将属性的值赋予对应属性*/
          tableData2.column.map((list) => {
            item[list.field] = res.data.records[i][list.field]
          })
        }
      })

      tableData2.data = getTableDataTimeData

      // console.log('tableData2::: ', tableData2.data, res.data.records, getTableDataTimeData)
    }
  })
}
// 表格2切換頁碼
const handelCurrentChange2 = (val) => {
  tableAndPaginationConfig2.value.pagesizeConfig.current = val
  getQueryPageRequestFn()
}

// 判断是否为空或数字类型
const verifyVal = (val) => {
  // if (val === null || String(val).trim() === '') {
  //   return true
  // }
  return /^-?\d+(\.\d+)?$/.test(val)
}
// 保存前数据校验
let verifyFlag = ref(false)
const judgeSubmit = (data) => {
  if (data.length <= 0) {
    ElMessage({
      type: 'warning',
      message: `提交的数据不能为空！`
    })
    return false
  }
  // 判断顶峰能力和下调峰能力是否为数字
  let errorText = ''
  for (let item of data) {
    if (item.dfnl && !verifyVal(item.dfnl)) {
      errorText = item.dfnl
    }
    if (item.xtfnl && !verifyVal(item.xtfnl)) {
      errorText = item.xtfnl
    }
    verifyFlag.value = false
  }
  console.log('judgeSubmit errorText::: ', errorText, data)
  if (!verifyFlag.value && errorText != '') {
    ElMessage({
      type: 'warning',
      message: `您提交的数据 ${errorText} 格式错误，顶峰能力、下调峰能力数据必须为数字类型！`
    })
    return false
  }
  return true
}
//input编辑 ，type=1,2分别表示顶峰和调峰, val编辑框的值
const onEditChange = (type, val) => {
  console.log('type, val::: ', type, val, typeof val)
  let valIs = verifyVal(val)
  if (!valIs) {
    verifyFlag.value = false
    ElMessage({
      type: 'warning',
      message: `您填写的数据${val} 格式错误，顶峰能力、下调峰能力数据必须为数字类型！`
    })
    return
  }
  verifyFlag.value = true
}
// tableData2保存
const submitSave = () => {
  let tableData = tableData2.data.concat()

  tableData.map((item) => {
    if (item.dataTime && String(item.dataTime).trim().length == 5) {
      item.dataTime = `${dateValue.value} ${item.dataTime}:00`
    }
  })
  console.log('tableData::: ', tableData)
  if (judgeSubmit(tableData)) {
    postJSON('/glbecoPhyunitDfRnEntity/batchSave', {
      phyUnitId: selectListId.value,
      isqt: 0,
      dataList: tableData
    }).then(function (res) {
      if (res && res.code == 200) {
        ElMessage({
          type: 'success',
          message: `数据保存成功！`
        })
      }
    })
  }
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
// 下载模板(本地文件)
const linkUrl = ref('/example.xlsx')
const downloadModule = () => {
  ElMessageBox.confirm('确定下载模板吗?', '提示', {
    confirmButtonText: '是',
    cancelButtonText: '否',
    type: 'warning'
  })
    .then(() => {
      ElMessage({
        type: 'warning',
        message: '正在下载中!'
      })
      // console.log('linkUrl.value::: ', linkUrl.value)
      // 下载模板
      setTimeout(() => {
        downLoad(linkUrl.value, 'example.xlsx')
        // window.open(fileUrl, '_blank')
      }, 1000)
    })
    .catch(() => {})
}
</script>

<template>
  <div class="peakCompetencyExam">
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
                  高峰时段：<i>&nbsp;</i><span>{{ filterNumber(staticData.data?.gfkhValue) }}</span>
                </p>
                <p>
                  其它时段：<i>&nbsp;</i><span>{{ filterNumber(staticData.data?.qtkhValue) }}</span>
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
                  高峰时段：<i>&nbsp;</i><span>{{ filterNumber(staticData.data?.gfbcValue) }}</span>
                </p>
                <p>
                  其它时段：<i>&nbsp;</i><span>{{ filterNumber(staticData.data?.qtbcValue) }}</span>
                </p>
              </div>
            </div>
          </div>
          <!-- <div class="topAvatar">
            <div class="blow">
              <div>
                <img src="../assets/img/ico_parameter.png" />
              </div>
              <div>
                <p>受阻电力考核</p>
                <p>
                  <span>{{ staticData.data?.isvalue || 0 }} </span>
                </p>
              </div>
            </div>
            <div class="under">
              <div class="underLine">
                <p>
                  未申报：<i>&nbsp;</i><span>{{ staticData.data?.tb || 0 }}</span>
                </p>
                <p>
                  提前申报：<i>&nbsp;</i><span>{{ staticData.data?.hb || 0 }}</span>
                </p>
              </div>
            </div>
          </div> -->
        </div>

        <table-view
          :table-data="tableData1"
          :config="tableAndPaginationConfig1"
          @currentChange="handelCurrentChange1"
        >
          <template #sum="scope">
            <div>
              {{ filterNumber(scope.row.sum) }}
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
          <!-- <el-button class="eadBtn" @click="submitSave">保存</el-button> -->
          <el-button class="eadBtn" v-debounce @click="submitSave">保存</el-button>
          <el-button class="eadBtn" @click="downloadModule">下载模板</el-button>
        </div>
        <table-view
          class="tableView"
          v-show="buttonMSg.type == 1"
          :table-data="tableData2"
          :config="tableAndPaginationConfig2"
          @currentChange="handelCurrentChange2"
        >
          <template #dataTime="scope">
            <div>
              {{
                scope.row.dataTime.length == 19
                  ? scope.row.dataTime.trim().substr(11, 5)
                  : scope.row.dataTime.length == 5
                    ? scope.row.dataTime
                    : '时间格式异常'
              }}
            </div>
          </template>
          <template #dfnl="scope">
            <div>
              <el-input
                v-model.number.trim="scope.row.dfnl"
                placeholder="顶峰能力(可编辑)"
                @change="onEditChange(1, scope.row.dfnl)"
                clearable
              />
            </div>
          </template>
          <template #xtfnl="scope">
            <div>
              <el-input
                v-model.number.trim="scope.row.xtfnl"
                placeholder="下调峰能力(可编辑)"
                @change="onEditChange(2, scope.row.xtfnl)"
                clearable
              />
            </div>
          </template>
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
.peakCompetencyExam {
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
