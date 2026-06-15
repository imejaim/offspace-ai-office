#!/usr/bin/env python3
"""Generate Offspace AI Office status JSON from Mac mini process/token state."""
from __future__ import annotations

import json
import os
import re
import sqlite3
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "office-status.json"
STATE_DB = Path.home() / ".hermes" / "state.db"
CODEX_SESSIONS = Path.home() / ".codex" / "sessions"
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


def compact(text: str, max_len: int = 74) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    return text if len(text) <= max_len else text[: max_len - 1].rstrip() + "…"


def category_task(task_id: str, task_title: str, message: str, space: str) -> dict[str, str]:
    return {
        "task_id": task_id,
        "task_title": task_title,
        "message": message,
        "space": space,
    }


HERMES_TASK_CATEGORIES = [
    (
        "offspace_ai_office",
        "AI Office 상태 신뢰도 개선",
        "AI Office 상태 갱신중",
        "internal",
        [
            "offspace ai office",
            "office-status",
            "update_office_status",
            "update_and_push_status",
            "대시보드",
            "상태 신뢰도",
            "코부장",
            "오과장",
            "젬대리",
            "허사장",
        ],
    ),
    (
        "agentis_update",
        "Agentis workflows 구조 업데이트",
        "Agentis 업데이트 반영중",
        "internal",
        ["agentis", "cline2agent", ".clinerules", "workflows"],
    ),
    (
        "office_reporting",
        "사업보고/대시보드 관제",
        "허사장 관제중",
        "business",
        ["사업보고", "보고", "batoo", "투자", "제품 우선순위", "offspace 사업"],
    ),
    (
        "session_maintenance",
        "Hermes 세션/컨텍스트 정리",
        "세션 상태 정리중",
        "ops",
        ["context compaction", "active task list", "preserved across", "session", "컨텍스트"],
    ),
]


def normalize_hermes_task(raw_text: str, raw_title: str | None = None) -> dict[str, str] | None:
    """Map noisy recent Hermes messages to stable dashboard categories."""
    cleaned = compact(raw_text, 500)
    if not cleaned:
        return None
    if re.fullmatch(r"https?://\S+", cleaned):
        return None

    hay = f"{raw_title or ''}\n{cleaned}".lower()
    for task_id, task_title, message, space, keywords in HERMES_TASK_CATEGORIES:
        if any(k in hay for k in keywords):
            return category_task(task_id, task_title, message, space)

    # Keep uncategorized recent work readable without exposing raw prompt text.
    return category_task("latest_user_request", "최근 사용자 요청", "최근 요청 처리중", "business")


def previous_publish_status() -> dict[str, str | None]:
    fallback = {
        "status": "unknown",
        "updated_at": None,
        "message": "publish 상태 기록 없음",
        "log_path": str(Path.home() / ".hermes" / "logs" / "office-status-publish.log"),
    }
    try:
        previous = json.loads(OUT.read_text())
        publish = previous.get("publish") or {}
        if isinstance(publish, dict):
            fallback.update({k: publish.get(k, v) for k, v in fallback.items()})
    except Exception:
        pass
    return fallback


def current_publish_status(now: datetime) -> dict[str, str | None]:
    publish = previous_publish_status()
    env_status = os.environ.get("OFFICE_PUBLISH_STATUS")
    env_message = os.environ.get("OFFICE_PUBLISH_MESSAGE")
    if env_status:
        publish["status"] = env_status
        publish["updated_at"] = now.isoformat()
    if env_message:
        publish["message"] = compact(env_message, 160)
    return publish


