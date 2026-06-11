# 모바일 접속 안내

같은 Wi‑Fi에 연결된 휴대폰에서 아래 주소를 연다.

```text
http://192.168.1.4:8790/
```

직접 대시보드:

```text
http://192.168.1.4:8790/prototype/index-v3.html
```

## 서버
- LaunchAgent: `~/Library/LaunchAgents/com.offspace.ai-office-dashboard.plist`
- 실행 스크립트: `~/.hermes/scripts/offspace-ai-office-server.sh`
- 로그: `~/.hermes/logs/offspace-ai-office-dashboard.log`
- 에러로그: `~/.hermes/logs/offspace-ai-office-dashboard.err`
- 포트: `8790`

## 상태 확인

```bash
launchctl print gui/$(id -u)/com.offspace.ai-office-dashboard
lsof -nP -iTCP:8790 -sTCP:LISTEN
curl -I http://127.0.0.1:8790/prototype/index-v3.html
```
