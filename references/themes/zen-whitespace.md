# 留白禅意风（Zen Whitespace）

极简超大留白 + 东方禅意气质。衬线大字金句、细线分层、几乎无色块。靠留白和 1px 细线建立层次，克制、沉静、高级。适合禅意冥想、极简生活、深度随笔、艺术留白类文章。

> 平台红线同摸鱼绿。标题用衬线字体，正文用系统字体。

## 设计变量

```
主色（墨绿） #4A5D52   标题色 #2B2B2B   正文色 #525252   辅助文字 #A3A3A3
细线色 #E8E8E8   下划线标记 #B5C8BC   荧光笔 #D6E4DC
标签底 #EEF3F0   标签文字 #3D5046
正文字号 15px   行高 1.9   字间距 0.3px   段落间距 26px+   章节留白 64px+
内容区边距 0 16px
标题字体 'Noto Serif SC', Georgia, 'Times New Roman', serif
```

## 引言卡（开头，细线上下边 + 衬线大字居中）

```html
<section style="margin:32px 16px 48px;padding:40px 24px;border-top:1px solid #E8E8E8;border-bottom:1px solid #E8E8E8;text-align:center;">
  <p style="font-family:'Noto Serif SC',Georgia,'Times New Roman',serif;font-size:19px;font-weight:600;color:#2B2B2B;margin:0 0 28px;line-height:1.85;letter-spacing:0.8px;"><span leaf="">{{开篇金句}}</span></p>
</section>
```

## 章节标题（小号墨绿英文 + 衬线中文 + 短细线）

`margin-top:64px`；末章编号 `∞`、英文 `POSTSCRIPT`。

```html
<section style="margin-top:64px;margin-bottom:32px;padding:0 16px;">
  <p style="font-size:10px;color:#4A5D52;font-weight:600;letter-spacing:4px;margin:0 0 10px;text-transform:uppercase;"><span leaf="">{{编号}}</span></p>
  <h3 style="font-family:'Noto Serif SC',Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#2B2B2B;margin:0 0 16px;letter-spacing:0.5px;line-height:1.4;"><span leaf="">{{中文标题}}</span></h3>
  <section style="width:40px;height:2px;background:#4A5D52;"><span leaf=""><br></span></section>
</section>
```

## 正文段落 + 低饱和墨绿下划线

```html
<p style="margin-bottom:26px;font-size:15px;line-height:1.9;text-align:justify;text-indent:2em;color:#525252;padding:0 16px;">
  <span leaf="">{{前半句}}</span>
  <span style="border-bottom:1.5px solid #B5C8BC;font-weight:500;"><span leaf="">{{关键词}}</span></span>
  <span leaf="">{{后半句}}</span>
</p>
```

## 行内强调

- **普通加粗**：`<strong style="color:#2B2B2B;"><span leaf="">文字</span></strong>`
- **墨绿加粗**（锚点 ≤5 处）：`<strong style="color:#4A5D52;"><span leaf="">文字</span></strong>`
- **浅墨绿标签**（核心概念）：`<span style="background:#EEF3F0;color:#3D5046;padding:2px 6px;border-radius:2px;font-weight:600;font-size:14px;"><span leaf="">文字</span></span>`
- **荧光笔**（偶尔长句）：`<span style="background:linear-gradient(180deg,transparent 60%,#D6E4DC 60%);font-weight:600;color:#2B2B2B;"><span leaf="">文字</span></span>`

## 引用 / 提示

**居中衬线金句**（核心金句，细线框定）：
```html
<section style="margin:40px 16px;padding:36px 20px;border-top:1px solid #E8E8E8;border-bottom:1px solid #E8E8E8;text-align:center;">
  <p style="font-family:'Noto Serif SC',Georgia,'Times New Roman',serif;font-size:17px;font-weight:600;color:#2B2B2B;margin:0;line-height:1.9;letter-spacing:0.8px;"><span leaf="">「{{核心金句}}」</span></p>
</section>
```

**左竖条旁注**：
```html
<section style="border-left:2px solid #4A5D52;padding:10px 20px;margin:0 16px 30px;background:#FFFFFF;">
  <p style="font-size:14px;color:#525252;margin:0;line-height:1.9;text-align:justify;"><span leaf="">{{旁注内容}}</span></p>
</section>
```

**提示块**（墨绿左竖条 + NOTE 标签，无色块）：
```html
<section style="margin:0 16px 32px;padding:18px 20px;border-left:2px solid #4A5D52;">
  <p style="font-size:10px;color:#4A5D52;font-weight:600;letter-spacing:2px;margin:0 0 8px;text-transform:uppercase;"><span leaf="">NOTE</span></p>
  <p style="font-size:14px;color:#525252;margin:0;line-height:1.9;"><span leaf="">{{提示内容}}</span></p>
</section>
```

## 列表

**要点列表**（竖排细线分隔）：编号小字墨绿 `#4A5D52`，条目深色，`border-top/bottom:1px solid #E8E8E8`。
**胶囊标签**：底 `#EEF3F0`、字 `#3D5046`。

## 图片容器

```html
<section style="margin:0 16px 10px;border:1px solid #E8E8E8;">
  <section style="margin:0;overflow:hidden;">
    <span leaf=""><img src="{{图片URL}}" style="max-width:100%;display:block;"></span>
  </section>
</section>
```

## END 线

END 居中细线 + 小字「END」。

## 骨架

引言卡 → 前言正文 → 目录（细线三列）→ 章节分割线 → 各章节（衬线标题）→ 结语（∞ POSTSCRIPT）→ END。代码块用通用组件（摸鱼绿组件 7），浅色版左竖条换 `#4A5D52`。
