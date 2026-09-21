#!/usr/bin/env node
/**
 * AI 圈关键词雷达（方案甲·纯免费路线）
 *
 * 流程：搜狗微信检索根词 → 按时间戳过滤近 7 天 → 从标题/摘要提取高频 AI 专业名词
 *       → 与上一周词表做环比 → 输出升温词（作为「下拉词」的等效替代）
 *
 * 用法（脚本随 skill 分发，路径与调用者的当前目录无关）：
 *   node "<skill>/scripts/seo-radar/seo_radar.cjs"                    # 生成本周词表
 *   node "<skill>/scripts/seo-radar/seo_radar.cjs" --project E:/xxx   # 显式指定产出项目根
 *   node "<skill>/scripts/seo-radar/seo_radar.cjs" --weeks 1          # 回溯周数（默认 1 = 近 7 天）
 *   node "<skill>/scripts/seo-radar/seo_radar.cjs" --max 15           # 每个根词抓取条数（默认 20）
 *   node "<skill>/scripts/seo-radar/seo_radar.cjs" --json             # 只输出 JSON
 *
 * 产出目录（写到「调用者的项目根」/ .workbuddy/seo，由 --project 指定或自动向上探测）：
 *   关键词配置：与本脚本同目录（seo_roots.json / seo_dictionary.json），永不随调用者变化
 *   .workbuddy/seo/keywords-YYYY-Www.json   本周词表（按周归档）
 *   .workbuddy/seo/latest.json              最新一次结果（供下游直接读）
 *   .workbuddy/seo/radar-report.md          人读版报告（含升温词）
 *
 * 依赖：cheerio（从隔离工作区加载，见 NODE_PATH 兜底逻辑）
 */

