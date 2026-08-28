# 石墨极简风（Graphite Minimal）

石墨灰 + 纯白 + 几何细线 + 超大留白。几乎无色块，以 1px 细线与大间距建立秩序感。适合设计、科技评论、专业观点、高端品牌类文章。

> 平台红线同摸鱼绿：禁 `<style>/<script>/<div>/class/id/position/float/@media/grid`；文字全包 `<span leaf="">`。

## 设计变量

```
主色（石墨灰） #52525B   标题色 #27272A   深灰强调 #3F3F46
辅助文字 #A1A1AA   次要文字 #71717A   极细线 #E4E4E7
标签底色 #F4F4F5   极浅灰底 #FAFAFA   强调橙 #F97316（全篇 ≤3 处）
正文字号 15px   行高 1.8   字间距 0.3px   最大宽度 677px
内容区边距 0 10px   章节间距 56px
```

## 引言卡（开头）

```html
<section style="margin:10px 10px 40px;padding:32px 24px 24px;border-top:1px solid #E4E4E7;border-bottom:1px solid #E4E4E7;background:#FFFFFF;">
  <p style="font-size:11px;color:#A1A1AA;letter-spacing:2px;margin:0 0 18px;font-weight:400;"><span leaf="">QUOTE</span></p>
  <p style="font-size:18px;font-weight:700;color:#27272A;margin:0 0 8px;line-height:1.7;letter-spacing:0.5px;">
    <span leaf="">{{金句前段}}</span><span style="border-bottom:2px solid #52525B;"><span leaf="">{{关键词}}</span></span><span leaf="">{{金句收尾}}</span>
  </p>
</section>
```

## 章节标题（超大水印编号）

第一章节 `margin-top:16px`，后续 `margin-top:56px`；末章编号 `∞`、标签 `EPILOGUE`。

```html
<section style="margin-top:56px;margin-bottom:32px;padding:0 10px;">
  <section style="position:relative;padding-bottom:20px;border-bottom:1px solid #E4E4E7;">
    <p style="font-size:48px;font-weight:900;color:#E4E4E7;margin:0;line-height:1;letter-spacing:-2px;"><span leaf="">{{编号}}</span></p>
    <section style="margin-top:-8px;">
      <h3 style="font-size:20px;font-weight:800;color:#27272A;margin:0;letter-spacing:0.5px;line-height:1.4;"><span leaf="">{{中文标题}}</span></h3>
    </section>
  </section>
</section>
```

## 正文段落 + 关键词下划线

```html
<p style="margin-bottom:22px;font-size:15px;line-height:1.8;text-align:justify;text-indent:2em;color:#52525B;letter-spacing:0.3px;">
  <span leaf="">{{前半句}}</span>
  <span style="border-bottom:2px solid #52525B;font-weight:600;color:#27272A;"><span leaf="">{{关键词}}</span></span>
  <span leaf="">{{后半句}}</span>
</p>
```

## 行内强调

- **加粗**：`<strong style="color:#27272A;"><span leaf="">文字</span></strong>`
- **浅灰底标签**（核心概念，每篇 2~4 个）：`<span style="background:#F4F4F5;color:#27272A;padding:2px 7px;border-radius:3px;font-weight:700;font-size:14px;"><span leaf="">文字</span></span>`
- **行内代码**：`<span style="background:#F4F4F5;color:#27272A;padding:2px 6px;border-radius:4px;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:14px;"><span leaf="">code</span></span>`

## 引用 / 提示

**石墨竖条金句**（核心金句）：
```html
<section style="border-left:3px solid #52525B;padding:16px 0 16px 24px;margin:0 10px 28px;">
  <p style="font-size:16px;font-weight:700;color:#27272A;margin:0;line-height:1.7;letter-spacing:0.5px;"><span leaf="">「{{核心观点}}」</span></p>
</section>
```

**石墨竖条提示**（重要提醒）：
```html
<section style="border-left:3px solid #27272A;padding:14px 0 14px 22px;margin:0 10px 24px;">
  <p style="font-size:14px;font-weight:700;color:#27272A;margin:0;line-height:1.8;"><span leaf="">{{提示内容}}</span></p>
</section>
```

**踩坑提示**（灰底）：
```html
<section style="background:#FAFAFA;border-top:2px solid #27272A;padding:18px 22px;margin:0 10px 24px;">
  <p style="font-size:11px;color:#A1A1AA;margin:0 0 10px;letter-spacing:2px;font-weight:500;"><span leaf="">NOTE</span></p>
  <p style="font-size:14px;color:#52525B;margin:0;line-height:1.8;"><span leaf="">{{内容}}</span></p>
</section>
```

## 列表

**编号列表**（石墨圆标）：圆标底色 `#27272A`、数字白字；文字 `font-size:15px;color:#52525B`。
**胶囊要点**：胶囊底 `#F4F4F5`、圆点 `#52525B`、文字 `#27272A`。

## 图片容器

```html
<section style="border:1px solid #E4E4E7;padding:4px;margin:0 10px 12px;">
  <section style="margin:0;overflow:hidden;">
    <span leaf=""><img src="{{图片URL}}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span>
  </section>
</section>
```

## END 线

```html
<section style="padding:0 10px;">
  <section style="text-align:center;margin:0 0 36px;">
    <section style="display:flex;align-items:center;justify-content:center;">
      <span style="height:1px;width:48px;background:#E4E4E7;margin-right:16px;"><span leaf=""><br></span></span>
      <span style="font-size:10px;color:#A1A1AA;letter-spacing:4px;font-weight:500;"><span leaf="">END</span></span>
      <span style="height:1px;width:48px;background:#E4E4E7;margin-left:16px;"><span leaf=""><br></span></span>
    </section>
  </section>
</section>
```

## 骨架

引言卡 → 前言正文 → 导读（3 看点三列线框）→ 各章节（水印编号）→ 结语（∞）→ END。代码块用通用组件（摸鱼绿 themes/moyu-green.md 组件 7），浅色版左竖条换 `#52525B`。
