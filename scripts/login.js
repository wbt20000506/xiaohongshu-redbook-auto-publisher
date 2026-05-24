const { chromium } = require('playwright');
const path = require('path');
const readline = require('readline');

async function run() {
    const userDataDir = path.join(__dirname, '../.browser_data');
    console.log(`[Login] 启动持久化浏览器，配置文件存放在: ${userDataDir}`);

    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false, // 必须为 false 才能手动登录
        viewport: { width: 1280, height: 800 }
    });

    const page = context.pages()[0] || await context.newPage();
    
    console.log('[Login] 正在跳转到小红书主站和创作者中心...');
    
    // 打开主站（用于搜索和评论）
    const pageMain = context.pages()[0] || await context.newPage();
    await pageMain.goto('https://www.xiaohongshu.com');
    
    // 打开创作者中心（用于发布）
    const pageCreator = await context.newPage();
    await pageCreator.goto('https://creator.xiaohongshu.com/publish/publish');

    console.log('\n---------------------------------------------------------');
    console.log('👉 重要：小红书【主站】和【创作者中心】可能需要分别登录。');
    console.log('👉 请在弹出的两个窗口中，确保都已完成登录状态。');
    console.log('👉 两个页面都登录成功后，回到这里按【回车键】关闭浏览器。');
    console.log('---------------------------------------------------------\n');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    await new Promise(resolve => rl.question('按【回车键】结束登录并关闭浏览器...', () => {
        rl.close();
        resolve();
    }));

    await context.close();
    console.log('[Login] 登录会话已保存，浏览器已关闭。');
}

run().catch(err => {
    console.error('[Login] 发生错误:', err);
    process.exit(1);
});
