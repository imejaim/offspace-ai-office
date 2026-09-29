import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/Users/offspace/works/04_RnD_References/office-3d-moodboard/office-qa')
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless=True,args=['--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
  for n,w,h in [('desktop',1440,1000),('mobile',390,844)]:
   page=await b.new_page(viewport={'width':w,'height':h})
   errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
   await page.goto('http://127.0.0.1:8791/prototype/index-v4.html',wait_until='networkidle')
   await page.wait_for_timeout(4000)
   print(n,await page.evaluate("({state:document.body.dataset.scene,diag:window.officeDiagnostics?.(),width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>e.scrollWidth>e.clientWidth+1 || e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,id:e.id,cls:e.className,width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right})).slice(0,12)})"),errs,flush=True)
   await page.screenshot(path=str(OUT/(n+'-inspect.png')),full_page=True)
   await page.close()
  await b.close()
asyncio.run(main())
