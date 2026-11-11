# 배포와 환경변수 — 운영 절차

**현재 상태**: 셋업 0~5·7~10 완료, 동기화 실측 성공(2026-11-11). 남은 것: 6번 동료 push 게이트·11번 옛 이름 정리·12번 동료 단독 실행. 결정 기록은 [ADR 0011](../decisions/0011-github-org-and-env-source.md), 설계는 [스펙](../specs/2026-11-10-github-org-env-sync-design.md).

## 1. 구조 한 장

```
협업자 ──(Secrets 추가·변경)──▶ GitHub Org / sungbok-web (공개)
                                   │  Settings › Secrets and variables › Actions
                                   │        └─ VERCEL_TOKEN · VERCEL_ORG_ID · VERCEL_PROJECT_ID  (제어용, 소유자가 1회)
                                   │        └─ YOUTUBE_API_KEY                        (앱 변수 — 서버 전용, ADR 0010)
                                   │
   Run workflow(변수 이름 입력) ──▶  Actions: "Sync env to Vercel" (수동)
                                   │   Vercel REST API: POST /v10/projects/{id}/env?upsert=true (production,preview)
                                   ▼
                              Vercel (소유자 Hobby) · 프로젝트 sungbok-web
                                   ▲
   git push ─────────────────────── Vercel Git 연동 자동 배포 (공개 레포라 협업자 커밋도 배포됨)
```

- **환경변수의 정본은 GitHub Secrets.** Vercel 환경변수는 복사본이다. 동기화는 **덮어쓰기만** 한다 — Secrets 에서 지운 변수는 Vercel 에 남는다(정리는 소유자가 대시보드에서).
- 한 번 실행에 변수 하나. 입력한 이름의 Secret 만 읽는다.
- 배포는 지금처럼 Vercel 이 Git 에서 자동으로 한다. 워크플로우는 배포를 건드리지 않는다.
- 워크플로우 파일: [.github/workflows/sync-vercel-env.yml](../../.github/workflows/sync-vercel-env.yml)

## 2. 1회 셋업 체크리스트 (소유자 계정 필요)

