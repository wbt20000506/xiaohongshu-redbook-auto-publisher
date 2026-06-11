const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { program } = require('commander');

program
    .requiredOption('-t, --title <title>', '卡片标题')
    .option('-c, --content <content>', 'Markdown内容')
    .option('-f, --content-file <path>', '从文件读取内容')
    .option('-s, --style <style>', '风格 ID', 'cream-page')
    .option('-o, --output <path>', '输出图片路径', 'card.png')
    .parse(process.argv);

const options = program.opts();
if (!options.content && !options.contentFile) {
    console.error('错误: 必须提供 -c 或 -f 参数');
    process.exit(1);
}
if (options.contentFile) {
    options.content = fs.readFileSync(options.contentFile, 'utf8');
}

const stylesPath = path.join(__dirname, '..', 'references', 'styles.json');
const stylesData = JSON.parse(fs.readFileSync(stylesPath, 'utf8'));
const style = stylesData.styles.find(s => s.id === options.style) || stylesData.styles[0];

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderContent(raw) {
    const lines = raw.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n').split('\n');
    const html = [];
    let inParagraph = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed === '') {
            if (inParagraph) {
                html.push('</p>');
                inParagraph = false;
            }
            continue;
        }

        if (trimmed.startsWith('## ')) {
            if (inParagraph) {
                html.push('</p>');
                inParagraph = false;
            }
            const text = escapeHtml(trimmed.slice(3));
            const styled = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/==(.*?)==/g, '<span class="hl">$1</span>');
            html.push(`<h3>${styled}</h3>`);
            continue;
        }

        if (!inParagraph) {
            html.push('<p>');
            inParagraph = true;
        } else {
            html.push('<br>');
        }

        const styled = escapeHtml(trimmed)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/==(.*?)==/g, '<span class="hl">$1</span>');
        html.push(styled);
    }

    if (inParagraph) html.push('</p>');
    return html.join('');
}

function generateHtml(title, content, pageNum, totalPages) {
    const { colors, typography, layout } = style;
    const rendered = renderContent(content);

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@600;700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    width: ${style.size.width}px;
    height: ${style.size.height}px;
    background: ${colors.background};
    font-family: 'PingFang SC', -apple-system, ${typography.bodyFont};
    -webkit-font-smoothing: antialiased;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card {
    width: ${style.size.width - layout.padding * 2}px;
    min-height: ${style.size.height - layout.padding * 2}px;
    padding: ${layout.padding}px;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
}

.title {
    font-family: ${typography.titleFont};
    font-size: ${typography.titleSize}px;
    font-weight: 700;
    color: ${colors.text};
    line-height: 1.2;
    margin-bottom: 52px;
    letter-spacing: -0.02em;
}

.content h3 {
    font-size: 42px;
    font-weight: 700;
    color: ${colors.text};
    line-height: 1.3;
    margin-top: 40px;
    margin-bottom: 20px;
}

.content h3:first-child {
    margin-top: 0;
}

.content p {
    font-size: ${typography.bodySize}px;
    color: ${colors.text};
    line-height: ${typography.lineHeight};
    margin-bottom: 28px;
}

.content p:last-child {
    margin-bottom: 0;
}

.content strong {
    font-weight: 700;
    color: ${colors.text};
}

.content .hl {
    background: linear-gradient(to top, ${colors.highlight} 0%, ${colors.highlight} 35%, transparent 35%);
    font-weight: 700;
}
</style>
</head>
<body>
    <div class="card">
        <div class="title">${escapeHtml(title)}</div>
        <div class="content">${rendered}</div>
    </div>
</body>
</html>`;
}

async function run() {
    const rawSegments = options.content.split('---');
    const cards = rawSegments.map(seg =>
        seg.replace(/(\\n)+/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
    ).filter(seg => seg.length > 0);

    console.log(`[xhs-card] 风格: ${style.name} (${style.id})`);
    console.log(`[xhs-card] 检测到 ${cards.length} 页内容`);

    const browser = await chromium.launch();
    const baseOutputPath = options.output.replace('.png', '');

    for (let i = 0; i < cards.length; i++) {
        const page = await browser.newPage();
        await page.setViewportSize({ width: style.size.width, height: style.size.height });
        await page.setContent(generateHtml(options.title, cards[i], i + 1, cards.length));
        await page.waitForTimeout(500);

        const suffix = cards.length === 1 ? '' : `_${String(i + 1).padStart(2, '0')}`;
        const fileName = `${baseOutputPath}${suffix}.png`;
        await page.screenshot({ path: fileName, fullPage: true });
        console.log(`[xhs-card] 已生成: ${path.resolve(fileName)}`);
        await page.close();
    }

    await browser.close();
    console.log(`[xhs-card] 全部完成！`);
}

run().catch(err => {
    console.error('[xhs-card] 错误:', err);
    process.exit(1);
});
