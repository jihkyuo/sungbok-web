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
  reviewMax?: string,
): { stdout: string; status: number | null } {
  const env: NodeJS.ProcessEnv = { ...process.env, CLAUDE_PROJECT_DIR: projectDir };
  if (journal) env.RETRO_JOURNAL_FILE = journal;
  // 리뷰 횟수 상한은 테스트가 정한 값만 — 실행하는 컴퓨터의 환경변수에 흔들리지 않게
  delete env.AUTO_REVIEW_MAX;
  if (reviewMax !== undefined) env.AUTO_REVIEW_MAX = reviewMax;
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

// 리뷰 횟수 상한(review-cap.sh): 마지막 커밋 뒤로 리뷰를 상한만큼 돌렸으면 더 요구하지 않는다.
//   상한은 환경변수 AUTO_REVIEW_MAX 또는 .claude/review-max.local(컴퓨터마다 다르게)로 둔다.
describe('auto-code-review: 리뷰 횟수 상한', () => {
  const big = (repo: string) => writeFileIn(repo, 'src/x/util.ts', bigContent(120)); // 로직·큼
  const edit = (repo: string) => ({ tool: 'Edit', input: { file_path: join(repo, 'src/x/util.ts') } });
  const codeReview = { tool: 'Agent', input: { subagent_type: 'code-reviewer' } };
  const designQa = { tool: 'Skill', input: { skill: 'design-qa' } };

  it('상한 2: 리뷰를 2번 돌린 뒤에는 고쳐서 다시 편집해도 발동하지 않는다', () => {
    const repo = makeRepo();
    big(repo);
    const transcript_path = writeEvents(repo, [edit(repo), codeReview, designQa, edit(repo)]);
    // 상한이 없으면 발동한다(편집 뒤 리뷰가 없다)
    expect(runHook({ stop_hook_active: false, transcript_path }, repo).stdout).toContain(
      '"decision":"block"',
    );
    expect(
      runHook({ stop_hook_active: false, transcript_path }, repo, undefined, '2').stdout.trim(),
    ).toBe('');
  });

  it('상한 2: 아직 1번뿐이면 발동하고, 큰 변경에도 /code-review 하나만 요구한다(codex 생략)', () => {
    const repo = makeRepo();
    big(repo);
    const transcript_path = writeEvents(repo, [edit(repo), designQa, edit(repo)]);
    const out = runHook({ stop_hook_active: false, transcript_path }, repo, undefined, '2').stdout;
    expect(out).toContain('"decision":"block"');
    expect(out).toContain('/code-review high');
    expect(out).not.toContain('/codex');
    expect(out).toContain('상한이 2번');
  });

  it('상한이 있으면 큰 변경도 편집 뒤 /code-review 하나면 충족이다', () => {
    const repo = makeRepo();
    big(repo);
    const transcript_path = writeEvents(repo, [edit(repo), codeReview]);
    expect(
      runHook({ stop_hook_active: false, transcript_path }, repo, undefined, '3').stdout.trim(),
    ).toBe('');
  });

  it('마지막 커밋보다 먼저 돌린 리뷰는 세지 않는다 — 다음 작업은 다시 상한까지 돌 수 있다', () => {
    const repo = makeRepo();
    execFileSync(
      'git',
      ['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'base'],
      { cwd: repo },
    );
    big(repo);
    // 트랜스크립트 줄의 시각으로 가린다 — 커밋보다 앞선 리뷰 2번, 커밋 뒤의 편집
    const row = (e: { tool: string; input: Record<string, unknown> }, timestamp: string) =>
      JSON.stringify({
        type: 'assistant',
        timestamp,
        message: { role: 'assistant', content: [{ type: 'tool_use', name: e.tool, input: e.input }] },
      });
    const before = '2000-01-01T00:00:00.000Z';
    const after = '2999-01-01T00:00:00.000Z';
    const transcript_path = join(repo, 'transcript.jsonl');
    writeFileSync(
      transcript_path,
      [row(codeReview, before), row(designQa, before), row(edit(repo), after)].join('\n') + '\n',
    );
    expect(
      runHook({ stop_hook_active: false, transcript_path }, repo, undefined, '2').stdout,
    ).toContain('"decision":"block"');

    // 커밋 뒤에 돌린 리뷰 2번이면 상한에 걸린다
    writeFileSync(
      transcript_path,
      [row(codeReview, after), row(designQa, after), row(edit(repo), after)].join('\n') + '\n',
    );
    expect(
      runHook({ stop_hook_active: false, transcript_path }, repo, undefined, '2').stdout.trim(),
    ).toBe('');
  });

  it('명령 글자에 «git commit» 이 들어 있을 뿐인 셸 명령은 리뷰 횟수를 되돌리지 않는다', () => {
    const repo = makeRepo();
    big(repo);
    const transcript_path = writeEvents(repo, [
      edit(repo),
      codeReview,
      designQa,
      { tool: 'Bash', input: { command: 'cat > t.ts <<EOF\ngit commit -m "x"\nEOF' } },
      edit(repo),
    ]);
    expect(
      runHook({ stop_hook_active: false, transcript_path }, repo, undefined, '2').stdout.trim(),
    ).toBe('');
  });

  it('셸에서 돌린 codex 도 리뷰 한 번으로 센다', () => {
    const repo = makeRepo();
    big(repo);
    const transcript_path = writeEvents(repo, [
      edit(repo),
      codeReview,
      { tool: 'Bash', input: { command: 'cd repo; codex exec --sandbox read-only "review"' } },
      edit(repo),
    ]);
    expect(
      runHook({ stop_hook_active: false, transcript_path }, repo, undefined, '2').stdout.trim(),
    ).toBe('');
  });

  it('상한을 파일(.claude/review-max.local)에 둘 수 있다 — 숫자가 아니면 상한 없음', () => {
    const repo = makeRepo();
    big(repo);
    const transcript_path = writeEvents(repo, [edit(repo), codeReview, designQa, edit(repo)]);
    writeFileIn(repo, '.claude/review-max.local', '2\n');
    expect(runHook({ stop_hook_active: false, transcript_path }, repo).stdout.trim()).toBe('');
    writeFileIn(repo, '.claude/review-max.local', 'many\n');
    expect(runHook({ stop_hook_active: false, transcript_path }, repo).stdout).toContain(
      '"decision":"block"',
    );
  });
});
