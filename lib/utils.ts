import type WM from './type'

/**
 * 获取随机字符串
 * @param num 
 * @returns 
 */
export const getUUID = (num: number) => {
  let str = ''
  for (let i = 0; i < num; i++) {
    const v = Math.random() * 62 | 0
    if (v < 10) {
      str += v
    } else if (v < 36) {
      str += String.fromCharCode(65 + v - 10)
    } else {
      str += String.fromCharCode(97 + v - 36)
    }
  }
  return str
}

// 判断是否是文本节点
export const isText = (val: any) => Object.prototype.toString.call(val) === '[object Text]'

/**
 * 节流函数
 * @param fn 
 * @param lazy 
 */
export const throttle = (fn: () => void, lazy: number = 50) => {
  let timer: number | null = null
  return () => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn()
      timer = null
    }, lazy)
  }
}

/**
 * 获取canvas的Y轴偏移量
 * @param canvas 
 * @returns 
 */
export const getCanvasTranslateY = (canvas: HTMLCanvasElement) => {
  const match = /translateY\((\d+(\.\d+)?)px\)/.exec(canvas.style.transform)
  return match ? Number(match[1]) : 0
}

/**
 * 获取当前文本元素的祖先元素信息用于定位
 * @param ele 
 * @param parentEle 
 * @returns 
 */
export const getParentInfo = (ele: Text, parentEle: HTMLElement): [string, number] => {
  let eleIndex = 0, parent = ele.parentElement!
  if (parent?.parentElement && parent.parentElement !== parentEle) {
    parent = parent.parentElement
  }

  const tagName = Array.from(parent.children).map((item, index) => {
    if (item === ele.parentElement) {
      eleIndex = index
    }
    return item.localName
  }).join(',')

  return [tagName, eleIndex]
}

/**
 * 获取父级元素下的所有文本
 * @param ele 
 * @param parentEle 
 * @returns 
 */
export const getParentText = (ele: Text, parentEle: HTMLElement) => {
  let parent = ele.parentElement!
  if (parent?.parentElement === parentEle) {
    return ''
  }
  return parent.parentElement?.textContent || ''
}

/**
 * 创建canvas
 * @param parentEle 
 * @returns 
 */
export const createCanvas = (parentEle: HTMLElement, lazyLoad: boolean, zIndex = 1) => {
  const div = document.createElement('div')
  div.setAttribute('style', `position: absolute; top: 0; left: 0; z-index: ${zIndex}; pointer-events: none;`)
  const canvas = document.createElement('canvas')
  canvas.width = parentEle.scrollWidth
  canvas.height = lazyLoad ? window.innerHeight * 3 : parentEle.scrollHeight
  div.appendChild(canvas)
  parentEle.appendChild(div)
  return canvas
}

/**
 * 获取元素的所有祖先元素链
 * @param ele 
 * @returns 
 */
const getComposedPath = (ele: Text) => {
  const path: HTMLElement[] = []
  let e = ele.parentElement
  while (e) {
    path.push(e)
    e = e?.parentElement || null
  }
  return path
}

/**
 * 获取第一个公共祖先元素
 * @param ele 
 * @param path 
 * @returns 
 */
const getParent = (ele: Text, path: HTMLElement[]) => {
  let e = ele.parentElement
  while (e) {
    if (path.includes(e)) {
      return e
    }
    e = e?.parentElement || null
  }
  return null
}

/**
 * 获取同一祖先元素下的不同父级元素
 * @param ele 
 * @param grandfather 
 * @returns 
 */
const getFather = (ele: Text, grandfather: HTMLElement | null) => {
  let e = ele?.parentElement
  while (e) {
    if (e === grandfather) {
      return e
    }
    e = e?.parentElement || null
  }
  return null
}

let isReturn = false, isStart = false
/**
 * 获取所有的文本节点
 * @param ele 
 * @param endEle 
 * @returns 
 */
const getAllText = (ele: ChildNode | null | undefined, startEle: Text, endEle: Text, ignore?: (node: ChildNode) => boolean) => {
  const texts: Text[] = []
  if (!ele || isReturn) {
    return texts
  }
  const children = Array.from(ele.childNodes)

  children.forEach(item => {
    if (isReturn) {
      return
    }
    if (item.nodeType === 1) {
      texts.push(...getAllText(item, startEle, endEle, ignore))
    } else if (item.nodeType === 3 && !ignore?.(item)) {
      if (!isStart && item === startEle) {
        isStart = true
      }
      isStart && texts.push(item as Text)
    }
    if (item === endEle) {
      isReturn = true
    }
  })
  return texts
}

