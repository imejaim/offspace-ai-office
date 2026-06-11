#!/usr/bin/env python3
"""Generate Offspace AI Office status JSON from Mac mini process state."""
from __future__ import annotations

import json
import re
import subprocess
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "office-status.json"
KST = ZoneInfo("Asia/Seoul")


def run(cmd: list[str]) -> str:
    try:
        return subprocess.check_output(cmd, text=True, stderr=subprocess.DEVNULL, timeout=8)
    except Exception:
        return ""


def proc_lines() -> list[str]:
    out = run(["ps", "aux"])
    return [line for line in out.splitlines() if line.strip()]


def has_proc(lines: list[str], needles: list[str]) -> bool:
    return any(all(n.lower() in line.lower() for n in needles) for line in lines)


def matching_proc(lines: list[str], pattern: str) -> bool:
    rx = re.compile(pattern, re.I)
    ignore = ("update_office_status.py", "update_and_push_status.sh", "grep", "egrep")
    return any(rx.search(line) and not any(x in line for x in ignore) for line in lines)


def event(event_id: str, source: str, agent: str, character: str, status: str, space: str, task_id: str, task_title: str, message: str, progress: float = 0, clone_id=None):
    return {
        "event_id": event_id,
        "ts": datetime.now(KST).isoformat(),
        "source": source,
        "agent": agent,
        "character": character,
        "status": status,
        "space": space,
        "task_id": task_id,
        "task_title": task_title,
        "message": message,
        "clone_id": clone_id,
        "progress": progress,
        "severity": "normal",
    }


def main() -> None:
    now = datetime.now(KST)
    lines = proc_lines()
    hermes_active = matching_proc(lines, r"(/|\b)hermes(\s|$)|offs_hermes|hermes-agent")
    claude_telegram = matching_proc(lines, r"(/|\b)claude(\s|$).*plugin:telegram")
    claude_cli = matching_proc(lines, r"(/|\b)claude(\s|$).*\s-p(\s|$)")
    codex_active = matching_proc(lines, r"(/|\b)(codex|codex-cli)(\s|$)")
    # Treat Antigravity/Gemini browser profile as the Gemini/젬대리 workspace being open, not necessarily an active CLI task.
    gemini_active = matching_proc(lines, r"(/|\b)gemini(\s|$)|antigravity-browser-profile")
    server_active = bool(run(["/usr/sbin/lsof", "-nP", "-iTCP:8790", "-sTCP:LISTEN"]).strip())

    events = [
        event(
            "live_hermes",
            "hermes-agent",
            "hermes",
            "heo-sajang",
            "active" if hermes_active else "idle",
            "business",
            "office_reporting",
            "사업보고/대시보드 관제",
            "허사장 관제중" if hermes_active else "허사장 대기",
            0.8 if hermes_active else 0,
        ),
        event(
            "live_claude",
            "claude-code",
            "claude-code",
            "ko-bujang",
            "active" if claude_cli else ("idle" if claude_telegram else "blocked"),
            "internal",
            "claude_code",
            "코부장 상태",
            "코부장 CLI 작업중" if claude_cli else ("코부장 봇 대기" if claude_telegram else "코부장 봇 확인 필요"),
            0.55 if claude_cli else 0,
        ),
        event(
            "live_codex",
            "codex-cli",
            "codex-cli",
            "oh-gwajang",
            "active" if codex_active else "idle",
            "ops",
            "codex_cli",
            "오과장 상태",
            "오과장 실행중" if codex_active else "오과장 대기",
            0.5 if codex_active else 0,
        ),
        event(
            "live_gemini",
            "gemini-cli",
            "gemini-cli",
            "jem-daeri",
            "active" if gemini_active else "idle",
            "research",
            "gemini_cli",
            "젬대리 상태",
            "젬대리/Antigravity 열림" if gemini_active else "젬대리 대기",
            0.5 if gemini_active else 0,
        ),
    ]
    if server_active:
        events.append(event("live_local_server", "mac-mini", "python-http", "heo-sajang", "parallel", "ops", "local_server", "로컬 서버", "사무실 LAN 서버 켜짐", 1, "LAN"))

    reports = [
        {"area": "Offspace 사업", "summary": "제품군 우선순위 재정렬 대기 — 대시보드에서 대표 보고 카드로 추적 중입니다."},
        {"area": "BaToo 투자", "summary": "운영 판단은 로컬이 아니라 EC2/실거래 상태 확인 선행 원칙 유지."},
        {"area": "AI Office", "summary": "맥미니 상태를 JSON으로 생성해 GitHub Pages 사무실 화면에 반영 중입니다."},
        {"area": "R&D / PHTML", "summary": "보고서형 HTML/PHTML 표현 엔진은 향후 사업보고 화면 고도화에 활용 가능합니다."},
        {"area": "대외 전문활동", "summary": "RAPA 멘토링·KIEES 연구반은 행정/자료 업로드 관리 대상으로 분리 유지."},
    ]
    active_count = sum(1 for e in events if e["status"] in {"active", "parallel"})
    decision = "대표님 결정 필요: Offspace 제품 우선순위 확정 / BaToo EC2 점검 승인" if active_count else "대표님 결정 필요: 오늘 우선순위 지정"

    data = {
        "source": "mac-mini-status-script",
        "updated_at": now.isoformat(),
        "updated_at_kst": now.strftime("%Y-%m-%d %H:%M:%S KST"),
        "refresh_hint_seconds": 120,
        "decision": decision,
        "reports": reports,
        "events": events,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"wrote {OUT} events={len(events)} updated={data['updated_at_kst']}")


if __name__ == "__main__":
    main()
