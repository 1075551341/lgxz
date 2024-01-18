/*
 * @Date: 2024-01-09 14:05:36
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-09 15:50:21
 * @Description: 下载文件
 */
import { getCurrentDate } from './formateDate'
export const downLoad = (url, filename) => {
  fetch(url, {
    headers: new Headers({
      Origin: location.origin
    }),
    mode: 'cors'
  })
    .then((res) => {
      if (res.status == 200) {
        // 返回的.blob()为promise，然后生成了blob对象，此方法获得的blob对象包含了数据类型，十分方便
        // console.log('res.blob()::: ', res.blob())
        return res.blob()
      }

      // throw new Error(`status: ${response.status}.`)
    })
    .then((blob) => {
      download(blob, filename)
      // console.log('blob::: ', blob,filename)
    })
}
function download(blob, name = 'download.xlsx') {
  const a = document.createElement('a')
  let filename = name.split('.')[0] + getCurrentDate() + '.' + name.split('.')[1]
  a.download = filename //指定下载文件名
  /**解决Failed to execute ‘createObjectURL‘ on ‘URL‘报错 */
  let binaryData = []
  binaryData.push(blob)

  const blobUrl = window.URL.createObjectURL(
    new Blob(binaryData, { type: 'application/octet-stream' })
  )
  //   console.log('blobUrl::: ', binaryData, blobUrl)
  a.href = blobUrl
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(blobUrl)
}
