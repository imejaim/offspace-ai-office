import asyncio
import json
import os
from pathlib import Path

from playwright.async_api import TimeoutError as PlaywrightTimeoutError
from playwright.async_api import async_playwright

BASE = os.environ.get("OFFICE_BASE", "http://127.0.0.1:8791/prototype/index-v4.html")
OUT = Path(os.environ.get(
    "OFFICE_MODAL_QA_OUT",
    "/Users/offspace/works/04_RnD_References/office-3d-moodboard/office-qa/modal-fix.json",
))
BACKGROUND = [".masthead", "#area-nav", ".stage", ".team-wrap", ".scene-tools", ".footer", "#about-dialog"]


async def main():
    evidence = {"base": BASE, "checks": []}
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            headless=True,
            args=["--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
        )
        page = await browser.new_page(viewport={"width": 390, "height": 844})
        await page.goto(BASE, wait_until="networkidle")
        await page.wait_for_function("document.body.dataset.scene === 'ready'", timeout=60000)

        opener = page.locator('#area-nav [data-area="business"]')
        await page.locator(".footer").evaluate("el => { el.inert = true }")
        await opener.click()
        panel = page.locator("#detail-panel")
        assert await panel.get_attribute("role") == "dialog"
        assert await panel.get_attribute("aria-modal") == "true"
        assert await page.evaluate("sels => sels.every(s => document.querySelector(s).inert)", BACKGROUND)
        assert not await panel.evaluate("el => el.inert || [...document.querySelectorAll('[inert]')].some(node => node.contains(el))")
        evidence["checks"].append("mobile background uses DOM inert without inerting detail panel")

        about = page.locator("#about-button")
        try:
            await about.click(trial=True, timeout=700)
            raise AssertionError("background About button remained pointer-actionable")
        except PlaywrightTimeoutError:
            pass
        box = await about.bounding_box()
        assert box
        await page.mouse.click(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        assert not await page.locator("#about-dialog").evaluate("el => el.open")
        assert await page.locator('[role="dialog"]:visible').count() == 1
        evidence["checks"].append("real pointer attempt cannot open About; exactly one visible dialog")

        for _ in range(12):
            await page.keyboard.press("Tab")
            assert await page.evaluate("document.querySelector('#detail-panel').contains(document.activeElement)")
        await page.keyboard.press("Shift+Tab")
        assert await page.evaluate("document.querySelector('#detail-panel').contains(document.activeElement)")
        evidence["checks"].append("forward and reverse keyboard focus remain trapped in panel")

        await page.set_viewport_size({"width": 1000, "height": 844})
        await page.wait_for_function("!matchMedia('(max-width: 760px)').matches")
        await page.wait_for_function("document.querySelector('#detail-panel').getAttribute('role') === 'region'")
        assert await panel.get_attribute("role") == "region"
        assert await panel.get_attribute("aria-modal") is None
        assert await page.evaluate("sels => sels.slice(0, -2).every(s => !document.querySelector(s).inert)", BACKGROUND)
        assert await page.locator(".footer").evaluate("el => el.inert")
        assert not await page.locator("#about-dialog").evaluate("el => el.inert")
        await about.click()
        assert await page.locator("#about-dialog").evaluate("el => el.open")
        evidence["checks"].append("desktop media change removes modal semantics/isolation and About works")

        await page.set_viewport_size({"width": 390, "height": 844})
        await page.wait_for_function("matchMedia('(max-width: 760px)').matches")
        await page.wait_for_function("document.querySelector('#detail-panel').getAttribute('role') === 'dialog'")
        assert await panel.get_attribute("role") == "dialog"
        assert not await page.locator("#about-dialog").evaluate("el => el.open")
        assert await page.get_by_role("dialog").count() == 1
        assert await page.evaluate("document.querySelector('#detail-panel').contains(document.activeElement)")
        assert await page.evaluate("sels => sels.every(s => document.querySelector(s).inert)", BACKGROUND)
        await page.locator(".close-panel").click()
        assert await page.evaluate("document.activeElement?.matches('#area-nav [data-area=business]')")
        assert await page.evaluate("sels => sels.slice(0, -2).every(s => !document.querySelector(s).inert)", BACKGROUND)
        assert await page.locator(".footer").evaluate("el => el.inert")
        assert not await page.locator("#about-dialog").evaluate("el => el.inert")
        evidence["checks"].append("close restores prior inert states before restoring opener focus")

        await browser.close()

    evidence["pass"] = True
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(evidence, ensure_ascii=False, indent=2))


asyncio.run(main())
