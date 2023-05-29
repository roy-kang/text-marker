# work-marker

word-marker is a library used to tag web page text, which can store tag information.

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
});

document.querySelector("#app")!.addEventListener("click", (e: Event) => {
  const { pageX, pageY } = e as PointerEvent;

  const marker = wMarker.checkMark(pageX, pageY);
  if (marker) {
    confirm(`批注内容：${marker.message}\n是否删除批注？`) &&
      wMarker.deleteMark(marker.id);
  }
});
```

# Options

```ts
type WordMarkOptions = {
  // 元素上的唯一标识，默认：id
  attribute?: string;
  // 标记颜色，默认：rgba(224, 108, 117)
  color?: string;
  // 标记透明度，默认：0.3
  globalAlpha?: number;
  // 标记数据回显
  data?: MarkData[];
  // 对于每一个元素可以进行初始化处理
  tag?: (node: HTMLElement) => void;
  // 在选中标记的时候，可以根据节点就行忽略处理
  ignoreNode?: (node: ChildNode) => boolean;
  // 添加前的钩子
  add?: (data: MarkData) => Promise<string | undefined>;
  // 标记方式
  mark?: (ctx: CanvasRenderingContext2D, range: Range) => void;
  // 清除标记方式
  clearMark?: (range: Range) => void;
};
```

# Returns

```ts
function textMarker(
  container: HTMLElement,
  options: WordMarkOptions
): {
  // 获取所有的标记信息
  getMarkData(): MarkData[];
  // 修改标记信息
  modifyMark(id: string, msg: string): void;
  // 删除标记
  deleteMark(id: string): void;
  // 根据位置信息查找是否有标记信息
  checkMark(x: number, y: number): MarkData | undefined;
  // 刷新所有标记显示
  refresh(): void;
  // 销毁所有标记
  destory(): void;
};
```
