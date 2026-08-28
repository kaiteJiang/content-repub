# 公众号排版组件库（摸鱼绿主题）

绿色杂志风，卡片丰富、信息密度高，适合教程、测评、清单类文章。全部**内联样式**，可直接粘贴公众号编辑器。

> 风格借鉴自公开公众号排版主题，本文件为二次整理版本。

## 公众号平台红线

- ❌ 禁 `<style>/<script>/<div>`、`class/id`、`position:fixed/absolute/sticky`、`float`、`@media/@keyframes`、`display:grid`、CSS 变量、外部字体。
- ✅ 支持内联 `style`、`display:flex`（有限）、`linear-gradient`、`border-radius`、`box-shadow`、`<section>/<p>/<span>/<strong>/<img>/<h3>`。
- 所有文字节点用 `<span leaf="">文字</span>` 包裹（否则粘贴后样式丢失）。
- 装饰性空元素（圆点、细线）内部放 `<span leaf=""><br></span>` 占位。
- 不要在同一 `<p>` 混多个字号；不要给 `<strong>` 打 `font-size`/`border-bottom`。

## 设计变量

```
主色 #059669  辅色 #10B981  浅绿装饰 #34D399/#6EE7B7/#A7F3D0
浅绿边框 #BBF7D0  浅绿背景 #ECFDF5/#F0FDF4
黄色高亮 #FDE68A  警告黄底 #FFFBEB  警告黄字 #92400E
红色下划线 #FECACA  标题色 #111827  正文色 #374151
次要文字 #4B5563  注释 #6B7280  辅助 #9CA3AF
分隔线 #D1D5DB  浅边框 #E5E7EB  浅灰背景 #F3F4F6
正文字号 14px  正文行高 1.9  全局行高 1.75  字间距 0.5px  最大宽度 677px
```

## 组件 1：全局容器

```html
<section style="max-width:677px;margin:0 auto;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;color:#374151;line-height:1.75;letter-spacing:0.5px;overflow-x:hidden;">
  <!-- 所有组件放在这里 -->
</section>
```

## 组件 2：封面（cover-breaking，无图版）

> **AI 新闻日更场景不用此组件**：公众号封面已由单独上传的封面图承担，正文从导语 + 亮点卡直接开始，不放这个开头大卡。仅教程 / 测评 / 清单等以"正文内标题卡"开篇的题材才使用。

封面标题与外标题是两层，视角要错开：外标题卖"为什么点开"，封面卖"里面讲什么"。

```html
<section style="margin:0 0 32px;background:#fff;border:1.5px solid rgba(5,150,105,0.15);border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);width:100%;">
  <section style="padding:32px 28px 28px;">
    <section style="display:flex;align-items:center;gap:8px;margin-bottom:28px;">
      <span style="width:6px;height:6px;background:#059669;border-radius:50%;"><span leaf=""><br></span></span>
      <span style="font-size:11px;font-weight:700;letter-spacing:3px;color:#059669;"><span leaf="">{{顶部标签}}</span></span>
      <section style="flex:1;height:1px;overflow:hidden;background:linear-gradient(to right,rgba(5,150,105,0.12),transparent);"><span leaf=""><br></span></section>
      <span style="font-size:10px;color:#D1D5DB;font-weight:600;"><span leaf="">{{日期}}</span></span>
    </section>
    <section>
      <p style="font-size:15px;color:#D1D5DB;margin:0 0 6px;text-decoration:line-through;letter-spacing:0.5px;"><span leaf="">{{划线旧认知}}</span></p>
      <p style="font-size:24px;font-weight:900;color:#111827;margin:0;line-height:1.05;letter-spacing:-2px;"><span leaf="">{{主标题行1}}</span><span style="color:#059669;"><span leaf="">{{绿色高亮词}}</span></span></p>
      <p style="font-size:24px;font-weight:900;color:#059669;margin:0 0 16px;line-height:1.05;letter-spacing:-2px;"><span leaf="">{{主标题行2}}</span></p>
      <section style="width:48px;height:3px;background:linear-gradient(to right,#059669,#34D399);border-radius:2px;margin-bottom:12px;"><span leaf=""><br></span></section>
      <p style="font-size:13px;color:#9CA3AF;margin:0;line-height:1.7;letter-spacing:0.5px;"><span leaf="">{{副标题关键词}}</span></p>
    </section>
  </section>
  <section style="background:linear-gradient(135deg,#059669,#10B981);padding:12px 28px;display:flex;align-items:center;justify-content:space-between;">
    <p style="font-size:12px;color:rgba(255,255,255,0.9);margin:0;font-weight:600;letter-spacing:0.5px;"><span leaf="">{{底部左侧文字}}</span></p>
    <section style="display:flex;gap:4px;">
      <span style="background:rgba(255,255,255,0.2);padding:1px 6px;border-radius:3px;font-size:8px;color:#fff;font-weight:600;"><span leaf="">{{标签1}}</span></span>
      <span style="background:rgba(255,255,255,0.2);padding:1px 6px;border-radius:3px;font-size:8px;color:#fff;font-weight:600;"><span leaf="">{{标签2}}</span></span>
    </section>
  </section>
</section>
```

