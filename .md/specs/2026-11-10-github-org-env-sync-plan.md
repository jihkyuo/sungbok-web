# 레포 조직 이전 + env 정본 GitHub Secrets — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 협업자가 GitHub Secrets 에 값을 넣고 Actions 를 한 번 실행하면 그 값이 Vercel production·preview 환경변수에 들어가게 하는 워크플로우와, 사용자가 조직 이전·Vercel 재연결·토큰 셋업을 혼자 끝낼 수 있는 절차 문서를 만든다.

**Architecture:** 배포 경로는 손대지 않는다(Vercel Git 자동 배포 유지). 추가되는 것은 수동 실행 워크플로우 하나(`workflow_dispatch` 입력 `name` → `secrets[inputs.name]` → `vercel env add --force`), 로컬 개발용 `.env.example`, 살아있는 절차 문서, ADR. 셋업(조직·이전·토큰·Secrets)은 코드가 아니라 사용자가 수행하는 체크리스트다.

**Tech Stack:** GitHub Actions(`workflow_dispatch`, `secrets` context 인덱싱) · Vercel CLI 64.x(`env add --environment --force`) · bash · actionlint

**Spec:** [.md/specs/2026-11-10-github-org-env-sync-design.md](2026-11-10-github-org-env-sync-design.md) — §2 구조, §3 워크플로우 결정표·검증, §4 셋업 절차(0~11), §5 로컬 개발, §6 범위 밖, §7 리스크, §8 진행 방식, §9 산출물

## Global Constraints

- **git**: 스테이징·커밋은 **사용자가 지시할 때만** (CLAUDE.md). 태스크 끝의 "체크포인트"는 변경 보고이지 커밋이 아니다.
- **동기화 대상은 유튜브 API 키 하나**: `YOUTUBE_API_KEY`. 채널 ID(`NEXT_PUBLIC_YOUTUBE_CHANNEL_ID`, 코드 fallback `'UClz4pOT6Kmuy8MvR3cyHPjA'`)와 `API_URL`(죽은 변수)은 Secrets·동기화·문서의 "동기화 대상"에 넣지 않는다.
- **워크플로우 불변 조건**(스펙 §3): 입력 이름 하나만 읽음 · `--environment production,preview --force --yes` · 삭제 단계 없음 · `vercel@65.14.0` 정확히 고정 · 제어 Secret 은 동기화 step 의 `env` 에만 · `permissions: {}` · `concurrency` 그룹 `sync-vercel-env` · 이름 검증(`^[A-Z_][A-Z0-9_]*$` 대문자 전용 — Secret 조회가 대소문자 무시라 소문자 제어 이름 우회 방지, `VERCEL_*`·`GITHUB_*` 거부) · 빈 값·제어 Secret 누락 시 비0 종료.
- **레포는 공개 유지**(비공개로 바꾸면 Hobby 협업 차단). 문서에 명시.
- **외과적 변경**: 이 계획이 명시하지 않은 파일은 건드리지 않는다. 특히 `YoutubeInitialize.tsx` 의 `console.log` 는 범위 밖(별건).
- **문서 규칙**(`.md/README.md`): 살아있는 문서는 `workflow/`, ADR 은 `decisions/NNNN-slug.md` 양식, 인덱스 갱신 필수.
- **카피 톤**: 사실 진술만.

## Review Focus

스펙이 명시하지 않지만 실제로 깨질 입력. 각 항목은 Task 1 의 스텁 테스트에 반영돼 있다.

1. **등록되지 않은 이름을 입력** — `secrets[inputs.name]` 은 빈 문자열이 된다. 빈 값으로 Vercel 을 덮어쓰면 운영 키가 사라진다. 비0 종료해야 한다. → Task 1 테스트 `empty-value`
2. **소문자·하이픈·공백이 섞인 이름** — Vercel 이 거부하거나 엉뚱한 변수가 생긴다. 식별자 형식이 아니면 비0 종료. → Task 1 테스트 `bad-name`
3. **제어 Secret 이름을 입력**(`VERCEL_TOKEN`) — 토큰이 앱 환경변수로 들어가 브라우저 번들에 실릴 수 있다. 거부. → Task 1 테스트 `control-name`
4. **Vercel CLI 가 비0 으로 끝남**(토큰 만료·프로젝트 ID 오타) — `|| true` 없이 그대로 실패해야 "성공" 으로 보이지 않는다. → Task 1 테스트 `cli-fails`
5. **정상 입력** — CLI 가 정확히 `env add <이름> --environment production,preview --force --yes --token <토큰>` 로 호출되고 stdin 으로 값이 그대로(개행 추가 없이) 전달돼야 한다. → Task 1 테스트 `happy-path`

---

### Task 1: 워크플로우 확정 + 스텁 검증

**Files:**
- Modify: `.github/workflows/sync-vercel-env.yml` (초안 존재, 스펙 §3 반영본. 이 태스크는 검증하고 어긋난 곳만 고친다)
- Test(커밋 안 함): `<scratchpad>/wf-test/run.sh` — yml 의 `run:` 블록을 추출해 가짜 `vercel` 로 실행

