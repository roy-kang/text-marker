import * as WM from './type'
import {
  createCanvas,
  init,
  initHandler,
  render,
  deleteMark,
  refreshMark,
  throttle,
  getCanvasTranslateY,
  getMarkData,
  isText,
  selectText,
  defaultAttribute,
  removeAttribute,
  handleAttribute,
  getActualRects
} from './utils'

const defaultOptions = {
  scrollBy: document,
  color: 'rgba(224, 108, 117)',
  globalAlpha: 0.3,
  data: []
}

export { WM as WordMarker }

export default function wordMarker(container: HTMLElement, opts: WM.MarkOptions) {
  const options = { ...defaultOptions, ...opts }

  let lazyLoad = options.lazy === undefined ? container.scrollHeight / 4 > window.innerHeight : options.lazy

  if (lazyLoad && container.scrollHeight <= window.innerHeight * 3) {
    lazyLoad = false
  }
  const messages: WM.Message[] = []
  const canvas = createCanvas(container, lazyLoad, options.zIndex)
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
  const mouseupEvent = () => {
    const selection = window.getSelection()
    if (selection?.toString()) {
      isSelection = true
  
      const markData = getMarkData(container, selection)

      if (!markData) {
        options.callback?.()
      } else {
        const parentRect = container.getBoundingClientRect()
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        const rangeList = getActualRects(ctx, container, range)
        options.callback?.(markData, {
          x: rect.x - parentRect.x,
          y: rect.y - parentRect.y,
          width: rect.width,
          height: rect.height,
          range: rangeList
        })
      }
    } else {
      options.callback?.()
    }
  }

  // 标签高亮
  const highlightMark = (id?: string, force?: boolean) => {
    if (highlightId !== id || force) {
      refreshMark(ctx, messages, options)
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
      }
      highlightId = id
    }
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

    if (highlightId) {
      highlightMark(highlightId, true)
    }
  })

  if (options.callback) {
    container.addEventListener('mouseup', mouseupEvent)
  }
  if (lazyLoad) {
    options.scrollBy.addEventListener('scroll', scrollEvent)
    scrollEvent()
  }

  let currentCheckedId = ''

  return {
    // 自动选中文本
    selectText,
    // 触发标记动作
    triggerMarker: mouseupEvent,
    // 获取完整的标记数据
    getActualMarkData(): WM.MarkData[] {
      return markData.map(data => {
        return { ...data }
      })
    },
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
     * 添加标记
     * @param data 
     */
    addMark(data: WM.MarkData | WM.MarkData[]) {
      if (Array.isArray(data)) {
        markData.push(...data)
        for (const d of data) {
          if (!isText(d.startEle) || !isText(d.endEle)) {
            initHandler(container, markData, options)
          }
          handleAttribute(d, options.attribute)
          render(ctx, d, messages, container, options)
        }
      } else {
        markData.push(data)
        if (!isText(data.startEle) || !isText(data.endEle)) {
          initHandler(container, markData, options)
        }
        handleAttribute(data, options.attribute)
        render(ctx, data, messages, container, options)
      }
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
        let x = Infinity, y = Infinity
        for (const pos of msg.range) {
          x = Math.min(x, pos.x)
          y = Math.min(y, pos.y)
        }
        return { x, y, range: msg.range }
      }
      return
    },
    /**
     * 根据 ID 删除标记
     * @param id 
     */
    deleteMark(id: string | string[]) {
      if (Array.isArray(id)) {
        for (const i of id) {
          deleteMark(ctx, markData, messages, i, options)
        }
      } else {
        deleteMark(ctx, markData, messages, id, options)
      }
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
      const checkedMarks: WM.MarkData[] = []
      let isInclude = false
      for (const msg of messages) {
        for (const pos of msg.range) {
          if (vx >= pos.x && vx <= pos.x + pos.width && vy >= pos.y && vy <= pos.y + pos.height) {
            const item = markData.find(d => d.id === msg.id)
            if (item) {
              checkedMarks.push(item)
              if (!isInclude) {
                isInclude = currentCheckedId === item.id
              }
            }
          }
        }
      }
      if (!checkedMarks.length) {
        currentCheckedId = ''
        return
      }
      if (!isInclude) {
        currentCheckedId = checkedMarks[0].id
        return { ...checkedMarks[0] }
      }
      for (let i = 0; i < checkedMarks.length; i++) {
        const item = checkedMarks[i]
        if (item.id === currentCheckedId) {
          if (i === checkedMarks.length - 1) {
            currentCheckedId = checkedMarks[0].id
            return { ...checkedMarks[0] }
          }
          currentCheckedId = checkedMarks[i + 1].id
          return { ...checkedMarks[i + 1] }
        }
      }
      return
    },
    /**
     * 高亮标记
     * @param id 
     */
    highlightMark,
    /**
     * 重新刷新标记
     */
    refresh() {
      refreshMark(ctx, messages, options)
    },
    /**
     * 清除所有标记
     */
    clear() {
      markData = []
      messages.length = 0
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const allEle = document.querySelectorAll(`[${defaultAttribute}]`)
      if (allEle.length) {
        Array.from(allEle).forEach(ele => {
          removeAttribute(ele as HTMLElement, defaultAttribute)
        })
      }
    },
    /**
     * 销毁所有事件
     */
    destroy() {
      if (options.callback) {
        container.removeEventListener('mouseup', mouseupEvent)
      }
      if (lazyLoad) {
        options.scrollBy.removeEventListener('scroll', scrollEvent)
      }
      this.clear()
      canvas.parentElement?.remove()
    },
    /**
     * @deprecated 请使用 destroy 方法
     */
    destory() {
      if (options.callback) {
        container.removeEventListener('mouseup', mouseupEvent)
      }
      if (lazyLoad) {
        options.scrollBy.removeEventListener('scroll', scrollEvent)
      }
      this.clear()
      canvas.parentElement?.remove()
    }
  }
}
