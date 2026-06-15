# Offspace AI Office — Meeting Log

## 2026-06-10 — 허사장·코부장 CLI 소통 방식 정리

### 참석/역할
- 대표님: 방향 제시 및 최종 판단
- 허사장(Hermes): 전체 설계, 업무분장, 대표님 보고
- 코부장(Claude Code): 구현, 코드 구조, 이벤트 연결

### 대표님 지시
- 허사장과 코부장은 맥미니에서 CLI로 소통한다.
- 코부장을 부를 때는 Claude Code CLI를 사용한다.
- 코부장이 허사장에게 답변해야 할 때는 Hermes CLI를 사용할 수 있다.
- 그룹방에서 허사장을 호출할 필요가 있으면 `@offs_hermes` 멘션을 사용한다.
- 실무 논의는 회의록으로 남겨 진행상황을 추적한다.

### 결정
1. 실무 대화 기본 채널은 맥미니 CLI로 한다.
2. 대표님 보고는 이 그룹방에 짧게 남긴다.
3. `docs/COMMUNICATION_PROTOCOL.md`를 기준 문서로 둔다.
4. `docs/MEETING_LOG.md`에 회의록을 누적한다.
5. Offspace AI Office 구현 기준은 `prototype/index-v3.html`과 이벤트 기반 상태 엔진이다.

### 코부장 확인 응답
- `COMMUNICATION_PROTOCOL.md`, `MEETING_LOG.md`, `CLAUDE.md` 확인 완료.
- 실무 논의는 맥미니 CLI에서 진행하고, 그룹방은 중간/최종 보고용으로 이해함.
- 허사장 호출 시 `@offs_hermes` 사용, `@허사장` 금지 확인.
- 다음 구현 단계에서는 회의록 기록 → 필요 시 `hermes chat -q` 회신 → 대표님 보고 필요 시 핵심만 그룹방 보고 순서로 진행하겠다고 응답함.

### 다음 행동
- 허사장: 다음 구현 지시를 Claude Code CLI로 전달한다.
- 코부장: 다음 구현 지시부터 새 통신 규칙에 따라 작업하고 보고한다.
- 이후 작업: SSE/JSONL 이벤트 연결, Claude Code hooks, 캐릭터 상태 자동 갱신.

## 2026-06-10 — 모바일 접속 가능 상태 구성

### 대표님 지시
- 대시보드를 모바일에서도 볼 수 있도록 구성.

### 처리
- `prototype/index-v3.html`에 모바일 반응형 CSS와 모바일용 캐릭터 위치 슬롯을 추가.
- Chrome headless 390x844 모바일 뷰포트로 스크린샷 검증.
- 프로젝트 루트 `index.html`을 대시보드로 리다이렉트하도록 생성.
- LaunchAgent `com.offspace.ai-office-dashboard` 생성.
- 포트 `8790`에서 Python HTTP 서버를 실행하도록 구성.

### 접속 주소
- `http://192.168.1.4:8790/`
- `http://192.168.1.4:8790/prototype/index-v3.html`

### 검증
- `curl -I` 로 localhost/LAN URL 모두 `200 OK` 확인.
- 서버 프로세스 `*:8790 LISTEN` 확인.

## 2026-06-15 — UI 상태 배지와 젬대리 표현 통일

### 처리
- `prototype/index-v3.html` 상단/하단에 실데이터·샘플 데이터·오래됨 상태가 보이도록 상태 배지를 추가.
- 운영 화면의 데모 버튼은 기본 숨김 처리하고, `?dev=1`에서만 개발용 문구와 함께 표시하도록 변경.
- 젬대리 정체성은 `Antigravity/Agy Research Lounge` 기준으로 문서 표현을 통일.

### 결정
- 젬대리 표기는 Antigravity/Agy Research Lounge를 기준으로 유지한다.
- `scripts/update_office_status.py`는 이번 작업 범위에서 수정하지 않았다.