**Interfaces:**
- Produces: 워크플로우 이름 `Sync env to Vercel`, 입력 `name`(required string), 제어 Secret 이름 `VERCEL_TOKEN`·`VERCEL_ORG_ID`·`VERCEL_PROJECT_ID`. Task 3 문서가 이 이름들을 그대로 쓴다.

- [ ] **Step 1: 정적 검사**

Run: `actionlint .github/workflows/sync-vercel-env.yml`
Expected: 출력 없음(통과). 지적이 나오면 고친다.

- [ ] **Step 2: 스텁 테스트 작성**

`<scratchpad>/wf-test/run.sh`: yml 에서 두 번째 step 의 `run: |` 블록을 추출해 `script.sh` 로 저장. `<scratchpad>/wf-test/bin/vercel` 은 받은 인자를 `args.log` 에, stdin 을 `stdin.bin` 에 기록하고 `STUB_EXIT`(기본 0)로 종료하는 셸 스크립트. 케이스 5개를 각각 `env -i PATH=<scratchpad>/wf-test/bin:/usr/bin:/bin VERCEL_TOKEN=t VERCEL_ORG_ID=o VERCEL_PROJECT_ID=p NAME=<...> VALUE=<...> bash script.sh` 로 실행하고 종료코드·로그를 단언:

| 케이스 | NAME | VALUE | STUB_EXIT | 기대 |
|---|---|---|---|---|
| `happy-path` | `YOUTUBE_API_KEY` | `abc 123` | 0 | exit 0, `args.log` == `env add YOUTUBE_API_KEY --environment production,preview --force --yes --token t`, `stdin.bin` 바이트가 정확히 `abc 123`(개행 없음) |
| `empty-value` | `YOUTUBE_API_KEY` | `` | 0 | exit ≠ 0, `args.log` 없음(CLI 미호출) |
| `bad-name` | `youtube-key` | `x` | 0 | exit ≠ 0, CLI 미호출 |
| `control-name` | `VERCEL_TOKEN` | `x` | 0 | exit ≠ 0, CLI 미호출 |
| `control-name-lower` | `vercel_token` | `x` | 0 | exit ≠ 0, CLI 미호출 (Secret 조회는 대소문자 무시 — 소문자 우회 차단) |
| `cli-fails` | `YOUTUBE_API_KEY` | `x` | 7 | exit ≠ 0 |
| `missing-control` | (VERCEL_PROJECT_ID 를 env 에서 뺌) | `x` | 0 | exit ≠ 0, CLI 미호출 |

- [ ] **Step 3: 실행해 전부 통과 확인**

Run: `bash <scratchpad>/wf-test/run.sh`
Expected: `7 passed`. 실패하면 yml 의 `run:` 블록을 고치고 재실행.

- [ ] **Step 4: 체크포인트** — 변경 파일 보고. 커밋은 사용자 지시 대기.

---

### Task 2: `.env.example` + gitignore 예외

**Files:**
- Create: `.env.example`
- Modify: `.gitignore` (34행 `.env*` 바로 다음에 `!.env.example`)

**Interfaces:**
- Produces: 로컬 개발 변수 목록. Task 3 문서 §로컬 개발이 이 파일을 가리킨다.

- [ ] **Step 1: 실패 확인** — Run: `git check-ignore -v .env.example`; Expected: `.gitignore:34:.env*	.env.example` (현재는 무시됨)

- [ ] **Step 2: `.gitignore` 34행 뒤에 `!.env.example` 추가**

- [ ] **Step 3: `.env.example` 작성** — 주석 포함 세 줄 구조:
```
# 로컬 개발용. 복사해서 .env.local 로 저장. (.env.local 은 커밋되지 않음)
# 유튜브 API 키는 각자 Google Cloud 콘솔에서 발급(무료). 운영 키는 Vercel 에만 있음.
YOUTUBE_API_KEY=
# 성복교회 채널 ID (공개 값, 코드 fallback 과 동일)
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=UClz4pOT6Kmuy8MvR3cyHPjA
```
`API_URL` 은 넣지 않는다(죽은 변수).

- [ ] **Step 4: 통과 확인** — Run: `git check-ignore -v .env.example; echo "exit=$?"; git check-ignore -v .env.local`; Expected: 첫 줄 출력 없음 + `exit=1`, 둘째 줄 `.gitignore:34:.env*	.env.local`

- [ ] **Step 5: 체크포인트** — 보고. 커밋은 사용자 지시 대기.

---

### Task 3: 절차 문서 `.md/workflow/deploy-and-env.md`

**Files:**
- Create: `.md/workflow/deploy-and-env.md`

**Interfaces:**
- Consumes: Task 1 의 워크플로우·Secret 이름, Task 2 의 `.env.example`.
- Produces: 사용자 셋업 체크리스트(스펙 §4 0~11 그대로, 체크박스), 일상 절차, 규칙. Task 4 ADR 이 이 문서를 가리킨다.

