/**
 * globals.css 토큰 계층 회귀 테스트 — 설계 .md/specs/2026-11-05-design-system-design.md §5.1~5.3
 * 원시 토큰(B1)은 값이 고정이고, shadcn 의미 토큰은 원시 토큰을 가리켜야 한다.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '@/shared/lib/contrast';

const css = readFileSync(resolve(__dirname, '../../src/app/globals.css'), 'utf-8');
const rootBlock = css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')));
const varValue = (block: string, name: string) =>
  block.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim();

describe('raw B1 tokens are unchanged', () => {
  it.each([
    ['--color-b1-bg', '#f6fafe'],
    ['--color-b1-surface', '#ffffff'],
    ['--color-b1-text', '#0f172a'],
    ['--color-b1-sub', '#3f526b'],
    ['--color-b1-muted', '#8fa0b8'],
    ['--color-b1-border', '#dce5f0'],
    ['--color-b1-accent', '#2563eb'],
    ['--color-b1-accent2', '#5b7fe0'],
    ['--color-b1-accent-soft', '#e8f0fe'],
    ['--color-b1-glow', '#d2ebff'],
    ['--color-b1-sunday', '#dc2626'],
    ['--color-b1-placeholder', '#ecf0f7'],
    ['--color-b1-placeholder-tone', '#c2cddc'],
  ])('%s = %s', (name, value) => {
    expect(varValue(css, name)).toBe(value);
  });
});

describe('shadcn semantic tokens point at B1', () => {
  it.each([
    ['--primary', 'var(--color-b1-accent)'],
    ['--ring', 'var(--color-b1-accent)'],
    ['--border', 'var(--color-b1-border)'],
    ['--input', 'var(--color-b1-border)'],
    ['--destructive', 'var(--color-b1-danger)'],
    ['--muted-foreground', 'var(--color-b1-sub)'],
    ['--background', 'var(--color-b1-bg)'],
    ['--foreground', 'var(--color-b1-text)'],
  ])('%s → %s', (name, value) => {
    expect(varValue(rootBlock, name)).toBe(value);
  });

  it('has no dark-mode block and no leftover oklch defaults', () => {
    expect(css).not.toContain('.dark {');
    expect(css).not.toContain('oklch(');
  });
});

describe('status colors', () => {
  const names = ['success', 'warning', 'danger'] as const;
  it.each(names)('%s has a text color and a soft background', name => {
    expect(varValue(css, `--color-b1-${name}`)).toMatch(/^#[0-9a-f]{6}$/i);
    expect(varValue(css, `--color-b1-${name}-soft`)).toMatch(/^#[0-9a-f]{6}$/i);
  });
  it.each(names)('%s text reaches 4.5:1 on white', name => {
    const value = varValue(css, `--color-b1-${name}`) ?? '#ffffff';
    expect(contrastRatio(value, '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });
});

describe('type, shadow and motion scales (spec §5.2–5.3)', () => {
  it.each([
    ['--text-display', 'clamp(36px, 7vw, 54px)'],
    ['--text-h1', 'clamp(30px, 5vw, 40px)'],
    ['--text-h2', 'clamp(24px, 4vw, 36px)'],
    ['--text-h3', '20px'],
    ['--text-title', '17px'],
    ['--text-body', '16px'],
    ['--text-body-sm', '15px'],
    ['--text-label', '14px'],
    ['--text-caption', '13px'],
    ['--text-eyebrow', '12px'],
  ])('%s = %s', (name, value) => {
    expect(varValue(css, name)).toBe(value);
  });

  it.each(['--shadow-sm', '--shadow-md', '--shadow-lg'])('%s is defined', name => {
    expect(varValue(css, name)).toBeTruthy();
  });

  it.each([
    ['--duration-fast', '150ms'],
    ['--duration-base', '250ms'],
    ['--duration-slow', '400ms'],
    ['--ease-standard', 'cubic-bezier(0.16, 1, 0.3, 1)'],
  ])('%s = %s', (name, value) => {
    expect(varValue(css, name)).toBe(value);
  });
});