const https = require('https');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// 依赖加载：cheerio（本机 npm 在沙箱内易被中断，优先从隔离工作区加载）
// ---------------------------------------------------------------------------
const CHEERIO_CANDIDATES = [
  path.join(__dirname, '..', 'node_modules'),
  'C:/Users/1/.workbuddy/binaries/node/workspace/node_modules',
];
let cheerio = null;
for (const p of CHEERIO_CANDIDATES) {
  try { cheerio = require(path.join(p, 'cheerio')); break; } catch (e) { /* 继续尝试 */ }
}
if (!cheerio) {
  try { cheerio = require('cheerio'); } catch (e) {
    console.error('错误：找不到 cheerio 依赖。');
    console.error('请在隔离工作区安装：');
    console.error('  cd C:/Users/1/.workbuddy/binaries/node/workspace');
    console.error('  npm install cheerio --registry=https://registry.npmmirror.com');
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// 路径与配置
//
// 关键：本脚本随 skill 分发，不依赖调用者的当前目录。
//   - 脚本自身与配置（seo_roots.json / seo_dictionary.json）永远在 __dirname 下
//   - 产出目录（.workbuddy/seo）写到「调用者的项目根」，由 --project 指定或自动探测
// ---------------------------------------------------------------------------
const SCRIPT_DIR = __dirname;
const ROOTS_FILE = path.join(SCRIPT_DIR, 'seo_roots.json');
const DICT_FILE = path.join(SCRIPT_DIR, 'seo_dictionary.json');

/**
 * 推断调用者的项目根目录：
 *   1. --project 显式指定优先
 *   2. 否则从 cwd 向上找含 .workbuddy 的目录
 *   3. 都没有则用 cwd
 */
function resolveProjectRoot(explicit) {
  if (explicit) return path.resolve(explicit);
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(dir, '.workbuddy'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

let SEO_DIR;   // 在 main 里按项目根确定

const UA_POOL = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edg/123.0.0.0 Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
];
const pickUA = () => UA_POOL[Math.floor(Math.random() * UA_POOL.length)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// 命令行参数
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = { weeks: 1, max: 20, json: false, project: '' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--weeks') args.weeks = parseInt(argv[++i]) || 1;
    else if (argv[i] === '--max') args.max = parseInt(argv[++i]) || 20;
    else if (argv[i] === '--project') args.project = argv[++i] || '';
    else if (argv[i] === '--json') args.json = true;
  }
  return args;
}

// ---------------------------------------------------------------------------
// HTTP 请求（仅 https，带 gzip/br 解压与重试）
// ---------------------------------------------------------------------------
function request(url, headers, timeoutMs = 20000, retries = 1) {
  return new Promise(async (resolve) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const r = await new Promise((res) => {
        try {
          const u = new URL(url);
          const req = https.request(
            { hostname: u.hostname, path: u.pathname + u.search, method: 'GET', headers, timeout: timeoutMs },
            (resp) => {
              const chunks = [];
              resp.on('data', (c) => chunks.push(c));
              resp.on('end', () => {
                let b = Buffer.concat(chunks);
                try {
                  const ce = String(resp.headers['content-encoding'] || '').toLowerCase();
                  if (ce.includes('gzip')) b = zlib.gunzipSync(b);
                  else if (ce.includes('deflate')) b = zlib.inflateSync(b);
                  else if (ce.includes('br')) b = zlib.brotliDecompressSync(b);
                } catch (e) { /* 解压失败用原始数据 */ }
                res({ status: resp.statusCode, headers: resp.headers, body: b.toString('utf-8') });
              });
            }
          );
          req.on('error', (e) => res({ status: 0, error: e.message, body: '' }));
          req.setTimeout(timeoutMs, () => { req.destroy(); res({ status: 0, error: 'timeout', body: '' }); });
          req.end();
        } catch (e) { res({ status: 0, error: e.message, body: '' }); }
      });
      if (r.status === 200 && r.body) return resolve(r);
      if (attempt >= retries) return resolve(r);
      await sleep(500 + attempt * 500);
    }
  });
}

// ---------------------------------------------------------------------------
// 搜狗 cookie（搜索页需要，缺失时也能返回结果）
// ---------------------------------------------------------------------------
async function getSogouCookie() {
  const r = await request('https://v.sogou.com/v?ie=utf8&query=&p=40030600',
    { 'User-Agent': pickUA(), 'Accept-Language': 'zh-CN,zh;q=0.9' }, 10000, 0);
  const sc = r.headers && r.headers['set-cookie'];
  if (!sc) return '';
  return sc.map((c) => c.split(';')[0]).filter(Boolean).join('; ');
}

// ---------------------------------------------------------------------------
// 解析搜狗微信搜索结果
// ---------------------------------------------------------------------------
function parseArticles(html, limit) {
  const $ = cheerio.load(html);
  const out = [];
  $('ul.news-list li').each((_, el) => {
    if (out.length >= limit) return false;
    const $el = $(el);
    const $a = $el.find('h3 a');
    if (!$a.length) return;
    const title = $a.text().trim();
    if (!title) return;

    const summary = $el.find('p.txt-info').text().trim();
    const $sp = $el.find('.s-p');
    let source = '';
    let ts = 0;

    if ($sp.length) {
      // 时间戳藏在 script 里：document.write(timeConvert('1234567890'))
      const scriptText = $sp.find('.s2 script').text();
      const m = scriptText.match(/(\d{10})/);
      if (m) ts = parseInt(m[1]);

      source = $sp.find('.all-time-y2').text().trim() ||
               $sp.find('a.account').text().trim();
    }

    out.push({ title, summary, source, ts, datetime: ts ? new Date(ts * 1000).toISOString() : '' });
  });
  return out;
}

// ---------------------------------------------------------------------------
// 检索单个根词（近 N 天）
// 注意：搜狗反爬严格，302 表示被限流。必须带退避重试，否则连续跑两次就会全失败。
// ---------------------------------------------------------------------------
async function searchRoot(root, maxResults, weeks, cookieStr) {
  const articles = [];
  const pagesNeeded = Math.ceil(maxResults / 10);
  const cutoff = Date.now() - weeks * 7 * 86400 * 1000;

  for (let page = 1; page <= pagesNeeded; page++) {
    const url = `https://weixin.sogou.com/weixin?query=${encodeURIComponent(root)}&s_from=input&_sug_=n&type=2&page=${page}&ie=utf8`;
    const headers = {
      'User-Agent': pickUA(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Encoding': 'identity',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Host': 'weixin.sogou.com',
      'Referer': 'https://weixin.sogou.com/',
    };
    if (cookieStr) headers['Cookie'] = cookieStr;

    // 反爬退避重试：302/空响应 → 递增等待后重试（最多 3 次）
    let r = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      r = await request(url, headers, 25000, 0);
      if (r.status === 200 && r.body && r.body.length > 5000 && /news-list/.test(r.body)) break;
      if (attempt < 2) await sleep(3000 + attempt * 4000 + Math.random() * 2000);
    }

    if (!r || r.status !== 200 || !r.body) {
      if (page === 1) return { root, articles: [], error: 'HTTP ' + (r ? r.status : 'n/a') };
      break;
    }
    if (!/news-list/.test(r.body)) {
      if (page === 1) return { root, articles: [], error: 'HTTP ' + r.status + ' (反爬/无结果)' };
      break;
    }

    const got = parseArticles(r.body, 10);
    if (!got.length) break;
    articles.push(...got);
    if (page < pagesNeeded) await sleep(1500 + Math.random() * 1500);
  }

  // 按时间戳过滤近 N 天（搜狗不支持 tsn 参数，实测带参数会 302）
  const recent = articles.filter((a) => a.ts && a.ts * 1000 >= cutoff);
  return { root, articles: recent, fetched: articles.length };
}

// ---------------------------------------------------------------------------
// 专业名词抽取：字典匹配（高精度） + 英文缩写（正则）
// ---------------------------------------------------------------------------
function loadDictionary() {
  if (!fs.existsSync(DICT_FILE)) return { terms: [], aliases: {} };
  try { return JSON.parse(fs.readFileSync(DICT_FILE, 'utf-8')); } catch (e) { return { terms: [], aliases: {} }; }
}

function extractTerms(articles, dict, stopwords) {
  const counts = new Map();   // term -> { count, sampleTitles: [] }
  const aliasMap = dict.aliases || {};
  // 脏前缀：这些字开头说明是句子片段而非专业名词
  const BAD_PREFIX = ['一个', '这个', '那个', '首个', '全球', '什么', '怎么', '如何', '因为', '所以', '可以', '已经', '没有', '不是', '哪些', '这些', '那些'];
  // 噪音缩写：机构名、考试名、通用词，误报率高
  const BAD_ABBR = new Set(['NPO', 'CET', 'CEO', 'CTO', 'CFO', 'GDP', 'CPU', 'RAM', 'ROM', 'USB', 'HTML', 'HTTP', 'JSON', 'EXCEL', 'WORD', 'PPT', 'PDF', 'APP', 'PC', 'IT', 'OK', 'ID', 'IP', 'URL', 'DNS', 'SSL', 'SQL', 'FDE', 'AIOT', 'LIMS', 'MES', 'CAE', 'CNC', 'ERP', 'CRM', 'SaaS'.toUpperCase(), 'SOP', 'KPI', 'ROI', 'FAQ', 'DEMO', 'TBD']);
  // 合法技术限定词前缀：只有这些前缀 + 专业后缀的组合才算真专业名词
  const GOOD_PREFIX = /^(?:大|小|多|端侧|开源|闭源|行业|通用|专用|推理|视频|图像|语音|代码|金融|医疗|法律|教育|科学|工业|军事|垂直|基础|预训练|在线|离线|联邦|分布|强化|监督|无监督|半监督|深度|机器|神经|知识|语义|视觉|语言|对话|生成|决策|规划|控制|边缘|云端|国产|自研|轻量|超大|中型|巨型|级)/;

  const bump = (term, title) => {
    const key = aliasMap[term] || term;
    if (!counts.has(key)) counts.set(key, { term: key, count: 0, samples: [] });
    const e = counts.get(key);
    e.count++;
    if (e.samples.length < 3 && !e.samples.includes(title)) e.samples.push(title);
  };

  for (const a of articles) {
    const text = a.title + ' ' + (a.summary || '');
    // 1) 字典精确匹配
    for (const t of dict.terms || []) {
      if (text.includes(t)) bump(t, a.title);
    }
    // 2) 英文专业缩写（2-12 位大写字母/数字）
    // 收紧：必须含至少 2 个字母，且以字母开头字母结尾，剔除 A20 / G3 这类型号片段
    const abbrs = text.match(/\b[A-Z][A-Z0-9]{1,11}\b/g) || [];
    for (const ab of abbrs) {
      if (stopwords.includes(ab)) continue;
      if (BAD_ABBR.has(ab)) continue;
      if (!/^[A-Z][A-Z]/.test(ab)) continue;          // 至少 2 个连续字母开头
      if (!/[A-Z]$/.test(ab)) continue;               // 必须以字母结尾
      if (/^[A-Z]\d+$/.test(ab)) continue;            // 形如 A20 / G3 的型号
      if (/^\d/.test(ab)) continue;
      bump(ab, a.title);
    }
    // 3) 中文复合专业名词（如「行业大模型」「端侧模型」）
    // 收紧：只接受「合法限定词前缀 + 专业后缀」的干净组合，杜绝句子片段
    const patterns = text.match(/([\u4e00-\u9fa5]{1,3})(模型|智能体|算法|蒸馏|微调|架构|对齐|芯片|算力|训练|数据集|知识库|工作流)/g) || [];
    for (const p of patterns) {
      const m = p.match(/^([\u4e00-\u9fa5]{1,3})(模型|智能体|算法|蒸馏|微调|架构|对齐|芯片|算力|训练|数据集|知识库|工作流)$/);
      if (!m) continue;
      const prefix = m[1];
      if (p.length < 4 || p.length > 8) continue;
      if (!GOOD_PREFIX.test(prefix)) continue;   // 限定词必须是技术形容词，不是任意名词
      bump(p, a.title);
    }
  }

  return [...counts.values()]
    .filter((e) => e.count >= 2)      // 至少出现 2 次才算"高频"
    .sort((a, b) => b.count - a.count);
}

// ---------------------------------------------------------------------------
// ISO 周号
// ---------------------------------------------------------------------------
function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const wk = Math.ceil(((t - yStart) / 86400000 + 1) / 7);
  return { year: t.getUTCFullYear(), week: String(wk).padStart(2, '0') };
}

