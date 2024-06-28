export type MarkData = {
  // 当前数据id
  id: string
  // 开始文本元素
  startEle?: Text
  // 开始文本元素id
  startEleId?: string
  // 开始文本偏移量
  startOffset: number
  // 开始文本
  startText: string
  // 开始文本父级兄弟元素集合
  startBrother: string
  // 开始文本父级元素文本
  startParentText?: string
  // 结束文本元素
  endEle?: Text
  // 结束文本元素id
  endEleId?: string
  // 结束文本偏移量
  endOffset: number
  // 结束文本
  endText: string
  // 结束文本父级兄弟元素集合
  endBrother: string
  // 结束文本父级元素文本
  endParentText?: string
  // 选中文本
  text: string
  // 是否同一个文本元素
  single: boolean
  // 选中文本对应的标记消息
  message: string
}

type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export type MarkOptions = {
  // 滚动元素, 默认为 document
  scrollBy?: HTMLElement | Document
  // 是否懒加载
  lazy?: boolean
  // 标记元素指定的唯一属性字段
  attribute?: string
  // 标记的样式
  color?: string
  // 标记的透明度
  globalAlpha?: number
  // 层级
  zIndex?: number
  // 标记的数据
  data?: MarkData[]
  // 初始化时处理所有元素
  tag?: (node: HTMLElement) => void
  // 是否忽略某个元素
  ignoreNode?: (node: ChildNode) => boolean
  // 标记的数据添加前的回调
  add?: (data?: MarkData, range?: Range) => void
  // 自定义标记的样式
  mark?: (ctx: CanvasRenderingContext2D, range: Range) => void
  // 高亮标记的样式
  highlight?: (ctx: CanvasRenderingContext2D, range: Range) => void
}

export type Range = {
  x: number
  y: number
  width: number
  height: number
}

export type Message = {
  id: string
  range: Range[]
  message: string
}

export type WordMarkOptions = RequiredBy<MarkOptions, 'scrollBy' | 'color' | 'globalAlpha' | 'data'>
