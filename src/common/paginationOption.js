/*
 * @Date: 2023-10-20 16:17:30
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-12 14:16:30
 * @Description: 分页配置
 */
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
/**修改分页器默认文字 */
zhCn.el.pagination.total = '共 {total} 条'
zhCn.el.pagination.goto = '跳至'
zhCn.el.pagination.pagesize = '条/页'
zhCn.el.pagination.pageClassifier = '页'
export default zhCn