// ---------------------------------------------------------------------------
// 环比：与上一周词表对比，找出升温词
// ---------------------------------------------------------------------------
function compareWithPrevious(currentTerms, currentWeekTag) {
  const prevFiles = fs.existsSync(SEO_DIR)
    ? fs.readdirSync(SEO_DIR)
        .filter((f) => /^keywords-\d{4}-W\d{2}\.json$/.test(f))
        .filter((f) => f !== `keywords-${currentWeekTag}.json`)   // 排除本周，避免自己跟自己比
        .sort()
    : [];
  if (!prevFiles.length) return { prev: null, rising: [], fresh: currentTerms.slice(0, 10), dropping: [] };

  const prevFile = prevFiles[prevFiles.length - 1];
  let prev;
  try { prev = JSON.parse(fs.readFileSync(path.join(SEO_DIR, prevFile), 'utf-8')); } catch (e) { return { prev: null, rising: [], fresh: [], dropping: [] }; }

  const prevMap = new Map((prev.terms || []).map((t) => [t.term, t.count]));
  const curMap = new Map(currentTerms.map((t) => [t.term, t.count]));

  const rising = [], fresh = [], dropping = [];
  for (const t of currentTerms) {
    const p = prevMap.get(t.term);
    if (p === undefined) fresh.push(t);
    else if (t.count > p) rising.push({ ...t, prev: p, delta: t.count - p });
  }
  for (const [term, cnt] of prevMap) {
    if (!curMap.has(term)) dropping.push({ term, prev: cnt });
  }
  return { prev: prevFile, rising, fresh, dropping };
}

