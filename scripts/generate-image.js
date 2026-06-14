const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { program } = require('commander');

// ============================================================
// 10 种小红书卡片风格定义
// ============================================================
const STYLES = [
    {
        id: 'dark-tech',
        name: '深色科技',
        desc: 'GitHub Trending、AI 工具、技术排名',
        bg: '#0d1117',
        cardBg: '#161b22',
        text: '#e6edf3',
        textSecondary: '#8b949e',
        accent: '#58a6ff',
        titleDecor: 'left-border',
        titleDecoColor: '#58a6ff',
        fontTitle: "'SF Mono', 'JetBrains Mono', 'PingFang SC', monospace",
        fontBody: "'Inter', 'PingFang SC', sans-serif",
        cardRadius: 24,
        shadow: '0 16px 48px rgba(0,0,0,0.4)',
    },
    {
        id: 'cream-page',
        name: '奶白书页',
        desc: '知识分享、教程、笔记',
        bg: '#f5f0eb',
        cardBg: '#fffdf9',
        text: '#1a1a1a',
        textSecondary: '#888888',
        accent: '#1a1a1a',
        titleDecor: 'underline',
        titleDecoColor: 'rgba(255,183,77,0.5)',
        fontTitle: "'Noto Serif SC', Georgia, 'PingFang SC', serif",
        fontBody: "'Noto Sans SC', 'PingFang SC', sans-serif",
        cardRadius: 0,
        shadow: 'none',
    },
    {
        id: 'apple-minimal',
        name: '苹果极简',
        desc: '产品发布、正式公告',
        bg: '#ffffff',
        cardBg: '#ffffff',
        text: '#1d1d1f',
        textSecondary: '#86868b',
        accent: '#0071e3',
        titleDecor: 'none',
        titleDecoColor: '#0071e3',
        fontTitle: "-apple-system, 'SF Pro Display', 'PingFang SC', sans-serif",
        fontBody: "-apple-system, 'SF Pro Text', 'PingFang SC', sans-serif",
        cardRadius: 0,
        shadow: 'none',
    },
    {
        id: 'sunset-warm',
        name: '日落暖橘',
        desc: '生活方式、美食、旅行',
        bg: 'linear-gradient(160deg, #ffecd2 0%, #fcb69f 100%)',
        cardBg: 'rgba(255,255,255,0.92)',
        text: '#2d1810',
        textSecondary: '#8b5e3c',
        accent: '#e85d04',
        titleDecor: 'left-border',
        titleDecoColor: '#e85d04',
        fontTitle: "'PingFang SC', 'Noto Sans SC', sans-serif",
        fontBody: "'PingFang SC', 'Noto Sans SC', sans-serif",
        cardRadius: 32,
        shadow: '0 20px 60px rgba(232,93,4,0.15)',
    },
    {
        id: 'ocean-blue',
        name: '深海蓝境',
        desc: '商业分析、行业报告、深度思考',
        bg: 'linear-gradient(135deg, #0c1445 0%, #1a237e 50%, #0d47a1 100%)',
        cardBg: 'rgba(255,255,255,0.06)',
        text: '#e8eaf6',
        textSecondary: '#7986cb',
        accent: '#82b1ff',
        titleDecor: 'left-border',
        titleDecoColor: '#82b1ff',
        fontTitle: "'PingFang SC', 'Noto Sans SC', sans-serif",
        fontBody: "'PingFang SC', 'Noto Sans SC', sans-serif",
        cardRadius: 20,
        shadow: '0 8px 32px rgba(0,0,0,0.3)',
    },
    {
        id: 'rose-elegant',
        name: '玫瑰雅致',
        desc: '女性向内容、穿搭、护肤',
        bg: 'linear-gradient(150deg, #fce4ec 0%, #f8bbd0 100%)',
        cardBg: 'rgba(255,255,255,0.88)',
        text: '#3e2723',
        textSecondary: '#8d6e63',
        accent: '#c2185b',
        titleDecor: 'underline',
        titleDecoColor: 'rgba(194,24,91,0.3)',
        fontTitle: "'PingFang SC', 'Noto Serif SC', serif",
        fontBody: "'PingFang SC', 'Noto Sans SC', sans-serif",
        cardRadius: 36,
        shadow: '0 20px 60px rgba(194,24,91,0.1)',
    },
    {
        id: 'forest-green',
        name: '森林绿野',
        desc: '环保、健康、自然主题',
        bg: 'linear-gradient(160deg, #e8f5e9 0%, #c8e6c9 100%)',
        cardBg: 'rgba(255,255,255,0.9)',
        text: '#1b5e20',
        textSecondary: '#558b2f',
        accent: '#2e7d32',
        titleDecor: 'left-border',
        titleDecoColor: '#43a047',
        fontTitle: "'PingFang SC', 'Noto Sans SC', sans-serif",
        fontBody: "'PingFang SC', 'Noto Sans SC', sans-serif",
        cardRadius: 28,
        shadow: '0 16px 48px rgba(46,125,50,0.12)',
    },
    {
        id: 'magazine',
        name: '杂志排版',
        desc: '长文分析、行业报告、专栏',
        bg: '#f3eee2',
        cardBg: '#fffef8',
        text: '#1f1c17',
        textSecondary: '#6e6a5d',
        accent: '#b85a3a',
        titleDecor: 'top-line',
        titleDecoColor: '#b85a3a',
        fontTitle: "'Noto Serif SC', 'Playfair Display', Georgia, serif",
        fontBody: "'Noto Sans SC', 'PingFang SC', sans-serif",
        cardRadius: 0,
        shadow: 'none',
    },
    {
        id: 'neon-purple',
        name: '霓虹紫夜',
        desc: '潮流文化、音乐、电竞',
        bg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #11001c 100%)',
        cardBg: 'rgba(255,255,255,0.05)',
        text: '#f3e5f5',
        textSecondary: '#ba68c8',
        accent: '#e040fb',
        titleDecor: 'left-border',
        titleDecoColor: '#e040fb',
        fontTitle: "'PingFang SC', 'Noto Sans SC', sans-serif",
        fontBody: "'PingFang SC', 'Noto Sans SC', sans-serif",
        cardRadius: 20,
        shadow: '0 0 60px rgba(224,64,251,0.15)',
    },
    {
        id: 'ink-wash',
        name: '水墨国风',
        desc: '文化、读书、传统美学',
        bg: '#f7f4ef',
        cardBg: '#fefdfb',
        text: '#2c2c2c',
        textSecondary: '#7a7a7a',
        accent: '#c62828',
        titleDecor: 'left-border',
        titleDecoColor: '#c62828',
        fontTitle: "'Noto Serif SC', 'STSong', 'SimSun', serif",
        fontBody: "'Noto Sans SC', 'PingFang SC', sans-serif",
        cardRadius: 4,
        shadow: '0 2px 20px rgba(0,0,0,0.06)',
    },
];

