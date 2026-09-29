import asyncio, json, os
from pathlib import Path
from playwright.async_api import async_playwright
BASE=os.environ.get('OFFICE_BASE','http://127.0.0.1:8791/prototype/index-v4.html')
OUT=Path(os.environ.get('OFFICE_QA_OUT','/Users/offspace/works/04_RnD_References/office-3d-moodboard/office-qa'))
OUT.mkdir(parents=True,exist_ok=True)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless=True,args=['--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
  results=[]
  for label,size in [('desktop',{'width':1440,'height':1000}),('mobile',{'width':390,'height':844})]:
   page=await browser.new_page(viewport=size,device_scale_factor=1)
   errors=[];failed=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('response',lambda r:failed.append({'url':r.url,'status':r.status}) if r.status>=400 else None)
   res=await page.goto(BASE,wait_until='networkidle')
   assert res.status==200, 'new campus page is not implemented'
   await page.wait_for_function("document.body.dataset.scene === 'ready'",timeout=60000)
   await page.wait_for_timeout(2500)
   assert await page.locator('#area-nav button[data-area]').count()==6
   assert await page.locator('#team img').count()==4
   assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'horizontal overflow'
   await page.screenshot(path=str(OUT/(label+'-home.png')),full_page=True)
   for area in ['business','investment','work','research','public','life']:
    await page.locator('#area-nav [data-area="'+area+'"]').click()
    await page.wait_for_timeout(150)
    assert await page.locator('#detail-panel').is_visible()
    assert await page.locator('#detail-panel').get_attribute('data-area')==area
    assert await page.locator('#detail-panel h2').inner_text()
    await page.locator('.close-panel').click()
   await page.locator('#area-nav [data-area="business"]').click()
   await page.wait_for_timeout(1600)
   assert await page.locator('#detail-panel a[href="https://hidden-garden-review.pages.dev/"]').count()==1
   await page.screenshot(path=str(OUT/(label+'-business.png')),full_page=True)
   await page.keyboard.press('Escape')
   assert not await page.locator('#detail-panel').is_visible()
   await page.locator('#home-button').click()
   await page.locator('#motion-button').click()
   assert await page.locator('#motion-button').get_attribute('aria-pressed')=='true'
   assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
   assert not errors,errors
   assert not failed,failed
   diag=await page.evaluate('window.officeDiagnostics?.()')
   results.append({'viewport':label,'errors':errors,'failed':failed,'diagnostics':diag,'pass':True})
   await page.close()
  page=await browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
  await page.goto(BASE,wait_until='networkidle')
  await page.wait_for_function("document.body.dataset.scene === 'ready'",timeout=60000)
  assert await page.locator('#motion-button').get_attribute('aria-pressed')=='true'
  await page.locator('#area-nav [data-area="investment"]').click()
  assert await page.locator('#detail-panel').is_visible()
  results.append({'reducedMotion':True,'pass':True})
  await page.close()
  # The useful HTML directory remains available even if WebGL fails.
  page=await browser.new_page(viewport={'width':390,'height':844})
  await page.add_init_script("const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.includes('webgl'))return null;return original.call(this,type,...args)}")
  await page.goto(BASE,wait_until='networkidle')
  await page.wait_for_function("document.body.dataset.scene === 'fallback'",timeout=20000)
  await page.locator('#area-nav [data-area="business"]').click()
  assert await page.locator('#detail-panel a').count()>=1
  await page.screenshot(path=str(OUT/'fallback.png'),full_page=True)
  results.append({'webglFallback':True,'pass':True})
  await browser.close()
  (OUT/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
  print(json.dumps(results,ensure_ascii=False,indent=2))
asyncio.run(main())
