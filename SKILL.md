---
name: content-repub
version: 1.0.0
author: "Kater J"
description: 把 X（Twitter）文章或 AI 圈新闻抓取下来，经去 AI 味二创与公众号排版后推送到公众号草稿箱，实现内容跨平台再发布。当用户给出一条 X/Twitter 帖子或 t.co 短链并表达「抓到公众号/转公众号/排版/推送草稿/二创改写/去 AI 味」等意图时触发；当用户要求「每天抓 AI 新闻/抓 3-5 条 AI 资讯/AI 日报/AI 新闻解读/解读今天 AI 圈/AI 热点分析」时，走 AI 新闻日更模式（AIHOT 源）。
---

# content-repub：内容再发布流水线

把一条 X 文章变成公众号草稿的完整流水线。四步自包含：抓取解析 → 去 AI 味二创 → 公众号排版 → 推送草稿。agent 现场执行，无需预装外部工具。

## 核心流程（四步）

```
抓取解析 → 去 AI 味二创 → 公众号排版 → 推送草稿
```

---

## 内容来源与两种模式

本流水线支持两种内容来源，按用户意图二选一：

1. **X 文章模式**（默认）：用户给 X/Twitter 帖子或 t.co 链接 → 走第 1 步抓取解析。
2. **AI 新闻日更模式**：用户要求「每天抓 AI 新闻 / AI 日报 / AI 热点解读 / 抓 3-5 条 AI 资讯」→ 读 `references/ai-news.md`，用 AIHOT 匿名 API 抓当天 3—5 条有价值新闻，逐条**进入原文抓正文**后按「新闻本体 + 虾解读：」两段式解读（第 1 段客观陈述新闻事实，小标题「虾解读：」后是观点/影响/能带走，面向普通读者、术语翻译、数字给参照；原文抓不到时降级到摘要并标注），组装成 `article.md` 后**跳过第 1 步**，直接进入第 2 步去 AI 味二创；后续排版、推送照旧。

> 用户单独发链接时：X 链接走第 1 步；其他网页用 WebFetch 抓正文；单独链接条数不足 3—5 条时用 AIHOT 补足。

---

## 第 1 步：抓取解析 X 文章

读 `references/parse_tweet.md`（完整可运行 Python 代码），把代码落地到工作区临时文件并运行：

```bash
python _fetch_tweet.py "https://x.com/用户名/status/帖子ID"
```

产出 `article.md`（正文 + 代码块 + 图片引用）和 `images/`（下载好的配图）。

**要点**：抓帖子页（非 article 页）需浏览器 UA；正文在服务端渲染的 Relay JSON（DraftJS 结构）；图片用 `pbs.twimg.com` 原图（无防盗链），**不要**用 `mmbiz.qpic.cn`（浏览器访问返回 400）。

---

## 第 2 步：去 AI 味二创

读 `references/humanize.md`，按其中的规则对 `article.md` 全文做去 AI 味改写：

- **改写表达与语气**，去掉 AI 写作痕迹（宣传腔、三段式、破折号、AI 词汇、模糊归因等）。
- **保留技术事实**：代码块、配置项、命令、专有名词、数字、结论不改写。
- 产出 `article_rewrite.md`。
- 若核心内容来自原作者，文末补一句「本文思路参考自 @原作者」的来源说明，避免洗稿与原创度风险。

---

## 第 3 步：公众号排版

读 `references/theme-index.md` 选主题，再读 `references/themes/` 下对应主题的组件库，把 `article_rewrite.md` 装配成公众号可直接粘贴的 HTML：

- 内置 6 套主题：摸鱼绿（默认）、红白色系、石墨极简风、留白禅意风、摸鱼票据风、橄榄手记。据题材推荐或由用户指定。
- 代码块、图片、列表等通用组件统一在 `themes/moyu-green.md`，其余主题复用并换各自主色。
- 图片引用替换为 `pbs.twimg.com` 原图 URL（第 1 步已下载）。
- **不生成自我广告**：省略作者签名段（「我是 XX，…」）、footer-cta（点赞/在看/转发三连）与「—— 作者名」落款，正文到收束为止。
- 产出干净正文 HTML 片段 + 带「复制到公众号」按钮的预览页。
- 生成后校验：所有文字节点包 `<span leaf="">`，section/p 标签开闭数量一致。