// ============================================================
// 生成单张卡片 HTML
// ============================================================
function buildCardHTML(style, title, content, pageNum, totalPages) {
    const isSolidBg = !style.bg.includes('gradient');
    const bgCSS = isSolidBg ? `background-color: ${style.bg};` : `background: ${style.bg};`;

    let titleDecoCSS = '';
    switch (style.titleDecor) {
        case 'left-border':
            titleDecoCSS = `border-left: 16px solid ${style.titleDecoColor}; padding-left: 36px;`;
            break;
        case 'underline':
            titleDecoCSS = `display: inline; background-image: linear-gradient(to top, ${style.titleDecoColor} 30%, transparent 30%); padding: 0 8px;`;
            break;
        case 'top-line':
            titleDecoCSS = `padding-top: 36px; border-top: 6px solid ${style.titleDecoColor}; display: inline-block;`;
            break;
        default:
            titleDecoCSS = '';
    }

    const hasCard = style.cardBg !== style.bg && style.cardRadius > 0;

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 1080px; height: 1440px;
            ${bgCSS}
            font-family: ${style.fontBody};
            display: flex; justify-content: center; align-items: center;
            overflow: hidden;
        }
        .card {
            width: ${hasCard ? '920px' : '1080px'};
            ${hasCard ? `
                background: ${style.cardBg};
                border-radius: ${style.cardRadius}px;
                box-shadow: ${style.shadow};
                padding: 72px 64px;
            ` : `
                padding: 80px 72px;
            `}
            display: flex; flex-direction: column;
            min-height: ${hasCard ? '600px' : '1440px'};
            max-height: ${hasCard ? '1280px' : '1440px'};
            justify-content: flex-start;
        }
        .page-num {
            font-size: 28px; color: ${style.textSecondary};
            margin-bottom: 24px; text-align: right;
            font-family: ${style.fontBody}; opacity: 0.7;
        }
        .title {
            font-size: 56px; font-weight: 800; color: ${style.text};
            margin-bottom: 48px; line-height: 1.4;
            font-family: ${style.fontTitle}; letter-spacing: 1px;
            ${titleDecoCSS}
        }
        .content {
            font-size: 38px; color: ${style.text}; line-height: 1.9;
            word-wrap: break-word; white-space: pre-wrap;
            font-family: ${style.fontBody}; flex: 1;
        }
        .content h2, .content h3 {
            font-size: 44px; font-weight: 700; margin: 32px 0 16px 0; color: ${style.accent};
        }
        .content strong { color: ${style.accent}; font-weight: 700; }
    </style>
