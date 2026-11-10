# 스펙: 레포 조직 이전 + 환경변수 정본을 GitHub Secrets 로 (배포는 Vercel 자동 유지)

**상태**: 승인·산출물 구현 완료(2026-11-10) — 사용자 셋업·게이트 검증 대기. 계획: [-plan.md](2026-11-10-github-org-env-sync-plan.md)
**날짜**: 2026-11-10
**근거**: 2026-11-10 브레인스토밍. 협업자 1명 합류, Vercel 은 본인 Hobby(개인) 계정
**후속 ADR**: 0008 (레포 소유·환경변수 정본·배포 경로) — 구현 시 작성

## 1. 목적과 성공 기준

**목적**: 협업자가 본인 없이 **운영 환경변수를 추가·변경**할 수 있게 한다. 교회 프로젝트이므로 레포 소유도 개인에서 조직으로 옮겨 "모두가 함께 만드는" 구조로 바꾼다. 비용은 0 유지.

**성공 기준**
- 협업자가 GitHub 에서 Secret 을 추가·변경하고 Actions 를 한 번 실행하면, 그 값이 Vercel 의 production·preview 환경변수에 들어간다. 본인 개입 없음.
- 협업자의 커밋·PR 이 지금처럼 Vercel 에서 자동 배포·프리뷰 배포된다.
- Vercel 대시보드는 본인만 열고, 환경변수를 사람이 직접 고치지 않는다(정본은 Secrets 하나).
- 협업자가 로컬에서 `pnpm dev` 를 돌릴 수 있다.

**사용자가 한 결정** (브레인스토밍, 2026-11-10)
- 공용 Vercel 계정 ✕ (약관 1조 "로그인 자격 공유 금지" 명시).
- Vercel Pro 팀(1인당 월 $20) ✕ — 무료로 간다. (Pro 가 이 구조의 유료 정답임은 인지.)
- 레포에 `.env` 커밋 ✕ — 공개 레포라 키 노출. 비밀값 정본은 GitHub Secrets.
- GitHub Organization 생성 + 레포 이전 ○. 협업자는 Secrets 를 만질 수 있는 권한(Admin).
- 배포는 **Vercel Git 자동 배포 유지**. Actions 는 "Secrets → Vercel 환경변수 동기화"만 한다(Actions 전면 배포 ✕ — PR 프리뷰 배포를 잃고 파이프라인을 직접 소유하게 됨).

## 2. 구조

```
협업자 ──(Secrets 추가·변경)──▶ GitHub Org / sungbok-web (공개)
                                   │  Settings › Secrets
                                   │        └─ VERCEL_TOKEN · VERCEL_ORG_ID · VERCEL_PROJECT_ID  (제어용, 본인이 1회)
                                   │        └─ YOUTUBE_API_KEY  (앱 변수 — 지금은 이것 하나)
                                   │
   Run workflow(변수 이름 입력) ──▶  Actions: "Sync env to Vercel" (수동)
                                   │   vercel env add <이름> --environment production,preview --force
                                   ▼
                              Vercel (본인 Hobby) · 프로젝트 sungbok-web
                                   ▲
   git push ─────────────────────── Vercel Git 연동 자동 배포 (지금과 동일, 공개 레포라 협업자 커밋도 OK)
```

- 환경변수 정본 = GitHub Repository Secrets. Vercel 환경변수는 그 **복사본** — 단, 동기화는 **덮어쓰기만** 한다. Secrets 에서 지운 변수나 대시보드에 직접 넣은 변수는 Vercel 에 남는다(삭제 동기화 ✕, 아래 3절). 정리는 본인이 대시보드에서.
- 한 번 실행에 **변수 하나**. Run workflow 때 이름을 입력하면 그 Secret 만 읽어 보낸다. 다른 Secret 은 실행에 노출되지 않는다.
- 동기화 대상은 **유튜브 API 키 하나**다. 코드가 읽는 나머지 둘은 Secret 일 이유가 없다 — `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` 는 공개 값이고 `src/domains/home/data/homeVideo.ts` 에 fallback 이 이미 있다(Vercel 기존값은 그대로 둔다). `API_URL` 은 `src/shared/api/client.ts`(axios 인스턴스)만 읽는데 그 모듈을 import 하는 곳이 없어 **죽은 변수**다. 모듈 삭제는 이 작업 범위 밖(언급만).
- 동기화는 수동(`workflow_dispatch`)이다. Secrets 변경은 GitHub 이벤트가 없어서 자동 트리거를 걸 수 없다.
- 반영은 **다음 배포부터**. 즉시 반영은 Vercel 대시보드 Redeploy(본인) 또는 아무 커밋 push.

## 3. 동기화 워크플로우 — `.github/workflows/sync-vercel-env.yml`

**제 결정(사용자 미언급, 변경 가능)** — Codex 리뷰(2026-11-10) 반영본

