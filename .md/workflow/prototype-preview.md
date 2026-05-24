# 프로토타입 미리보기 방식

스크롤·모션 같은 **실제 동작**을 확정 전에 확인해야 할 때 쓰는 방식. 정적 스크린샷으로는 모션이 전달되지 않으므로, 브라우저에서 직접 스크롤해보게 한다. 실제 코드베이스와 분리된 던져버려도 되는 임시물로 만든다.

## 언제 쓰나

- 히어로 스크롤 인터랙션, 섹션 전환, 호버/등장 모션 등 "굴려봐야 아는" 동작을 결정할 때.
- 본 코드에 반영하기 **전에** 여러 안을 빠르게 비교할 때.

## 절차

1. **자기완결 HTML 한 파일** 작성 — 외부 의존성 0, inline CSS/JS. 본 코드와 무관한 임시물.
2. 작업 폴더 `/tmp/sungbok-proto/` 에 두고, 필요한 이미지 자산을 **flat 파일명**으로 복사한 뒤 상대경로로 참조.
   - 예: `src/assets/images/main/worship.jpg` → `/tmp/sungbok-proto/worship.jpg`
3. 그 폴더에서 **로컬 HTTP 서버**를 백그라운드로 실행:
   ```bash
   cd /tmp/sungbok-proto && python3 -m http.server 8973 --bind 127.0.0.1
   ```
   `file://` 로 직접 열면 브라우저가 file:// HTML에서 다른 file:// 이미지를 차단할 수 있으므로 로컬 서버로 띄운다.
4. 브라우저로 열기 — 캐시 무력화용 쿼리를 매번 증가:
   ```bash
   open "http://127.0.0.1:8973/?v=1"
   ```
5. 사용자가 직접 스크롤·동작 확인 → 피드백 → 같은 파일 수정 → `?v=2`, `?v=3` … 으로 다시 열어 반복.

## 자기 점검(선택)

사용자에게 보여주기 전, 헤드리스 브라우저로 몇 지점을 캡처해 깨진 곳을 먼저 확인할 수 있다(viewport 캡처):

```bash
B=~/.claude/skills/gstack/browse/dist/browse
"$B" viewport 1440x900
"$B" goto "http://127.0.0.1:8973/?v=1"
"$B" js "window.scrollTo(0,1400)" && "$B" screenshot --viewport /tmp/check.png
```

## 자산 참고

디자인 자산: [src/assets/images/main/](../../src/assets/images/main/) — `main01.jpg`(외관) · `worship.jpg`(예배) · `pastor.jpg`(담임목사).

## 주의

- 프로토타입은 **확정 전 확인용**이며, 승인된 동작만 본 코드로 옮긴다.
- 임시 폴더(`/tmp/sungbok-proto/`)와 자산 사본은 레포에 커밋하지 않는다.
