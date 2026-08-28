# 摸鱼票据风（Moyu Ticket）

票据/门票视觉隐喻——米黄纸感底 + 黑色实边框 + 硬阴影（box-shadow 无虚化偏移）+ 绿色虚线撕票线、星级评分、编号角标。适合测评、工具对比、创意评测类文章，强调"一张值得收藏的凭证"的仪式感。

> 平台红线同摸鱼绿。正文 14px、行高 1.9 是本主题铁律。

## 设计变量

```
主色（绿） #059669   米黄纸感背景 #fffef8   浅绿背景 #F0FDF4
绿色虚线/撕票线 #A7F3D0   黑色描边/硬阴影 #1a1a1a
正文色 #555   标题色 #1a1a1a   次要文字 #888/#999
品牌紫色（AI 品牌名） #7C3AED
正文字号 14px   行高 1.9   内容区边距 0 20px   章节间距 margin-bottom 32px
```

## 票据封面（开头）

> **AI 新闻日更场景不用此组件**：公众号封面由单独上传的封面图承担，正文从导语直接开始，不放票据封面卡。仅测评 / 对比类以"凭证开篇"的题材才使用。

```html
<section style="background:#fffef8;border:2px solid #1a1a1a;box-shadow:4px 4px 0 #1a1a1a;margin-bottom:32px;">
  <section style="background:#059669;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;">
    <section style="color:#fffef8;font-size:11px;letter-spacing:4px;font-weight:600;"><span leaf="">{{头部标签}}</span></section>
    <section style="color:#fffef8;font-size:11px;letter-spacing:2px;"><span leaf="">★★★★★</span></section>
  </section>
  <section style="display:flex;">
    <section style="flex:1;padding:24px 20px;border-right:2px dashed #A7F3D0;">
      <section style="font-size:24px;font-weight:900;color:#1a1a1a;letter-spacing:0.5px;margin-bottom:4px;"><span leaf="">{{大标题}}</span></section>
      <section style="font-size:14px;color:#666;letter-spacing:1px;margin-bottom:20px;"><span leaf="">{{副标题}}</span></section>
      <section style="border-top:1px dashed #A7F3D0;margin-bottom:16px;"><span leaf=""><br></span></section>
      <section style="font-size:13px;color:#555;line-height:1.8;padding:12px;background:#F0FDF4;border:1px solid #A7F3D0;"><span leaf="">{{简介段落}}</span></section>
    </section>
    <section style="width:48px;padding:14px 4px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;background:#F0FDF4;">
      <section style="text-align:center;">
        <section style="font-size:7px;color:#999;letter-spacing:1px;"><span leaf="">NO.</span></section>
        <section style="font-size:18px;font-weight:900;color:#059669;"><span leaf="">{{编号}}</span></section>
      </section>
      <section style="writing-mode:vertical-rl;font-size:9px;color:#888;letter-spacing:2px;"><span leaf="">{{竖排文字}}</span></section>
      <section style="text-align:center;">
        <section style="font-size:7px;color:#999;letter-spacing:1px;"><span leaf="">GRADE</span></section>
        <section style="font-size:14px;font-weight:900;color:#059669;"><span leaf="">{{等级}}</span></section>
      </section>
    </section>
  </section>
  <section style="display:flex;justify-content:space-between;align-items:center;padding:0 8px;">
    <section style="flex:1;border-top:2px dashed #A7F3D0;"><span leaf=""><br></span></section>
    <section style="padding:0 8px;font-size:10px;color:#A7F3D0;"><span leaf="">✂</span></section>
    <section style="flex:1;border-top:2px dashed #A7F3D0;"><span leaf=""><br></span></section>
  </section>
  <section style="padding:10px 20px;display:flex;justify-content:space-between;align-items:center;">
    <section style="font-size:10px;color:#999;letter-spacing:1px;"><span leaf="">VALID FOR ONE READ</span></section>
    <section style="font-size:10px;color:#999;letter-spacing:1px;"><span leaf="">ADMIT ONE 🎫</span></section>
  </section>
</section>
```

## 章节标题

