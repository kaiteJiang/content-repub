# 红白色系（Red White）

红白干净 + 克制点睛。淡粉下划线为主标记、左竖条块引用、红色仅在锚点出现。经典编辑骨架：编号章节 + 引言卡。适合观点、深度分析、盘点、教程、随笔类文章。

> 平台红线同摸鱼绿。

## 设计变量

```
主色 #DC2626   主色深 #991B1B   主色浅 #FCA5A5   主色极浅 #FEE2E2   主色背景 #FEF2F2
淡粉标记 #FECACA（下划线/左竖条）   标题色 #1C1917   正文色 #374151
辅助文字 #9CA3AF   分割线 #E5E7EB   灰竖条 #D6D3D1
正文字号 15px   行高 1.8   字间距 0.5px   内容区边距 0 10px
```

## 引言卡（开头，红色光晕）

```html
<section style="margin:10px 10px 32px;background:#ffffff;border-radius:12px;box-shadow:0 4px 24px -4px rgba(220,38,38,0.15);padding:28px 24px 22px;overflow:hidden;">
  <p style="font-size:42px;color:#DC2626;font-weight:900;margin:0;line-height:0.6;"><span leaf="">"</span></p>
  <p style="font-size:16px;font-weight:800;color:#1C1917;margin:12px 0 8px;line-height:1.75;padding-left:4px;">
    <span style="background:#DC2626;color:#FFFFFF;padding:2px 8px;border-radius:4px;"><span leaf="">{{高亮词}}</span></span>
    <span leaf="">{{金句中段}}</span>
    <span style="background:#DC2626;color:#FFFFFF;padding:2px 8px;border-radius:4px;"><span leaf="">{{高亮词}}</span></span>
    <span leaf="">{{金句收尾}}</span>
  </p>
</section>
```

## 章节标题（红底编号标签）

第一章节 `margin-top:16px`，后续 `margin-top:48px`；末章编号 `∞`、标签 `THE END`。

```html
<section style="margin-top:48px;margin-bottom:28px;padding:0 10px;">
  <section style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:14px;border-bottom:3px solid #DC2626;">
    <section style="display:flex;align-items:center;">
      <span style="display:inline-block;background:#DC2626;color:#FFFFFF;font-size:18px;font-weight:900;padding:4px 14px;border-radius:6px;margin-right:14px;line-height:1.3;"><span leaf="">{{编号}}</span></span>
      <section>
        <h3 style="font-size:18px;font-weight:800;color:#1C1917;margin:0;letter-spacing:0.5px;"><span leaf="">{{中文标题}}</span></h3>
      </section>
    </section>
  </section>
</section>
```

## 正文段落 + 淡粉下划线

```html
<p style="margin-bottom:20px;font-size:15px;line-height:1.8;text-align:justify;text-indent:2em;">
  <span leaf="">{{前半句}}</span>
  <span style="border-bottom:2px solid #FECACA;font-weight:600;"><span leaf="">{{关键词}}</span></span>
  <span leaf="">{{后半句}}</span>
</p>
```

## 行内强调

- **加粗**（默认）：`<strong><span leaf="">文字</span></strong>`
- **红色加粗**（锚点 ≤5 处）：`<strong style="color:#DC2626;"><span leaf="">文字</span></strong>`
- **浅红底标签**（核心概念）：`<span style="background:#FEE2E2;color:#991B1B;padding:2px 6px;border-radius:3px;font-weight:700;"><span leaf="">文字</span></span>`
- **行内代码**：`<span style="background:#F3F4F6;color:#1F2937;padding:2px 6px;border-radius:4px;font-size:14px;font-weight:600;"><span leaf="">code</span></span>`

## 引用 / 提示

**粉底左竖条金句**（核心金句）：
```html
<section style="background:#FEF2F2;border-radius:0 10px 10px 0;border-left:4px solid #DC2626;padding:18px 22px;margin-bottom:24px;">
  <p style="font-size:16px;font-weight:800;color:#991B1B;margin:0;line-height:1.8;"><span leaf="">「{{核心观点}}」</span></p>
</section>
```

**红色提示条**：
```html
<section style="background:#FEF2F2;border-left:4px solid #DC2626;border-radius:0 8px 8px 0;padding:14px 20px;margin-bottom:24px;">
  <p style="font-size:14px;font-weight:700;color:#991B1B;margin:0;line-height:1.8;"><span leaf="">💡 {{提示内容}}</span></p>
</section>
```

**踩坑提示**（灰底）：标题用 `color:#DC2626` 的「！踩坑提示 🕳」，内容灰色正文。

## 列表

**编号列表**（红色圆标）：圆标底色 `#DC2626`、数字白字。
**胶囊要点**：胶囊底 `#FEE2E2`、圆点 `#DC2626`、文字 `#991B1B`。

## 图片容器

```html
<section style="background:#FFF;border-radius:12px;padding:6px;border:1px solid #E5E7EB;box-shadow:0 4px 12px -2px rgba(0,0,0,0.08);margin-bottom:10px;">
  <section style="margin:0;border-radius:8px;overflow:hidden;">
    <span leaf=""><img src="{{图片URL}}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span>
  </section>
</section>
```

## END 线

END 线为红色渐变（`linear-gradient(to right,transparent,#DC2626)`）。

## 骨架

引言卡 → 前言正文 → 导读（三列红底编号卡）→ 各章节（红底编号标题）→ 结语（∞）→ END。代码块用通用组件（摸鱼绿组件 7），浅色版左竖条换 `#DC2626`。
