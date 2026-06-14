---
name: xhs-card
description: 小红书高清卡片图片生成工具。支持 10 种风格预览选择，将 Markdown 内容转换为 3:4 比例的精美卡片图片。
---

# 小红书卡片图片生成器

将 Markdown 文本转换为小红书风格的高清卡片图片。内置 10 种精美风格。

## 工作流程

### 第一步：预览（打开浏览器让用户看）

```bash
node scripts/generate-image.js \
  --title "卡片标题" \
  --content "Markdown内容" \
  --preview
```

这会在浏览器中打开一个页面，展示 10 种风格的缩略图预览。**不保存任何文件**。
然后等待用户告诉你喜欢哪个风格（编号或名称）。

### 第二步：正式生成（用户选好风格后）

```bash
node scripts/generate-image.js \
  --title "卡片标题" \
  --content "Markdown内容" \
  --style <风格ID>
```

这会用指定风格生成所有分页的高清卡片，保存到：
`/Users/wave/Documents/xhs-card/<YYYYMMDD-HHmmss-标题>/`

### 多页卡片

使用 `---` 分隔内容可生成多张卡片：

```bash
node scripts/generate-image.js \
  --title "长文章标题" \
  --content "第一页内容... --- 第二页内容..." \
  --style dark-tech
```

### 参数说明

- `-t, --title <title>`: 卡片标题（必填）
- `-c, --content <content>`: Markdown 内容（必填）
- `-o, --output <name>`: 输出目录名后缀（可选，默认用标题）
- `-s, --style <id>`: 指定风格 ID 进行正式生成
- `--preview`: 在浏览器中打开预览，不保存文件

### 可用风格 ID

| 编号 | ID | 名称 | 适用场景 |
|------|------|------|---------|
| 01 | dark-tech | 深色科技 | GitHub Trending、AI 工具、技术排名 |
| 02 | cream-page | 奶白书页 | 知识分享、教程、笔记 |
| 03 | apple-minimal | 苹果极简 | 产品发布、正式公告 |
| 04 | sunset-warm | 日落暖橘 | 生活方式、美食、旅行 |
| 05 | ocean-blue | 深海蓝境 | 商业分析、行业报告、深度思考 |
| 06 | rose-elegant | 玫瑰雅致 | 女性向内容、穿搭、护肤 |
| 07 | forest-green | 森林绿野 | 环保、健康、自然主题 |
| 08 | magazine | 杂志排版 | 长文分析、行业报告、专栏 |
| 09 | neon-purple | 霓虹紫夜 | 潮流文化、音乐、电竞 |
| 10 | ink-wash | 水墨国风 | 文化、读书、传统美学 |

## 输出格式

```
/Users/wave/Documents/xhs-card/<YYYYMMDD-HHmmss-标题>/
├── copy.md          # 文案文件
├── slide-01.png     # 第 1 页卡片
├── slide-02.png     # 第 2 页卡片
└── ...
```

## 技能资源

- **渲染脚本**: `scripts/generate-image.js`
- **文案指南**: `references/copywriting-guide.md`
