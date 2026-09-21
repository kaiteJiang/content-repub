---
name: content-repub
version: 1.0.0
author: "Kater J"
description: 把 X（Twitter）文章或 AI 圈新闻抓取下来，先经关键词雷达做选题与搜索关键词优化，再去 AI 味二创与公众号排版，最后推送到公众号草稿箱。当用户给出一条 X/Twitter 帖子或 t.co 短链并表达「抓到公众号/转公众号/排版/推送草稿/二创改写/去 AI 味」等意图时触发；当用户要求「每天抓 AI 新闻/抓 3-5 条 AI 资讯/AI 日报/AI 新闻解读/解读今天 AI 圈/AI 热点分析」时，走 AI 新闻日更模式（AIHOT 源）；当用户提到「关键词优化/选题优化/搜一搜/关键词雷达/让文章能被搜到/SEO」时，走关键词雷达步骤（第 0 步）。
---

# content-repub：内容再发布流水线

把一条 X 文章变成公众号草稿的完整流水线。自包含：关键词雷达（选题优化）→ 抓取解析 → 去 AI 味二创 → 公众号排版 → 标题/封面 → 推送草稿。agent 现场执行，无需预装外部工具。

## 核心流程

```
[第 0 步] 关键词雷达 → 抓取解析 → 去 AI 味二创 → 公众号排版 → 标题/封面 → 推送草稿
```

> 第 0 步是**选题与内容优化前置**，让文章更容易被微信搜一搜收录。见下文「第 0 步」。

## 内容来源与两种模式

本流水线支持两种内容来源，按用户意图二选一：

1. **X 文章模式**（默认）：用户给 X/Twitter 帖子或 t.co 链接 → 走第 1 步抓取解析。
2. **AI 新闻日更模式**：用户要求「每天抓 AI 新闻 / AI 日报 / AI 热点解读 / 抓 3-5 条 AI 资讯」→ 读 `references/ai-news.md`，用 AIHOT 匿名 API 抓当天 3—5 条有价值新闻，逐条**进入原文抓正文**后按「新闻本体 + 虾解读：」两段式解读（第 1 段客观陈述新闻事实，小标题「虾解读：」后是观点/影响/能带走，面向普通读者、术语翻译、数字给参照；原文抓不到时降级到摘要并标注），组装成 `article.md` 后**跳过第 1 步**，直接进入第 2 步去 AI 味二创；后续排版、推送照旧。

> 用户单独发链接时：X 链接走第 1 步；其他网页用 WebFetch 抓正文；单独链接条数不足 3—5 条时用 AIHOT 补足。

> **日更调度与发布约定（2026-09-01）**：自动化每天 07:50 跑一次，一次产出**两篇独立文章**（各 5 条新闻，全天共 10 条；两组零交集、主题错开、两篇标题不得围绕同一条新闻）。自动化**只把草稿送入公众号草稿箱**，发布由用户在后台用「定时发表」自行完成。每篇推送前必须做**防重复双校验**：① 重读 `.published.json`，本篇任一条已在列即跳过该篇；② 查草稿箱（`run/_list_drafts.cjs`），当天本流水线日报草稿已 ≥2 篇则全部跳过。注意 `_list_drafts.cjs` 的 `no_content:1` 拿不到标题；判定「是否本流水线草稿」需用工作区 `run/_draft_titles.cjs`（batchget 逐篇取标题）按标题判断，避免把其他账号/其他流水线的草稿误计入。每篇推送成功后**立即**写入去重记录再处理下一篇。

> **第 0 步与日更的关系（2026-09-21 起）**：日更任务先跑关键词雷达（约 3—5 分钟）拿到当周升温词，再抓新闻。雷达失败不阻塞出稿。

---

## 第 0 步：关键词雷达（选题与内容优化前置）

读 `references/seo-radar.md`，在**抓新闻之前**运行为公众号做选题与关键词优化：

```bash
node run/seo_radar.cjs
```

原理：搜狗微信检索 10 个 AI 根词 → 过滤近 7 天文章 → 从标题/摘要提取高频 **AI 专业名词** → 与上一周词表环比，产出「升温词」。

产出 `.workbuddy/seo/latest.json`，三个关键字段：`terms`（高频专业名词）、`rising`（升温词）、`fresh`（本周新词）。

**必须落到三处**（否则本步等于白跑）：

1. **定选题**：优先围绕 `rising` + `fresh` 里的词组稿；同题材时选关键词覆盖更好的那一条。
2. **写标题**：调 bigpeng-hot-gzh 时，把 `rising` 前 5 个词作为**必含关键词候选**交进去，让首选标题自然带上 1—2 个。
3. **铺正文**：`terms` 前 15 的词，首次出现用**完整专业写法**（写「检索增强生成（RAG）」而非只写「RAG」），让搜索同时命中长短写法。

> **重要前提**：微信「搜一搜」下拉词**没有可用公开接口**（实测三路探测全部失败）。本步用竞品爆款标题里的高频 AI 专业名词作为等效替代——与下拉词只是来源不同，用途一致。
>
> **搜狗反爬**：脚本已内置退避重试 + 根词间隔 + 失败补救。**一天跑一次即可，不要连续多次跑**，否则会 302。

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
| 雷达大量根词报 302 | 搜狗反爬限流 | 一天只跑一次；脚本已内置退避+补救，仍失败则不阻塞出稿 |
| 雷达报找不到 cheerio | 本机 npm 在沙箱内中断 | `cd C:/Users/1/.workbuddy/binaries/node/workspace && npm install cheerio --registry=https://registry.npmmirror.com` |

---

## 许可证与来源说明

本 SKILL 的规则整合自以下公开资源，开源使用时请保留本说明：

- 去 AI 味规则（`references/humanize.md`）基于 [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)（CC BY-SA 4.0）与开源项目 blader/humanizer、hardikpandya/stop-slop。
- 排版组件库（`references/theme.md`）的「摸鱼绿」主题风格借鉴自公开公众号排版主题。
- 关键词雷达（`references/seo-radar.md`）的文章检索层基于 [zjp1997720/wechat-article-search](https://github.com/zjp1997720/wechat-article-search)（MIT）的搜狗微信检索思路重写，专业名词抽取与环比逻辑为原创实现。仅用于学习研究与个人选题参考，不高频调用、不做大规模商业爬取。
- 抓取解析与推送逻辑为原创实现。
