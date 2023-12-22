import wordMarker from '../lib'
import { str } from './abc'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = str

const tmarker = wordMarker(document.querySelector<HTMLDivElement>('#app')!, {
  data: JSON.parse(localStorage.getItem('markData') || '[]'),
  tag(node) {
    if (node.nodeType === 1) {
      const text = node?.innerText || ''
      // 处理下划线
      if (/^_*$/.test(text)) {
        node.style.pointerEvents = 'none'
      }
    }
  },
  ignoreNode(node) {
    const text = (node as Text).data || ''
    // 处理下划线
    return /^_*$/.test(text)
  },
  add(data: any) {
    return new Promise((resolve) => {
      if (data) {
        tmarker.addMark(data)
        window.md.push(data)
        localStorage.setItem('markData', JSON.stringify(tmarker.getMarkData()))
        console.log(data)
        // const msg = prompt('请输入批注', '这里需要一个备注信息')
        // if (msg !== null) {
        //   resolve(msg)
        // }
      }
    })
  }
})

window.wm = tmarker
window.md = []

let activeTable: HTMLElement | null = null, oldBackgroundColor = ''
document.querySelector('#app')!.addEventListener('dblclick', (e: Event) => {
  const paths = e.composedPath()
  let ele: any = null
  while (paths.length) {
    ele = paths.shift() as HTMLElement
    if (ele.tagName === 'TABLE') {
      break
    }
    ele = null
  }
  if (ele) {
    oldBackgroundColor = ele.style.backgroundColor
    ele.style.backgroundColor = 'lightgrey'
    activeTable = ele
  }
})

document.querySelector('#app')!.addEventListener('click', (e: Event) => {
  const { pageX, pageY } = e as PointerEvent

  const marker = tmarker.checkMark(pageX, pageY)
  if (marker) {
    confirm(`批注内容：${marker.message}\n是否删除批注？`) && tmarker.deleteMark(marker.id)
  }

  if (activeTable) {
    activeTable.style.backgroundColor = oldBackgroundColor
    activeTable = null
    oldBackgroundColor = ''
  }
})
