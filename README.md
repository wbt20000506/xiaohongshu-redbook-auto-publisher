# xhs-card-generator

小红书高清卡片图片生成工具。内置 10 种精美风格，先预览再保存。

## 安装

```bash
npm install
npx playwright install chromium
```

## 使用

### 标准流程（预览 → 选择 → 保存）

```bash
node scripts/generate-image.js \
  --title "你的标题" \
  --content "内容..."
```

会生成 10 种风格预览图 → 用户选择 → 保存到 `/Users/wave/Documents/xhs-card/<时间戳-标题>/`

### 直接指定风格

```bash
node scripts/generate-image.js \
  --title "标题" \
  --content "内容" \
  --style dark-tech
```

### 多页卡片

使用 `---` 分隔内容可生成多张卡片：

```bash
node scripts/generate-image.js \
  --title "长文章标题" \
  --content "第一页内容... --- 第二页内容..." 
```

## 参数

| 参数 | 说明 | 必填 | 默认值 |
|------|------|------|--------|
| `-t, --title` | 卡片标题 | 是 | - |
| `-c, --content` | Markdown 内容 | 是 | - |
| `-o, --output` | 输出目录名后缀 | 否 | 标题 |
| `-s, --style` | 风格 ID（跳过预览） | 否 | - |
| `--preview-only` | 仅预览不保存 | 否 | false |

## 10 种可用风格

| ID | 名称 | 适用场景 |
|----|------|---------|
| `dark-tech` | 深色科技 | GitHub Trending、AI 工具 |
| `cream-page` | 奶白书页 | 知识分享、教程 |
| `apple-minimal` | 苹果极简 | 产品发布、公告 |
| `sunset-warm` | 日落暖橘 | 生活方式、美食 |
| `ocean-blue` | 深海蓝境 | 商业分析、报告 |
| `rose-elegant` | 玫瑰雅致 | 穿搭、护肤 |
| `forest-green` | 森林绿野 | 环保、健康 |
| `magazine` | 杂志排版 | 长文、专栏 |
| `neon-purple` | 霓虹紫夜 | 潮流、电竞 |
| `ink-wash` | 水墨国风 | 文化、读书 |
