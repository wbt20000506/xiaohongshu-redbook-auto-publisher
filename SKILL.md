---
name: xhs-card
description: 小红书高清卡片图片生成工具。支持将 Markdown 内容转换为 3:4 比例的精美卡片图片。
---

# 小红书卡片图片生成器

将 Markdown 文本转换为小红书风格的高清卡片图片。

## 使用方法

```bash
node scripts/generate-image.js \
  --title "卡片标题" \
  --content "Markdown内容" \
  --output "card.png"
```

### 参数说明

- `-t, --title <title>`: 卡片标题（必填）
- `-c, --content <content>`: Markdown 内容（必填）
- `-o, --output <path>`: 输出路径（默认: card.png）

### 多页卡片

使用 `---` 分隔符可以生成多张卡片：

```bash
node scripts/generate-image.js \
  --title "长文章标题" \
  --content "第一页内容... --- 第二页内容..." \
  --output "card.png"
```

## 技能资源

- **渲染脚本**: `scripts/generate-image.js`
