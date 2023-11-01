# work-marker

word-marker is a library used to tag web page text, which can store tag information.

Support for custom tag styles, highlighting, and more

# demo

[在线地址](https://roy-kang.github.io/text-marker/wm.html)

```ts
import wordMarker from "word-marker";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = "文本标记";

const wMarker = wordMarker(document.querySelector<HTMLDivElement>("#app")!, {
  data: [],
});
```

# Options

```ts
type MarkOptions = {
  // 是否懒加载，默认为高度超过窗口 4 倍开启
  lazy?: boolean;
  // 滚动元素, 如果懒加载开启则默认为 document
  scrollBy?: HTMLElement | Document;
  // 标记元素指定的唯一属性字段
  attribute?: string;
  // 标记的样式
  color?: string;
  // 标记的透明度
  globalAlpha?: number;
  // 层级
  zIndex?: number;
  // 标记的数据
  data?: MarkData[];
  // 初始化时处理所有元素
  tag?: (node: HTMLElement) => void;
  // 是否忽略某个元素
  ignoreNode?: (node: ChildNode) => boolean;
  // 标记的数据添加前的回调
  add?: (data?: MarkData, range?: Range) => void;
  // 自定义标记的样式
  mark?: (ctx: CanvasRenderingContext2D, range: Range) => void;
  // 高亮标记的样式
  highlight?: (ctx: CanvasRenderingContext2D, range: Range) => void;
};
```

# Returns

```ts
function wordMarker(
  container: HTMLElement,
  options: MarkOptions
): {
  /**
   * 获取所有的标记数据
   * @returns 获取标记数据
   */
  getMarkData(): MarkData[];
  /**
   * 添加标记
   * @param message
   */
  addMark(data: MarkData): void;
  /**
   * 修改标记备注
   * @param id
   * @param msg
   */
  modifyMark(id: string, msg: string): void;
  /**
   * 根据 ID 获取标记位置
   * @param id
   * @returns
   */
  getPosition(id: string): { x: number; y: number } | undefined;
  /**
   * 根据 ID 删除标记
   * @param id
   */
  deleteMark(id: string): void;
  /**
   * 根据 x y 获取该位置是否有标记
   * @param x
   * @param y
   * @returns
   */
  checkMark(x: number, y: number): MarkData | undefined;
  /**
   * 高亮标记
   * @param id
   */
  lighthighMark(id?: string): void;
  /**
   * 重新刷新标记
   */
  refresh(): void;
  /**
   * 清除所有标记
   */
  clear(): void;
  /**
   * 销毁所有事件
   */
  destory(): void;
};
```
