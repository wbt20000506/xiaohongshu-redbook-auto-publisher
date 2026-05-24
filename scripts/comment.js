const { chromium } = require('playwright');
const path = require('path');
const { program } = require('commander');

program
    .requiredOption('-u, --url <url>', '帖子链接')
    .requiredOption('-c, --content <content>', '评论内容')
    .option('--headless <boolean>', '无头模式', 'true')
    .parse(process.argv);

const options = program.opts();

async function run() {
    const userDataDir = path.join(__dirname, '../.browser_data');
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: options.headless === 'true',
        viewport: { width: 1280, height: 1000 }
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
    
    console.error('[Comment] 正在打开页面: ' + options.url + '...');
    await page.goto(options.url, { waitUntil: 'networkidle' });

    try {
        // 定位评论框
        // 小红书详情页评论框常见选择器
        const inputSelector = '.content-edit, div.tiptap.ProseMirror, .comment-input div[contenteditable="true"]';
        await page.waitForSelector(inputSelector, { timeout: 15000 });
        const input = page.locator(inputSelector).first();
        
        await input.click({ force: true });
        await page.waitForTimeout(1000);

        console.error('[Comment] 正在输入评论...');
        // 模拟人工输入，带延迟
        await page.keyboard.type(options.content, { delay: 100 });
        await page.waitForTimeout(1000);

        // 点击发送
        const sendBtnSelectors = [
            'button:has-text("发布")',
            'button:has-text("发送")',
            '.submit-btn',
            '.send-btn'
        ];
        
        let sent = false;
        for (const selector of sendBtnSelectors) {
            const btn = page.locator(selector).first();
            if (await btn.isVisible()) {
                await btn.click();
                sent = true;
                console.error('[Comment] 评论已通过按钮发送');
                break;
            }
        }

        if (!sent) {
            await page.keyboard.press('Enter');
            console.error('[Comment] 尝试通过 Enter 键发送');
            sent = true;
        }

        console.log(JSON.stringify({ success: sent }));
    } catch (e) {
        console.log(JSON.stringify({ success: false, error: e.message }));
    }

    await page.waitForTimeout(3000); // 留时间给提交请求
    await context.close();
}

run().catch(err => {
    console.error(JSON.stringify({ success: false, error: err.message }));
    process.exit(1);
});
