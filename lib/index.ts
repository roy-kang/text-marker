import type WM from './type'
import {
  createCanvas,
  init,
  initHandler,
  getUUID,
  render,
  getParentInfo,
  getParentText,
  deleteMark,
  getAttribute,
  refreshMark,
  throttle,
  getCanvasTranslateY
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
  e: MouseEvent,
  data: WM.MarkData[] = [],
  messages: WM.Message[],
  ctx: CanvasRenderingContext2D,
  parentEle: HTMLElement,
  options: WM.WordMarkOptions
) => {
  const selection = window.getSelection()
  let isSelection = false
  if (selection?.toString()) {
    isSelection = true
    const range = selection.getRangeAt(0)

    const startEle = range.startContainer as Text
    const endEle = range.endContainer as Text

    const [startBrother, startIndex] = getParentInfo(startEle, parentEle)
    const [endBrother, endIndex] = getParentInfo(endEle, parentEle)

    const position: WM.MarkData = {
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
      options.add(e, position).then((msg?: string) => {
        if (msg) {
          position.message = msg
        }
        selection?.removeAllRanges()
        render(ctx, position, messages, parentEle, options)
      })
    } else {
      selection?.removeAllRanges()
      render(ctx, position, messages, parentEle, options)
    }
  }
  return isSelection
}

const defaultOptions = {
  scrollBy: document,
  color: 'rgba(224, 108, 117)',
  globalAlpha: 0.3,
  data: [],
  attribute: 'id',
}

export default function wordMarker(container: HTMLElement, opts: WM.MarkOptions) {
  const options = { ...defaultOptions, ...opts }

  let lazyLoad = options.lazy === undefined ? container.scrollHeight / 4 > window.innerHeight : options.lazy

  if (lazyLoad && container.scrollHeight <= window.innerHeight * 3) {
    lazyLoad = false
  }
  const messages: WM.Message[] = []
  const canvas = createCanvas(container, lazyLoad)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = options.color
  ctx.globalAlpha = options.globalAlpha

  let markData: WM.MarkData[] = JSON.parse(JSON.stringify(options.data))

  // 初始化还原元素绑定及tag处理
  if (options.tag || markData.length) {
    initHandler(container, markData, options)
    // 清除没有找到元素的错误标记
    markData = markData.filter(d => d.startEle && d.endEle)
  }

  if (markData.length) {
    init(canvas, markData, messages, container, options)
  }

  let highlightId: string | undefined = ''
  let isSelection = false
  const mouseupEvent = (e: MouseEvent) => {
    isSelection = mouseupHandler(e, markData, messages, ctx, container, options)
  }
  const scrollEvent = throttle(() => {
    const parentRect = container.getBoundingClientRect()
    let y = 0
    if (parentRect.y >= -window.innerHeight) {
      y = 0
    } else if (parentRect.y <= window.innerHeight * 3 - container.scrollHeight) {
      y = container.scrollHeight - window.innerHeight * 3
    } else {
      y = -window.innerHeight - parentRect.y
    }
    canvas.style.transform = `translateY(${y}px)`
    refreshMark(ctx, messages, options)
  })

  container.addEventListener('mouseup', mouseupEvent)
  if (lazyLoad) {
    options.scrollBy.addEventListener('scroll', scrollEvent)
  }

  return {
    /**
     * 获取所有的标记数据
     * @returns 获取标记数据
     */
    getMarkData(): WM.MarkData[] {
      return JSON.parse(JSON.stringify(markData, (_t, key) => {
        if (key?.nodeType === 3) {
          return
        }
        return key
      }))
    },
    /**
     * 修改标记备注
     * @param id 
     * @param msg 
     */
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
    /**
     * 根据 ID 获取标记位置
     * @param id 
     * @returns 
     */
    getPosition(id: string) {
      const msg = messages.find(d => d.id === id)
      if (msg) {
        let x = 0, y = 0
        for (const pos of msg.range) {
          x = Math.min(x, pos.x)
          y = Math.min(y, pos.y)
        }
        return { x, y }
      }
      return
    },
    /**
     * 根据 ID 删除标记
     * @param id 
     */
    deleteMark(id: string) {
      deleteMark(ctx, markData, messages, id, options)
    },
    /**
     * 根据 x y 获取该位置是否有标记
     * @param x 
     * @param y 
     * @returns 
     */
    checkMark(x: number, y: number) {
      if (isSelection) {
        isSelection = false
        return
      }
      const parentRect = container.getBoundingClientRect()
      const vx = x - window.scrollX - parentRect.left
      const vy = y - window.scrollY - parentRect.top
      for (const msg of messages) {
        for (const pos of msg.range) {
          if (vx >= pos.x && vx <= pos.x + pos.width && vy >= pos.y && vy <= pos.y + pos.height) {
            const item = markData.find(d => d.id === msg.id)
            return item ? { ...item } : undefined
          }
        }
      }
      return
    },
    /**
     * 高亮标记
     * @param id 
     */
    lighthighMark(id?: string) {
      if (highlightId !== id) {
        if (id) {
          const msg = messages.find(d => d.id === id)
          const translateY = getCanvasTranslateY(canvas)
          
          if (msg) {
            for (const pos of msg.range) {
              const { x, y, width, height } = pos
              let ay = y
              if (y >= translateY && y <= translateY + window.innerHeight * 3) {
                ay = y - translateY
              }
              options.highlight?.(ctx, { x, y: ay, width, height })
            }
          }
        } else {
          refreshMark(ctx, messages, options)
        }
        highlightId = id
      }
    },
    /**
     * 重新刷新标记
     */
    refresh() {
      refreshMark(ctx, messages, options)
    },
    /**
     * 销毁所有事件
     */
    destory() {
      container.removeEventListener('mouseup', mouseupEvent)
      if (lazyLoad) {
        options.scrollBy.removeEventListener('scroll', scrollEvent)
      }
    }
  }
}
