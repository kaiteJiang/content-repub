# 主题索引

本 SKILL 内置 6 套公众号排版主题，组件库文件在 `references/themes/` 下。排版时按文章题材推荐，用户也可直接指定。

| 主题 | 英文标识 | 主色 | 适用场景 | 组件库文件 | 正文下划线 CSS |
|------|---------|------|---------|-----------|---------------|
| 摸鱼绿 | moyu-green | `#059669` | 教程、测评、清单、工具盘点（卡片丰富、信息密度高，默认推荐） | `themes/moyu-green.md` | `border-bottom:2px solid #A7F3D0;font-weight:600;` |
| 红白色系 | red-white | `#DC2626` | 深度分析、观点、力量感话题（经典编辑风，编号章节+引言卡+签名区） | `themes/red-white.md` | `border-bottom:2px solid #FECACA;font-weight:600;` |
| 石墨极简风 | graphite-minimal | `#52525B` | 设计、科技评论、专业观点（极简克制、留白理性、全灰阶） | `themes/graphite-minimal.md` | `border-bottom:2px solid #52525B;font-weight:600;` |
| 留白禅意风 | zen-whitespace | `#4A5D52` | 禅意冥想、极简生活、深度随笔（呼吸感最强） | `themes/zen-whitespace.md` | `border-bottom:1.5px solid #B5C8BC;font-weight:500;` |
| 摸鱼票据风 | moyu-ticket | `#059669` | 测评、工具对比、创意评测（票据/门票视觉隐喻，星级+编号+硬阴影） | `themes/moyu-ticket.md` | `border-bottom:2px solid #A7F3D0;font-weight:600;` |
| 橄榄手记 | olive-journal | `#1e1f23`（配橙 `#ed7b2f`） | 内刊手记、深度评测、案例复盘、系统性说明（编辑部内刊质感） | `themes/olive-journal.md` | `border-bottom:2px solid #ed7b2f;font-weight:600;` |

## 选择建议

- 用户没指定主题时，据题材推荐最契合的，让用户一步确认。
- 题材明显契合（教程→摸鱼绿、观点→红白、科技→石墨、随笔→禅意、对比评测→票据、复盘→橄榄）时直接推荐。
- 全自动模式（用户说"直接排/一键"）才不提问，默认摸鱼绿。

## 通用组件

代码块、图片、列表等**通用组件**的完整 HTML 在 `themes/moyu-green.md` 内（组件 7 代码块、组件 8 图片、组件 11 列表），其余主题直接复用，仅把强调色/左竖条色换成各自主色即可。

## 全主题通用格式规范（6 套主题统一生效）

排版时无论选哪套主题，一律遵循以下三条：

1. **不生成封面/头图卡**：公众号封面已由单独上传的封面图承担，正文从导语一句直接开始，不放任何主题的「封面卡片 / 头图卡 / 票据封面」。
2. **章节标题不带副标题小字**：各主题章节标题里的英文标签 / 英文副标题 / 「/ 副标题」一律去掉，只保留「编号 + 中文标题」。
3. **正文自然段落首行缩进 2 字**：正文段落加 `text-indent:2em`；原文链接脚注行不缩进。

其余（引言卡、行内强调、列表、引用、图片、END 线等）按各主题组件库正常装配，收束到结语结束，不生成签名 / CTA。