</head>
<body>
    <div class="card">
        ${totalPages > 1 ? `<div class="page-num">${pageNum} / ${totalPages}</div>` : ''}
        <div class="title">${title}</div>
        <div class="content">${content}</div>
    </div>
</body>
</html>`;
}

// ============================================================
// 生成预览总览 HTML（10 种风格缩略图 + 编号标签）
// ============================================================
function buildPreviewPageHTML(title, content, screenshotDataURLs) {
    const cards = screenshotDataURLs.map((dataURL, i) => {
        const style = STYLES[i];
        return `
        <div class="preview-item">
            <div class="preview-img-wrap">
                <img src="${dataURL}" alt="${style.name}" />
            </div>
            <div class="preview-label">
                <span class="preview-num">${String(i + 1).padStart(2, '0')}</span>
                <span class="preview-name">${style.name}</span>
            </div>
            <div class="preview-desc">${style.desc}</div>
        </div>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>小红书卡片风格预览 — ${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #0a0a0a; color: #e0e0e0;
            font-family: -apple-system, 'PingFang SC', 'Noto Sans SC', sans-serif;
            padding: 40px 60px 80px;
        }
        h1 {
            font-size: 36px; font-weight: 700; text-align: center;
            margin-bottom: 12px; color: #fff;
        }
        .subtitle {
            text-align: center; font-size: 16px; color: #666;
            margin-bottom: 48px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 32px;
            max-width: 1600px; margin: 0 auto;
        }
        .preview-item {
            cursor: pointer; transition: transform 0.2s;
        }
        .preview-item:hover { transform: translateY(-6px); }
        .preview-img-wrap {
            border-radius: 12px; overflow: hidden;
            box-shadow: 0 8px 30px rgba(0,0,0,0.5);
            aspect-ratio: 3/4;
        }
        .preview-img-wrap img {
            width: 100%; height: 100%; object-fit: cover;
            display: block;
        }
        .preview-label {
            margin-top: 14px; display: flex; align-items: center; gap: 10px;
        }
        .preview-num {
            background: #333; color: #fff; font-size: 13px;
            padding: 2px 8px; border-radius: 4px; font-weight: 600;
            font-family: 'SF Mono', monospace;
        }
        .preview-name {
            font-size: 17px; font-weight: 600; color: #fff;
        }
        .preview-desc {
            font-size: 13px; color: #666; margin-top: 4px;
        }
    </style>
</head>
<body>
    <h1>选择你喜欢的卡片风格</h1>
    <div class="subtitle">标题：${title} ｜ 告诉我编号即可生成</div>
    <div class="grid">${cards}</div>
