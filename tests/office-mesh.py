import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/Users/offspace/works/04_RnD_References/office-3d-moodboard/office-qa')
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless=True,ignore_default_args=['--disable-back-forward-cache'],args=['--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
  page=await b.new_page(viewport={'width':1440,'height':1000})
  await page.goto('http://127.0.0.1:8791/prototype/index-v4.html',wait_until='networkidle')
  await page.wait_for_function("document.body.dataset.scene==='ready'")
  results=[]
  for id in ['business','investment','work','research','public','life']:
   await page.locator('#home-button').click()
   await page.wait_for_timeout(1000)
   pos=await page.evaluate(f'officeDiagnostics().zoneScreenPositions.{id}')
   await page.mouse.move(pos['x'],pos['y']);await page.wait_for_timeout(80)
   await page.mouse.click(pos['x'],pos['y'])
   await page.wait_for_timeout(120)
   actual=await page.evaluate('officeDiagnostics().selected')
   assert actual==id,{'expected':id,'actual':actual,'position':pos}
   results.append({'meshClick':id,'pass':True})
   await page.keyboard.press('Escape')
  await page.evaluate("addEventListener('pagehide',e=>window.__wasPersisted=e.persisted)")
  await page.goto('http://127.0.0.1:8791/assets/characters/transparent/Heo-sajang.svg')
  await page.evaluate('history.back()')
  await page.wait_for_function("location.pathname.endsWith('/index-v4.html') && document.body.dataset.scene==='ready'")
  assert not await page.evaluate('officeDiagnostics().destroyed')
  await page.locator('#home-button').click()
  before=await page.evaluate('officeDiagnostics().renderFrames')
  await page.wait_for_timeout(400)
  assert await page.evaluate('officeDiagnostics().renderFrames')>before
  results.append({'realBackNavigation':True,'usedBFCache':await page.evaluate('window.__wasPersisted===true')})
  # Root and the bookmark must resolve to v4.
  for path in ['/','/prototype/index-v3.html']:
   await page.goto('http://127.0.0.1:8791'+path,wait_until='networkidle')
   await page.wait_for_url('**/prototype/index-v4.html')
   results.append({'route':path,'resolved':page.url})
  (OUT/'mesh-results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
  await b.close()
asyncio.run(main())
