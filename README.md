# xhs-card-generator

小红书高清卡片图片生成工具。将 Markdown 文本转换为 3:4 比例的精美卡片图片。

## 安装

```bash
npm install
npx playwright install chromium
```

## 使用

```bash
node scripts/generate-image.js \
  --title "你的标题" \
  --content "内容..." \
  --output "card.png"
```

### 多页卡片

使用 `---` 分隔内容可生成多张卡片：

```bash
node scripts/generate-image.js \
  --title "长文章标题" \
  --content "第一页内容... --- 第二页内容..." \
  --output "card.png"
```

## 参数

| 参数 | 说明 | 必填 | 默认值 |
|------|------|------|--------|
| `-t, --title` | 卡片标题 | 是 | - |
| `-c, --content` | Markdown 内容 | 是 | - |
| `-o, --output` | 输出路径 | 否 | card.png |
