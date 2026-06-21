/**
 * auto-code-review.sh 스모크 테스트 (Stop 훅).
 *
 * git 상태에 강하게 의존하므로 임시 git 레포(CLAUDE_PROJECT_DIR)로 격리한다.
 * 핵심: 변경 크기·세션 한정(transcript)·필요 리뷰 세트로 발동을 조절한다.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const HOOK = resolve(repoRoot, '.claude/hooks/auto-code-review.sh');

const repos: string[] = [];
function makeRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), 'autoreview-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  repos.push(dir);
  return dir;
}
afterEach(() => {
  for (const r of repos.splice(0)) rmSync(r, { recursive: true, force: true });
});

function runHook(
  payload: Record<string, unknown>,
  projectDir: string,
  journal?: string,
): { stdout: string; status: number | null } {
  const env: NodeJS.ProcessEnv = { ...process.env, CLAUDE_PROJECT_DIR: projectDir };
  if (journal) env.RETRO_JOURNAL_FILE = journal;
  const res = spawnSync('bash', [HOOK], {
    input: JSON.stringify(payload),
    encoding: 'utf-8',
    cwd: projectDir,
    env,
  });
  return { stdout: res.stdout ?? '', status: res.status };
}

function writeFileIn(repo: string, rel: string, content: string): void {
  const abs = join(repo, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
}

describe('auto-code-review: 루프 가드', () => {
  it('stop_hook_active=true 면(리뷰 재진입) 통과한다', () => {
    const repo = makeRepo();
    writeFileIn(repo, '.claude/hooks/foo.sh', 'echo hi\n');
    const res = runHook({ stop_hook_active: true }, repo);
    expect(res.stdout.trim()).toBe('');
  });
});

describe('auto-code-review: 사소한 변경은 통과', () => {
  it('하네스도 로직도 아닌 작은 변경은 조용히 통과한다', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'notes.txt', 'hello\n');
    const res = runHook({ stop_hook_active: false }, repo);
    expect(res.stdout.trim()).toBe('');
  });
});

// n 줄짜리 더미 파일 내용 (임계 초과용)
function bigContent(lines: number): string {
  return Array.from({ length: lines }, (_, i) => `line ${i}`).join('\n') + '\n';
}

// 이 세션이 editedAbs 의 파일들을 편집했다고 보이는 transcript(jsonl)를 만든다.
// 빈 배열이면 편집 0건(순수 텍스트) transcript.
function writeTranscript(repo: string, editedAbs: string[]): string {
  const path = join(repo, 'transcript.jsonl');
  const rows = editedAbs.length
    ? editedAbs.map((fp) =>
        JSON.stringify({
          type: 'assistant',
          message: {
            role: 'assistant',
            content: [{ type: 'tool_use', name: 'Edit', input: { file_path: fp } }],
          },
        }),
      )
    : [
        JSON.stringify({
          type: 'assistant',
          message: { role: 'assistant', content: [{ type: 'text', text: 'hi' }] },
        }),
      ];
  writeFileSync(path, rows.join('\n') + '\n');
  return path;
}

// 시간순 tool_use 트랜스크립트(jsonl)를 만든다. 각 이벤트는 한 assistant 줄.
//   { tool, input } 그대로 content[0].tool_use 로 직렬화한다.
function writeEvents(repo: string, events: { tool: string; input: Record<string, unknown> }[]): string {
  const path = join(repo, 'transcript.jsonl');
  const rows = events.map((e) =>
    JSON.stringify({
      type: 'assistant',
      message: { role: 'assistant', content: [{ type: 'tool_use', name: e.tool, input: e.input }] },
    }),
  );
  writeFileSync(path, rows.join('\n') + '\n');
  return path;
}

// 필요 리뷰 세트 가드: '마지막 편집 이후' 필요한 리뷰가 다 돌았으면 재촉 안 함.
//   작은 변경 → code-review 1종이면 충분. 큰 변경 → code-review + codex 둘 다 필요.
describe('auto-code-review: required-set 이미-충족 가드', () => {
  it('작은 로직 변경: 편집 뒤 /code-review 면 통과(codex 불필요) [중복 회귀 잠금]', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'src/x/util.ts', 'export const x = 1\n'); // 로직·작음 → is_big=0
    const transcript_path = writeEvents(repo, [
      { tool: 'Edit', input: { file_path: join(repo, 'src/x/util.ts') } },
      { tool: 'Skill', input: { skill: 'code-review', args: 'HEAD' } },
    ]);
    const res = runHook({ stop_hook_active: false, transcript_path }, repo);
    expect(res.stdout.trim()).toBe('');
  });

  it('작은 변경: 리뷰 후 다시 편집하면 발동한다 [과소-억제 회귀 잠금]', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'src/x/util.ts', 'export const x = 1\n');
    const transcript_path = writeEvents(repo, [
      { tool: 'Skill', input: { skill: 'code-review', args: 'HEAD' } },
      { tool: 'Edit', input: { file_path: join(repo, 'src/x/util.ts') } }, // 리뷰 후 편집
    ]);
    const res = runHook({ stop_hook_active: false, transcript_path }, repo);
    const out = JSON.parse(res.stdout.trim()) as { decision?: string };
    expect(out.decision).toBe('block');
  });

  it('큰 변경: /code-review 만으로는 통과 못 함 — codex 누락 시 재발동 [핵심 회귀 잠금]', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'scripts/mine.sh', bigContent(120)); // is_big=1
    const transcript_path = writeEvents(repo, [
      { tool: 'Edit', input: { file_path: join(repo, 'scripts/mine.sh') } },
      { tool: 'Skill', input: { skill: 'code-review', args: 'HEAD' } }, // codex 안 돌림
    ]);
    const res = runHook({ stop_hook_active: false, transcript_path }, repo);
    const out = JSON.parse(res.stdout.trim()) as { decision?: string; reason?: string };
    expect(out.decision).toBe('block');
    expect(out.reason).toContain('/codex');
  });

  it('큰 변경: /code-review + /codex 둘 다면 통과한다', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'scripts/mine.sh', bigContent(120));
    const transcript_path = writeEvents(repo, [
      { tool: 'Edit', input: { file_path: join(repo, 'scripts/mine.sh') } },
      { tool: 'Skill', input: { skill: 'code-review', args: 'HEAD' } },
      { tool: 'Skill', input: { skill: 'codex', args: 'review' } },
    ]);
    const res = runHook({ stop_hook_active: false, transcript_path }, repo);
    expect(res.stdout.trim()).toBe('');
  });

  it('큰 변경: code-reviewer 서브에이전트 + /codex 면 통과한다', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'scripts/mine.sh', bigContent(120));
    const transcript_path = writeEvents(repo, [
      { tool: 'Edit', input: { file_path: join(repo, 'scripts/mine.sh') } },
      { tool: 'Agent', input: { subagent_type: 'code-reviewer', description: 'review' } },
      { tool: 'Skill', input: { skill: 'codex', args: 'review' } },
    ]);
    const res = runHook({ stop_hook_active: false, transcript_path }, repo);
    expect(res.stdout.trim()).toBe('');
  });
});

// 리뷰 무게가 변경 크기에 비례하는지: 작으면 단일 /code-review, 크면 +codex.
describe('auto-code-review: size-scaled 리뷰 무게', () => {
  it('작은 로직 변경은 /code-review 단일·codex 없이 발동한다', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'src/x/util.ts', 'export const x = 1\n'); // 로직·작음
    const transcript_path = writeEvents(repo, [
      { tool: 'Edit', input: { file_path: join(repo, 'src/x/util.ts') } },
    ]);
    const res = runHook({ stop_hook_active: false, transcript_path }, repo);
    const out = JSON.parse(res.stdout.trim()) as { decision?: string; reason?: string };
    expect(out.decision).toBe('block');
    expect(out.reason).toContain('/code-review medium');
    expect(out.reason).not.toContain('/codex');
  });

  it('큰 변경은 /code-review high + /codex 로 발동한다', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'scripts/mine.sh', bigContent(120));
    const transcript_path = writeEvents(repo, [
      { tool: 'Edit', input: { file_path: join(repo, 'scripts/mine.sh') } },
    ]);
    const res = runHook({ stop_hook_active: false, transcript_path }, repo);
    const out = JSON.parse(res.stdout.trim()) as { decision?: string; reason?: string };
    expect(out.decision).toBe('block');
    expect(out.reason).toContain('/code-review high');
    expect(out.reason).toContain('/codex');
  });
});

// 핵심 회귀: 발동 규모를 '워킹트리 전체'가 아니라 '이번 세션이 편집한 파일'로 한정한다.
// (다른 세션의 미커밋 변경이 떠 있어도 내가 안 건드렸으면 발동하지 않아야 한다.)
describe('auto-code-review: 세션-한정(transcript) 스코프', () => {
  it('편집 0건 세션은 워킹트리에 큰 변경이 있어도 통과한다 [오발동 회귀 잠금]', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'scripts/ambient.sh', bigContent(120)); // 임계 초과 변경
    const transcript_path = writeTranscript(repo, []); // 이 세션은 아무것도 편집 안 함
    const res = runHook({ stop_hook_active: false, transcript_path }, repo);
    expect(res.stdout.trim()).toBe('');
  });

  it('내가 안 건드린 다른 세션의 미커밋 변경은 발동하지 않는다', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'scripts/ambient.sh', bigContent(120)); // 남이 만든 큰 변경
    const transcript_path = writeTranscript(repo, [join(repo, 'src/mine.ts')]); // 나는 무관한 파일만 편집
    const res = runHook({ stop_hook_active: false, transcript_path }, repo);
    expect(res.stdout.trim()).toBe('');
  });

  it('내 세션이 실제 편집한 큰 파일은 발동한다', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'scripts/mine.sh', bigContent(120));
    const transcript_path = writeTranscript(repo, [join(repo, 'scripts/mine.sh')]);
    const res = runHook({ stop_hook_active: false, transcript_path }, repo);
    const out = JSON.parse(res.stdout.trim()) as { decision?: string };
    expect(out.decision).toBe('block');
  });

  it('내 변경과 남의 ambient 변경이 공존해도 내 것만 발동·집계한다 [혼합 회귀 잠금]', () => {
    const repo = makeRepo();
    writeFileIn(repo, 'scripts/ambient.sh', bigContent(120)); // 남이 만든 변경(집계 제외돼야)
    writeFileIn(repo, 'scripts/mine.sh', bigContent(95)); // 내 변경(이것만 집계)
    const transcript_path = writeTranscript(repo, [join(repo, 'scripts/mine.sh')]);
    const res = runHook({ stop_hook_active: false, transcript_path }, repo);
    const out = JSON.parse(res.stdout.trim()) as { decision?: string; reason?: string };
    expect(out.decision).toBe('block');
    // 규모는 내 것(95줄/1파일)만 — ambient 합산(215줄)이 아니어야 한다
    expect(out.reason).toContain('95줄 / 1파일');
    expect(out.reason).not.toContain('215');
  });
});
