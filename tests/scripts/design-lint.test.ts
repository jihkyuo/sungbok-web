/**
 * scripts/design-lint.sh 회귀 테스트 — 임시 git 레포에서 --diff 모드를 돌린다.
 * 설계 §5.8: 색 hex 에 더해 임의 글자 크기·그림자·둥글기 하드코딩을 차단한다.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const SCRIPT = resolve(here, '..', '..', 'scripts/design-lint.sh');

const repos: string[] = [];
afterEach(() => {
  for (const r of repos.splice(0)) rmSync(r, { recursive: true, force: true });
});

function lintDiff(files: Record<string, string>, baseline?: string) {
  const dir = mkdtempSync(join(tmpdir(), 'designlint-'));
  repos.push(dir);
  execFileSync('git', ['init', '-q'], { cwd: dir });
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), content);
  }
  if (baseline !== undefined) writeFileSync(join(dir, '.design-lint-baseline'), baseline);
  execFileSync('git', ['add', '-A'], { cwd: dir });
  const res = spawnSync('bash', [SCRIPT, '--diff'], {
    encoding: 'utf-8',
    cwd: dir,
    env: { ...process.env, CLAUDE_PROJECT_DIR: dir },
  });
  return { status: res.status, out: `${res.stdout}${res.stderr}` };
}

const tsx = (cls: string, extra = '') => `export const A = () => <p className="${cls}">x</p>;${extra}\n`;

describe('design-lint --diff', () => {
  it('blocks an arbitrary font size', () => {
    const r = lintDiff({ 'src/x/A.tsx': tsx('text-[11px]') });
    expect(r.status).toBe(1);
    expect(r.out).toContain('text-[11px]');
  });
  it('allows it with a design-lint-ignore comment on the same line', () => {
    const r = lintDiff({ 'src/x/A.tsx': tsx('text-[11px]', ' /* design-lint-ignore: 연출 고유 크기 */') });
    expect(r.status).toBe(0);
  });
  it('blocks an arbitrary shadow', () => {
    expect(lintDiff({ 'src/x/A.tsx': tsx('shadow-[0_2px_4px_rgba(0,0,0,.1)]') }).status).toBe(1);
  });
  it('blocks an arbitrary radius', () => {
    expect(lintDiff({ 'src/x/A.tsx': tsx('rounded-[28px]') }).status).toBe(1);
  });
  it('lets a baseline entry through', () => {
    const r = lintDiff({ 'src/x/A.tsx': tsx('text-[11px]') }, 'src/x/A.tsx\ttext-[11px]\n');
    expect(r.status).toBe(0);
  });
  it('still blocks hex colors (existing rule)', () => {
    expect(lintDiff({ 'src/x/A.tsx': tsx('bg-[#ff0000]') }).status).toBe(1);
  });
  it('ignores preview code', () => {
    expect(lintDiff({ 'src/app/nextgen-preview/x.tsx': tsx('text-[11px]') }).status).toBe(0);
  });
  it('allows design tokens', () => {
    expect(lintDiff({ 'src/x/A.tsx': tsx('text-caption shadow-md rounded-2xl') }).status).toBe(0);
  });
});