/**
 * 获取两个元素间的所有子孙元素
 * @param startEle 
 * @param endEle 
 * @returns 
 */
const getAllTextNode = (startEle?: Text, endEle?: Text, ignore?: (node: ChildNode) => boolean) => {
  if (!startEle || !endEle) {
    return []
  }
  if (startEle === endEle) {
    return [startEle]
  }
  const startParentEles = getComposedPath(startEle)
  const grandfather = getParent(endEle, startParentEles)
  const startFather = getFather(startEle, grandfather)
  const endFather = getFather(endEle, grandfather)
  if (!startFather || !endFather) {
    return []
  }

  const eles: Text[] = []
  let se: ChildNode | null | undefined = startFather
  while (se !== endFather.nextSibling) {
    isReturn = false
    isStart = false
    eles.push(...getAllText(se, startEle, endEle, ignore))
    se = se?.nextSibling
  }
  return eles
}

/**
 * 刷新标记
 * @param ctx 
 * @param messages 
 * @param container 
 * @param options 
 */
export const refreshMark = (
  ctx: CanvasRenderingContext2D,
  messages: WM.Message[],
  options: WM.WordMarkOptions
) => {
  const canvas = ctx.canvas
  ctx.fillStyle = options.color
  ctx.globalAlpha = options.globalAlpha
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const translateY = getCanvasTranslateY(canvas)

  messages.forEach(item => {
    item.range.forEach(range => {
      const { x, y, width, height } = range
      if (y >= translateY && y <= translateY + window.innerHeight * 3) {
        const ay = y - translateY
        if (options.mark) {
          options.mark(ctx, { x, y: ay, width, height })
        } else {
          ctx.fillRect(x, ay, width, height)
        }
      }
    })
  })
}

/**
 * 删除标记
 * @param ctx 
 * @param data 
 * @param messages 
 * @param id 
 * @param options
 */
export const deleteMark = (
  ctx: CanvasRenderingContext2D,
  data: WM.MarkData[],
  messages: WM.Message[],
  id: string,
  options: WM.WordMarkOptions
) => {
  const dataIndex = data.findIndex(item => item.id === id)
  if (dataIndex > -1) {
    data.splice(dataIndex, 1)
  }
  const msgIndex = messages.findIndex(item => item.id === id)
  if (msgIndex > -1) {
    messages.splice(msgIndex, 1)
    refreshMark(ctx, messages, options)
  }
}

/**
 * 高亮标记
 * @param ctx 
 * @param data 
 * @param messages 
 * @param container 
 * @param options
 */
export const render = (
  ctx: CanvasRenderingContext2D,
  data: WM.MarkData,
  messages: WM.Message[],
  container: HTMLElement,
  options: WM.WordMarkOptions
) => {
  const allTextNode = getAllTextNode(data.startEle, data.endEle, options.ignoreNode)
  const rectInfo: WM.Range[] = []

  allTextNode.forEach((item, index) => {
    const range = document.createRange()
    range.setStart(item, index === 0 ? data.startOffset : 0)
    range.setEnd(item, index === allTextNode.length - 1 ? data.endOffset : item.data.length)

    const parentRect = container.getBoundingClientRect()
    const clientRects = range.getClientRects()

    for (let i = 0; i < clientRects.length; i++) {
      const rect = clientRects[i]
      const x = rect.left - parentRect.left
      const y = rect.top - parentRect.top
      const width = rect.right - rect.left
      const height = rect.bottom - rect.top

      const translateY = getCanvasTranslateY(ctx.canvas)
      const ay = y - translateY

      if (options.mark) {
        options.mark(ctx, { x, y: ay, width, height })
      } else {
        ctx.fillRect(x, ay, width, height)
      }
      rectInfo.push({ x, y, width, height })
    }
  })

  messages.push({
    id: data.id,
    range: rectInfo,
    message: data.message
  })
}

/**
 * 获取元素的属性值
 * @param el 
 * @param attribute 
 * @returns 
 */
export const getAttribute = (el?: HTMLElement | null, attribute?: string) => {
  return el?.getAttribute(attribute || 'id') || ''
}

