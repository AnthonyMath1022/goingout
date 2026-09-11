const {chromium}=require('C:/Users/LEE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true});
 try{
  const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const p=await c.newPage();
  await p.goto(pathToFileURL(path.resolve('Kuala Lumpur-itinerary (2).html')).href);
  await p.locator('.map-pin').first().tap();
  await p.waitForTimeout(600);
  const selected=await p.locator('article.selected').getAttribute('id');
  const popup=await p.locator('.leaflet-popup-content').textContent();
  await p.locator('.leaflet-control-zoom-in').tap();
  await p.waitForTimeout(500);
  const zoomed=await p.locator('.leaflet-tile-loaded').evaluateAll(imgs=>imgs.map(i=>i.src));
  await p.locator('.leaflet-control-zoom-out').tap();
  await p.waitForTimeout(500);
  const zoomedOut=await p.locator('.leaflet-tile-loaded').evaluateAll(imgs=>imgs.map(i=>i.src));
  const result={selected,popup,zoomed,zoomedOut};
  fs.writeFileSync(path.join(__dirname,'map-check.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