## 组件 3：目录（toc-scroll 横向滚动）

2 个及以上章节时生成，第一卡绿色高亮，最后固定"写在最后"。

```html
<section style="margin:0 20px 32px;">
  <section style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
    <p style="font-size:10px;color:#9CA3AF;margin:0;text-transform:uppercase;letter-spacing:2px;font-weight:600;"><span leaf="">📦 {{N}} Parts + Conclusion</span></p>
    <p style="font-size:10px;color:#9CA3AF;margin:0;"><span leaf="">👉 滑动</span></p>
  </section>
  <section style="overflow-x:scroll;-webkit-overflow-scrolling:touch;white-space:nowrap;padding-bottom:8px;">
    <section style="display:inline-block;white-space:normal;vertical-align:top;width:110px;background:linear-gradient(135deg,#059669,#10B981);border-radius:12px;padding:12px;margin-right:8px;">
      <p style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:1px;margin:0 0 5px;"><span leaf="">PART 01</span></p>
      <p style="font-size:13px;font-weight:800;color:#fff;margin:0 0 3px;"><span leaf="">{{章节名}}</span></p>
      <p style="font-size:10px;color:rgba(255,255,255,0.7);margin:0;"><span leaf="">{{副标题}}</span></p>
    </section>
    <section style="display:inline-block;white-space:normal;vertical-align:top;width:110px;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:12px;margin-right:8px;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
      <p style="font-size:9px;font-weight:700;color:#9CA3AF;letter-spacing:1px;margin:0 0 5px;"><span leaf="">PART 02</span></p>
      <p style="font-size:13px;font-weight:800;color:#111827;margin:0 0 3px;"><span leaf="">{{章节名}}</span></p>
      <p style="font-size:10px;color:#9CA3AF;margin:0;"><span leaf="">{{副标题}}</span></p>
    </section>
  </section>
</section>
```

## 组件 4：章节标题（chapter-title）

第一章节 `margin-top:16px`，后续 `margin-top:48px`；末章编号 `///`、PART 改 `LAST`。**不带英文副标题小字**，只保留编号 + 中文标题一行。

```html
<section style="margin-top:48px;margin-bottom:32px;padding:0 20px;">
  <section style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
    <section style="text-align:center;flex-shrink:0;">
      <p style="margin:0;font-size:28px;font-weight:900;color:#059669;line-height:1;letter-spacing:-2px;"><span leaf="">{{编号}}</span></p>
      <p style="margin:0;font-size:8px;font-weight:700;color:#D1D5DB;letter-spacing:2px;"><span leaf="">PART</span></p>
    </section>
    <span style="width:1px;height:36px;background:#E5E7EB;flex-shrink:0;"><span leaf=""><br></span></span>
    <section>
      <p style="margin:0;font-size:17px;font-weight:900;color:#111827;letter-spacing:0.3px;"><span leaf="">{{中文标题}}</span></p>
    </section>
  </section>
</section>
```

## 组件 5：正文段落（paragraph）

每段主动标 1~3 个关键短语（绿色下划线 6e）。

```html
<p style="margin-bottom:16px;font-size:14px;line-height:1.9;text-align:justify;"><span leaf="">{{正文内容}}</span></p>
```

## 组件 6：行内样式

**6a 绿色加粗**（核心概念/产品名）：
```html
<strong style="color:#059669;"><span leaf="">文字</span></strong>
```
**6c 黄色渐变高亮**（一段最想让人注意的短语，每段 ≤2 处）：
```html
<span style="background:linear-gradient(120deg,#FDE68A 0%,rgba(255,255,255,0) 100%);padding:0 4px;border-radius:2px;font-weight:600;color:#111827;"><span leaf="">文字</span></span>
```
**6d 黄色底部高亮（下划线效果）**：
```html
<span style="color:#111827;font-weight:bold;border-bottom:3px solid #FDE68A;"><span leaf="">文字</span></span>
```
**6e 绿色下划线**（次要强调，正文关键词默认标记）：
```html
<span style="border-bottom:2px solid #A7F3D0;font-weight:600;"><span leaf="">文字</span></span>
```
**6f 红色下划线**（对比/否定）：
```html
<span style="border-bottom:2px solid #FECACA;"><span leaf="">文字</span></span>
```
**6g 代码标签**（行内代码）：
```html
<span style="background:#F3F4F6;color:#1F2937;padding:2px 6px;border-radius:4px;font-size:13px;font-weight:600;"><span leaf="">code</span></span>
```
**6i 删除线灰色**（被淘汰概念）：
```html
<span style="background:#F3F4F6;color:#6B7280;padding:2px 6px;border-radius:4px;font-size:13px;text-decoration:line-through;font-weight:600;"><span leaf="">旧词</span></span>
```

