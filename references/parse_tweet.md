# 抓取解析参考实现

把 X（Twitter）帖子页抓取并解析成 `markdown + 本地图片`。下面是**完整可运行的 Python 代码**，执行时把代码块整体写入工作区临时文件（如 `_fetch_tweet.py`），再运行：

```bash
python _fetch_tweet.py "https://x.com/用户名/status/帖子ID"
```

脚本会在当前目录产出：
- `article.md` —— 标题、作者、引言、正文、代码块（带语言标注）、图片引用（相对路径 `images/xxx.jpg`）
- `images/` —— 下载好的配图

---

## 完整代码

```python
# -*- coding: utf-8 -*-
"""抓取 X 帖子 -> markdown + 本地图片（DraftJS/Relay 解析）"""
import re, json, base64, sys, os, subprocess, urllib.request

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

def fetch_html(url):
    """用 curl 抓帖子页（需浏览器 UA，帖子页含服务端渲染的正文 + Relay JSON）"""
    r = subprocess.run(
        ["curl", "-sL", "--max-time", "40", "-A", UA, "-H", "Accept: text/html", url],
        capture_output=True
    )
    html = r.stdout.decode("utf-8", errors="ignore")
    if not html or len(html) < 5000:
        raise RuntimeError("抓取失败或页面过小，请确认链接是公开帖子")
    return html

def extract_json_string(s, start):
    """从 s[start]=='"' 解析 JSON 字符串（处理 \\ 转义），返回 (value, end)"""
    assert s[start] == '"'
    i = start + 1
    buf = []
    while i < len(s):
        c = s[i]
        if c == "\\":
            buf.append(c + s[i+1])
            i += 2
        elif c == '"':
            return "".join(buf), i + 1
        else:
            buf.append(c)
            i += 1
    raise ValueError("unterminated string")

def parse(html):
    """解析 Relay JSON，返回 (blocks, ent_data, media_entities_urls)"""
    # 1) blocks：正文块（unstyled=段落 / header-two=标题 / ordered-list-item=有序列表 / atomic=引用实体）
    blocks = {}
    for m in re.finditer(
        r'content_state:blocks:(\d+)":\$R\[\d+\]=\{__id:"[^"]*",__typename:"DraftJsBlock",'
        r'key:"[^"]*",text:"((?:[^"\\]|\\.)*)",type:"([^"]+)"', html):
        blocks[int(m.group(1))] = {"text": m.group(2), "type": m.group(3)}

    # 2) entity_ranges：block -> entity key（数字）
    er = {}
    for m in re.finditer(
        r'content_state:blocks:(\d+):entity_ranges:(\d+)":\$R\[\d+\]=\{__id:"[^"]*",'
        r'__typename:"DraftJsEntityRange",key:(\d+),length:\d+,offset:\d+\}', html):
        er[(int(m.group(1)), int(m.group(2)))] = m.group(3)

    # 3) DraftJsEntityMap：存储索引 -> key（字符串）
    entmap_key = {}
    for m in re.finditer(
        r'content_state:entity_map:(\d+)":\$R\[\d+\]=\{__id:"[^"]*",__typename:"DraftJsEntityMap",'
        r'key:"([^"]*)",value:', html):
        entmap_key[int(m.group(1))] = m.group(2)
    key_to_idx = {v: k for k, v in entmap_key.items()}

    # 4) entity 类型（MARKDOWN / MEDIA）
    ent_type = {}
    for m in re.finditer(
        r'content_state:entity_map:(\d+):value":\$R\[\d+\]=\{__id:"[^"]*",__typename:"DraftJsEntity",type:"([^"]+)"', html):
        ent_type[int(m.group(1))] = m.group(2)

    # 5) entity 数据：markdown 字段
    ent_md = {}
    for m in re.finditer(
        r'content_state:entity_map:(\d+):value:data":\$R\[\d+\]=\{__id:"[^"]*",__typename:"DraftJsEntityData",'
        r'caption:([^,]*),markdown:', html):
        idx = int(m.group(1))
        p = m.end()
        if html.startswith("null", p):
            ent_md[idx] = None
        else:
            raw, _ = extract_json_string(html, p)
            try:
                ent_md[idx] = json.loads('"' + raw + '"')
            except Exception:
                ent_md[idx] = raw.replace("\\n", "\n").replace('\\"', '"')

    # 6) MEDIA 实体的 media_id（数字）
    ent_media_id = {}
    for m in re.finditer(
        r'content_state:entity_map:(\d+):value:data:media_items:(\d+)":\$R\[\d+\]=\{__id:"[^"]*",'
        r'__typename:"ArticleMediaKey",media_id:"([^"]*)"\}', html):
        ent_media_id[int(m.group(1))] = m.group(3)

    # 7) ApiMedia id -> original_img_url
    api_url = {}
    for m in re.finditer(r'original_img_url:"(https://pbs\.twimg\.com/media/[^"]+)"', html):
        # 找它之前最近的 ApiMedia id
        seg = html[:m.start()]
        mm = re.findall(r'"QXBpTWVkaWE6[^"]+"', seg)
        if mm:
            api_url[mm[-1].strip('"')] = m.group(1)

    # 8) media_id 数字 -> URL（通过 ApiMedia id 的 protobuf 字节匹配）
    media_id_url = {}
    for idx, mid in ent_media_id.items():
        try:
            n = int(mid)
            needle = n.to_bytes(8, "big").rstrip(b"\x00")
            for aid, url in api_url.items():
                try:
                    decoded = base64.b64decode(aid)
                except Exception:
                    continue
                if needle and needle in decoded:
                    media_id_url[mid] = url
                    break
        except Exception:
            pass

    return blocks, er, key_to_idx, ent_type, ent_md, ent_media_id, media_id_url

def rebuild(html, blocks, er, key_to_idx, ent_type, ent_md, ent_media_id, media_id_url):
    """按 block 顺序重建 markdown"""
    # 标题
    title = ""
    m = re.search(r'<h1[^>]*>([^<]+)</h1>', html)
    if m:
        title = m.group(1).strip()
    else:
        m = re.search(r'property="og:description" content="([^"]+)"', html)
        if m:
            title = m.group(1).strip()

    # 作者（从 URL 或页面提取）
    author = ""
    m = re.search(r'x\.com/([A-Za-z0-9_]+)/status', sys.argv[1])
    if m:
        author = "@" + m.group(1)

    lines = [f"# {title}", ""]
    if author:
        lines += [f"> **作者**：{author}", ""]

    for i in sorted(blocks):
        b = blocks[i]
        t = b["text"]
        if b["type"] == "header-two":
            lines.append(f"\n## {t}\n")
        elif b["type"] == "atomic":
            ek = er.get((i, 0))
            emi = key_to_idx.get(ek)
            if emi is None:
                continue
            if emi in ent_md and ent_md[emi]:
                code = ent_md[emi].strip("`\n ")
                lang = "bash"
                if re.search(r'\b(import |from |def |sys\.argv|dashscope\.)', code):
                    lang = "python"
                elif re.search(r'^\s*[\w.-]+\s*:\s*\S', code, re.M):
                    lang = "yaml"
                elif re.search(r'^\s*[A-Z][A-Z0-9_]+\s*=\s*\S', code, re.M):
                    lang = "ini"
                lines.append(f"\n```{lang}\n{code}\n```\n")
            elif emi in ent_media_id:
                mid = ent_media_id[emi]
                url = media_id_url.get(mid, "")
                if url:
                    fname = url.split("/")[-1]
                    lines.append(f"\n![img](images/{fname})\n")
        elif b["type"] == "ordered-list-item":
            lines.append(f"1. {t}")
        else:
            for seg in t.split("\\n"):
                lines.append(seg)
            lines.append("")

    md = "\n".join(lines)
    md = re.sub(r"\n{3,}", "\n\n", md)
    return md, title

