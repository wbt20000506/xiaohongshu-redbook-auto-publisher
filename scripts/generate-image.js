const { chromium } = require('playwright');
const path = require('path');
const { marked } = require('marked');
const fs = require('fs');
const { program } = require('commander');

program
    .requiredOption('-t, --title <title>', '卡片标题')
    .requiredOption('-c, --content <content>', 'Markdown内容')
    .option('-o, --output <path>', '输出图片路径', 'card.png')
    .parse(process.argv);

const options = program.opts();

async function run() {
    // 1. 分页逻辑：支持通过 --- 分隔符生成多张卡片
    const rawSegments = options.content.split('---');
    const cards = rawSegments.map(seg => {
        return seg
            .replace(/(\\n)+/g, '\n')
            .replace(/\n+/g, '\n')
            .replace(/#/g, ' #')
            .replace(/ +/g, ' ')
            .trim();
    }).filter(seg => seg.length > 0);

    console.log(`[Image] 检测到 ${cards.length} 页内容，准备生成高清卡片...`);

    const browser = await chromium.launch();
    const baseOutputPath = options.output.replace('.png', '');

    for (let i = 0; i < cards.length; i++) {
        const page = await browser.newPage();
        await page.setViewportSize({ width: 1242, height: 1656 });

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    margin: 0; padding: 0;
                    width: 1242px; height: 1656px;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    font-family: "PingFang SC", "Microsoft YaHei", "Segoe UI Emoji", sans-serif;
                    display: flex; justify-content: center; align-items: center;
                }
                .card {
                    width: 1000px; background: white; border-radius: 40px;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.1); padding: 80px;
                    display: flex; flex-direction: column; min-height: 800px;
                }
                .title {
                    font-size: 72px; font-weight: bold; color: #333;
                    margin-bottom: 60px; line-height: 1.3;
                    border-left: 20px solid #ff2442; padding-left: 40px;
                }
                .content {
                    font-size: 52px; color: #444; line-height: 1.8;
                    word-wrap: break-word; white-space: pre-wrap; 
                }
                .footer {
                    margin-top: 80px; font-size: 36px; color: #bbb;
                    text-align: right; border-top: 2px solid #f0f0f0; padding-top: 40px;
                }
                .page-num {
                    font-size: 32px; color: #ddd; margin-bottom: 20px; text-align: right;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="page-num">${i + 1} / ${cards.length}</div>
                <div class="title">${options.title}</div>
                <div class="content">${cards[i]}</div>

            </div>
        </body>
        </html>
        `;

        await page.setContent(htmlContent);
        await page.waitForTimeout(500);
        
        const fileName = cards.length === 1 ? `${baseOutputPath}.png` : `${baseOutputPath}_${i + 1}.png`;
        await page.screenshot({ path: fileName, fullPage: true });
        console.log(`[Image] 已生成第 ${i+1} 张卡片: ${path.resolve(fileName)}`);
        await page.close();
    }

    await browser.close();
    console.log(`[Image] 所有 ${cards.length} 张高清卡片生成完毕！`);
}

run().catch(err => {
    console.error('[Image] 发生错误:', err);
    process.exit(1);
});
