import type TM from './type'
import { 
  createCanvas,
  init,
  initHandler,
  getUUID,
  render,
  getParentInfo,
  getParentText,
  deleteMark,
  getAttribute
} from './utils'

/**
 * 鼠标up事件，用于获取选中的文本
 * @param _e 
 * @param data 
 * @param messages 
 * @param ctx 
 * @param parentEle 
 * @param options 
 * @returns 
 */
const mouseupHandler = (
  _e: MouseEvent, 
  data: TM.TextData[] = [], 
  messages: TM.Message[], 
  ctx: CanvasRenderingContext2D,
  parentEle: HTMLElement, 
  options: TM.TextMarkOptions
) => {
  const selection = window.getSelection()
  let isSelection = false
  if (selection?.toString()) {
    isSelection = true
    const range = selection.getRangeAt(0)

    const startEle = range.startContainer as Text
    const endEle = range.endContainer as Text

    const [ startBrother, startIndex ] = getParentInfo(startEle, parentEle)
    const [ endBrother, endIndex ] = getParentInfo(endEle, parentEle)

    const position: TM.TextData = {
      id: getUUID(10),
      startEle,
      startEleId: getAttribute(startEle.parentElement, options.attribute),
      startOffset: range.startOffset,
      startText: startEle.data,
      startIndex,
      startBrother,
      startParentText: getParentText(startEle, parentEle),
      endEle,
      endEleId: getAttribute(endEle.parentElement, options.attribute),
      endOffset: range.endOffset,
      endText: endEle.data,
      endIndex,
      endBrother,
      endParentText: getParentText(endEle, parentEle),
      text: selection.toString(),
      message: '',
      single: startEle === endEle
    }

    data.push(position)

    if (options.add) {
      options.add(position).then((msg?: string) => {
        if (msg) {
          position.message = msg
        }
        render(ctx, position, messages, parentEle, options)
      })
    } else {
      render(ctx, position, messages, parentEle, options)
    }
  }
  selection?.removeAllRanges()
  return isSelection
}

export default function textMarker(options: TM.TextMarkOptions) {
  const { container, color = 'rgba(224, 108, 117)', globalAlpha = 0.3, data = [] } = options

  const messages: TM.Message[] = []
  const canvas = createCanvas(container)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  ctx.globalAlpha = globalAlpha

  const markData: TM.TextData[] = JSON.parse(JSON.stringify(data))

  // 初始化还原元素绑定及tag处理
  initHandler(container, markData, options)

  if (markData.length) {
    init(canvas, markData, messages, container, options)
  }

  let isSelection = false
  const mouseupEvent = (e: MouseEvent) => {
    isSelection = mouseupHandler(e, markData, messages, ctx, container, options)
  }

  container.addEventListener('mouseup', mouseupEvent)

  return {
    getMarkData() {
      return JSON.parse(JSON.stringify(markData, (_t, key) => {
        if (key?.nodeType === 3) {
          return
        }
        return key
      }))
    },
    modifyMark(id: string, msg: string) {
      const item = markData.find(d => d.id === id)
      if (item) {
        item.message = msg
      }
      const msgItem = messages.find(d => d.id === id)
      if (msgItem) {
        msgItem.message = msg
      }
    },
    deleteMark(id: string) {
      deleteMark(ctx, markData, messages, id, options)
    },
    checkMark(x: number, y: number) {
      if (isSelection) {
        isSelection = false
        return
      }
      const parentRect = container.getBoundingClientRect()
      const vx = x - window.pageXOffset - parentRect.left
      const vy = y - window.pageYOffset - parentRect.top
      for (const msg of messages) {
        for (const pos of msg.range) {
          if (vx >= pos.x && vx <= pos.x + pos.width && vy >= pos.y && vy <= pos.y + pos.height) {
            const item = markData.find(d => d.id === msg.id)!
            return item ? { ...item } : undefined
          }
        }
      }
      return
    },
    refresh() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      messages.length = 0
      init(canvas, markData, messages, container, options)
    },
    destory() {
      container.removeEventListener('mouseup', mouseupEvent)
    }
  }
}
