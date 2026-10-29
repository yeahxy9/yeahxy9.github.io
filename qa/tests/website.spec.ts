import {test,expect} from '@playwright/test';
const startupDiagnostics=new WeakMap<object,string[]>();

test.beforeEach(async({page})=>{
  const diagnostics:string[]=[];
  startupDiagnostics.set(page,diagnostics);
  page.on('pageerror',error=>diagnostics.push(`Uncaught: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error')diagnostics.push(message.text())});
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
});
test.afterEach(async({page},testInfo)=>{
  if(testInfo.status!==testInfo.expectedStatus){
    const details=(startupDiagnostics.get(page)||[]).join('\n');
    console.log('Browser diagnostics:',details);
    await testInfo.attach('browser-diagnostics',{body:details,contentType:'text/plain'});
  }
});

test('首页可交互时，全量素材仍可在后台未完成',async({page},testInfo)=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  let release!:()=>void;const held=new Promise<void>(resolve=>{release=resolve});let waiting=0;
  await page.route(/\/(uniforms|voices)\//,async route=>{waiting++;await held;await route.abort().catch(()=>{});waiting--});
  try{
    await page.goto('/',{waitUntil:'domcontentloaded'});
    await expect(page.getByRole('button',{name:'问本心',exact:true})).toBeVisible();
    await expect.poll(()=>waiting).toBeGreaterThan(0);
    const started=Date.now();await page.getByRole('button',{name:'问本心',exact:true}).click();
    await expect(page.locator('.quiz-screen')).toBeVisible();
    await expect(page.locator('.option-card').first()).toBeEnabled();
    expect(waiting).toBeGreaterThan(0);expect(errors).toEqual([]);
    await testInfo.attach('background-preload-proof',{body:JSON.stringify({pendingMediaRequests:waiting,quizOpenedWithinMs:Date.now()-started,allMediaFinished:false}),contentType:'application/json'});
    await page.screenshot({path:testInfo.outputPath('quiz-with-media-still-pending.png')});
  }finally{release()}
});

for(const route of ['preference','trail'] as const){
 test(`${route}完整作答、刷新恢复和分享图`,async({page},testInfo)=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route(/\/(uniforms|voices)\//,route=>route.abort());
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:route==='preference'?'问本心':'观行迹',exact:true}).click();
  if(route==='trail')await page.getByRole('button',{name:'进江湖看看',exact:true}).click();
  for(let index=0;index<13;index++){
   const choices=page.locator('.option-card');await expect(choices.first()).toBeVisible();
   await page.locator('.option-card[data-neutral="true"]').click();
   if(index===2){await page.reload({waitUntil:'domcontentloaded'});await expect(page.locator('.option-card[data-neutral="true"]')).toHaveAttribute('aria-pressed','true');}
   await page.getByRole('button',{name:index===12?/查看结果/:/^下一题/}).click();
  }
  await expect(page.getByText('江湖别管我',{exact:true}).first()).toBeVisible();
  await page.getByRole('button',{name:'生成我的江湖签',exact:true}).click();
  await expect(page.locator('a[download]').first()).toBeVisible({timeout:20000});
  expect(errors).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
  await page.screenshot({path:testInfo.outputPath(`${route}-result.png`),fullPage:true});
 });
}

test('关注与观看链接用途正确，浏览器无未捕获启动异常',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route(/\/(uniforms|voices)\//,route=>route.abort());
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('button',{name:'问本心',exact:true})).toBeVisible();
 await expect(page.getByRole('link',{name:'打开叶相宜的抖音主页'})).toHaveAttribute('href',/douyin.com\/user\//);
 await expect(page.getByRole('link',{name:'打开叶相宜的小红书主页'})).toHaveAttribute('href','https://xhslink.cn/o/4uTO4LMAntU');
 await expect(page.getByRole('link',{name:'在抖音观看：问心仪 · 门派选择工具介绍'})).toHaveAttribute('href','https://v.douyin.com/e5v49QcOEx8/');
 expect(errors).toEqual([]);
});

test('主体脚本失败显示恢复信息，不持续白屏',async({page})=>{
 await page.route('**/assets/renderApp-*.js',route=>route.abort());
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#boot-message')).toContainText('页面未能启动');
 await expect(page.getByRole('link',{name:'重新加载',exact:true})).toBeVisible();
});