// ---------------------------------------------------------------------------
// 根词结果缓存：搜狗反爬会导致单次跑不全。缓存 6 小时内的成功结果，
// 下次运行时自动复用，使多天累积能拼出完整词表。
// ---------------------------------------------------------------------------
// CACHE_FILE 依赖 SEO_DIR，在 main 里赋值后使用（见 getCacheFile）
function getCacheFile() { return path.join(SEO_DIR, 'root-cache.json'); }
const CACHE_TTL_MS = 6 * 3600 * 1000;

function loadCache() {
  try {
    const cacheFile = getCacheFile();
    if (!fs.existsSync(cacheFile)) return {};
    const c = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    const now = Date.now();
    // 清理过期条目
    for (const k of Object.keys(c)) {
      if (!c[k].ts || now - c[k].ts > CACHE_TTL_MS) delete c[k];
    }
    return c;
  } catch (e) { return {}; }
}

function saveCache(cache, root, articles) {
  cache[root] = { ts: Date.now(), articles };
  try { fs.writeFileSync(getCacheFile(), JSON.stringify(cache), 'utf-8'); } catch (e) { /* 忽略写失败 */ }
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv.slice(2));
  // 产出目录写到「调用者的项目根」：--project 指定 > 从 cwd 向上探测 .workbuddy > cwd
  SEO_DIR = path.join(resolveProjectRoot(args.project), '.workbuddy', 'seo');
  fs.mkdirSync(SEO_DIR, { recursive: true });

  if (!fs.existsSync(ROOTS_FILE)) {
    console.error('错误：找不到根词表 ' + ROOTS_FILE);
    process.exit(1);
  }
  const cfg = JSON.parse(fs.readFileSync(ROOTS_FILE, 'utf-8'));
  const dict = loadDictionary();
  const stopwords = [...(cfg.stopwords || []), 'AI', 'APP', 'CEO', 'GDP', 'PDF'];

  console.error(`[关键词雷达] 根词 ${cfg.roots.length} 个，回溯 ${args.weeks} 周，每根词最多 ${args.max} 条`);

  const cookieStr = await getSogouCookie();
  console.error(`[关键词雷达] 搜狗 cookie: ${cookieStr ? '已获取' : '未获取（不影响检索）'}`);

  const allArticles = [];
  const perRoot = [];
  const cache = loadCache();
  const cacheHits = [];

  for (const root of cfg.roots) {
    // 命中缓存：直接复用，不打网络（对抗搜狗限流的关键）
    if (cache[root] && cache[root].articles && cache[root].articles.length) {
      const cached = cache[root].articles;
      const cutoff = Date.now() - args.weeks * 7 * 86400 * 1000;
      const recent = cached.filter((a) => a.ts && a.ts * 1000 >= cutoff);
      if (recent.length) {
        perRoot.push({ root, recent: recent.length, fetched: cached.length, error: null, cached: true });
        cacheHits.push(root);
        allArticles.push(...recent);
        continue;
      }
    }

    const res = await searchRoot(root, args.max, args.weeks, cookieStr);
    const n = res.articles.length;
    perRoot.push({ root, recent: n, fetched: res.fetched || 0, error: res.error || null });
    console.error(`  - ${root}: 近${args.weeks}周 ${n} 条${res.error ? ' (' + res.error + ')' : ''}`);
    if (n > 0) {
      allArticles.push(...res.articles);
      saveCache(cache, root, res.articles);
    }
    await sleep(2500 + Math.random() * 2500);   // 礼貌间隔：搜狗反爬严格，间隔过短会 302
  }

  if (cacheHits.length) console.error(`[关键词雷达] 复用缓存 ${cacheHits.length} 个根词: ${cacheHits.join('、')}`);

  // 失败根词二次补救：等一轮冷却后重试，提高覆盖率
  const failed = perRoot.filter((p) => p.error && p.recent === 0);
  if (failed.length) {
    console.error(`[关键词雷达] ${failed.length} 个根词失败，冷却 20 秒后重试...`);
    await sleep(20000);
    for (const f of failed) {
      const res = await searchRoot(f.root, args.max, args.weeks, cookieStr);
      if (res.articles.length > 0) {
        console.error(`  - ${f.root}: 重试成功，${res.articles.length} 条`);
        f.recent = res.articles.length;
        f.fetched = res.fetched || 0;
        f.error = null;
        allArticles.push(...res.articles);
      } else {
        console.error(`  - ${f.root}: 重试仍失败`);
      }
      await sleep(2500 + Math.random() * 2500);
    }
  }

  // 按标题去重
  const seen = new Set();
  const unique = allArticles.filter((a) => {
    const k = a.title;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const terms = extractTerms(unique, dict, stopwords);

  const { year, week } = isoWeek();
  const weekTag = `${year}-W${week}`;
  const cmp = compareWithPrevious(terms, weekTag);
  const result = {
    generated_at: new Date().toISOString(),
    window: `近${args.weeks}周`,
    week: weekTag,
    roots: cfg.roots,
    articles_scanned: unique.length,
    per_root: perRoot,
    terms,
    rising: cmp.rising,
    fresh: cmp.fresh,
    dropping: cmp.dropping.slice(0, 20),
    prev_week: cmp.prev,
  };

  const weekFile = path.join(SEO_DIR, `keywords-${weekTag}.json`);
  fs.writeFileSync(weekFile, JSON.stringify(result, null, 2), 'utf-8');
  fs.writeFileSync(path.join(SEO_DIR, 'latest.json'), JSON.stringify(result, null, 2), 'utf-8');

  // 人读版报告
  const top = terms.slice(0, 30);
  const okRoots = perRoot.filter((p) => !p.error).length;
  const lines = [];
  lines.push(`# AI 圈关键词雷达 · ${weekTag}`);
  lines.push('');
  lines.push(`生成时间：${new Date().toLocaleString('zh-CN')}　|　窗口：近 ${args.weeks} 周　|　扫描文章：${unique.length} 篇`);
  lines.push('');
  lines.push(`根词覆盖：${okRoots}/${perRoot.length} 正常${okRoots < perRoot.length ? '（搜狗反爬限流，脚本会缓存成功结果，下次运行自动补全）' : ''}`);
  lines.push('');
  if (cmp.prev && cmp.prev !== `keywords-${weekTag}.json`) {
    lines.push(`环比基期：${cmp.prev}`);
    lines.push('');
  } else {
    lines.push('> 首次运行，暂无环比基期。下次运行（或下周）即可看到「升温词」。');
    lines.push('');
  }
  lines.push('## 一、本周高频 AI 专业名词（TOP 30）');
  lines.push('');
  lines.push('| # | 专业名词 | 出现次数 | 环比 | 样本标题 |');
  lines.push('|---|---------|---------|------|---------|');
  top.forEach((t, i) => {
    const r = cmp.rising.find((x) => x.term === t.term);
    const isFresh = cmp.fresh.some((x) => x.term === t.term);
    const delta = r ? `↑${r.delta}` : (isFresh ? '新增' : '—');
    lines.push(`| ${i + 1} | ${t.term} | ${t.count} | ${delta} | ${(t.samples[0] || '').slice(0, 26)} |`);
  });
  lines.push('');
  if (cmp.rising.length) {
    lines.push('## 二、升温词（做标题优先用这些）');
    lines.push('');
    cmp.rising.slice(0, 15).forEach((t) => {
      lines.push(`- **${t.term}**　${t.prev} → ${t.count}（+${t.delta}）`);
    });
    lines.push('');
  }
  if (cmp.fresh.length) {
    lines.push('## 三、本周新出现（值得提前布局）');
    lines.push('');
    cmp.fresh.slice(0, 15).forEach((t) => lines.push(`- **${t.term}**　${t.count} 次`));
    lines.push('');
  }
  lines.push('## 四、根词检索明细');
  lines.push('');
  lines.push('| 根词 | 近周条数 | 抓取总数 | 状态 |');
  lines.push('|------|---------|---------|------|');
  perRoot.forEach((p) => lines.push(`| ${p.root} | ${p.recent} | ${p.fetched} | ${p.error ? '失败' : '正常'} |`));
  lines.push('');
  lines.push('> 本词表由搜狗微信公开检索生成，用于选题与正文关键词覆盖，非微信官方下拉词。');

  fs.writeFileSync(path.join(SEO_DIR, 'radar-report.md'), lines.join('\n'), 'utf-8');

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.error('');
    console.error(`[关键词雷达] 完成。扫描 ${unique.length} 篇，提取 ${terms.length} 个专业名词。`);
    console.error(`  周词表: ${weekFile}`);
    console.error(`  报告:   ${path.join(SEO_DIR, 'radar-report.md')}`);
    console.error(`  TOP 10: ${terms.slice(0, 10).map((t) => t.term).join('、')}`);
  }
}

main().catch((e) => { console.error('运行失败：' + e.message); process.exit(1); });
