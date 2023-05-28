declare module TM {
  export type TextData = {
    id: string
    startEle?: Text
    startEleId?: string
    startOffset: number
    startText: string
    startIndex: number
    startBrother: string
    startParentText?: string
    endEle?: Text
    endEleId?: string
    endOffset: number
    endText: string
    endIndex: number
    endBrother: string
    endParentText?: string
    text: string
    single: boolean
    message: string
  }
  
  export type TextMarkOptions = {
    // 目标元素
    container: HTMLElement
    color?: string
    globalAlpha?: number
    data?: TextData[]
    tag?: (node: HTMLElement) => void
    ignoreNode?: (node: ChildNode) => boolean
    selected?: (data: TextData, deleteMark: () => void) => void
    add?: (data: TextData) => Promise<string | undefined>
    mark?: (ctx: CanvasRenderingContext2D, range: Range) => void
    clearMark?: (range: Range) => void
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
}

export default TM
