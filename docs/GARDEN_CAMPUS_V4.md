# Garden Campus v4 — design & delivery contract

## Decision, 2026-09-29
The user selected a combination of Kamaboko's Room (furnished isometric interior), Bruno Simon 2019 (spatial exploration), and Summer Afternoon (sunny village). Keep all four original character artworks. Replace the old planned/demo office with a current, public-safe work directory matching the user's six top-level workspace areas and Discord work categories.

Design reference screenshots and source URLs are archived in the Offspace business area's common design library. They remain research references, not assets licensed for redistribution. All campus geometry is original procedural modeling; three.js is MIT and its license is shipped beside the self-hosted library.

## Deliverable
- `prototype/index-v4.html` + `prototype/v4/`: static hosted Three.js campus, HTML work directory, mobile UI, and WebGL-failure fallback.
- `prototype/v4/office-data.js`: curated public directory. Source checked against the local workspace index and actual directory presence on 2026-09-29; channel mapping from user-approved existing role structure, not a live Discord API query.
- Navigation: scene selection / HTML buttons, orbit / zoom, home, reduce motion, keyboard exploration where supported.
- Four unchanged SVG character assets. Character movement is decorative, not a live task or presence signal.

## Explicit boundaries
- No private folder traversal from the browser, no company files, no personal family information, no account data, no credentials.
- No Discord API, no autonomous agent launch, no brokerage query or trade.
- No invented work-in-progress, sales, visitors, queue or online metrics.
- Public service links point only to already-known public pages; descriptions do not claim current launch/approval/health.
- Live activity wiring is not simulated. The old publisher/data are not used by v4 and are not changed in this redesign.
- Other businesses are NOT modified or deployed under this office request.

## Implementation / audit allocation
Astra owns public-data curation, HTML interface, integration, tests and release verification. One scoped Sol child owns the procedural 3D scene only; its claims are subject to parent browser verification. Claude Code auth probe returned expired login, so an Opus 5.5 independent CLI audit could not be performed. No additional paid API path or subscription change is authorized. Provider weekly remaining quotas are unavailable from the checked interfaces; do not equate session tokens with remaining quota. No redundant parallel implementation teams.

## Verification
- `npm test`: deterministic data/scene contract tests.
- `uv run --with playwright python tests/office-ui.py`: desktop/mobile render and navigation, real links, original characters, overflow, reduced-motion, WebGL fallback, console and request failures.
- Additional screenshots and direct interaction checks before release. Browser viewport emulation is not a physical phone FPS benchmark.
- Verify deployed file hashes and public navigation after GitHub Pages publishes. A successful push is insufficient.

## Release approach
Preserve the old v3 page as `prototype/index-v3-legacy.html`. After tests pass, route root and the user's existing `prototype/index-v3.html` bookmark to the new v4 page. No private screenshot archives or source research assets are published.