- [x] **0. (이전 전) 동료가 지금 레포에 커밋 하나 push → Vercel 이 배포하는지 확인.** ✅ 2026-11-10 확인: 동료(jwkim705) 커밋 7f61c48·80d5bc2·69aacaa 등이 Production 으로 자동 배포 성공(GitHub deployments 기록, vercel[bot]). 공식 문서상 커밋 작성자 제한은 비공개·조직 레포에만 걸리고 개인 계정의 협업자에게는 적용되지 않는다. 배포돼야 정상. 막히면 여기서 멈추고 설계로 돌아간다.
- [x] 1. ✅ 2026-11-10 `sungbok-church`(Free) 생성. GitHub Organization 생성(Free). GitHub › 프로필 메뉴 › Your organizations › New organization.
- [x] 2. ✅ 2026-11-10 `gh api …/transfer` 로 이전, 공개 유지 확인. 레포 이전: `jihkyuo/sungbok-web` › Settings › Danger Zone › **Transfer ownership** → 조직. **공개 유지.** 비공개로 바꾸면 Hobby 는 조직 레포를 배포하지 못한다.
- [x] 3. ✅ 2026-11-10 `jwkim705` 레포 Admin 부여(이전 시 Write 로 따라옴). 조직 멤버 초대는 생성 화면에서 처리. `rladnjs705` 는 Write 유지. 동료를 조직 멤버로 초대하고 레포 **Admin**(또는 조직 Owner) 부여. Secrets 는 Admin 이상만 편집할 수 있다.
- [x] 4. ✅ 2026-11-10 완료. 로컬 remote 갱신: `git remote set-url origin git@github.com:<org>/sungbok-web.git`
- [x] 5. ✅ 2026-11-10 Vercel GitHub App 을 조직에 설치(sungbok-web 만, installation 180468160). 프로젝트 Settings › Git 이 `sungbok-church/sungbok-web` 로 자동 추적되는 것처럼 보였지만 push 가 배포를 만들지 않아 **Disconnect → Connect 로 재연결 필요했음**(Activity log: disconnected jihkyuo/sungbok-web → connected sungbok-church/sungbok-web). Vercel 재연결. 조건: **Vercel 에 연결된 소유자 GitHub 계정이 조직의 Member 이고 레포 Write 이상**(Outside Collaborator 로는 조직 레포를 연결할 수 없다). GitHub › 조직 Settings › GitHub Apps › Vercel 설치(또는 Vercel › Add New › Import 의 "Adjust GitHub App Permissions"). Vercel › 프로젝트 › Settings › Git › Connected Git Repository 가 `<org>/sungbok-web` 인지 확인, 아니면 Disconnect → Connect.
- [ ] **6. 게이트: 소유자 커밋 push → 자동 배포 확인. 동료 커밋 push → 자동 배포 확인.** ✅ 소유자 쪽 2026-11-11 확인: 빈 커밋 db19696 push → 약 40초 뒤 Production 자동 배포 success(GitHub deployments, vercel[bot]). 주의: 기존 커밋을 새 브랜치 이름으로만 push 하면(새 커밋 0개) 배포가 안 생기니 게이트 실측은 반드시 새 커밋으로. ⏳ 동료 쪽: jwkim705 가 `git remote set-url origin git@github.com:sungbok-church/sungbok-web.git` 뒤 커밋 하나 push → 배포 확인 대기. 둘 다 되면 설계 전제가 실측으로 확인된 것. 동료 커밋이 막히면 멈추고 ADR 0011 을 보류한다.
- [x] 7. ✅ 2026-11-11 팀 범위·1년으로 발급해 `VERCEL_TOKEN` 등록. 주의: 팀 범위 토큰은 Vercel CLI 가 못 쓴다(`GET /v2/user` 404 → "Could not retrieve Project Settings", vercel@65.14.0 실측). 그래서 워크플로우는 CLI 대신 REST API 를 직접 부른다 — 토큰을 전체 계정 범위로 넓히지 말 것. Vercel 토큰 발급: Vercel › Account Settings › Tokens › Create. Scope = 소유자 팀, 만료 1년 권장. 만료되면 워크플로우가 실패해서 알게 된다 → 재발급 후 Secret 교체.
- [x] 8. ✅ 2026-11-11 등록(`team_…`·`prj_…` — 비밀값이 아니라 `GET api.vercel.com/v9/projects?search=sungbok` 으로 토큰만 있으면 다시 얻을 수 있다). ID 확보: `VERCEL_ORG_ID` = Vercel › 팀 Settings › General › Team ID. `VERCEL_PROJECT_ID` = 프로젝트 Settings › General › Project ID.
- [x] 9. ✅ 2026-11-11 4개 등록(`YOUTUBE_API_KEY` 값은 Vercel 에 이미 있던 같은 이름 변수의 값을 복사). 주의: `gh secret set NAME` 을 `--body` 없이 여러 줄 한꺼번에 붙여넣으면 stdin 이 비어 **빈 값이 저장**되고 에러도 없다 — 한 줄씩 `--body` 로. GitHub › 레포 Settings › Secrets and variables › Actions › New repository secret 로 4개 등록: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `YOUTUBE_API_KEY`(값은 현재 Vercel 대시보드의 옛 이름 `NEXT_PUBLIC_YOUTUBE_API_KEY` 값과 동일. 코드는 새 이름을 먼저 읽고 없으면 옛 이름을 읽는다 — ADR 0010).
- [x] 10. ✅ 2026-11-11 run 42974766792 `synced: YOUTUBE_API_KEY → production, preview`. 실측: Vercel 에 이미 있던 `YOUTUBE_API_KEY`(5/29, 3환경 한 레코드)는 upsert 로 **production·preview 만 새 레코드로 분리**되고 development 는 옛 레코드에 그대로 남았다(삭제 없음). 같은 push(65cf83f) 의 새 배포 success → `/api/home-video` 200. Actions › Sync env to Vercel › Run workflow › `name` 에 `YOUTUBE_API_KEY` → 실행. 로그에 `synced: YOUTUBE_API_KEY → production, preview` 확인. Vercel › 프로젝트 › Settings › Environment Variables 에서 그 키가 Production·Preview 에 있고, `VERCEL_*` 는 없는지 확인. 원래 있던 다른 변수는 그대로 남는 게 정상. Development 값이 남았는지도 기록해 둔다(문서가 명시하지 않는 부분).
- [ ] 11. Redeploy(Vercel › Deployments › 최신 › ⋯ › Redeploy) 또는 아무 커밋 push → **새 배포**에서 홈 영상 섹션이 production·preview 모두 정상인지 확인. 환경변수 변경은 기존 배포에 반영되지 않는다. 새 배포가 정상이면 Vercel 대시보드에서 옛 이름 `NEXT_PUBLIC_YOUTUBE_API_KEY` 를 지우고, 코드의 옛 이름 fallback(`src/shared/api/youtubeApi.server.ts`)도 별도 PR 로 지운다.
- [ ] 12. 동료 계정으로 `YOUTUBE_API_KEY` Secret 값을 바꾸고 Run workflow → Vercel 값이 바뀌는지 확인(소유자 개입 없이). 확인 후 원래 값으로 되돌리고 한 번 더 실행.