| 항목 | 결정 | 이유 |
|---|---|---|
| 동기화 대상 | Run workflow 입력 `name` 하나 → `secrets[inputs.name]` | 레포 Secrets 전체를 열거(`toJSON(secrets)`)하면 제어 토큰·조직 Secret 까지 한 step 에 노출됨. 이름 하나만 읽으면 노출면이 그 값 하나. 새 변수도 yml 수정 없이 추가 가능 |
| 대상 환경 | `--environment production,preview` | PR 프리뷰도 유튜브 키가 있어야 영상 섹션이 뜸. `development` 는 로컬 `.env.local` 로 대체 |
| 기존값 교체 | `vercel env add --force` | 삭제 단계 없음. 중간에 실패해도 기존 값이 남는다. 구 방식(rm → add)은 레코드 통째 삭제·부분 반영 위험이 있어 폐기 |
| CLI 버전 | `vercel@65.14.0` (정확한 버전 고정) | `--environment`·`--force` 는 64.7.0 이상. 운영 변수를 바꾸는 작업이라 패치 릴리스에도 흔들리지 않게 정확히 고정. 올릴 때는 스텁 테스트 재실행 |
| 토큰 노출 범위 | 제어 Secret 은 **동기화 step 의 env 에만** | job-level env 면 `npm install` 과 그 lifecycle script 도 토큰을 상속 |
| 권한 | `permissions: {}` | checkout 도 GitHub API 도 안 씀 |
| 동시 실행 | `concurrency: sync-vercel-env` | 두 번 눌러도 교차 실행 안 함 |
| 이름 검증 | 식별자 형식만 허용, `VERCEL_*`·`GITHUB_*` 거부 | 제어 Secret 을 앱 변수로 밀어 넣는 실수 방지 |
| 빈 값·제어 Secret 누락 | 즉시 실패 | 이름 오타·셋업 미완을 조용히 지나치지 않음 |
| 삭제 동기화 | **하지 않음** | Vercel 에서 변수를 지우는 로직은 잘못 짜면 운영을 날리는 가장 위험한 부분. 변수 하나가 몇 달에 한 번 바뀌는 규모라 drift 는 문서로 관리 |
| 환경별 다른 값 | **같은 값**을 production·preview 에 | 지금 환경별로 달라야 하는 변수가 없음. 필요해지면 접미사 규약(예: `X_PREVIEW` → preview 만)으로 확장 — 범위 밖 |
| 기존 3-타깃 레코드와의 상호작용 | 게이트에서 확인 | 대시보드에서 만든 변수는 production·preview·development 한 레코드. `--force` 가 그 레코드를 어떻게 재편하는지(development 가 남는지)는 문서가 명시하지 않음. 이 레포는 `vercel env pull` 을 쓰지 않아(`.vercel/` 없음) 어느 쪽이든 로컬 영향 없음 |

워크플로우 초안은 `.github/workflows/sync-vercel-env.yml` 에 있다(위 결정 반영됨, 승인 뒤 계획 단계에서 재검증).

**검증 (구현 단계)**
- YAML 파싱 통과(가능하면 `actionlint`).
- 실제 실행: Secrets 등록 후 Run workflow(`YOUTUBE_API_KEY`) → Vercel 프로젝트 환경변수에 그 키가 production·preview 에 있고 값이 Secrets 와 같음. `VERCEL_*` 는 Vercel 에 없어야 함. 대시보드에 원래 있던 다른 변수는 그대로 남는 게 정상.
- **새 배포 기준으로 확인**: 환경변수 변경은 기존 deployment 에 반영되지 않는다. Redeploy(또는 커밋 push) 뒤 그 deployment 의 생성 시각·커밋이 동기화 이후인지 보고, 홈 영상 섹션(LiveStage·NoticeReel)이 production·preview 모두 정상인지 확인.
- 협업자 계정으로 Secret 값을 바꾸고 Run workflow → Vercel 값이 바뀜(본인 개입 없이).

## 4. 1회 셋업 절차 (본인 계정 필요 — 사용자 수행, 문서로 제공)

