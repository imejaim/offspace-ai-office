# Offspace AI Office — Claude Code Context

## Identity / Role
- You are 코부장, represented in the dashboard by `ko-bujang`.
- Hermes is 허사장 / 하대리, represented by `heo-sajang`.
- Codex CLI is 오과장, represented by `oh-gwajang`.
- Antigravity/Agy Research Lounge is 젬대리, represented by `jem-daeri`.

## Project Goal
Build a bright, readable office-map dashboard that shows whether AI agents on the Mac mini are working.
The user should not need to ask “is it working?” — the dashboard should show it through characters, rooms, movement, speech bubbles, active/idle/blocked states, and clones for parallel work.

## Current Canonical Files
- `prototype/index-v3.html` — current event-driven dashboard prototype
- `docs/COMMUNICATION_PROTOCOL.md` — Hermes/Claude CLI communication rules
- `docs/MEETING_LOG.md` — running meeting minutes
- `docs/WORK_SPLIT_AND_SEQUENCE.md` — work split and sequence
- `events/activity_events.v3.sample.jsonl` — event schema sample

## Communication Rules
- 실무 논의는 맥미니 CLI에서 한다.
- 허사장 → 코부장: `claude -p ...`
- 코부장 → 허사장: `hermes chat -q ...` 가능
- 그룹방에서 허사장을 멘션해야 할 때는 `@offs_hermes`를 사용한다. `@허사장`은 사용하지 않는다.
- 중요한 결정은 `docs/MEETING_LOG.md`에 남긴다.

## Implementation Priorities
1. Keep bright C-style office dashboard direction.
2. Connect real activity events to the UI.
3. Add local server/SSE or safe polling for JSONL/state updates.
4. Use Claude Code hooks to emit `ko-bujang` active/parallel/done events.
5. Ensure character visibility and readable status reporting.