> 用户明确要求「直接推草稿、不用手动粘贴」时，跳过预览，进入第 4 步。

---

## 第 3.5 步：生成标题与封面

推送前补齐标题与封面：

- **标题**：调用 **bigpeng-hot-gzh** 技能（路径 A）生成候选标题，取它的「首选」作为 `--title`。输入为当天最热门一条新闻的简写（见 `references/title.md`），该技能按 7 型公式出 6 个不同公式候选 + 首选。
- **封面**：读 `references/cover.md`，用 **punk-cover 方法**生成封面提示词（选风格 + 按蓝图编译，见 `~/.workbuddy/skills/punk-cover/` 与 `~/.workbuddy/styles/`），再生成 2.35:1 横版封面作为 `--cover`。**封面必须带标题文字 + 具体视觉主体 + 高对比配色**。

> 生图路由：优先本地 codex CLI（`codex exec --skip-git-repo-check "…"`），出错或无响应时降级 grok CLI（`grok -p "…"`）。codex 下**不要加 `-m gpt-image-2`**（会报「gpt-image-2 不支持 ChatGPT 账号」），用默认内置生图工具。

---

## 第 4 步：推送公众号草稿

读 `references/publish.md`（完整可运行 Node 代码），落地运行：

```bash
node _publish.cjs --html <排版后.html> --title "标题" [--author "作者"] [--cover "封面URL"]
```

脚本自动：获取 access_token → 上传封面 → 把正文外链图上传微信 CDN 并替换 → 推草稿。

**报 `40164`（IP 不在白名单）时**：把错误里的实际 IP 交给用户，加入公众号后台「设置与开发 → 基本配置 → API IP 白名单」后重试。

---

## 第 5 步：小红书图文分发（可选）

用户要求「做小红书素材 / 小红书图文 / 发小红书」时，读 `references/social-publish.md`，调用 guizang-social-card-skill（`~/.workbuddy/skills/guizang-social-card-skill/`）把 `article_rewrite.md` 编排成小红书图文组图（1080×1440，3:4）PNG 素材包 + 发布文案建议，交给用户手动发布。

- 小红书无公开第三方推送 API，本步只产出素材，不自动推送。
- 首次使用需在 guizang 目录 `npm install playwright && npx playwright install chromium`。
- guizang 为 AGPL-3.0，注意署名与开源合规。

---

## 配置

微信凭据按顺序读取：环境变量 → `~/.workbuddy/skills/md-to-wechat__skillhub/.env` → 本 SKILL 的 `.env`。缺失时向用户索要：

```
WECHAT_APP_ID=你的AppID
WECHAT_APP_SECRET=你的AppSecret
AUTHOR_NAME=默认作者名（可选）
```

> AppSecret 只存本地 `.env`，不写入对话或日志。

---

## 常见问题

| 现象 | 原因 | 处理 |
|------|------|------|
| 抓不到正文 | 帖子页需浏览器 UA；正文在 Relay JSON | 按 parse_tweet.md 执行 |
| 复制/预览没图片 | 用了 mmbiz 防盗链 URL | 改用 pbs.twimg.com 原图 |
| 推送报 40164 | IP 未加白名单 | 让用户加白名单后重试 |
| 排版标签闭合错乱 | 章节标题 section 未闭合 | 校验 section 开闭数量一致 |

---

## 许可证与来源说明

本 SKILL 的规则整合自以下公开资源，开源使用时请保留本说明：

- 去 AI 味规则（`references/humanize.md`）基于 [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)（CC BY-SA 4.0）与开源项目 blader/humanizer、hardikpandya/stop-slop。
- 排版组件库（`references/theme.md`）的「摸鱼绿」主题风格借鉴自公开公众号排版主题。
- 抓取解析与推送逻辑为原创实现。
