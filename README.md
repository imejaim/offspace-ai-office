# Offspace AI Office

대표님이 폰/외부에서 보는 Offspace 사무실 홈페이지 겸 사업보고 대시보드입니다.

## 공개 접속

GitHub Pages 배포 후 아래 주소로 접속합니다.

```text
https://imejaim.github.io/offspace-ai-office/
```

## 로컬 열어보기

```bash
open /Users/offspace/works/03_Work/offspace-ai-office/prototype/index-v3.html
```

로컬 서버가 켜져 있으면:

```text
http://127.0.0.1:8790/prototype/index-v3.html
```

## 현재 포함된 것

- C안 밝은 사무실 맵 대시보드
- 허사장/코부장/오과장/젬대리 캐릭터 상태 표시
- 모바일 대응 레이아웃
- 대표 보고 카드: Offspace 사업, BaToo 투자, AI Office, R&D/PHTML, 대외 전문활동
- 작업 이벤트 샘플 JSONL
- 공유 설계 문서

## 실시간 상태 반영

GitHub Pages는 정적 호스팅이므로 맥미니가 2분마다 상태 JSON을 생성해 GitHub에 push하고, 브라우저는 60초마다 새 JSON을 읽습니다.

- 데이터 파일: `data/office-status.json`
- 생성 스크립트: `scripts/update_office_status.py`
- 자동 push 스크립트: `scripts/update_and_push_status.sh`
- LaunchAgent: `~/Library/LaunchAgents/com.offspace.ai-office-status-publisher.plist`
- 로그: `~/.hermes/logs/offspace-ai-office-status-publisher.log`

## 다음 구현

- 실제 Hermes / Claude Code / Codex / Gemini 실행 이벤트를 `events/activity_events.jsonl`에 더 정교하게 기록
- 사업보고 JSON을 업무별 파일로 분리해 누적 이력화
- Cloudflare 도메인/접근제어/실시간 터널은 2단계에서 검토