def download_images(md):
    """下载正文图片到 images/"""
    os.makedirs("images", exist_ok=True)
    urls = re.findall(r'!\[img\]\((images/[^)]+)\)', md)
    seen = set()
    for rel in urls:
        fname = rel.split("/")[-1]
        if fname in seen:
            continue
        seen.add(fname)
        url = f"https://pbs.twimg.com/media/{fname}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = resp.read()
            if data[:3] == b"\xff\xd8\xff":  # JPEG 校验
                open(f"images/{fname}", "wb").write(data)
        except Exception as e:
            print(f"  [图片] 下载失败 {fname}: {e}")

def main():
    if len(sys.argv) < 2:
        print("用法: python _fetch_tweet.py <帖子URL>")
        sys.exit(1)
    url = sys.argv[1]
    print(f"[1/3] 抓取 {url}")
    html = fetch_html(url)
    print(f"[2/3] 解析 Relay JSON（HTML {len(html)} 字节）")
    blocks, er, key_to_idx, ent_type, ent_md, ent_media_id, media_id_url = parse(html)
    md, title = rebuild(html, blocks, er, key_to_idx, ent_type, ent_md, ent_media_id, media_id_url)
    print(f"[3/3] 下载图片")
    download_images(md)
    open("article.md", "w", encoding="utf-8").write(md)
    n_code = md.count("```") // 2
    n_img = md.count("![img]")
    print(f"完成：标题《{title}》 代码块 {n_code} 个，图片 {n_img} 张 -> article.md")

if __name__ == "__main__":
    main()
```

---

## 关键解析要点（供排查用）

1. **正文位置**：帖子页 HTML 的服务端渲染部分有正文，但代码块/图片被折叠；完整数据在 Relay JSON 的 `DraftJsBlock` 结构里。
2. **实体映射链**：`block.entity_ranges[N].key`（数字）→ `DraftJsEntityMap.key`（字符串）→ `entity_map` 存储索引 → `DraftJsEntityData`（markdown / media）。
3. **图片 URL**：`ArticleMediaKey.media_id` 是数字，不可直接拼 URL；真实 URL 在 `ApiMedia.original_img_url`，通过数字 media_id 的大端字节（去尾部 0）在 ApiMedia 的 base64 protobuf 里匹配。
4. **代码块 markdown** 是 JSON 转义字符串，需 `json.loads` 解码（`\n`→换行、`\"`→引号）。
