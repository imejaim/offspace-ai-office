import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/Users/offspace/works/04_RnD_References/office-3d-moodboard/office-qa')
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless=True,args=['--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
  page=await b.new_page(viewport={'width':1440,'height':1000})
  await page.goto('http://127.0.0.1:8791/prototype/index-v4.html',wait_until='networkidle')
  await page.wait_for_function("document.body.dataset.scene==='ready'")
  d=await page.evaluate('officeDiagnostics()')
  assert 'explorerPosition' in d, 'movement diagnostics not yet available'
  await page.locator('#explore-button').click()
  before=await page.evaluate('officeDiagnostics().explorerPosition')
  await page.keyboard.down('ArrowRight');await page.wait_for_timeout(350);await page.keyboard.up('ArrowRight')
  after=await page.evaluate('officeDiagnostics().explorerPosition')
  assert before!=after,'keyboard exploration did not move guide'
  await page.keyboard.press('Escape')
  assert not await page.evaluate('officeDiagnostics().explorationEnabled')
  await page.locator('#motion-button').click()
  await page.wait_for_timeout(300)
  frames=await page.evaluate('officeDiagnostics().renderFrames')
  await page.wait_for_timeout(300)
  assert frames==await page.evaluate('officeDiagnostics().renderFrames'),'motion pause still renders idle frames'
  # A canvas resize while idle must render the resized view, not go blank.
  await page.set_viewport_size({'width':1200,'height':850})
  await page.wait_for_timeout(400)
  assert await page.evaluate('officeDiagnostics().renderFrames')>frames,'paused resize did not render'
  await page.evaluate("dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}))")
  assert not await page.evaluate('officeDiagnostics().destroyed'),'BFCache page was destroyed'
  await page.locator('#area-nav [data-area="business"]').click()
  await page.wait_for_timeout(80)
  assert await page.locator('#detail-panel').is_visible()
  assert await page.evaluate('officeDiagnostics().selectedZone')=='business'
  await page.keyboard.press('Escape')
  await page.locator('#home-button').click()
  await page.wait_for_timeout(100)
  assert await page.evaluate('officeDiagnostics().selectedZone') is None
  await page.emulate_media(reduced_motion='reduce')
  await page.wait_for_timeout(100)
  assert not await page.evaluate('officeDiagnostics().motionEnabled')
  await page.emulate_media(reduced_motion='no-preference')
  await page.wait_for_function('officeDiagnostics().motionEnabled',timeout=5000)
  assert await page.evaluate('officeDiagnostics().motionEnabled')
  await page.set_viewport_size({'width':390,'height':844})
  await page.wait_for_timeout(300)
  assert await page.evaluate('officeDiagnostics().shadowMapSize')==1024,'resize kept desktop GPU budget'
  reduced=await b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
  await reduced.goto('http://127.0.0.1:8791/prototype/index-v4.html',wait_until='networkidle')
  await reduced.wait_for_function("document.body.dataset.scene==='ready'")
  await reduced.emulate_media(reduced_motion='no-preference')
  await reduced.wait_for_function('officeDiagnostics().motionEnabled',timeout=5000)
  assert await reduced.evaluate('officeDiagnostics().motionEnabled'),'initial reduce preference cannot be changed'
  result={'keyboardMovement':True,'pauseOnDemand':True,'pausedResize':True,'bfcache':True,'selectedZone':True,'dynamicReducedMotion':True}
  (OUT/'interaction-results.json').write_text(json.dumps(result,indent=2));print(result)
  await b.close()
asyncio.run(main())
