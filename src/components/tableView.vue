<!--
 * @Date: 2023-10-18 13:32:16
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-16 15:47:01
 * @Description: 自定义封裝(表格+分頁)
-->

<script setup>
import { dataPreFix } from '../common/prefix.js'
const emit = defineEmits([
  'command', // 按钮组事件
  'size-change', // pageSize事件
  'current-change', // currentPage按钮组事件
  'selection-change' // 当选择项发生变化时会触发该事件
  // 'row-click', // 当某一行被点击时会触发该事件
  // 'cell-click', // 当某个单元格被点击时会触发该事件
  // 'pagination-change', // currentPage或者pageSize改变触发
  // 'sort-change' // 列排序发生改变触发
])
// 获取父元素传过来的数据
const tables = defineProps({
  tableData: Object,
  config: Object
})

//每页显示条数
const handleSizeChange = (val) => {
  // console.log(`${val} items per page`)
}
// 切换页码
const handleCurrentChange = (val) => {
  // console.log(`当前页: ${val}`)
  emit('current-change', val)
}

// 查看
const handleEditFn = (index, row) => {
  emit('command', index, row)
  // console.log('handleEditFn查看', index, row)
}

const multipleTableRef = ref()
const multipleSelection = ref([])
const toggleSelection = (rows) => {
  // console.log('rows::: ', rows)
  if (rows) {
    rows.forEach((row) => {
      multipleTableRef.value.toggleRowSelection(row, undefined)
    })
  } else {
    multipleTableRef.value.clearSelection()
  }
  // emit('selection-change', 123)
}
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}
</script>
<template>
  <div class="tables">
    <!-- 1.页面顶部header  新建，删除等 -->
    <!-- <div class="header">
      <slot name="header">
        <div class="title">{{ title }}</div>
        <div class="handler">
          <slot name="headerHandler"></slot>
        </div>
      </slot>
    </div> -->
    <div class="table">
      <div style="margin: 10px 0" v-if="tables.tableData?.selectAll?.show">
        <slot :name="tables.tableData?.selectAll?.slotName">
          <el-button @click="toggleSelection()">{{
            multipleSelection.value ? '取消全选' : '全选'
          }}</el-button>
        </slot>
      </div>
      <el-table
        ref="multipleTableRef"
        :data="tables.tableData.data"
        border
        :height="tables.config.value.tableStyle && tables.config.value.tableStyle.height"
        highlight-current-row
        empty-text="暂无数据"
        :default-expand-all="tables.config.value?.treeExpandAll"
        :tree-props="{ children: 'children' }"
        @selection-change="handleSelectionChange"
      >
        <!-- 勾选列  和 序号列 根据 showSelectColumn\showIndexColumn 来决定是否显示-->
        <!-- el-table-column来显示表头 -->
        <el-table-column
          v-if="tables.tableData.showSelectColumn"
          type="selection"
          min-width="60"
          label="选择"
          align="center"
        ></el-table-column>
        <!-- label表示表头某一列具体名称 -->
        <el-table-column
          v-if="tables.tableData.showIndexColumn"
          type="index"
          label="序号"
          min-width="40"
        ></el-table-column>
        <template v-for="propItem in tables.tableData.column" :key="propItem.label">
          <el-table-column
            v-bind="propItem"
            show-overflow-tooltip
            resizable
            :prop="propItem.field"
            :label="propItem.label"
          >
            <!-- scope.row会存放表格中的所有行的数据，scope.row[propItem.prop]则取出某一行 -->
            <template #default="scope">
              <!-- 作用域插槽，向父组件传递name与row属性 -->
              <!-- 动态插槽名，根据父组件传入的参数slotName决定，若slotName不存在，则没有name属性，认作默认插槽-->
              <!--在slot中 只在不修改数据有效，如合格率保留n位小数添加%，则单独添加.toFixed(n) -->
              <slot :name="propItem.slotName" :row="scope.row">
                {{ dataPreFix(scope.row[propItem.field]) }}
              </slot>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </div>
    <!-- 分页  pagesizeConfig决定分页显示与否-->
    <div class="pagination footer" v-show="tables.config.value?.pagesizeConfig">
      <!-- layout="total, sizes, prev, pager, next, jumper" -->
      <slot name="footer">
        <el-pagination
          :currentPage="tables.config.value.pagesizeConfig?.current || 1"
          :page-size="tables.config.value.pagesizeConfig?.size || 10"
          small
          background
          layout="prev, pager, next, jumper"
          :total="parseInt(tables.config.value.pagesizeConfig?.total) || 0"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          v-debounce="500"
        />
      </slot>
    </div>
  </div>
</template>

<style scoped lang="less">
.tables {
  padding: 10px 0 5px;
  .table {
    flex: 1;
    position: relative;
  }
  .pagination {
    padding: 10px 0;
  }
}
</style>