- [ ] **Step 1: 문서 작성** — 절 구성(살아있는 문서, 현재 상태만):
  1. **구조 한 장** — 스펙 §2 그림 + "정본 = GitHub Secrets, Vercel 은 복사본(덮어쓰기만, 삭제 동기화 없음)"
  2. **1회 셋업 체크리스트** — 스펙 §4 의 0~11 을 `- [ ]` 로. 0번(이전 전 동료 push 테스트)과 6번(게이트)은 **굵게**. 각 항목에 Vercel/GitHub 메뉴 경로 포함. 토큰 Scope·만료(1년 권장) 포함.
  3. **일상 절차: 변수 추가·변경** — Secrets 등록 → Actions › Sync env to Vercel › Run workflow › `name` 입력 → 실행 로그 `synced:` 확인 → Vercel Redeploy(본인) 또는 아무 커밋 push → 새 배포에서 확인. 3단계 안에 끝남을 명시.
  4. **로컬 개발** — `.env.example` 복사, 유튜브 키는 각자 발급, `vercel env pull` 안 씀.
  5. **규칙** — 레포 공개 유지 · fork PR 배포 승인 금지 · 레포 Secrets 는 Vercel 변수 + 제어용만 · 제어 Secret 이름 3개는 건드리지 않음 · 협업자 이탈 시 토큰 재발급 · Vercel 대시보드에서 환경변수 직접 편집 금지(drift)
  6. **알려진 제약** — 삭제 동기화 없음 · 환경별 같은 값(접미사 규약은 필요 시) · 첫 동기화 때 기존 3-타깃 레코드 재편 여부는 게이트에서 확인 · 유튜브 키는 브라우저 번들에 노출돼 있음(별건: `console.log` 제거, 키 분리 후속)

- [ ] **Step 2: 검증** — 문서 안의 Secret 이름 3개·워크플로우 이름·입력 이름이 `.github/workflows/sync-vercel-env.yml` 과 글자 단위로 같은지 `grep` 으로 확인. Run: `grep -c "Sync env to Vercel" .md/workflow/deploy-and-env.md`; Expected: ≥1

- [ ] **Step 3: 체크포인트** — 보고.

---

### Task 4: ADR 0011 + 인덱스 갱신

**Files:**
- Create: `.md/decisions/0011-github-org-and-env-source.md`
- Modify: `.md/README.md` (트리 2곳: `workflow/`·`decisions/`, 목록 3곳: Workflow·Specs(상태)·Decisions)
- Modify: `.md/specs/2026-11-10-github-org-env-sync-design.md` 3행 상태 필드

**Interfaces:**
- Consumes: Task 3 문서 경로.

- [ ] **Step 1: ADR 작성** — README 양식 그대로. 상태 `채택 — 셋업 검증 대기(스펙 §4 6번 게이트)`, 날짜 2026-11-10. 배경(협업자 합류·Hobby·공개 레포), 결정(조직 이전 + Secrets 정본 + 동기화 워크플로우 + Vercel 자동 배포 유지), 대안 비교(Pro 팀 / 공용 Vercel 계정 / `.env` 커밋 / Actions 전면 배포 / Secrets 전부 동기화 — 각 탈락 이유 한 줄), 결과·영향(토큰 권한 범위, 삭제 동기화 없음, 레포 공개 유지 제약, 게이트 실패 시 되돌아갈 지점).

- [ ] **Step 2: README 갱신** — 트리에 `workflow/deploy-and-env.md`·`decisions/0011-github-org-and-env-source.md` 추가, Workflow 목록·Decisions 목록에 한 줄씩, Specs 목록의 2026-11-10 항목 "**승인 대기**" → "**승인·구현 완료(2026-11-10), 셋업 검증 대기**", 같은 항목에 plan 링크 추가.

- [ ] **Step 3: 스펙 상태 갱신** — 3행을 `**상태**: 승인·산출물 구현 완료(2026-11-10) — 사용자 셋업·게이트 검증 대기. 계획: [-plan.md](2026-11-10-github-org-env-sync-plan.md)` 로.

- [ ] **Step 4: 검증** — Run: `ls .md/decisions/0008-* && grep -c "0008" .md/README.md && grep -c "deploy-and-env" .md/README.md`; Expected: 파일 존재, 각 카운트 ≥1

- [ ] **Step 5: 체크포인트** — 전체 변경 파일 목록 보고. 커밋은 사용자 지시 대기.

---

## 완료 정의

- 빌더 완료 = Task 1~4 끝 + 각 검증 통과. `git status` 에 다음이 보인다: `.github/workflows/sync-vercel-env.yml`, `.env.example`, `.gitignore`, `.md/workflow/deploy-and-env.md`, `.md/decisions/0011-github-org-and-env-source.md`, `.md/README.md`, `.md/specs/2026-11-10-*.md` 2개.
- 작업 완료 = 사용자가 `deploy-and-env.md` 체크리스트를 끝내고 스펙 §3 검증 4개를 통과한 뒤 ADR 상태를 `채택` 으로 갱신(별도 지시).