끝나면 ADR 0011 상태의 "셋업 검증 대기" 꼬리를 떼고 `채택` 만 남긴다.

## 3. 일상 절차: 변수 추가·변경 (협업자 혼자 가능)

1. GitHub › 레포 Settings › Secrets and variables › Actions 에 Secret 등록 또는 값 갱신. 이름은 그대로 Vercel 환경변수 이름이 된다(**대문자**·숫자·밑줄만. 소문자가 섞이면 워크플로우가 거부한다).
2. Actions › **Sync env to Vercel** › Run workflow › `name` 에 그 이름 입력 › Run. 로그 끝에 `synced: <이름> → production, preview` 가 보이면 성공. 빨간색이면 이름 오타·미등록·토큰 만료 중 하나다(로그의 `::error::` 줄).
3. 반영은 다음 배포부터. 바로 보려면 소유자에게 Redeploy 를 부탁하거나 아무 커밋을 push 한다. 새 배포에서 확인한다.

새 변수를 추가할 때 워크플로우 파일을 고칠 필요는 없다. 코드에서 `process.env.<이름>` 으로 읽는 부분은 별도 PR.

## 4. 로컬 개발

- [`.env.example`](../../.env.example) 을 복사해 `.env.local` 로 저장(커밋되지 않음).
- `YOUTUBE_API_KEY`(서버 전용, `NEXT_PUBLIC_` 없음) 는 **각자** Google Cloud 콘솔에서 발급한다(무료, YouTube Data API v3 활성화 → 사용자 인증 정보 › API 키). 운영 키를 로컬로 돌리지 않는다.
- `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` 는 공개 값이고 코드에 같은 fallback 이 있다.
- `vercel link`·`vercel env pull` 은 쓰지 않는다(`.vercel/` 없음).

## 5. 규칙

- **레포는 공개로 유지한다.** 비공개 조직 레포는 Hobby 로 배포할 수 없다.
- **fork 에서 온 PR 의 Vercel 배포를 승인하지 않는다.** 승인하면 그 코드가 preview 환경변수(유튜브 키)를 읽을 수 있다. 협업자는 fork 가 아니라 조직 레포의 브랜치에서 작업한다.
- 레포 Secrets 에는 Vercel 환경변수와 제어용 3개만 둔다. 제어용 이름(`VERCEL_*`)은 워크플로우가 앱 변수로 받지 않는다.
- Vercel 대시보드에서 환경변수를 직접 고치지 않는다. 정본은 Secrets 다.
- 협업자가 빠지면 Vercel 토큰을 재발급하고 `VERCEL_TOKEN` 을 교체한다. 토큰은 소유자 팀 전체 범위라, 레포 Admin 은 사실상 그 권한을 갖는다.

## 6. 알려진 제약

- 삭제 동기화 없음. Secrets 에서 지운 변수는 Vercel 에서 소유자가 지운다.
- production·preview 에 같은 값이 들어간다. 환경별로 달라야 하는 변수가 생기면 접미사 규약(예: `X_PREVIEW`)으로 워크플로우를 확장한다.
- 첫 동기화 때 대시보드에서 만든 3-타깃(production·preview·development) 레코드가 어떻게 재편되는지는 문서가 명시하지 않는다. 체크리스트 10번에서 기록.
- 유튜브 키는 서버 전용이다(`import "server-only"`, ADR 0010). 브라우저 번들에 실리지 않으므로 Google Cloud 에서 "YouTube Data API v3 만 허용" 제한을 걸 수 있다. HTTP 리퍼러 제한은 서버 호출이라 걸지 않는다.
- 관리자·백엔드(ADR 0008, Supabase)가 들어오면 변수가 늘어난다(예: `SUPABASE_URL`, 서비스 키). 이 워크플로우는 이름을 가리지 않으니 같은 절차로 동기화한다. ADR 0008 은 Vercel 계정을 교회 명의로 두기로 했는데, 그때는 제어용 Secret 3개(`VERCEL_TOKEN`·`VERCEL_ORG_ID`·`VERCEL_PROJECT_ID`)만 새 계정 것으로 바꾸면 된다. 이 구조는 Vercel 계정이 누구 것이든 같다.
