const { chromium } = require('playwright');
const path = require('path');
const { program } = require('commander');

program
    .requiredOption('-k, --keyword <keyword>', '搜索关键词')
    .option('-l, --limit <limit>', '抓取数量', '5')
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
    
    // 直接进入小红书搜索页面
    const searchUrl = 'https://www.xiaohongshu.com/search_result?keyword=' + encodeURIComponent(options.keyword);
    console.error('[Search] 正在搜索: ' + options.keyword + '...');
    
    await page.goto(searchUrl);
    
    // 等待搜索结果列表出现
    try {
        await page.waitForSelector('section.note-item', { timeout: 15000 });
    } catch (e) {
        // 如果 section.note-item 不行，尝试更宽泛的
        await page.waitForTimeout(5000);
    }

    const posts = await page.evaluate((limit) => {
        const items = Array.from(document.querySelectorAll('section.note-item'));
        return items.slice(0, limit).map(item => {
            const titleEl = item.querySelector('.title span') || item.querySelector('.title');
            const linkEl = item.querySelector('a.cover');
            return {
                title: titleEl ? titleEl.innerText.trim() : '无标题',
                url: linkEl ? 'https://www.xiaohongshu.com' + linkEl.getAttribute('href') : ''
            };
        }).filter(p => p.url);
    }, parseInt(options.limit));

    console.log(JSON.stringify({ success: true, count: posts.length, posts: posts }, null, 2));
    await context.close();
}

run().catch(err => {
    console.error(JSON.stringify({ success: false, error: err.message }));
    process.exit(1);
});
