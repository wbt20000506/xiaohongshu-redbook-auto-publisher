const { chromium } = require('playwright');
const path = require('path');
const { program } = require('commander');

program
    .requiredOption('-u, --url <url>', '帖子链接')
    .option('--headless <boolean>', '无头模式', 'true')
    .parse(process.argv);

const options = program.opts();

async function run() {
    const userDataDir = path.join(__dirname, '../.browser_data');
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: options.headless === 'true',
        viewport: { width: 1280, height: 800 }
    });

    const cookies = await context.cookies();
    if (!cookies.some(c => c.name === 'web_session')) {
        console.error('❌ 错误：检测到未登录状态，请先运行 node scripts/login.js 进行扫码登录。');
        if (__filename.includes('search.js') || __filename.includes('read.js') || __filename.includes('comment.js')) {
            console.log(JSON.stringify({ success: false, error: '未登录，请先运行 node scripts/login.js 进行扫码登录。' }));
        }
        await context.close();
        process.exit(1);
    }
    const page = context.pages()[0] || await context.newPage();
    
    console.error('[Read] 正在读取内容: ' + options.url + '...');
    await page.goto(options.url, { waitUntil: 'domcontentloaded' });

    try {
        // 等待正文出现
        await page.waitForSelector('.note-container, .desc', { timeout: 15000 });
        
        const detail = await page.evaluate(() => {
            const titleEl = document.querySelector('.title, [class*="title"]');
            const descEl = document.querySelector('.desc, [class*="desc"]');
            return { 
                title: titleEl ? titleEl.innerText : '', 
                content: descEl ? descEl.innerText : '' 
            };
        });

        console.log(JSON.stringify({ success: true, ...detail }, null, 2));
    } catch (e) {
        console.log(JSON.stringify({ success: false, error: '读取正文超时: ' + e.message }));
    }

    await context.close();
}

run().catch(err => {
    console.error(JSON.stringify({ success: false, error: err.message }));
    process.exit(1);
});
