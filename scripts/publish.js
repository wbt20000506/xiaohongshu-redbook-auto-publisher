const { chromium } = require('playwright');
const path = require('path');
const { program } = require('commander');

program
    .requiredOption('-t, --title <title>', '笔记标题')
    .requiredOption('-c, --content <content>', '笔记正文')
    .requiredOption('-i, --images <images...>', '图片路径（多张用空格分隔）')
    .option('--headless <boolean>', '是否无头模式', 'false')
    .parse(process.argv);

const options = program.opts();

async function run() {
    const userDataDir = path.join(__dirname, '../.browser_data');
    console.log(`[Publish] 使用持久化上下文: ${userDataDir}`);

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
    
    console.log('[Publish] 正在打开小红书发布页面 (图文模式)...');
    await page.goto('https://creator.xiaohongshu.com/publish/publish?from=tab_switch&target=image');

    // 1. 检查是否登录
    try {
        await page.waitForSelector('.user-info', { timeout: 10000 });
    } catch (e) {
        console.error('[Publish] ❌ 错误：检测到未登录，请先运行 node scripts/login.js 进行扫码登录。');
        await context.close();
        process.exit(1);
    }

    console.log('[Publish] 准备上传图片...');
    const uploadInput = page.locator('input[type="file"]');
    await uploadInput.waitFor({ state: 'attached', timeout: 10000 });
    
    const absolutePaths = options.images.map(p => path.resolve(p));
    await uploadInput.setInputFiles(absolutePaths);
    
    console.log(`[Publish] 已提交 ${absolutePaths.length} 张图片，等待编辑界面加载...`);
    
    const titleSelectors = [
        'input[placeholder*="填写标题"]',
        'input[placeholder*="标题"]',
        '.d-input input',
        'input.d-text'
    ];
    
    let editorLoaded = false;
    for (let i = 0; i < 12; i++) {
        for (const selector of titleSelectors) {
            if (await page.locator(selector).isVisible()) {
                editorLoaded = true;
                break;
            }
        }
        if (editorLoaded) break;
        await page.waitForTimeout(5000);
        console.log(`[Publish] 正在等待编辑界面... (${(i+1)*5}s)`);
    }

    if (!editorLoaded) throw new Error('上传超时或未能进入编辑界面');

    // 3. 填写标题
    for (const selector of titleSelectors) {
        if (await page.locator(selector).isVisible()) {
            await page.fill(selector, options.title);
            console.log(`[Publish] 标题填写完成 (选择器: ${selector})`);
            break;
        }
    }

    // 4. 填写正文
    const contentSelectors = [
        'div.tiptap.ProseMirror',
        'div.ProseMirror[contenteditable="true"]',
        'div.ql-editor',
        '.post-content'
    ];
    let contentFilled = false;
    for (const selector of contentSelectors) {
        if (await page.locator(selector).isVisible()) {
            await page.click(selector, { force: true });
            
            const isMac = process.platform === 'darwin';
            const modifier = isMac ? 'Meta' : 'Control';
            const wordModifier = isMac ? 'Alt' : 'Control';

            // 清空旧内容
            await page.keyboard.down(modifier);
            await page.keyboard.press('A');
            await page.keyboard.up(modifier);
            await page.keyboard.press('Backspace');
            
            console.log('[Publish] 正在模拟人工打字输入正文...');
            const rawContent = options.content.replace(/\\n/g, '\n');
            
            // 1. 拆分正文和标签
            // 我们假设标签都在最后，或者散落在各处
            // 为了稳妥，我们先把正文里的标签先占位，最后统一输入
            const body = rawContent.replace(/#[\w\u4e00-\u9fa5]+/g, '').trim();
            const tags = rawContent.match(/#[\w\u4e00-\u9fa5]+/g) || [];

            // 2. 输入纯正文
            const bodyLines = body.split('\n');
            for (let i = 0; i < bodyLines.length; i++) {
                await page.keyboard.type(bodyLines[i], { delay: 10 });
                if (i < bodyLines.length - 1) await page.keyboard.press('Enter');
            }
            
            // 3. 换行开始输入标签
            await page.keyboard.press('Enter');
            console.log(`[Publish] 正文输入完成，准备输入 ${tags.length} 个标签...`);

            // 4. 逐个输入标签并用 Enter 激活
            for (const tag of tags) {
                console.log(`[Publish] 正在激活标签: ${tag}`);
                // 输入空格隔离
                await page.keyboard.type(' '); 
                // 输入标签内容（慢速，诱导联想框出现）
                await page.keyboard.type(tag, { delay: 100 });
                
                // 关键：等待 1 秒让小红书弹出“话题推荐”
                await page.waitForTimeout(1000);
                
                // 关键：按下 Enter 键。这会选中联想框第一个，并自动把标签变蓝。
                // 这是目前最稳的“变蓝”方案
                await page.keyboard.press('Enter');
                await page.waitForTimeout(500);
            }
            
            contentFilled = true;
            console.log(`[Publish] 正文与标签（变蓝模式）输入完成`);
            break;
        }
    }
    if (!contentFilled) throw new Error('无法定位正文输入框');

    // 5. 发布按钮
    console.log('[Publish] 🚀 准备就绪，请手动点击发布。');
    console.log('\n---------------------------------------------------------');
    console.log('👉 内容已填充完毕。请手动检查并点击“发布”。');
    console.log('👉 完成后按【回车键】结束任务。');
    console.log('---------------------------------------------------------\n');

    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    await new Promise(resolve => rl.question('按【回车键】结束...', () => { rl.close(); resolve(); }));
    await context.close();
}

run().catch(err => { console.error('[Publish] 发生错误:', err); process.exit(1); });