使用原则：绿色加粗给核心概念；黄色高亮每段 ≤2 处；绿色下划线做正文关键词；红色下划线只做对比/否定；一段最多 2 种高亮。

## 组件 7：多行代码块（深色，通用）

每行一个 `<p style="margin:0">`，禁 `white-space:pre`；缩进用全角空格 `　`。

```html
<section style="margin:0 0 20px;border-radius:8px;overflow:hidden;background:#1E293B;box-shadow:0 4px 16px -8px rgba(15,23,42,0.4);">
  <section style="display:flex;align-items:center;padding:9px 14px;background:#0F172A;">
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FF5F56;margin-right:7px;font-size:0;line-height:0;overflow:hidden;">.</span>
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FFBD2E;margin-right:7px;font-size:0;line-height:0;overflow:hidden;">.</span>
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#27C93F;font-size:0;line-height:0;overflow:hidden;">.</span>
    <span style="margin-left:12px;font-size:12px;color:#64748B;font-family:Consolas,Monaco,monospace;letter-spacing:1px;"><span leaf="">{{语言}}</span></span>
  </section>
  <section style="padding:11px 14px;">
    <p style="margin:0;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;line-height:1.6;color:#E2E8F0;"><span leaf="">{{代码行}}</span></p>
  </section>
</section>
```

## 组件 8：图片容器（image）

图片自适应、居中，不用 `width:100%`（避免小图拉伸变糊）。

```html
<section style="background:#FFF;border-radius:12px;padding:6px;border:1px solid #E5E7EB;box-shadow:0 4px 12px -2px rgba(0,0,0,0.08);margin-bottom:10px;">
  <section style="margin:0;border-radius:8px;overflow:hidden;">
    <span leaf=""><img src="{{图片URL}}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span>
  </section>
</section>
```

## 组件 9：引用与亮点

**9a 灰色虚线引用框**（引用/补充说明默认）：
```html
<section style="background:#F9FAFB;border:1px dashed #D1D5DB;border-radius:8px;padding:12px 16px;margin-bottom:24px;text-align:justify;">
  <p style="font-size:13px;color:#374151;margin:0;line-height:1.6;">{{引用内容}}</p>
</section>
```

**9b 一句话亮点卡**（带引导语两段式）：
```html
<section style="background:#FFF;border:1px dashed #BBF7D0;border-radius:8px;padding:14px 16px;margin-bottom:24px;text-align:center;">
  <p style="font-size:12px;color:#9CA3AF;margin:0 0 6px;line-height:1.5;"><span leaf="">{{引导语}}</span></p>
  <p style="margin:0;line-height:1.6;"><span style="font-size:15px;color:#059669;font-weight:bold;border-bottom:3px solid #FDE68A;padding-bottom:2px;"><span leaf="">{{亮点内容}}</span></span></p>
</section>
```

**9c 小节黄色下划线标题**：
```html
<p style="font-size:15px;font-weight:900;color:#111827;margin-bottom:16px;"><span style="background:linear-gradient(180deg,transparent 65%,#FDE68A 65%);padding:0 4px;"><span leaf="">{{小节标题}}</span></span></p>
```

**9d 居中金句分隔**：
```html
<p style="font-size:14px;margin-bottom:20px;text-align:center;color:#059669;font-weight:700;letter-spacing:1px;border-top:1px solid #F3F4F6;border-bottom:1px solid #F3F4F6;padding:12px 0;"><span leaf="">{{居中金句}}</span></p>
```

## 组件 10：提示与信息

**10a 踩坑提示**：
```html
<section style="padding:6px 0 4px;margin-bottom:16px;">
  <p style="margin-bottom:6px;font-size:12px;font-weight:700;color:#9CA3AF;letter-spacing:1px;"><span style="color:rgb(255,76,0);"><span leaf="">！{{标题}} 🕳</span></span></p>
  <p style="font-size:13px;color:#374151;margin:0;line-height:1.7;"><span style="color:rgb(136,136,136);font-weight:bold;"><span leaf="">{{提示内容}}</span></span></p>
</section>
```

