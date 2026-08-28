# 推送草稿参考实现

把排版后的公众号 HTML 推送到草稿箱。下面是**完整可运行的 Node 代码**（零依赖，Node 18+ 内置 fetch），执行时把代码块整体写入 `_publish.cjs`，再运行：

```bash
node _publish.cjs --html <排版后的.html> --title "文章标题" [--author "作者"] [--cover "封面图URL"]
```

脚本会：获取 access_token → 上传封面 → 把正文外链图（如 pbs.twimg.com）上传到微信 CDN 并替换 → 推送草稿。

---

## 前置：微信凭据

脚本按顺序从以下位置读取 `WECHAT_APP_ID` / `WECHAT_APP_SECRET` / `AUTHOR_NAME`：
1. 环境变量
2. `~/.workbuddy/skills/md-to-wechat__skillhub/.env`（已配置过则直接复用）
3. 本 SKILL 的 `.env`（`~/.workbuddy/skills/content-repub/.env`）

若都缺失，向用户索要（AppSecret 只存本地 `.env`）。

---

## 完整代码

```javascript
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const WECHAT_API = 'https://api.weixin.qq.com/cgi-bin';

// 读取 .env（优先 md-to-wechat 的既有配置，其次本 skill 自身 .env）
function loadEnv() {
  const candidates = [
    path.join(os.homedir(), '.workbuddy', 'skills', 'md-to-wechat__skillhub', '.env'),
    path.join(os.homedir(), '.workbuddy', 'skills', 'content-repub', '.env'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      fs.readFileSync(p, 'utf-8').split('\n').forEach(line => {
        const m = line.match(/^\s*([^#=\s][^=]*?)\s*=\s*(.*?)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
      });
    }
  }
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--html') a.html = argv[++i];
    else if (argv[i] === '--title') a.title = argv[++i];
    else if (argv[i] === '--author') a.author = argv[++i];
    else if (argv[i] === '--cover') a.cover = argv[++i];
  }
  return a;
}

function guessMime(fn) {
  const ext = path.extname(fn).toLowerCase();
  return { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' }[ext] || 'image/jpeg';
}

async function getAccessToken(appId, appSecret) {
  const res = await fetch(`${WECHAT_API}/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`);
  const d = await res.json();
  if (d.errcode && d.errcode !== 0) {
    if (d.errcode === 40164) {
      const ip = (d.errmsg.match(/invalid ip\s+([\d.]+)/i) || [])[1] || '见错误信息';
      throw new Error(`IP 不在白名单：${ip}\n请加入公众号后台 → 设置与开发 → 基本配置 → API IP 白名单`);
    }
    throw new Error(`access_token 失败：${d.errcode} ${d.errmsg}`);
  }
  return d.access_token;
}

async function uploadCover(cover, token) {
  // cover 支持 URL 或本地路径
  let buffer, filename;
  if (/^https?:\/\//i.test(cover)) {
    const res = await fetch(cover);
    if (!res.ok) throw new Error(`封面下载失败 HTTP ${res.status}`);
    buffer = Buffer.from(await res.arrayBuffer());
    filename = path.basename(new URL(cover).pathname) || 'cover.jpg';
  } else {
    buffer = fs.readFileSync(cover);
    filename = path.basename(cover);
  }
  const form = new FormData();
  form.append('media', new Blob([buffer], { type: guessMime(filename) }), filename);
  const res = await fetch(`${WECHAT_API}/material/add_material?access_token=${token}&type=image`, { method: 'POST', body: form });
  const d = await res.json();
  if (d.errcode && d.errcode !== 0) throw new Error(`封面上传失败：${JSON.stringify(d)}`);
  return d.media_id;
}

async function uploadBodyImages(html, token) {
  const wxDomains = ['mmbiz.qpic.cn', 'mmbiz.qlogo.cn', 'res.wx.qq.com'];
  const srcs = new Set();
  let m;
  const re = /\bsrc="(https?:\/\/[^"]+)"/g;
  while ((m = re.exec(html)) !== null) {
    if (!wxDomains.some(d => m[1].includes(d))) srcs.add(m[1]);
  }
  if (srcs.size === 0) return html;
  console.error(`[图片] 上传 ${srcs.size} 张外链图到微信 CDN...`);
  const map = {};
  for (const url of srcs) {
    try {
      const res = await fetch(url);
      if (!res.ok) { console.error(`  [图片] 下载失败 ${res.status}，跳过 ${url}`); continue; }
      const buffer = Buffer.from(await res.arrayBuffer());
      const ct = res.headers.get('content-type') || 'image/jpeg';
      const ext = ct.includes('png') ? '.png' : ct.includes('gif') ? '.gif' : '.jpg';
      const form = new FormData();
      form.append('media', new Blob([buffer], { type: ct }), `img${ext}`);
      const up = await fetch(`${WECHAT_API}/media/uploadimg?access_token=${token}`, { method: 'POST', body: form });
      const d = await up.json();
      if (d.url) map[url] = d.url;
    } catch (e) { console.error(`  [图片] 异常 ${e.message}，跳过`); }
  }
  let out = html;
  for (const [k, v] of Object.entries(map)) {
    out = out.replace(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), v);
  }
  console.error(`[图片] 替换 ${Object.keys(map).length} 张`);
  return out;
}

async function pushDraft(token, title, author, html, thumb) {
  const article = { title, content: html, thumb_media_id: thumb, show_cover_pic: 1, need_open_comment: 0 };
  if (author) article.author = author;
  const res = await fetch(`${WECHAT_API}/draft/add?access_token=${token}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articles: [article] }),
  });
  const d = await res.json();
  if (d.errcode && d.errcode !== 0) throw new Error(`推草稿失败：${d.errcode} ${d.errmsg}`);
  return d.media_id;
}

