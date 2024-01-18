<!--
 * @Date: 2023-12-28 09:14:06
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-08 16:34:53
 * @Description: 总结分析
-->
<script setup>
// 当前月（2024-01格式）
let todayValue = formateTime(new Date()).substring(0, 7)
onMounted(() => {
  queryData()
})
// 时间选择--月份
const year = computed(() => {
  return dateValue.value.substr(0, 4)
})
const month = computed(() => {
  return Number(dateValue.value.substr(5)) > 9
    ? dateValue.value.substr(5)
    : dateValue.value.substr(6)
})

// 切换时间--月份
let dateValue = ref(todayValue)
const dateChange = (visible) => {
  if (!visible) {
    if (dateValue.value == null || dateValue.value == '' || dateValue.value == void 0) {
      ElMessage({
        type: 'warning',
        message: '日期不能为空！'
      })
      return
    }
    queryData()
  }
}

// 获取请求数据
let val = ref({})
const queryData = () => {
  axiosRequest('/monthStatisticsEntity/statistics', {
    date: dateValue.value
  }).then((res) => {
    if (res && res.code == 200) {
      val.value.res = res.data
      tableData.data = [
        {
          month: dateValue.value,
          sum: res.data.sum,
          khSum: res.data.khSum,
          bcSum: res.data.bcSum
        }
      ]
    }
  })
}

