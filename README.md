# xiaohongshu-redbook-auto-publisher 🚀

基于 Node.js 和 Playwright 的小红书 (Xiaohongshu / RED) 自动化发布与互动脚本。
专为 AI Agent (如 Gemini CLI / Cursor) 设计，通过模拟真实按键解决富文本标签变蓝难题，支持多图渲染、持久化免扫码登录、自动搜索与评论。

## 📦 1. 安装与准备

1.  克隆项目并安装依赖：
    \`\`\`bash
    git clone <your-repo-url>
    cd xiaohongshu-redbook-auto-publisher
    npm install
    npx playwright install chromium
    \`\`\`

2.  **首次运行必须扫码登录**：
    \`\`\`bash
    node scripts/login.js
    \`\`\`
    *弹出的浏览器中，请确保“小红书主站”和“创作者中心”都扫码登录成功。登录状态会保存在 .browser_data 目录下，后续运行无需再次扫码。*

---

## 🚀 2. 核心功能：自动化发布笔记

### 步骤 A：生成高清图片卡片 (可选)
使用内置脚本将 Markdown 文案转换为 3:4 的高清图片卡片（使用 --- 分隔可生成多张）：
\`\`\`bash
node scripts/generate-image.js \
  --title "你的爆款标题" \
  --content "第一页内容... --- 第二页内容..." \
  --output "card.png"
\`\`\`

### 步骤 B：执行自动化发布
支持自动填充标题、正文、上传多张图片，并**完美处理 #话题标签 变蓝**。
\`\`\`bash
node scripts/publish.js \
  --title "你的爆款标题" \
  --content "你的正文内容 #标签1 #标签2" \
  --images "card_1.png" "card_2.png"
\`\`\`
*注：为保证安全，脚本填装完毕后会暂停，请在浏览器中确认无误后，手动点击“发布”。*

---

## 💬 3. 核心功能：自动化搜索与评论

### 动作 A：搜索帖子获取 URL
获取某个关键词下最新帖子的标题和链接：
\`\`\`bash
node scripts/search.js --keyword "AI开发工具" --limit 5
\`\`\`

### 动作 B：抓取帖子正文
读取帖子详情，用于喂给 AI 生成有针对性的评论：
\`\`\`bash
node scripts/read.js --url "https://www.xiaohongshu.com/explore/..."
\`\`\`

### 动作 C：自动发送评论
在指定帖子下方，模拟人工打字发送评论：
\`\`\`bash
node scripts/comment.js \
  --url "https://www.xiaohongshu.com/explore/..." \
  --content "非常有深度的见解，学到了！"
\`\`\`

---

## ⚠️ 注意事项
*   本项目未开源任何绕过验证码或风控的代码，仅模拟日常键盘鼠标操作。
*   建议控制调用频率，切勿用于恶意营销发帖，以免账号被平台风控。