def human_age(delta: timedelta) -> str:
    minutes = max(0, int(delta.total_seconds() // 60))
    if minutes < 60:
        return f"{minutes}분 전"
    hours = minutes // 60
    if hours < 48:
        return f"{hours}시간 전"
    return f"{hours // 24}일 전"


def latest_codex_token_event(now: datetime) -> dict[str, object] | None:
    """Return newest Codex token_count event; process presence alone is idle/open."""
    if not CODEX_SESSIONS.exists():
        return None
    newest = None
    cutoff_mtime = (now - timedelta(days=14)).timestamp()
    try:
        files = [p for p in CODEX_SESSIONS.rglob("*.jsonl") if p.stat().st_mtime >= cutoff_mtime]
    except Exception:
        return None
    for path in sorted(files, key=lambda p: p.stat().st_mtime, reverse=True)[:40]:
        try:
            for line in path.read_text(errors="ignore").splitlines():
                if '"token_count"' not in line:
                    continue
                obj = json.loads(line)
                payload = obj.get("payload") or {}
                if payload.get("type") != "token_count":
                    continue
                ts = obj.get("timestamp")
                if not ts:
                    continue
                dt = datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(KST)
                info = payload.get("info") or {}
                usage = info.get("last_token_usage") or info.get("total_token_usage") or {}
                item = {"ts": dt, "usage": usage, "path": str(path)}
                if newest is None or dt > newest["ts"]:
                    newest = item
        except Exception:
            continue
    return newest


def latest_hermes_task(now: datetime) -> dict[str, str]:
    """Infer the visible Hermes task from the local Hermes session DB.

    This is intentionally read-only and heuristic: process state says whether Hermes
    is alive; recent session messages say what Hermes is actually working on.
    """
    fallback = {
        "task_id": "office_reporting",
        "task_title": "사업보고/대시보드 관제",
        "message": "허사장 관제중",
        "space": "business",
    }
    if not STATE_DB.exists():
        return fallback

    cutoff = (now - timedelta(hours=18)).timestamp()
    try:
        con = sqlite3.connect(f"file:{STATE_DB}?mode=ro", uri=True, timeout=2)
        rows = con.execute(
            """
            SELECT m.role, COALESCE(m.content, ''), m.timestamp, s.title, s.id
            FROM messages m
            JOIN sessions s ON s.id = m.session_id
            WHERE m.timestamp >= ?
              AND m.role IN ('user', 'assistant')
              AND s.source IN ('telegram', 'cli')
            ORDER BY m.timestamp DESC, m.id DESC
            LIMIT 260
            """,
            (cutoff,),
        ).fetchall()
        con.close()
    except Exception:
        return fallback

    # Prefer known concrete categories over generic recent-message fallback.
    for role, content, _ts, title, _sid in rows:
        normalized = normalize_hermes_task(content, title)
        if normalized and normalized["task_id"] not in {"latest_user_request", "session_maintenance"}:
            return normalized

    for role, content, _ts, title, _sid in rows:
        if role == "user":
            normalized = normalize_hermes_task(content, title)
            if normalized:
                return normalized
    return fallback


def main() -> None:
    now = datetime.now(KST)
    lines = proc_lines()
    hermes_active = matching_proc(lines, r"(/|\b)hermes(\s|$)|offs_hermes|hermes-agent")
    claude_telegram = matching_proc(lines, r"(/|\b)claude(\s|$).*plugin:telegram")
    claude_cli = matching_proc(lines, r"(/|\b)claude(\s|$).*\s-p(\s|$)")
    codex_terminal_open = matching_proc(lines, r"(/|\b)(codex|codex-cli)(\s|$)(?!.*mcp-server)")
    codex_available = matching_proc(lines, r"(/|\b)(codex|codex-cli)(\s|$).*(mcp-server)")
    # 젬대리는 Antigravity/Agy Research Lounge 작업자다. Browser profile / IDE / agy CLI 중 하나가 보이면 열린 상태로 표시한다.
    agy_open = matching_proc(lines, r"(/|\b)agy(\s|$)|Antigravity( IDE)?\.app|antigravity-browser-profile")
    server_active = bool(run(["/usr/sbin/lsof", "-nP", "-iTCP:8790", "-sTCP:LISTEN"]).strip())
    hermes_task = latest_hermes_task(now)
    codex_token = latest_codex_token_event(now)
    codex_token_ts = codex_token["ts"] if codex_token else None
    codex_token_age = (now - codex_token_ts) if isinstance(codex_token_ts, datetime) else None
    codex_using_tokens = bool(codex_token_age and codex_token_age <= timedelta(minutes=5))
    codex_token_msg = "오과장 토큰 사용중" if codex_using_tokens else (
        f"오과장 대기 · 마지막 토큰 {human_age(codex_token_age)}" if codex_token_age else "오과장 대기 · 토큰 기록 없음"
    )

    events = [
        event(
            "live_hermes",
            "hermes-agent",
            "hermes",
            "heo-sajang",
            "active" if hermes_active else "idle",
            hermes_task["space"],
            hermes_task["task_id"],
            hermes_task["task_title"],
            hermes_task["message"] if hermes_active else "허사장 대기",
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
            "active" if codex_using_tokens else "idle",
            "ops",
            "codex_cli",
            "오과장 상태",
            codex_token_msg if (codex_terminal_open or codex_available or codex_token) else "오과장 대기",
            0.5 if codex_using_tokens else 0,
        ),
        event(
            "live_agy",
            "antigravity/agy-cli",
            "agy-cli",
            "jem-daeri",
            "idle",
            "research",
            "agy_cli",
            "젬대리 상태",
            "젬대리 Antigravity/Agy 열림 · 토큰 사용 감지 안됨" if agy_open else "젬대리 대기",
            0,
        ),
    ]
    if server_active:
        events.append(event("live_local_server", "mac-mini", "python-http", "heo-sajang", "parallel", "ops", "local_server", "로컬 서버", "사무실 LAN 서버 켜짐", 1, "LAN"))

    reports = [
        {"area": "Offspace 사업", "summary": "제품군 우선순위 재정렬 대기 — 대시보드에서 대표 보고 카드로 추적 중입니다."},
        {"area": "BaToo 투자", "summary": "운영 판단은 로컬이 아니라 EC2/실거래 상태 확인 선행 원칙 유지."},
        {"area": "AI Office", "summary": f"현재 허사장 표시 작업: {hermes_task['task_title']}"},
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
        "status_quality": {
            "mode": "live",
            "is_sample": False,
            "generated_from": "mac-mini process state + local session metadata",
            "stale_after_seconds": 300,
        },
        "publish": current_publish_status(now),
        "decision": decision,
        "reports": reports,
        "events": events,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"wrote {OUT} events={len(events)} updated={data['updated_at_kst']}")


if __name__ == "__main__":
    main()