**10b 绿色提示**：
```html
<section style="padding:6px 0 4px;margin-bottom:16px;">
  <p style="margin-bottom:6px;font-size:12px;font-weight:700;color:#9CA3AF;letter-spacing:1px;"><span style="color:#059669;"><span leaf="">✦ {{提示标题}}</span></span></p>
  <p style="font-size:13px;color:#374151;margin:0;line-height:1.7;">{{提示内容}}</p>
</section>
```

**10c 黄色警告框**：
```html
<section style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:12px 16px;margin-bottom:20px;">
  <p style="font-size:13px;color:#92400E;margin:0;font-weight:700;"><span leaf="">{{警告内容}}</span></p>
</section>
```

**10d 绿色信息框**：
```html
<section style="background:#F0FDF4;padding:12px 16px;border-radius:8px;border:1px solid #BBF7D0;margin-bottom:20px;">
  <p style="font-size:13px;color:#374151;margin:0;line-height:1.7;text-align:justify;">{{信息内容}}</p>
</section>
```

## 组件 11：列表

**11a 绿色胶囊列表（无序要点）**：
```html
<section style="margin-bottom:14px;">
  <p style="margin:0 0 6px;"><span style="display:inline-block;font-size:13px;font-weight:700;color:#059669;background:rgba(5,150,105,0.08);padding:3px 10px;border-radius:999px;"><span style="display:inline-block;width:6px;height:6px;background:#059669;border-radius:50%;margin-right:5px;vertical-align:middle;"><span leaf=""><br></span></span><span leaf="">{{列表项}}</span></span></p>
</section>
```

**11g 数字编号列表（有序）**：
```html
<section style="margin-bottom:24px;">
  <section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:#059669;color:#fff;font-size:11px;font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;"><span leaf="">1</span></span>
    <p style="font-size:14px;color:#374151;margin:0;line-height:1.9;flex:1;"><span leaf="">{{列表项内容}}</span></p>
  </section>
</section>
```

## 组件 12：内容标签组

**12a STEP 步骤标签**：
```html
<section style="margin-bottom:24px;">
  <section style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
    <span style="display:inline-block;background:#111827;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:12px;"><span leaf="">STEP 01</span></span>
    <h4 style="font-size:15px;font-weight:800;color:#111827;margin:0;"><span leaf="">{{步骤标题}}</span></h4>
  </section>
  <p style="font-size:14px;margin:0 0 16px;color:#4B5563;line-height:1.9;text-align:justify;">{{步骤内容}}</p>
</section>
```

## 组件 13：结尾

结尾**不生成**作者签名段与 footer-cta（点赞/在看/转发三连）。正文到结语章结束即可，不加任何「我是 XX / 欢迎关注 / 三连」等自我广告。

## 完整模板骨架

```html
<section style="max-width:677px;margin:0 auto;...">
  <!-- 1. 封面（组件2） -->
  <!-- 2. 目录（组件3，2+ 章节时紧跟封面） -->
  <!-- 3. 引言亮点卡（组件9b） -->
  <!-- 4. 前言正文（组件5 × N，放 0 20px 边距 section） -->
  <!-- 5. 各章节（组件4 + 章内组件5~12） -->
  <!-- 6. 结语章（组件4 变体：/// + LAST） -->
  <!-- 7.（无签名/CTA，正文到结语结束） -->
</section>
```

## Markdown → 组件映射

| Markdown | 组件 |
|---|---|
| `# 标题` | 不用（公众号标题在平台设置），封面主标题从中提炼 |
| 开头 `> 引言` | 9b oneliner-card |
| `## 章节` | 4 chapter-title（编号 01/02…，末章 /// + LAST） |
| `### 子标题` | 9c 黄色下划线标题 |
| 普通段落 | 5 paragraph（每段 1~3 处 6e 下划线） |
| `**加粗**` | 6a 绿色加粗 |
| `==高亮==` | 6c 黄色渐变高亮 |
| `<u>下划线</u>` / `++文字++` | 6e 绿色下划线 |
| `~~删除~~` | 6i 删除线灰色 |
| 行内 `code` | 6g 代码标签 |
| ` ``` 多行代码 ``` ` | 7 深色代码块 |
| 操作步骤 | 12a step-label |
| 并列要点 | 11a 胶囊列表 |
| `1. 2. 3.` | 11g 编号列表 |
| 注意/警告 | 10a/10c |
| 亮点提示 | 10b/10d |
| `> 引用段落` | 9a 虚线引用框 |
| 核心金句 | 9b / 9d |
| `![](图片)` | 8 image（自适应居中） |
| 文末 | （无，正文到结语结束） |
