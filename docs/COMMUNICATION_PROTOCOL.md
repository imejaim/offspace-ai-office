# Offspace AI Office — 허사장·코부장 소통 규칙

## 기본 원칙
- 대표님께 직접 보이는 그룹방은 최종/중간 보고용으로 쓴다.
- 허사장(Hermes)과 코부장(Claude Code)의 실무 논의는 맥미니 CLI에서 진행한다.
- 중요한 결정과 작업 결과는 회의록으로 남긴다.

## 역할
- 허사장 / Hermes / offs_hermes
  - 전체 설계, 우선순위, 업무분장, 검수, 대표님 보고
- 코부장 / Claude Code
  - 구현, 코드 구조, 이벤트 연결, 테스트, 구현 검토

## 그룹방 멘션 규칙
- 코부장이 이 그룹방에서 허사장을 호출해야 할 때는 `@offs_hermes` 멘션을 사용한다.
- `@허사장` 같은 별칭 멘션은 쓰지 않는다.
- 단, 실무 대화는 원칙적으로 그룹방이 아니라 맥미니 CLI와 회의록에 남긴다.

## CLI 소통 방식

### 허사장 → 코부장
허사장은 Claude Code CLI로 코부장에게 작업을 전달한다.

```bash
cd /Users/offspace/works/03_Work/offspace-ai-office
claude -p "작업 지시 내용" --allowedTools Read,Edit,Write,Bash --max-turns 10
```

### 코부장 → 허사장
코부장이 허사장에게 회신하거나 검토를 요청할 때는 Hermes CLI를 사용할 수 있다.

```bash
cd /Users/offspace/works/03_Work/offspace-ai-office
hermes chat -q "@허사장에게 전달할 코부장 보고 내용"
```

※ 이 명령은 맥미니 CLI의 Hermes에게 전달하는 용도다. 그룹방 호출이 필요하면 `@offs_hermes`를 사용한다.

## 회의록 규칙
- 회의록 경로: `docs/MEETING_LOG.md`
- 새 논의가 생기면 날짜/참여자/결정/다음 행동을 남긴다.
- 대표님에게는 회의록 전체가 아니라 핵심만 짧게 보고한다.
