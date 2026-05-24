---
name: custom-xhs-publisher
description: 自定义小红书笔记创作与互动技能。支持生成爆款文案、高清卡片图片并自动发布，同时支持搜索帖子、阅读内容并自动发表见解评论。
---

# 自定义小红书发布与互动助手

这是一个纯净、稳定的自动化工具，支持从内容发布到互动评论的完整闭环。

---

## 🛠 准备工作 (第一次使用必做)

在开始发布或评论之前，您需要先完成小红书账号的登录。
请在终端运行：
```bash
node /Users/wave/Documents/CustomXhsSkill/scripts/login.js
```
按照弹出窗口的提示完成扫码登录，然后回到终端按回车键保存会话。

---

## 📝 文案生成规范 (严格遵守)
...（此处保留原有文案规范）...

---

## 🚀 自动化发布流程
...（此处保留原有发布流程）...

---

## 💬 自动搜索与评论流程

当用户要求“针对某个话题进行评论”或“搜下相关帖子并评论”时，请按以下步骤执行：

### 第一步：搜索帖子
通过关键词获取相关的帖子列表：
```bash
node /Users/wave/Documents/CustomXhsSkill/scripts/search.js --keyword "关键词" --limit 3 --headless true
```

### 第二步：阅读内容
选择一个帖子 URL，获取其详细正文以便生成高质量见解：
```bash
node /Users/wave/Documents/CustomXhsSkill/scripts/read.js --url "帖子URL" --headless true
```

### 第三步：生成并发送评论
根据抓取的正文，生成一段 30-100 字、语气真实、见解深刻的评论，并发送：
```bash
node /Users/wave/Documents/CustomXhsSkill/scripts/comment.js --url "帖子URL" --content "生成的见解评论" --headless true
```

---

## 📂 技能资源
*   **登录脚本**：`scripts/login.js`
*   **渲染脚本**：`scripts/generate-image.js`
*   **发布脚本**：`scripts/publish.js`
*   **搜索脚本**：`scripts/search.js`
*   **阅读脚本**：`scripts/read.js`
*   **评论脚本**：`scripts/comment.js`
*   **持久化数据**：`.browser_data/`
