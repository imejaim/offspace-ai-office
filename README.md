# Offspace — Garden Campus

작은 아이디어와 일이 모이는 3D 사무실. Three.js로 만든 햇살 캠퍼스와 실제 업무 영역을 연결하는 공개 디렉터리입니다.

## 공개 주소

- 메인: https://imejaim.github.io/offspace-ai-office/
- 새 화면: https://imejaim.github.io/offspace-ai-office/prototype/index-v4.html
- 기존 `prototype/index-v3.html` 북마크도 새 화면으로 이동합니다.
- 변경 전 v3는 `prototype/index-v3-legacy.html`에 보존했습니다.

## 들어 있는 것

- 사업 스튜디오 / 투자 관측소 / 워크숍 / 리서치 온실 / 커뮤니티 홀 / 라이프 코티지
- 직접 제작한 3D 건물과 가구, 정원, 경로, 분수
- 원본을 보존한 헤리·코부장·오과장·젬대리 캐릭터
- 건물 클릭과 HTML 메뉴, 회전·확대·전체 보기
- 데스크톱 키보드 산책: 산책 버튼 → 방향키/WASD → Escape 종료
- 모바일 업무 목록, 모션 축소, WebGL 미지원 시 HTML 업무 디렉터리

## 중요한 구분

`prototype/v4/office-data.js`는 공개해도 되는 업무 구성만 담은 수동 편집 자료입니다. 구성 확인일은 2026-09-29이며, 실시간 작업·매출·잔고를 의미하지 않습니다. 캐릭터 움직임은 공간 연출입니다. 회사 문서와 가족 기록, 자격증명, 계좌 상세를 읽거나 게시하지 않습니다. 폴더명/디스코드 채널명은 분류 안내이지 직접 접속 링크가 아닙니다.

기존 `scripts/update_office_status.py`, `scripts/update_and_push_status.sh`와 `data/office-status.json`은 변경하지 않았으며 새 화면은 이 오래된 상태 피드를 사용하지 않습니다. 투자 데이터는 기존 별도 대시보드 링크에서 확인합니다.

## 개발과 검증

```bash
npm ci --ignore-scripts
npm test
npm run serve
# http://127.0.0.1:8791/prototype/index-v4.html

uv run --with playwright python tests/office-ui.py
uv run --with playwright python tests/office-interactions.py
uv run --with playwright python tests/office-modal.py
```

브라우저 검증 스크립트는 macOS Google Chrome 설치 경로를 사용합니다. `office-ui.py`의 `OFFICE_BASE` 환경변수로 배포 주소를 검사할 수 있습니다. 화면 캡처와 결과는 로컬 QA 폴더에 저장합니다. 모바일 뷰포트 검사와 실제 휴대폰 GPU/FPS 측정은 다릅니다.

별도 서버 빌드 없이 HTML/JS/CSS와 로컬 Three.js 모듈을 GitHub Pages에서 제공합니다. Three.js 0.180.0은 `prototype/v4/vendor/`에 고정 보관했으며 MIT 라이선스를 함께 배포합니다. `npm ci`는 공급 버전 재현용이며 vendor 파일을 자동 변경하지 않습니다.

시각 방향·범위·검증 기준: [Garden Campus v4](docs/GARDEN_CAMPUS_V4.md).
