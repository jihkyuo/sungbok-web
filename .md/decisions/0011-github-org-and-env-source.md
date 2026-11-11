# ADR 0011: 레포를 GitHub Organization 으로 이전하고 환경변수 정본을 GitHub Secrets 로 둔다

**상태**: 채택 — 셋업 검증 대기(스펙 §4 6번 게이트: 조직 공개 레포에서 협업자 커밋이 Vercel 자동 배포되는지 실측)
**날짜**: 2026-11-10

## 배경

협업자 1명이 합류했다. 협업자가 소유자 없이 운영 환경변수를 추가·변경할 수 있어야 한다. Vercel 은 소유자의 개인 Hobby(무료) 계정이고, 레포 `jihkyuo/sungbok-web` 은 개인 소유 공개 레포다.

- Vercel Hobby 는 멤버 초대가 불가능하다(Pro 는 1인당 월 $20).
- Vercel 약관 1조는 로그인 자격 공유를 명시적으로 금지한다.
- 공개 레포에 `.env` 를 커밋하면 유튜브 API 키가 노출된다.
- 교회 프로젝트이므로 레포 소유가 개인에게 묶여 있는 것 자체가 바람직하지 않다.

## 결정

레포를 교회 GitHub Organization 으로 이전하고 협업자를 Admin 으로 둔다. 환경변수의 정본은 GitHub Repository Secrets 로 하고, 수동 실행 워크플로우(`.github/workflows/sync-vercel-env.yml`)가 입력한 이름의 Secret 하나를 Vercel REST API(`POST /v10/projects/{id}/env?upsert=true`, production·preview)로 Vercel 에 덮어쓴다(처음엔 `vercel env add --force` 였으나 팀 범위 토큰으로는 CLI 가 프로젝트를 못 읽어 2026-11-11 API 직접 호출로 바꿨다. 같은 엔드포인트다). **배포 경로는 바꾸지 않는다** — Vercel Git 연동 자동 배포(PR 프리뷰 포함)를 그대로 쓴다. 레포는 공개를 유지한다.

핵심 디테일:
- 한 번 실행에 변수 하나(`secrets[inputs.name]`). 레포 Secrets 전체를 열거하지 않는다.
- 삭제 동기화 없음. 덮어쓰기만.
- 제어용 Secret 3개(`VERCEL_TOKEN`·`VERCEL_ORG_ID`·`VERCEL_PROJECT_ID`)는 소유자가 1회 등록. 워크플로우는 이 이름을 앱 변수로 받지 않는다.
- 동기화 대상은 현재 `YOUTUBE_API_KEY` 하나(서버 전용 — ADR 0010 에서 `NEXT_PUBLIC_` 이름을 버렸다. 옛 이름은 Vercel 에서 지운 뒤 코드 fallback 도 지운다). 채널 ID 는 코드 fallback 이 있는 공개값.
- 절차: [workflow/deploy-and-env.md](../workflow/deploy-and-env.md). 설계: [스펙](../specs/2026-11-10-github-org-env-sync-design.md).
- 관련 결정: [ADR 0008](0008-admin-backend-vercel-supabase.md) 은 Vercel·Supabase 계정을 교회 명의로 두기로 했다. 이 결정은 그와 독립이다 — Vercel 계정이 바뀌면 제어용 Secret 3개만 교체한다. Supabase 변수가 늘어나도 같은 워크플로우로 동기화한다.

## 대안 비교

| 대안 | 탈락 이유 |
|---|---|
| Vercel Pro 팀 업그레이드 | 이 구조의 유료 정답. 무료 유지가 사용자 결정. 협업 규모가 커지면 다시 검토 |
| 공용 Vercel 계정 | 약관 1조 위반("각 사용자는 고유한 로그인 자격… 여러 사용자가 공유 금지"). 공용 메일함·GitHub 계정도 추가로 필요, 감사 추적 없음 |
| 레포에 `.env` 커밋 | 공개 레포라 키 노출. 비공개로 바꾸면 Hobby 가 조직 레포를 배포하지 못함 |
| GitHub Actions 가 배포까지 전담(`vercel deploy`) | PR 프리뷰 배포를 직접 스크립트로 재구현해야 하고 파이프라인 전체를 소유하게 됨. 환경변수는 몇 달에 한 번 바뀌는 값이라 과함 |
| 레포 Secrets 전부를 한 번에 동기화(`toJSON(secrets)`) | 제어 토큰·조직 Secret 까지 한 step 환경에 노출됨. 이름 하나만 받는 쪽이 더 단순하고 노출면이 작음 |
| 기존 변수를 `env rm` 후 `env add` | `rm` 이 3-타깃 레코드를 통째로 지우고, 삭제와 추가 사이 실패 시 운영 값 유실. `--force` 덮어쓰기로 대체 |

## 결과 / 영향

- 협업자 절차는 "Secrets 등록 → Run workflow(이름 입력)" 두 단계. 워크플로우 파일을 고치지 않고 변수를 추가할 수 있다.
- Vercel 토큰은 소유자 팀 전체 범위다. 레포 Admin 은 워크플로우를 고쳐 토큰을 꺼낼 수 있으므로, Admin 권한은 신뢰하는 협업자에게만. 협업자 이탈 시 토큰 재발급.
- 삭제 동기화가 없어 Secrets 와 Vercel 이 어긋날 수 있다. 정리는 소유자가 대시보드에서.
- **레포를 비공개로 바꾸면 이 구조가 깨진다**(Hobby + 조직 + 비공개 = 배포 차단). 비공개가 필요해지면 Pro 로 간다.
- 게이트(조직 공개 레포에서 협업자 커밋 자동 배포)가 실패하면 레포 소유 결정으로 되돌아온다. 그 경우 레포를 개인에 두고 협업자만 추가하는 구조는 Secrets 편집권을 주지 못하므로(개인 레포 Secrets 는 소유자만), Pro 재검토가 다음 선택지다.
- 유튜브 키가 브라우저 번들에 노출돼 있는 문제는 이 결정과 무관하게 존재한다. 후속: `console.log` 제거, 브라우저용·서버용 키 분리.
