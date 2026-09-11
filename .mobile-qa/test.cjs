const { chromium } = require('C:/Users/LEE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const proposal = pathToFileURL(path.join(root, 'dating(yes or no).html')).href;
const itinerary = pathToFileURL(path.join(root, 'Kuala Lumpur-itinerary (2).html')).href;
const results = [];
const metrics = () => {
  const box = el => { const r = el.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; };
  return {viewport:{w:innerWidth,h:innerHeight}, document:{w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight},
    controls:[...document.querySelectorAll('button,a')].filter(e=>e.getClientRects().length).map(e=>({text:e.textContent.trim(),...box(e)})),
    images:[...document.images].map(e=>({src:e.getAttribute('src'),loaded:e.complete&&e.naturalWidth>0,...box(e)}))};
};
(async()=>{
  const browser = await chromium.launch({channel:'chrome',headless:true});
  try {
    for(const [w,h] of [[320,568],[360,800],[390,844],[430,932],[844,390]]) {
      const context = await browser.newContext({viewport:{width:w,height:h},isMobile:true,hasTouch:true,deviceScaleFactor:1});
      const page = await context.newPage();
      const errors=[]; const failedRequests=[]; const dialogs=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
      page.on('dialog',async d=>{dialogs.push(d.message());await d.dismiss();});
      await page.goto(proposal); await page.locator('.bottom-image').waitFor();
      const initial = await page.evaluate(metrics);
      await page.screenshot({path:path.join(__dirname,`proposal-${w}x${h}.png`),fullPage:true});
      const before = await page.locator('#evil-button').boundingBox();
      await page.locator('#evil-button').tap();
      const after = await page.locator('#evil-button').boundingBox();
      const audioDuring = await page.locator('audio').evaluate(a=>({paused:a.paused,time:a.currentTime,error:a.error?.code??null,readyState:a.readyState}));
      await page.waitForTimeout(850);
      const audioAfter = await page.locator('audio').evaluate(a=>({paused:a.paused,time:a.currentTime}));
      const chase=[];
      for(let i=0;i<12;i++) {
        const b = await page.locator('#evil-button').boundingBox();
        await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);
        chase.push(await page.locator('#evil-button').boundingBox());
      }
      await page.screenshot({path:path.join(__dirname,`chase-${w}x${h}.png`),fullPage:true});
      const chaseMetrics=await page.evaluate(metrics);
      await page.locator('#yes-btn').tap();
      await page.waitForURL(url=>decodeURIComponent(url.href)===decodeURIComponent(itinerary));
      await page.waitForLoadState('load');
      await page.waitForTimeout(1000);
      const tripInitial = await page.evaluate(metrics);
      const tripState = await page.evaluate(()=>({title:document.querySelector('h1').textContent,stops:document.querySelectorAll('article').length,map:!!window.L,markers:document.querySelectorAll('.map-pin').length,tiles:document.querySelectorAll('.leaflet-tile-loaded').length,day:document.querySelector('#days button').getAttribute('aria-pressed')}));
      await page.screenshot({path:path.join(__dirname,`itinerary-${w}x${h}.png`),fullPage:true});
      await page.locator('.stop-title').last().tap();
      await page.waitForTimeout(400);
      const stopTap = await page.evaluate(()=>{const r=document.querySelector('#map').getBoundingClientRect();return {scrollY,mapTop:r.top,mapBottom:r.bottom,popup:document.querySelector('.leaflet-popup-content')?.textContent??null};});
      await page.screenshot({path:path.join(__dirname,`stop-tap-${w}x${h}.png`)});
      await page.locator('#days button').tap();
      const dayTap=await page.locator('article').count();
      await page.evaluate(()=>{window.print=()=>{window.__printCalled=true;};});
      await page.locator('#print').tap();
      const printCalled=await page.evaluate(()=>window.__printCalled===true);
      results.push({size:`${w}x${h}`,initial,before,after,audioDuring,audioAfter,chase,chaseMetrics,tripInitial,tripState,stopTap,dayTap,printCalled,errors,failedRequests,dialogs});
      console.log(JSON.stringify(results.at(-1)));
      await context.close();
    }
    const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const page=await context.newPage();
    await page.goto(proposal);
    await page.locator('#evil-button').tap();
    await page.setViewportSize({width:844,height:390});
    await page.waitForTimeout(100);
    const rotated=await page.evaluate(metrics);
    await page.setViewportSize({width:390,height:844});
    await page.waitForTimeout(100);
    const restored=await page.evaluate(metrics);
    await context.route('https://**/*',route=>route.abort());
    await page.goto(itinerary);
    const offline=await page.evaluate(()=>({stops:document.querySelectorAll('article').length,mapMessage:document.querySelector('#map').textContent}));
    results.push({rotation:{rotated,restored},offline});
    console.log(JSON.stringify(results.at(-1)));
    await context.close();
  } finally {fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify(results,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
