# 橄榄手记（Olive Journal）

内刊/编辑部手记质感——米白纸感底 + 墨黑强调 + 橄榄灰边框，橙色作画龙点睛的强调色，陶土棕作次强调/进行中状态色。信息密度偏高、分节形式多样。适合系统性说明文档、深度评测、案例复盘类内容，气质克制、理性、略带"内部资料"的严肃感。

> 平台红线同摸鱼绿。行内代码用 `<span>` 模拟（不用 `<code>` 标签）。

## 设计变量

```
主题墨色 #1e1f23   标题色 #23251d   正文色 #4d4f46   次要文字 #65675e   弱化文字 #9ea096
边框/分隔线 #bfc1b7   米白背景 #fdfdf8   浅橄榄灰 #eeefe9   标签浅底 #e5e7e0
强调橙 #ed7b2f   陶土棕 #d4c9b8（配边框 #b17816）
正文字号 14px   行高 1.9   全局行高 1.75   容器内边距 8px   区块间距 margin-top 24px   圆角 6px
字体栈 'IBM Plex Sans',-apple-system,system-ui,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif
```

## 头图卡（开头，内刊风格，全文唯一、不设 margin-top）

> **AI 新闻日更场景不用此组件**：公众号封面由单独上传的封面图承担，正文从导语直接开始，不放头图卡。仅系统性说明 / 深度评测等以"内刊开篇"的题材才使用。

```html
<section style="background:#fdfdf8;border:1px solid #bfc1b7;border-radius:6px;overflow:hidden;font-family:'IBM Plex Sans',-apple-system,system-ui,sans-serif;">
  <section style="padding:28px 24px 22px;">
    <section style="display:flex;align-items:center;gap:8px;margin-bottom:22px;">
      <span style="width:8px;height:8px;background:#1e1f23;border-radius:50%;display:inline-block;overflow:hidden;vertical-align:middle;font-size:0;line-height:0;"><span leaf="">&nbsp;</span></span>
      <span style="font-size:10px;font-weight:700;letter-spacing:3px;color:#65675e;"><span leaf="">{{内刊标签}}</span></span>
      <span style="flex:1;height:1px;background:#bfc1b7;display:inline-block;overflow:hidden;vertical-align:middle;font-size:0;line-height:0;"><span leaf="">&nbsp;</span></span>
      <span style="font-size:10px;color:#9ea096;font-weight:500;"><span leaf="">{{日期}}</span></span>
    </section>
    <p style="font-size:24px;font-weight:800;color:#23251d;margin:0 0 10px;line-height:1.15;letter-spacing:-0.75px;">
      <span leaf="">{{主标题}}</span><span style="color:#4d4f46;"><span leaf=""> · </span></span><span style="border-bottom:3px solid #e5e7e0;"><span leaf="">{{强调词}}</span></span>
    </p>
    <p style="font-size:13px;color:#65675e;margin:0;line-height:1.7;"><span leaf="">{{副标题说明}}</span></p>
  </section>
  <section style="background:#1e1f23;padding:11px 24px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
    <p style="font-size:12px;color:rgba(255,255,255,0.92);margin:0;font-weight:600;"><span leaf="">{{底部摘要}}</span></p>
    <section style="display:flex;gap:6px;flex-wrap:wrap;">
      <span style="background:#e5e7e0;color:#23251d;padding:3px 8px;border-radius:4px;font-size:8px;font-weight:700;border:1px solid #bfc1b7;"><span leaf="">{{标签1}}</span></span>
      <span style="background:#e5e7e0;color:#23251d;padding:3px 8px;border-radius:4px;font-size:8px;font-weight:700;border:1px solid #bfc1b7;"><span leaf="">{{标签2}}</span></span>
    </section>
  </section>
</section>
```

## 章节标题（编号 + PART + 竖线）

