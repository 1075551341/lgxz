/*
 * @Date: 2024-01-16 16:33:52
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-17 09:06:37
 * @Description: 并发处理
 */
class bothMultiTask {
  constructor(task = 2) {
    this.currentTask = task
    this.runningTask = 0
    this.taskArr = []
  }
  _add(task) {
    return new Promise((resolve, reject) => {
      this.taskArr.push({
        task,
        resolve,
        reject
      })
      this._run()
      //   console.log('this.taskArr::: ', this.taskArr)
    })
  }
  _run() {
    // console.log('this.taskArr::: ', this.taskArr)
    while (this.runningTask < this.currentTask && this.taskArr.length) {
      this.runningTask++
      const { task, resolve, reject } = this.taskArr.shift()
      task()
        .then(resolve, reject)
        .finally(() => {
          this.runningTask--
          this._run()
        })
    }
  }
}

// 测试
const tasks = new bothMultiTask()
const timeout = (delay, name) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(console.log('name::: ', `任务${name}开始`))
    }, delay)
  })
}
const addTask = (delay, name) => {
  tasks
    ._add(() => timeout(delay, name))
    .then(() => {
      console.log('name::: ', `任务${name}完成`)
    })
}

addTask(1000, '111')
addTask(3000, '222')
addTask(5000, '333')
addTask(2000, '444')
addTask(500, '555')