/**
 * 自动标记数据
 * @param startNode 
 * @param start 
 * @param endNode 
 * @param end
 */
export function selectText(startNode: HTMLElement, start: number, endNode: HTMLElement, end: number) {
  let range = document.createRange()
  range.setStart(startNode, start)
  range.setEnd(endNode, end)
  let selection = window.getSelection()
  if (selection) {
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

/**
 * 获取标记数据
 * @param container 
 * @param selection 
 * @param options 
 * @returns 
 */
export const getMarkData = (container: HTMLElement, selection: Selection, options: WM.WordMarkOptions) => {
  const range = selection.getRangeAt(0)
  const startEle = range.startContainer as Text
  const endEle = range.endContainer as Text

  const [startBrother, startIndex] = getParentInfo(startEle, container)
  const [endBrother, endIndex] = getParentInfo(endEle, container)

  const markData = {
    id: getUUID(10),
    startEle,
    startEleId: getAttribute(startEle.parentElement, options.attribute),
    startOffset: range.startOffset,
    startText: startEle.data,
    startIndex,
    startBrother,
    startParentText: getParentText(startEle, container),
    endEle,
    endEleId: getAttribute(endEle.parentElement, options.attribute),
    endOffset: range.endOffset,
    endText: endEle.data,
    endIndex,
    endBrother,
    endParentText: getParentText(endEle, container),
    text: selection.toString(),
    message: '',
    single: startEle === endEle
  }
  return markData
}

// 获取所有子孙元素的文本节点
const getChildrenAllText = (ele: HTMLElement) => {
  const texts: Text[] = []
  const children = Array.from(ele.childNodes)
  children.forEach(item => {
    if (item.nodeType === 1) {
      texts.push(...getChildrenAllText(item as HTMLElement))
    } else if (item.nodeType === 3) {
      texts.push(item as Text)
    }
  })
  return texts
}

/**
 * 对初始化的数据进行元素绑定
 * @param node 
 * @param data 
 */
const checkNode = (node: HTMLElement, data: WM.MarkData[], attribute: string) => {
  const text = node.textContent
  for (const item of data) {
    if (
      !isText(item.startEle) &&
      (item.startEleId
        ? item.startEleId === getAttribute(node, attribute)
        : (!item.startParentText || item.startParentText === text)
      )
    ) {
      if (node.nodeType === 1) {
        const tags = Array.from(node?.children).map(n => n.localName).join(',')
        if (tags !== item.startBrother) {
          continue
        }
        const allText = getChildrenAllText(node)

        for (const text of allText) {
          if (text.data === item.startText) {
            item.startEle = text
            if (item.single) {
              item.endEle = item.startEle
            }
            break
          }
        }
      }
    }
    if (
      !isText(item.endEle) && !item.single &&
      (item.endEleId
        ? item.endEleId === getAttribute(node, attribute)
        : (!item.endParentText || item.endParentText === text)
      )
    ) {
      if (node.nodeType === 1) {
        const tags = Array.from(node?.children).map(n => n.localName).join(',')
        if (tags !== item.endBrother) {
          continue
        }
        const allText = getChildrenAllText(node)

        for (const text of allText) {
          if (text.data === item.endText) {
            item.endEle = text
            break
          }
        }
      }
    }
  }
}

/**
 * 对存储的数据进行处理
 * @param container 
 * @param data 
 * @param options
 */
export const initHandler = (container: HTMLElement, data: WM.MarkData[], options: WM.WordMarkOptions) => {
  const children = Array.from(container.childNodes) as HTMLElement[]
  data.length && checkNode(container, data, options.attribute)
  while (children.length) {
    const child = children.shift()!
    child && options.tag?.(child)

    // 处理子元素
    data.length && checkNode(child, data, options.attribute)
    for (let i = 0; i < child?.childNodes.length; i++) {
      children.push(child?.childNodes[i] as HTMLElement)
    }
  }
}

/**
 * 初始化
 * @param canvas 
 * @param data 
 * @param messages 
 * @param container 
 * @param options
 */
export const init = (
  canvas: HTMLCanvasElement,
  data: WM.MarkData[],
  messages: WM.Message[],
  container: HTMLElement,
  options: WM.WordMarkOptions
) => {
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  data.forEach(item => {
    render(ctx, item, messages, container, options)
  })
}
