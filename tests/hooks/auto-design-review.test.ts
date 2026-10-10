/**
 * auto-design-review.sh 스모크/회귀 테스트 (Stop 훅).
 *
 * git 상태에 의존하므로 임시 git 레포(CLAUDE_PROJECT_DIR)로 격리한다.
 * 핵심 회귀: 발동 규모를 'UI(디자인) 파일'만으로 집계한다 — 작은 UI 변경 +
 * 큰 비-UI churn 에 오발동하지 않아야 한다(codex 교차검증으로 고친 P2-4).
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const HOOK = resolve(repoRoot, '.claude/hooks/auto-design-review.sh');

const repos: string[] = [];
function makeRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), 'designreview-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  // 실제 프로젝트엔 .claude/ 가 항상 존재(훅이 거기 산다). 상태파일
  // (.claude/.last-design-review-hash) 기록 경로가 되도록 미리 만든다.
  mkdirSync(join(dir, '.claude'), { recursive: true });
  repos.push(dir);
  return dir;
}
afterEach(() => {
  for (const r of repos.splice(0)) rmSync(r, { recursive: true, force: true });
});

function runHook(
  payload: Record<string, unknown>,
  projectDir: string,
): { stdout: string; status: number | null } {
  const res = spawnSync('bash', [HOOK], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
    cwd: projectDir,
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
  });
  return { stdout: res.stdout ?? '', status: res.status };
}

function writeFileIn(repo: string, rel: string, content: string): void {
  const abs = join(repo, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
}

// n 줄짜리 더미 내용 (임계: 80줄 / 5파일)
function bigContent(lines: number): string {
  return Array.from({ length: lines }, (_, i) => `line ${i}`).join('\n') + '\n';
}

describe('auto-design-review: 루프 가드', () => {
  it('stop_hook_active=true 면(리뷰 재진입) 통과한다', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'src/shared/components/Foo/index.tsx', bigContent(90));
    const res = runHook({ stop_hook_active: true }, repo);
    expect(res.stdout.trim()).toBe('');
  });

  it('재진입으로 해시가 기록되면 같은 변경은 다시 발동하지 않는다 [dedup]', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'src/shared/components/Foo/index.tsx', bigContent(90));
    runHook({ stop_hook_active: true }, repo); // 상태파일에 현재 해시 기록
    const res = runHook({ stop_hook_active: false }, repo); // 같은 트리 → dedup 통과
    expect(res.stdout.trim()).toBe('');
  });
});

describe('auto-design-review: UI 변경 발동', () => {
  it('큰 UI 컴포넌트(components/index.tsx) 변경은 /design-qa 를 발동시킨다', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'src/shared/components/Foo/index.tsx', bigContent(90));
    const res = runHook({ stop_hook_active: false }, repo);
    const out = JSON.parse(res.stdout.trim()) as { decision?: string; reason?: string };
    expect(out.decision).toBe('block');
    expect(out.reason).toContain('/design-qa');
    expect(out.reason).toContain('UI 변경 규모');
  });

  it('큰 .css 변경도 디자인 표면으로 발동시킨다', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'src/styles/theme.css', bigContent(90));
    const res = runHook({ stop_hook_active: false }, repo);
    const out = JSON.parse(res.stdout.trim()) as { decision?: string };
    expect(out.decision).toBe('block');
  });
});

describe('auto-design-review: 사소/비-UI 변경은 통과', () => {
  it('작은 UI 변경은 조용히 통과한다(임계 미만)', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'src/shared/components/Foo/index.tsx', bigContent(10));
    const res = runHook({ stop_hook_active: false }, repo);
    expect(res.stdout.trim()).toBe('');
  });

  it('비-UI 로직(.ts)만 크게 바뀌면 통과한다(디자인 표면 아님)', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'src/shared/lib/util.ts', bigContent(120));
    const res = runHook({ stop_hook_active: false }, repo);
    expect(res.stdout.trim()).toBe('');
  });
});

describe('auto-design-review: design-only 집계 [P2-4 회귀 잠금]', () => {
  it('작은 UI + 큰 비-UI churn 은 통과한다(비-UI 미집계)', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'src/shared/lib/big.ts', bigContent(120)); // 비-UI(집계 제외)
    writeFileIn(repo, 'src/shared/components/Foo/index.tsx', bigContent(10)); // UI 10줄
    const res = runHook({ stop_hook_active: false }, repo);
    expect(res.stdout.trim()).toBe('');
  });

  it('큰 UI + 큰 비-UI 가 공존해도 규모는 UI 만 집계한다', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'scripts/big.sh', bigContent(120)); // 비-UI(집계 제외돼야)
    writeFileIn(repo, 'src/shared/components/Foo/index.tsx', bigContent(95)); // UI 95줄
    const res = runHook({ stop_hook_active: false }, repo);
    const out = JSON.parse(res.stdout.trim()) as { decision?: string; reason?: string };
    expect(out.decision).toBe('block');
    expect(out.reason).toContain('95줄 / 1파일'); // UI 만 — 215 합산이 아니어야
    expect(out.reason).not.toContain('215');
  });
});

describe('auto-design-review: fail-open', () => {
  it('git 저장소가 아니면 통과한다', () => {
    const dir = mkdtempSync(join(tmpdir(), 'designreview-nogit-'));
    repos.push(dir);
    writeFileIn(dir, 'src/shared/components/Foo/index.tsx', bigContent(90));
    const res = runHook({ stop_hook_active: false }, dir);
    expect(res.stdout.trim()).toBe('');
  });
});
