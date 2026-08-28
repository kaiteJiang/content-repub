# 小红书图文分发（guizang 编排）

把已排版内容编排成**小红书图文组图**（1080×1440，3:4），输出 PNG 素材包供手动发布。小红书无公开第三方推送 API，素材生成后由用户在小红书 App 发布。

## 定位与输入

- **输入**：`article_rewrite.md`（已去 AI 味）或 `article.md`。
- **输出**：小红书图文组图素材（3—9 张 PNG，1080×1440）+ 发布文案建议（标题/正文钩子/标签）。
- **调用**：guizang-social-card-skill（`~/.workbuddy/skills/guizang-social-card-skill/`）。

## 前置依赖（首次使用）

```bash
cd ~/.workbuddy/skills/guizang-social-card-skill
npm install playwright
npx playwright install chromium
```

渲染用 `node render.mjs <task-dir>`（task 目录含 index.html，逐个 `.poster` 出 PNG）。node 已具备（v22）。

## 编排流程（7 步）

1. **Intake**：平台=小红书（3:4，1080×1440）；素材=文章；无用户图时用 AI 生图或网络取图（Unsplash → Pexels → Flickr CC → Wallhaven 优先级）。
2. **Style & Theme**：从 10 套预设选一套（小红书 AI/工具内容 → Swiss + IKB 克莱因蓝，或 Editorial + 靛蓝瓷；叙事/生活 → Editorial 系列）。**不自定义 hex**。
3. **Layout**：按内容结构从 28 个版式骨架选（Editorial M01-M16 / Swiss S01-S12），拆成 3—9 页：封面（信息明确）+ 拆条 + 结尾。
4. **Asset Prep**：取图落本地 + 写 `SOURCES.md`。
5. **Compose & Render**：拷种子模板（`assets/template-editorial-card.html` 或 `template-swiss-card.html`）→ 替换 `<!-- POSTERS_HERE -->` → `node render.mjs`。
6. **Deliver**：输出素材包 + 发布文案建议。
7. **Iterate**：用户反馈后调整（换版式/替图/改文案，重渲）。

## 小红书发布文案规范

- **标题**：20 字内，含核心关键词或利益点（呼应公众号 `--title` 核心词）。
- **正文**：钩子开头（1 句）→ 3—5 点干货 → 一句引导收藏/关注。
- **标签**：3—5 个（如 #AI #效率工具 #程序员 #测评）。
- **封面首图**：信息明确、吸引点击（guizang 版式已保证：大标题 + 主体 + 高对比）。

## 合规注意

- guizang-social-card-skill 为 **AGPL-3.0**：必须保留署名；修改/分发衍生品须以 AGPL-3.0 开源。个人内部使用可，对外分发修改版前先确认合规。
- 取图遵守各图源版权，`SOURCES.md` 记录来源；用户要求标注时在正文注明。

## 使用

- 用户说「做小红书素材 / 小红书图文 / 发小红书」时，走本流程。
- 素材生成后由用户手动发布，本流程不涉及 API 推送。