let reason = ref('')
// 表格table和分頁配置
let tableAndPaginationConfig = reactive({
  value: {
    tableStyle: {
      //   height: '440'
    }
    // pagesizeConfig: { current: 1, size: 10, total: 0 }
  }
})
let tableData = reactive({
  column: [
    { label: '月份', field: 'month', align: 'center' },
    { label: '收入(万元)', field: 'sum', align: 'center' },
    { label: '考核合计(万元)', field: 'khSum', align: 'center' },
    // { label: '考核返还(万元)', field: 'dataValue', slotName: 'dataValue', align: 'center' },
    { label: '补偿合计(万元)', field: 'bcSum', align: 'center' }
    // { label: '考核分摊(万元)', field: 'value', align: 'center' }
  ],
  data: []
})
</script>
<template>
  <div class="sumAnalysis">
    <div class="block">
      <label for="dateValue">月份： </label>
      <el-date-picker
        :clearable="false"
        v-model="dateValue"
        id="dateValue"
        type="month"
        value-format="YYYY-MM"
        placeholder="请选择某一月份"
        @visible-change="dateChange($event)"
      />
    </div>
    <!-- <div class="goBack">
        <el-button type="primary" plain @click="goBack">返回首页</el-button>
      </div> -->
    <div class="content">
      <div class="header">{{ month }}月两个细则总结分析</div>
      <div class="part">
        <div class="h1">一、两个细则数据</div>

        <table-view :table-data="tableData" :config="tableAndPaginationConfig"> </table-view>
      </div>
      <div class="part">
        <div class="h1">二、总体情况</div>
        <div class="text">
          {{ year }}年{{ month }}月份发电公司“两个细则”收入
          <span class="val">{{ val.res?.sum }}</span
          >万元，其中考核合计 <span class="val">{{ val.res?.khSum }}</span
          >万元，补偿合计 <span class="val">{{ val.res?.bcSum }}</span
          >万元。
        </div>
      </div>
      <div class="part">
        <div class="h1">三、考核及补偿情况分析</div>
        <div class="h2">（一）考核情况分析</div>
        <div class="text">
          {{ year }}年{{ month }}月份发电公司“两个细则”共计考核{{ val.res?.khSum }}
          万元，考核分析如下：
        </div>
        <div class="text">
          1）顶峰能力考核 <span class="val">{{ val.res?.dfKhSum }}</span
          >万元。
        </div>
        <!-- <div class="text">
          考核原因：<span class="reason val">{{ reason }}</span>
        </div> -->
        <div class="text">
          2）一次调频 <span class="val">{{ val.res?.tpKhSum }}</span
          >万元。
        </div>
        <!-- <div class="text">
          考核原因：<span class="reason val">{{ reason }}</span>
        </div> -->
        <div class="text item">
          小频差考核 <span class="val">{{ val.res?.tpKhXpcSum }}</span
          >万元。考核原因：
          <span class="reason val">{{ reason }}</span>
          。
        </div>
        <div class="text item">
          大频差考核 <span class="val">{{ val.res?.tpKhDpcSum }}</span
          >万元。考核原因：
          <span class="reason val">{{ reason }}</span>
          。
        </div>
        <div class="text item">
          过调节考核 <span class="val">{{ val.res?.tpKhGtjSum }}</span
          >万元。考核原因：
          <span class="reason val">{{ reason }}</span>
          。
        </div>
        <div class="text">
          3）AGC考核 <span class="val">{{ val.res?.agcKhSum }}</span
          >万元。
        </div>
        <div class="text item">
          可用率考核 <span class="val">{{ val.res?.agcKhKylSum }}</span
          >万元。考核原因：
          <span class="reason val">{{ reason }}</span>
          。
        </div>
        <div class="text item">
          频繁投退考核 <span class="val">{{ val.res?.agcKhPfttSum }}</span
          >万元。考核原因：
          <span class="reason val">{{ reason }}</span>
          。
        </div>
        <div class="text item">
          调节速率考核 <span class="val">{{ val.res?.agcKhTjslSum }}</span
          >万元。考核原因：
          <span class="reason val">{{ reason }}</span>
          。
        </div>
        <div class="text item">
          响应时间考核 <span class="val">{{ val.res?.agcKhXysjSum }}</span
          >万元。考核原因：
          <span class="reason val">{{ reason }}</span>
          。
        </div>
        <div class="text">
          3）AVC考核 <span class="val">{{ val.res?.avcKhSum }}</span
          >万元。
        </div>
        <div class="text item">
          投运率考核 <span class="val">{{ val.res?.avcKhTylSum }}</span
          >万元。考核原因：
          <span class="reason val">{{ reason }}</span>
          。
        </div>
        <div class="text item">
          调节合格率考核 <span class="val">{{ val.res?.avcKhTjhglSum }}</span
          >万元。考核原因：
          <span class="reason val">{{ reason }}</span>
          。
        </div>

        <div class="h2">（二）补偿情况分析</div>
        <div class="text">
          {{ year }}年{{ month }}月份 发电公司“两个细则”共计补偿
          <span class="val">{{ val.res?.bcSum }}</span
          >万元，主要补偿分析如下：
        </div>
        <div class="text">
          1）顶峰能力补偿 <span class="val">{{ val.res?.dfnlBcSum }}</span
          >万元。
        </div>
        <div class="text">
          2）有偿调峰补偿 <span class="val">{{ val.res?.yctfBcSum }}</span
          >万元。
        </div>
        <div class="text">
          3）一次调频补偿 <span class="val">{{ val.res?.yctpBcSum }}</span
          >万元。
        </div>
        <div class="text item">
          贡献电量补偿 <span class="val">{{ val.res?.yctpBcGxdlSum }}</span
          >万元。
        </div>
        <div class="text">
          4）AGC补偿 <span class="val">{{ val.res?.agcBcSum }}</span
          >万元。
        </div>
        <div class="text item">
          贡献电量合格率补偿 <span class="val">{{ val.res?.agcBcHglSum }}</span
          >万元。
        </div>
        <div class="text">
          5）有偿无功补偿 <span class="val">{{ val.res?.ycwgBcSum }}</span
          >万元。
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.sumAnalysis {
  position: relative;
  padding: 20px 0 50px;
  .block {
    position: absolute;
    top: 10px;
    left: 50px;
    cursor: pointer;
  }
  .content {
    width: clamp(700px, 70%, 1000px);
    margin: 0 auto;
    font-size: 16px;
    .header {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
    }
    .part {
      .h1 {
        font-weight: bold;
        font-size: 20px;
        line-height: 40px;
      }
      .h2 {
        font-weight: bold;
        font-size: 18px;
        line-height: 40px;
      }
      .text {
        text-indent: 2em;
        line-height: 36px;
        &.item {
          text-indent: 4em;
        }
        .val {
          font-weight: bold;
          border-bottom: 1px solid rgb(44, 62, 80);
          padding: 0 10px;
        }
        .reason {
          text-indent: 0;
          min-width: 300px;
          display: inline-block;
        }
      }
    }
  }
}
</style>