```html
<section style="margin-top:24px;">
  <section style="display:flex;align-items:center;gap:14px;">
    <section style="text-align:center;flex-shrink:0;">
      <p style="margin:0;font-size:24px;font-weight:800;color:#23251d;line-height:1;letter-spacing:-2px;"><span leaf="">{{编号}}</span></p>
      <p style="margin:0;font-size:8px;font-weight:700;color:#9ea096;letter-spacing:2px;"><span leaf="">PART</span></p>
    </section>
    <span style="width:1px;height:36px;background:#bfc1b7;flex-shrink:0;"><span leaf=""><br></span></span>
    <section>
      <p style="margin:0 0 1px;font-size:17px;font-weight:800;color:#23251d;letter-spacing:0.2px;"><span leaf="">{{标题}}</span></p>
    </section>
  </section>
</section>
```

## 正文段落 + 橙色下划线

```html
<section style="margin-top:24px;">
  <p style="margin:0;font-size:14px;line-height:1.9;text-align:justify;text-indent:2em;color:#4d4f46;">
    <span leaf="">{{前半句}}</span>
    <span style="border-bottom:2px solid #ed7b2f;font-weight:600;color:#23251d;"><span leaf="">{{关键词}}</span></span>
    <span leaf="">{{后半句}}</span>
  </p>
</section>
```

## 文字强调（正文内，一段不叠加超过 2 种）

- **a 强调加粗**：`<strong style="color:#23251d;"><span leaf="">文字</span></strong>`
- **b 浅底高亮框**（关键信息/数据）：`<span style="background:#eeefe9;padding:1px 5px;border-radius:4px;font-weight:600;color:#23251d;border:1px solid #bfc1b7;"><span leaf="">文字</span></span>`
- **c 橙色下划线**（默认标记）：`<span style="border-bottom:2px solid #ed7b2f;font-weight:600;color:#23251d;"><span leaf="">文字</span></span>`
- **d 行内代码**：`<span style="background:#eeefe9;color:#23251d;padding:2px 6px;border-radius:4px;font-family:ui-monospace,Menlo,Monaco,Consolas,monospace;font-size:13px;border:1px solid #b6b7af;"><span leaf="">代码</span></span>`
- **e 删除线旧词**：`<span style="color:#9ea096;text-decoration:line-through;"><span leaf="">旧文字</span></span>`

## 编者按（开篇引言/背景说明）

```html
<section style="margin-top:24px;">
  <section style="background:#fdfdf8;border:1px solid #bfc1b7;border-radius:6px;overflow:hidden;">
    <section style="padding:10px 16px;background:#1e1f23;display:flex;align-items:center;justify-content:space-between;gap:10px;">
      <p style="margin:0;font-size:10px;font-weight:800;letter-spacing:2px;color:#ffffff;"><span leaf="">EDITOR'S NOTE</span></p>
    </section>
    <section style="padding:16px 18px 18px;background:#eeefe9;">
      <p style="margin:0;font-size:14px;line-height:1.9;color:#4d4f46;text-align:justify;"><span leaf="">{{编者按正文}}</span></p>
    </section>
  </section>
</section>
```

## 重点观点卡 / 对比摘要卡 / 条目列表卡 / FAQ

**重点观点卡**（段落级强调，橙下划线扣题）：
```html
<section style="margin-top:24px;">
  <section style="background:#fdfdf8;border-radius:6px;padding:16px 18px;border:1px solid #bfc1b7;">
    <p style="font-size:14px;color:#4d4f46;margin:0;line-height:1.8;text-align:justify;"><strong style="color:#23251d;border-bottom:3px solid #ed7b2f;"><span leaf="">{{重点观点}}</span></strong><span leaf=""> {{补充说明}}</span></p>
  </section>
</section>
```

