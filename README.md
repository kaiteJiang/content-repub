# content-repub

一条 X（Twitter）文章 → 公众号草稿的内容再发布流水线。

把公开的 X 文章抓取下来，经「去 AI 味二创」与「公众号排版」后推送到公众号草稿箱。

## 核心特色：模块化，可独立调用，可串联成 SOP

四个环节**互相独立**，每个环节都能**单独使用**，也能**首尾相接**组成一套完整 SOP：

```
  ① 抓取解析        ② 去 AI 味二创        ③ 公众号排版        ④ 推送草稿
parse_tweet.md  →   humanize.md      →    themes/*.md     →   publish.md
```

- **单独用①**：只想把 X 文章扒成 markdown 存稿，不排版不发布。
- **单独用②**：给任意一段文字去 AI 味（不限于 X 文章）。
- **单独用③**：给任意一篇 markdown 排版成公众号 HTML（自带 6 套主题）。
- **单独用④**：把任意公众号 HTML 推送到草稿箱。
- **串联成 SOP**：给一条 X 链接，一句话触发，①→②→③→④ 自动跑完全程。

每个环节的入口都是 `references/` 下一个独立文件，agent 按需读取、按需调用，互不依赖。

## 功能一览

| 环节 | 入口文件 | 说明 |
|------|---------|------|
| ① 抓取解析 | `references/parse_tweet.md` | 抓帖子页，解析 DraftJS/Relay，还原正文、代码块、配图（Python） |
| ② 去 AI 味 | `references/humanize.md` | 24 个 AI 痕迹模式 + 改写规则，保留技术事实 |
| ③ 排版 | `references/theme-index.md` + `references/themes/` | 6 套主题组件库，装配成公众号 HTML |
| ④ 推送 | `references/publish.md` | 微信 API 上传封面/正文图并推草稿（Node） |

## 内置 6 套排版主题

| 主题 | 主色 | 适用 |
|------|------|------|
| 摸鱼绿 | `#059669` | 教程、测评、清单（默认） |
| 红白色系 | `#DC2626` | 观点、深度分析 |
| 石墨极简风 | `#52525B` | 科技评论、专业观点 |
| 留白禅意风 | `#4A5D52` | 随笔、极简生活 |
| 摸鱼票据风 | `#059669` | 工具对比、创意评测 |
| 橄榄手记 | `#1e1f23` | 案例复盘、系统说明 |

## 目录结构

```
content-repub/
├── SKILL.md                    # 主指令
├── README.md
├── LICENSE
└── references/
    ├── parse_tweet.md          # ① 抓取解析
    ├── humanize.md             # ② 去 AI 味
    ├── theme-index.md          # ③ 主题索引
    ├── themes/                 # ③ 6 套主题组件库
    │   ├── moyu-green.md
    │   ├── red-white.md
    │   ├── graphite-minimal.md
    │   ├── zen-whitespace.md
    │   ├── moyu-ticket.md
    │   └── olive-journal.md
    └── publish.md              # ④ 推送草稿
```

## 使用

在支持 agent 的环境中，给出一条 X 帖子链接并表达意图即可：

- 完整 SOP：`把 https://x.com/xxx/status/xxx 抓到公众号，去下 AI 味，排成摸鱼绿，推草稿`
- 只抓取：`把这条 X 文章扒下来存成 markdown`
- 只排版：`把这篇 md 排成石墨极简风`
- 只推送：`把这个 html 推到公众号草稿`

## 配置

推送草稿需要微信公众号 AppID / AppSecret（存本地 `.env`，不写入对话或日志），并将运行机器的公网 IP 加入公众号后台「API IP 白名单」。

## 许可证与来源说明

本项目采用分文件双许可，详见 `LICENSE`：

- **去 AI 味规则**（`references/humanize.md`）：基于 [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)（**CC BY-SA 4.0**），参考开源项目 blader/humanizer 与 hardikpandya/stop-slop。此部分沿用 CC BY-SA 4.0，使用时须保留署名。
- **排版主题**（`references/themes/`）：风格借鉴自公开公众号排版主题，已做二次整理。
- **其余部分**（抓取、推送、主指令）：原创实现，MIT License。

简言之：**可自由使用、修改、开源，但请保留 LICENSE 与 humanize.md 中的来源署名。**