async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));
  if (!args.html || !fs.existsSync(args.html)) { console.error('缺少 --html 文件'); process.exit(1); }
  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;
  if (!appId || !appSecret) { console.error('缺少微信凭据（WECHAT_APP_ID / WECHAT_APP_SECRET）'); process.exit(1); }

  const html = fs.readFileSync(args.html, 'utf-8');
  const title = args.title || '未命名';
  const author = args.author || process.env.AUTHOR_NAME || '';

  // 封面：--cover 参数 > HTML 第一张图
  let cover = args.cover;
  if (!cover) {
    const m = html.match(/<img[^>]*src="([^"]+)"/);
    cover = m ? m[1] : null;
  }
  if (!cover) { console.error('未找到封面图，请用 --cover 指定'); process.exit(1); }

  console.error('[微信] 获取 access_token...');
  const token = await getAccessToken(appId, appSecret);
  console.error('[封面] 上传...');
  const thumb = await uploadCover(cover, token);
  const processed = await uploadBodyImages(html, token);
  console.error('[草稿] 推送...');
  const mediaId = await pushDraft(token, title, author, processed, thumb);

  console.log(JSON.stringify({ success: true, media_id: mediaId, title, message: '草稿已推送，请前往公众号后台 → 草稿箱查看' }, null, 2));
}

main().catch(e => { console.error(JSON.stringify({ success: false, error: e.message }, null, 2)); process.exit(1); });
```

---

## 常见错误

| 错误码 | 含义 | 处理 |
|--------|------|------|
| `40164` | IP 不在白名单 | 把错误里的实际 IP 交给用户，加入公众号后台 API IP 白名单后重试 |
| `40001` | AppSecret 错误 | 核对 WECHAT_APP_SECRET |
| `45009` | 接口调用频率超限 | 稍等重试 |
| `fetch failed` | 封面/正文图下载超时 | 多为 Node fetch 不走系统代理（twimg 需代理）。用 `HTTPS_PROXY=<代理> node --use-env-proxy` 运行即可 |

> **代理坑**：Node 22 的 `fetch` 默认不读系统代理，`pbs.twimg.com` 等外链图可能连接超时（Python 的 urllib 会自动读系统代理所以能成功）。检测系统代理可用 `python -c "import urllib.request; print(urllib.request.getproxies())"`；解决：`HTTPS_PROXY=http://127.0.0.1:10808 HTTP_PROXY=http://127.0.0.1:10808 node --use-env-proxy _publish.cjs ...`（Node 22 需 `--use-env-proxy` 标志，未支持则改用带代理的脚本）。
