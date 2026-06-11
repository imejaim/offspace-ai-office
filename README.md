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

## 다음 구현

- 사업보고 JSON을 별도 파일로 분리해 자동 갱신
- 실제 Hermes / Claude Code / Codex / Gemini 실행 이벤트를 `events/activity_events.jsonl`에 기록
- 대시보드가 이벤트를 읽어서 캐릭터 상태를 자동 갱신
- Cloudflare 도메인/접근제어/실시간 터널은 2단계에서 검토