0. **(조직 이전 전) 동료가 지금 레포에 커밋 하나 push** → Vercel 이 배포하는지 확인. 공식 문서상 커밋 작성자 제한은 비공개 레포·조직 레포에만 걸리고 "개인 계정의 협업자에게는 적용되지 않는다"고 명시돼 있으므로 배포돼야 정상. 여기서 막히면 문서와 실제가 다른 것이니 설계를 멈춘다.
1. GitHub Organization 생성(Free). 이름은 사용자 결정.
2. `jihkyuo/sungbok-web` → Settings › Danger Zone › **Transfer ownership** → 조직. **공개 유지**(비공개로 바꾸면 Hobby 의 "소유자 외 커밋 배포 차단"이 다시 걸림).
3. 협업자를 조직 멤버로 초대하고 레포 **Admin**(또는 조직 Owner) 부여 — Secrets 는 Admin 이상만 편집 가능.
4. 로컬 remote 갱신: `git remote set-url origin git@github.com:<org>/sungbok-web.git` (GitHub 가 구 주소를 리다이렉트하지만 명시적으로 바꾼다).
5. Vercel: GitHub App 을 조직에 설치(Vercel › Add New › Import 흐름의 "Adjust GitHub App Permissions" 또는 GitHub › Org Settings › GitHub Apps › Vercel). **Vercel 에 연결된 본인 GitHub 계정이 조직의 Member 이고 레포 Write 이상**이어야 조직 레포를 연결할 수 있다(Outside Collaborator 로는 불가). 프로젝트 Settings › Git 의 Connected Repository 가 새 경로인지 확인, 아니면 Disconnect → Connect.
6. 커밋 하나 push 해서 자동 배포 확인. 협업자 커밋도 확인. **← 게이트.** 근거: Vercel Git 문서의 커밋 작성자 제한은 "Deploying private Git repositories" 절에만 있고, Hobby 절도 "조직의 **비공개** 레포에서는 Hobby 로 배포할 수 없다"고 쓴다. 공개 레포는 "commits from it will usually deploy automatically", 승인이 필요한 건 fork 에서 온 PR 뿐. 즉 **조직 + 공개**는 되고 **조직 + 비공개**는 완전 차단. 문서 해석이므로 여기서 실측한다. 막히면 레포 소유 결정 자체를 다시 본다(ADR 0011 보류).
7. Vercel 토큰 발급: Account Settings › Tokens. Scope = 본인 팀, 만료는 1년 권장(만료되면 워크플로우가 실패해서 알게 됨 → 재발급·Secret 교체).
8. `VERCEL_ORG_ID` = 팀 Settings › General › Team ID. `VERCEL_PROJECT_ID` = 프로젝트 Settings › General › Project ID.
9. 레포 Settings › Secrets and variables › Actions 에 제어용 3개 + `YOUTUBE_API_KEY` 등록(값은 현재 Vercel 대시보드 것과 동일). 레포 이전으로 기존 Secret 이 사라지지는 않는다 — 지금은 없어서 새로 넣는 것.
10. Run workflow(이름 `YOUTUBE_API_KEY`) → 3절 검증.
11. **fork PR 배포는 승인하지 말 것.** 공개 레포는 fork 에서 온 PR 에 Vercel 이 배포 승인을 요구한다. 승인하면 그 코드가 preview 환경변수(유튜브 키)를 읽을 수 있다. 협업자는 fork 가 아니라 조직 레포의 브랜치에서 작업한다.

## 5. 로컬 개발

- 각자 `.env.local`(gitignore 됨). `.env.example` 을 레포에 추가해 **이름만** 안내. `.gitignore` 가 `.env*` 를 통째로 막고 있으므로 `!.env.example` 예외 한 줄 추가.
- `YOUTUBE_API_KEY` 는 협업자가 Google Cloud 에서 **자기 키**를 발급(무료)해 쓴다. 운영 키를 로컬로 돌리지 않는다.
- `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` 는 비밀이 아니므로 `.env.example` 에 값까지 적는다(코드 fallback 과 같은 값).

## 6. 범위 밖

- Vercel Pro 전환, Actions 전면 배포(프리뷰 포함), 동기화 뒤 자동 Redeploy(후속 후보).
- 유튜브 키의 Google Cloud 제한 설정(별건 권고: "YouTube Data API v3 만 허용". **HTTP 리퍼러 제한은 걸지 말 것** — 같은 키를 서버 Route Handler 가 쓴다).
- `YoutubeInitialize.tsx`(클라이언트에서 키 사용) 정리 — 키가 브라우저 번들에 이미 들어가 있는 상태는 이 작업과 무관하게 존재한다. 다만 같은 파일이 **키를 `console.log` 로 찍는 줄**(26행 부근)은 별건 소수정으로 지우는 게 맞고, 브라우저용·서버용 키 분리는 후속.

## 7. 리스크

- **토큰 권한**: Hobby 토큰은 본인 Vercel 계정 전체 권한. 레포 Admin 전원이 사실상 그 권한을 갖는다. 교회 동료 범위에서 수용(사용자 결정). 협업자 이탈 시 토큰 재발급.
- **fork PR**: 승인하면 preview 환경변수가 fork 코드에 읽힌다. 4절 11번으로 운영 규칙화.
- **Hobby 약관**: 교회 사이트는 비상업이라 Hobby 범위. CI 토큰 사용은 통상 관행이라 "자격 공유"로 보지 않는다.

## 8. 진행 방식과 완료 정의

빌더(Claude)는 GitHub 조직·Vercel 계정에 접근할 수 없다. 그래서:
1. 산출물(아래 9절)을 먼저 만든다. ADR 0011 상태는 **"채택 — 셋업 검증 대기"**.
2. 사용자가 4절 셋업을 수행하고 3절 검증을 돌린다(체크리스트는 `.md/workflow/deploy-and-env.md` 에).
3. 게이트(4절 6번) 통과 + 검증 통과 → ADR 상태를 "채택"으로 갱신. 막히면 스펙으로 돌아온다.

"완료" = 1번까지가 빌더 완료, 3번까지가 작업 완료.

## 9. 산출물

- `.github/workflows/sync-vercel-env.yml` (초안 존재)
- `.env.example`
- `.md/workflow/deploy-and-env.md` — 셋업·일상 절차·주의(살아있는 문서)
- `.md/decisions/0008-*.md` — ADR
- `.md/README.md` 인덱스 갱신