```html
<section style="margin-bottom:32px;padding:0 20px;">
  <section style="display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid #1a1a1a;">
    <section style="background:#059669;color:#fff;font-size:12px;font-weight:800;padding:6px 12px;letter-spacing:2px;"><span leaf="">{{编号}}</span></section>
    <section style="font-size:18px;font-weight:800;color:#1a1a1a;letter-spacing:1px;"><span leaf="">{{标题}}</span></section>
  </section>
</section>
```

## 正文段落

```html
<section style="margin-bottom:32px;padding:0 20px;">
  <p style="font-size:14px;color:#555;line-height:1.9;margin-bottom:16px;text-align:justify;text-indent:2em;"><span leaf="">{{正文内容}}</span></p>
</section>
```

## 行内强调

- **绿色加粗**（产品名/工具名）：`<span style="color:#059669;font-weight:700;"><span leaf="">文字</span></span>`
- **绿色高亮**（核心观点/数据）：`<span style="background:linear-gradient(120deg,#A7F3D0 0%,rgba(167,243,208,0) 100%);padding:0 4px;font-weight:600;color:#111;"><span leaf="">文字</span></span>`
- **绿色下划线**（重要短语，正文默认标记）：`<span style="border-bottom:2px solid #A7F3D0;font-weight:600;"><span leaf="">文字</span></span>`
- **代码标签**（技术名词/命令）：`<span style="background:#F3F4F6;color:#1F2937;padding:2px 6px;border-radius:4px;font-size:13px;font-weight:600;"><span leaf="">文字</span></span>`
- **品牌紫**（Claude/Obsidian/Gemini 等）：`<span style="color:#7C3AED;font-weight:700;"><span leaf="">文字</span></span>`

## 结论卡片 / 核心观点卡 / 编号特点列表

**结论卡片**（章节小结）：
```html
<section style="margin-bottom:32px;padding:0 20px;">
  <section style="background:#F0FDF4;border-left:4px solid #059669;padding:14px 16px;">
    <p style="font-size:14px;color:#1a1a1a;font-weight:600;line-height:1.7;margin:0;"><span leaf="">{{前缀}}</span><span style="color:#059669;"><span leaf="">{{结论内容}}</span></span></p>
  </section>
</section>
```

**核心观点卡**（硬阴影，全文 ≤3 处）：
```html
<section style="margin-bottom:32px;padding:0 20px;">
  <section style="background:#fffef8;border:2px solid #1a1a1a;box-shadow:3px 3px 0 #1a1a1a;padding:20px;">
    <p style="font-size:15px;color:#1a1a1a;font-weight:700;line-height:1.8;margin:0 0 12px;text-align:center;"><span leaf="">{{金句}}</span></p>
    <p style="font-size:14px;color:#555;line-height:1.8;margin:0;text-align:justify;"><span leaf="">{{补充说明}}</span></p>
  </section>
</section>
```

**编号特点列表**（每项一张卡，绿底序号 + 撕票虚线分隔）：
```html
<section style="margin-bottom:32px;padding:0 20px;">
  <section style="background:#fffef8;border:1px solid #eee;margin-bottom:12px;">
    <section style="display:flex;align-items:stretch;">
      <section style="width:36px;background:#059669;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;"><span leaf="">{{序号}}</span></section>
      <section style="flex:1;padding:12px 16px;font-size:13px;color:#555;line-height:1.7;border-left:1px dashed #A7F3D0;">
        <span style="font-weight:600;color:#1a1a1a;"><span leaf="">{{小标题}}</span></span><span leaf="">：{{描述}}</span>
      </section>
    </section>
  </section>
</section>
```

## 图片容器

```html
<section style="margin-bottom:32px;padding:0 20px;">
  <section style="background:#fffef8;border:1px solid #eee;padding:6px;">
    <figure style="margin:0;"><span leaf=""><img src="{{图片URL}}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span></figure>
  </section>
</section>
```

## 结束符 + 隐藏标记

结尾不生成签名段与 footer-cta（点赞/在看/星标三连），正文到核心观点卡结束，加结束符 `/` 即可。文章最末（容器外）放隐藏标记：

```html
<p style="display:none;"><mp-style-type data-value="3"></mp-style-type></p>
```

## 骨架

票据封面 → 各章节（章节标题）→ 核心观点卡 → 结束符 `/` → 隐藏标记。本主题**不设目录**（一张凭证从头看到尾）。代码块用通用组件（摸鱼绿组件 7），浅色版左竖条换 `#059669`。