**对比摘要卡**（A vs B，深底/浅底左右分栏）：
```html
<section style="margin-top:24px;">
  <section style="background:#eeefe9;padding:16px;border-radius:6px;border:1px solid #bfc1b7;">
    <section style="display:flex;align-items:stretch;justify-content:center;gap:8px;">
      <section style="flex:1;text-align:center;padding:10px 8px;background:#1e1f23;border-radius:6px;border:1px solid #23251d;">
        <p style="font-size:13px;font-weight:800;color:#fff;margin:0 0 3px;"><span leaf="">{{左侧标题}}</span></p>
        <p style="font-size:10px;color:rgba(255,255,255,0.75);margin:0;line-height:1.5;"><span leaf="">{{左侧说明}}</span></p>
      </section>
      <section style="display:flex;align-items:center;color:#bfc1b7;font-size:14px;padding:0 4px;"><span leaf="">vs</span></section>
      <section style="flex:1;text-align:center;padding:10px 8px;background:#fdfdf8;border:1px solid #bfc1b7;border-radius:6px;">
        <p style="font-size:13px;font-weight:800;color:#23251d;margin:0 0 3px;"><span leaf="">{{右侧标题}}</span></p>
        <p style="font-size:10px;color:#65675e;margin:0;line-height:1.5;"><span leaf="">{{右侧说明}}</span></p>
      </section>
    </section>
  </section>
</section>
```

**条目列表卡**（胶囊标题 + 圆点 + 说明）：
```html
<section style="margin-top:24px;">
  <p style="margin:0 0 6px;"><span style="display:inline-block;font-size:13px;font-weight:700;color:#23251d;background:#e5e7e0;padding:3px 10px;border-radius:999px;border:1px solid #bfc1b7;"><span style="display:inline-block;width:6px;height:6px;background:#ed7b2f;border-radius:50%;margin-right:5px;vertical-align:middle;"><span leaf=""><br></span></span><span leaf="">{{条目标题}}</span></span></p>
  <p style="font-size:13px;color:#4d4f46;margin:0;line-height:1.7;text-align:justify;"><span leaf="">{{条目说明}}</span></p>
</section>
```

**FAQ 列表**（编号 + 问题一行式，答案另起段落）：
```html
<section style="margin-top:24px;">
  <section style="background:#fdfdf8;border:1px solid #bfc1b7;padding:18px;border-radius:6px;">
    <p style="margin:0 0 12px;font-size:10px;line-height:1.6;color:#9ea096;letter-spacing:3px;font-weight:800;"><span leaf="">COMMON QUESTIONS</span></p>
    <section style="padding:10px 0;border-top:1px solid #bfc1b7;"><p style="margin:0;font-size:15px;line-height:1.8;color:#23251d;font-weight:800;"><span leaf="">01 / {{问题}}</span></p></section>
    <section style="padding:10px 0;border-top:1px solid #bfc1b7;border-bottom:1px solid #bfc1b7;"><p style="margin:0;font-size:15px;line-height:1.8;color:#23251d;font-weight:800;"><span leaf="">02 / {{问题}}</span></p></section>
  </section>
</section>
```

## 图片（图片卡，带说明加 figcaption）

```html
<section style="margin-top:24px;">
  <figure style="margin:0;">
    <section style="border-radius:6px;overflow:hidden;border:1px solid #bfc1b7;display:block;">
      <span leaf=""><img src="{{图片URL}}" alt="图片" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span>
    </section>
    <figcaption style="font-size:13px;line-height:1.7;color:#65675e;text-align:center;margin-top:10px;"><span leaf="">{{图片说明}}</span></figcaption>
  </figure>
</section>
```

## 结尾 + 隐藏标记

结尾不生成签名段与 ending-actions（赞/在看/收藏三连），正文到全文收束结束即可。文章最末（容器外）放隐藏标记：

```html
<p style="display:none;"><mp-style-type data-value="3"></mp-style-type></p>
```

## 骨架

头图卡 →（可选编者按）→ 各章节（编号章节标题）→ 全文收束（对比卡/FAQ/重点观点卡）→ 隐藏标记。代码块用通用组件（摸鱼绿组件 7），浅色版左竖条换 `#1e1f23`。
