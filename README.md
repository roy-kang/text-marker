# work-marker

word-marker is a library used to tag web page text, which can store tag information.

Support for custom tag styles, highlighting, and more

# demo

```ts
import wordMarker from "word-marker";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
  <div class="lemma-summary J-summary" label-module="lemmaSummary">
  <div class="para MARK_MODULE" label-module="para" data-uuid="go03ufac04" data-pid="1">《荷塘月色》是中国现代文学家<a target="_blank" href="/item/%E6%9C%B1%E8%87%AA%E6%B8%85/106017?fromModule=lemma_inlink" data-lemmaid="106017" data-log="summary" data-module="summary">朱自清</a>任教清华大学时创作的<a target="_blank" href="/item/%E6%95%A3%E6%96%87/104524?fromModule=lemma_inlink" data-lemmaid="104524" data-log="summary" data-module="summary">散文</a>，因收入中学语文教材而广为人知，是现代<a target="_blank" href="/item/%E6%8A%92%E6%83%85%E6%95%A3%E6%96%87/4928887?fromModule=lemma_inlink" data-lemmaid="4928887" data-log="summary" data-module="summary">抒情散文</a>的名篇。文章写了清华园中荷塘月色的美丽景象，含蓄而又委婉地抒发了作者不满现实，渴望自由，想超脱现实而又不能的复杂的思想感情，寄托了作者一种向往于未来的政治思想，也寄托了作者对荷塘月色的喜爱之情，为后人留下了旧中国正直知识分子在苦难中徘徊前进的足迹。全文构思新奇精巧，语言清新典雅，景物描绘细腻传神，具有强烈的画面感。</div>
</div>
`;

const wMarker = wordMarker(document.querySelector<HTMLDivElement>("#app")!, {
  add() {
    return new Promise((resolve) => {
      const msg = prompt("请输入批注", "这里需要一个备注信息");
      if (msg !== null) {
        resolve(msg);
      }
    });
  },
  highlight(ctx, range) {
    ctx.fillStyle = "rgba(224, 108, 117, 0.5)";
    ctx.fillRect(range.x, range.y, range.width, range.height);
  },
});

document.querySelector("#app")!.addEventListener("click", (e: Event) => {
  const { pageX, pageY } = e as PointerEvent;

  const marker = wMarker.checkMark(pageX, pageY);
  if (marker) {
    confirm(`批注内容：${marker.message}\n是否删除批注？`) &&
      wMarker.deleteMark(marker.id);
  }
});

document.querySelector("#app")!.addEventListener("mousemove", (e: Event) => {
  const { pageX, pageY } = e as PointerEvent;

  const marker = tmarker.checkMark(pageX, pageY);
  tmarker.lighthighMark(marker?.id);
});
```

# Options

```ts
type MarkOptions = {
  // 滚动元素, 默认为 document
  scrollBy?: HTMLElement | Document;
  // 是否懒加载
  lazy?: boolean;
  // 标记元素指定的唯一属性字段
  attribute?: string;
  // 标记的样式
  color?: string;
  // 标记的透明度
  globalAlpha?: number;
  // 标记的数据
  data?: MarkData[];
  // 初始化时处理所有元素
  tag?: (node: HTMLElement) => void;
  // 是否忽略某个元素
  ignoreNode?: (node: ChildNode) => boolean;
  // 标记的数据添加前的回调
  add?: (e: Event, data: MarkData) => Promise<string | undefined>;
  // 自定义标记的样式
  mark?: (ctx: CanvasRenderingContext2D, range: Range) => void;
  // 高亮标记的样式
  highlight?: (ctx: CanvasRenderingContext2D, range: Range) => void;
};
```

# Returns

```ts
function textMarker(
  container: HTMLElement,
  options: MarkOptions
): {
  /**
   * 获取所有的标记数据
   * @returns 获取标记数据
   */
  getMarkData(): MarkData[];
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
   * 销毁所有事件
   */
  destory(): void;
};
```
