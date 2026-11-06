# sungbok-code-review — 코드 리뷰 플러그인 마켓플레이스

성복교회 웹 프로젝트용 코드 리뷰 자동화 플러그인 묶음(로컬 마켓플레이스).
세 플러그인은 독립적으로 설치·사용할 수 있고, 같은 `diff-review` 방법론을 공유한다.

## 구성

| 플러그인 | 종류 | 무엇을 하나 |
|----------|------|-------------|
| `sungbok-review-skill` | 스킬 | `diff-review` — 변경분을 정확성 버그 + 재사용/단순화 + 프로젝트 컨벤션 관점에서 리뷰. 커밋·PR 전 자가검증용. |
| `sungbok-review-agent` | 서브에이전트 | `code-reviewer` — 위 방법론을 따르는 **읽기 전용** 리뷰 에이전트. 메인 작업과 분리해 리뷰를 위임할 때 사용. |
| `sungbok-precommit` | 훅 | `git commit` 직전 staged diff를 헤드리스 `claude -p` 로 리뷰해 **must-fix 발견 시 커밋을 차단**하는 PreToolUse 훅. |

## 설치

```bash
# 1) 로컬 마켓플레이스 등록 (저장소 루트에서)
/plugin marketplace add ./claude-plugins

# 2) 원하는 플러그인 설치
/plugin install sungbok-review-skill@sungbok-code-review
/plugin install sungbok-review-agent@sungbok-code-review
/plugin install sungbok-precommit@sungbok-code-review
```

설치 후:
- 스킬: `/sungbok-review-skill:diff-review` 로 호출(또는 모델이 자동 선택).
- 에이전트: `code-reviewer` 서브에이전트로 위임(Task/Agent).
- 훅: 설치 즉시 활성화 — 이후 `git commit` 시 자동으로 리뷰 게이트가 동작.

## 프리커밋 훅 동작 (sungbok-precommit)

`git commit` 명령을 가로채 다음 순서로 동작한다:

1. **git commit 이 아니면 즉시 통과** (모든 Bash 호출에 붙지만 비-commit은 저렴하게 빠짐).
2. staged diff(없으면 `git diff HEAD`)를 수집.
3. 재귀 가드(`SUNGBOK_PRECOMMIT_REVIEW=1`)를 켠 채 nested `claude -p` 로 diff를 리뷰.
4. 리뷰 마지막 줄의 판정으로 결정:
   - `VERDICT: BLOCK` → `permissionDecision: "deny"` + 리뷰 전문을 Claude에 전달해 **커밋 차단**.
   - `VERDICT: PASS` → 통과.

### fail-open 원칙
환경/도구 문제(`claude`·`jq` 부재, diff 없음, 리뷰 실행 실패, 판정 토큰 누락)로는
**커밋을 막지 않는다.** 오직 명시적 `BLOCK` 판정일 때만 차단한다.

### 주의
- 커밋마다 nested `claude -p` 가 한 번 돌아 **수십 초가 걸리고 토큰을 소모**한다.
- 리뷰는 제공된 diff 만으로 판정한다(추가 파일 읽기 없이). 깊은 맥락 리뷰가 필요하면
  `code-reviewer` 에이전트나 `diff-review` 스킬을 직접 쓰는 것이 낫다.
- 재귀 가드 환경변수 덕분에 리뷰용 nested 세션 안에서는 이 훅이 다시 돌지 않는다.

## 기존 프로젝트 설정과의 관계
이 플러그인들은 저장소의 `.claude/skills/diff-review`, `.claude/agents/code-reviewer.md`,
`.claude/hooks/pre-commit-checks.sh`(lint·typecheck 게이트)와 **별개**다. 플러그인은
배포·공유 가능한 패키지 형태이며, 프리커밋 훅은 정적 검사 대신 **claude 리뷰**를 돌린다는
점이 다르다. 둘을 함께 쓰면 정적 검사 + 리뷰 게이트가 모두 걸린다.
