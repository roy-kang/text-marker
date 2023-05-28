import type TM from './type'
import { 
  createCanvas,
  init,
  initHandler,
  getUUID,
  render,
  getParentInfo,
  getParentText,
  deleteMark
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
      startEleId: startEle.parentElement?.id,
      startOffset: range.startOffset,
      startText: startEle.data,
      startIndex,
      startBrother,
      startParentText: getParentText(startEle, parentEle),
      endEle,
      endEleId: endEle.parentElement?.id,
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

/**
 * 鼠标点击事件
 * @param e 
 * @param isSelection 
 * @param data 
 * @param messages 
 * @param parentEle 
 * @param ctx 
 * @param options 
 * @returns 
 */
const clickHandler = (
  e: MouseEvent, 
  isSelection: boolean, 
  data: TM.TextData[], 
  messages: TM.Message[], 
  parentEle: HTMLElement,
  ctx: CanvasRenderingContext2D, 
  options: TM.TextMarkOptions
) => {
  if (!isSelection && options.selected) {
    const parentRect = parentEle.getBoundingClientRect()
    const { pageX, pageY } = e
    const vx = pageX - window.pageXOffset - parentRect.left
    const vy = pageY - window.pageYOffset - parentRect.top
    for (const msg of messages) {
      for (const pos of msg.range) {
        if (vx >= pos.x && vx <= pos.x + pos.width && vy >= pos.y && vy <= pos.y + pos.height) {
          const item = data.find(d => d.id === msg.id)!
          options.selected(item, () => deleteMark(ctx, data, messages, item.id, options))
          return
        }
      }
    }
  }
  isSelection = false
}

export default function textMarker(options: TM.TextMarkOptions) {
  const { container, color = 'rgba(224, 108, 117)', globalAlpha = 0.3, data = [] } = options

  const messages: TM.Message[] = []
  const canvas = createCanvas(container)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  ctx.globalAlpha = globalAlpha

  const markData: TM.TextData[] = JSON.parse(JSON.stringify(data))

  // 处理下划线
  initHandler(container, markData, options)

  if (markData.length) {
    init(canvas, markData, messages, container, options)
  }

  let isSelection = false
  const mouseupEvent = (e: MouseEvent) => {
    isSelection = mouseupHandler(e, markData, messages, ctx, container, options)
  }
  const clickEvent = (e: MouseEvent) => {
    clickHandler(e, isSelection, markData, messages, container, ctx, options)
  }

  container.addEventListener('mouseup', mouseupEvent)
  container.addEventListener('click', clickEvent)

  return {
    getMarkData() {
      return JSON.parse(JSON.stringify(markData, (_t, key) => {
        if (key?.nodeType === 3) {
          return
        }
        return key
      }))
    },
    refresh() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      messages.length = 0
      init(canvas, markData, messages, container, options)
    },
    destory() {
      container.removeEventListener('mouseup', mouseupEvent)
      container.removeEventListener('click', clickEvent)
    }
  }
}