</body>
</html>`;
}

// ============================================================
// 命令行参数
// ============================================================
program
    .requiredOption('-t, --title <title>', '卡片标题')
    .requiredOption('-c, --content <content>', 'Markdown内容')
    .option('-o, --output <path>', '输出目录名后缀（可选）')
    .option('-s, --style <id>', '直接指定风格 ID，跳过预览')
    .option('--preview', '在浏览器中打开预览，不保存文件')
    .parse(process.argv);

const options = program.opts();

// ============================================================
// 主流程
// ============================================================
async function run() {
    // 1. 处理内容分页
    const rawSegments = options.content.split('---');
    const cards = rawSegments.map(seg => {
        return seg
            .replace(/(\\n)+/g, '\n')
            .replace(/\n+/g, '\n')
            .replace(/#/g, ' #')
            .replace(/ +/g, ' ')
            .trim();
    }).filter(seg => seg.length > 0);

    console.log(`\n[XHS Card] 检测到 ${cards.length} 页内容`);
    console.log(`[XHS Card] 标题: ${options.title}\n`);

    // ==================== 预览模式 ====================
    if (options.preview) {
        console.log('[XHS Card] 正在生成 10 种风格预览...');

        const browser = await chromium.launch();
        const screenshotDataURLs = [];

        for (let si = 0; si < STYLES.length; si++) {
            const style = STYLES[si];
            const page = await browser.newPage();
            await page.setViewportSize({ width: 1080, height: 1440 });

            const html = buildCardHTML(style, options.title, cards[0], 1, cards.length);
            await page.setContent(html);
            await page.waitForTimeout(300);

            const buffer = await page.screenshot({ type: 'png' });
            screenshotDataURLs.push(`data:image/png;base64,${buffer.toString('base64')}`);
            await page.close();

            console.log(`  [${String(si + 1).padStart(2, '0')}/${STYLES.length}] ${style.name}`);
        }

        await browser.close();

        // 生成预览 HTML 并用浏览器打开
        const previewHTML = buildPreviewPageHTML(options.title, cards[0], screenshotDataURLs);
        const previewPath = path.join(__dirname, '..', '.preview.html');
        fs.writeFileSync(previewPath, previewHTML, 'utf-8');

        console.log(`\n[XHS Card] ✅ 预览页面已生成，正在打开浏览器...`);

        const { execSync } = require('child_process');
        execSync(`open "${previewPath}"`);

        console.log(`[XHS Card] 请在浏览器中查看 10 种风格，然后告诉我你喜欢哪个编号。\n`);

        // 输出风格列表供参考
        STYLES.forEach((s, i) => {
            console.log(`  ${String(i + 1).padStart(2, '0')}. ${s.name} (${s.id}) — ${s.desc}`);
        });
        console.log('');
        return;
    }

    // ==================== 正式生成模式 ====================
    if (!options.style) {
        console.error('[XHS Card] ❌ 正式生成需要指定风格: --style <id>');
        console.error('[XHS Card] 请先用 --preview 预览，选好风格后再指定 --style');
        console.error(`[XHS Card] 可用风格: ${STYLES.map(s => s.id).join(', ')}`);
        process.exit(1);
    }

    const chosenIndex = STYLES.findIndex(s => s.id === options.style);
    if (chosenIndex === -1) {
        console.error(`[XHS Card] ❌ 未找到风格: ${options.style}`);
        console.error(`[XHS Card] 可用风格: ${STYLES.map(s => s.id).join(', ')}`);
        process.exit(1);
    }

    const chosenStyle = STYLES[chosenIndex];
    console.log(`[XHS Card] 使用风格: ${chosenStyle.name} (${chosenStyle.id})\n`);

    // 生成输出目录
    const now = new Date();
    const timestamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
        '-',
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
        String(now.getSeconds()).padStart(2, '0'),
    ].join('');

    const slugTitle = options.output
        || options.title.replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '').substring(0, 40);
    const outputDirName = `${timestamp}-${slugTitle}`;
    const outputDir = path.join('/Users/wave/Documents/xhs-card', outputDirName);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 生成所有页的高清卡片
    const browser = await chromium.launch();

    console.log(`[XHS Card] 正在生成 ${cards.length} 张高清卡片...\n`);

    for (let i = 0; i < cards.length; i++) {
        const page = await browser.newPage();
        await page.setViewportSize({ width: 1080, height: 1440 });

        const html = buildCardHTML(chosenStyle, options.title, cards[i], i + 1, cards.length);
        await page.setContent(html);
        await page.waitForTimeout(400);

        const fileName = `slide-${String(i + 1).padStart(2, '0')}.png`;
        const filePath = path.join(outputDir, fileName);
        await page.screenshot({ path: filePath });
        await page.close();

        console.log(`  [${i + 1}/${cards.length}] ${filePath}`);
    }

    // 保存 copy.md（文案模板，待 AI 填入正式文案）
    const copyContent = [
        '# 小红书文案',
        '',
        '## 标题选项',
        '',
        `1. ${options.title}`,
        '2. ',
        '3. ',
        '',
        '## 正文',
        '',
        '（待填写发帖正文，与卡片内容独立）',
        '',
        '## 标签',
        '',
        '（待填写 15-20 个标签）',
        '',
        '---',
        '',
        '## 卡片信息',
        '',
        `- **使用风格**: ${chosenStyle.name} (${chosenStyle.id})`,
        `- **风格说明**: ${chosenStyle.desc}`,
        `- **卡片页数**: ${cards.length}`,
        '',
    ].join('\n');
    fs.writeFileSync(path.join(outputDir, 'copy.md'), copyContent, 'utf-8');

    await browser.close();

    // 清理预览文件
    const previewPath = path.join(__dirname, '..', '.preview.html');
    if (fs.existsSync(previewPath)) {
        fs.unlinkSync(previewPath);
    }

    console.log(`\n${'═'.repeat(50)}`);
    console.log(`[XHS Card] ✅ 完成！所有文件已保存到:`);
    console.log(`  ${outputDir}`);
    console.log(`${'═'.repeat(50)}\n`);
}

run().catch(err => {
    console.error('[XHS Card] 发生错误:', err);
    process.exit(1);
});
