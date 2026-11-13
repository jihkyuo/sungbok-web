#!/usr/bin/env node
// 사진을 화면 폭별 크기로 미리 만들어 레포에 둔다 — 접속 시점에 서버가 크기를 줄이는 일(/_next/image)을 없앤다.
//   pnpm images:variants           # 없는 크기만 만들고, 원본이 사라진 크기 파일은 지운다. 목록 파일도 다시 쓴다
//   pnpm images:variants --force   # 전부 다시 만든다(sharp 버전·압축 설정을 바꿨을 때. 화질·원본 변경은 이름이 바뀌어 저절로 다시 만든다)
//   pnpm images:variants --check   # 만들지 않고, 빠지거나 남는 파일이 있으면 실패(exit 1)
// 결과: src/assets/sized/<원본 경로>.<원본 해시>.w<폭>.webp + src/assets/photoVariants.generated.ts(원본 → 크기 목록).
// 화질은 기본 85, 교역자·부서 사진(images/staff·main/department·next-generation)은 90(QUALITY_RULES).
// 파일 이름에 원본 내용의 해시가 들어간다 — 같은 이름으로 사진을 바꾸면 옛 크기 파일은 지워지고 새로 만들어진다.
// 화면에서는 <Photo>(src/shared/components/features/Photo)가 이 목록으로 srcset 을 만든다.
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = 'src/assets';
const OUT_DIR = path.join(ROOT, 'sized');
const MANIFEST = path.join(ROOT, 'photoVariants.generated.ts');
// next/image 가 srcset 에 쓰는 폭 가운데 실제로 골라지는 구간. 이보다 큰 요청은 원본(최대 1920)을 준다.
const WIDTHS = [128, 256, 384, 640, 828, 1080, 1200];
// 원본 폭에 거의 닿는 크기는 만들지 않는다 — 용량 차이가 없어 파일만 늘어난다.
const MAX_RATIO = 0.85;
const QUALITY = 85;
// 폴더별 화질 — 교역자·부서 사진은 더 높게(예전 quality={90} 자리). 위에서부터 처음 맞는 규칙을 쓴다.
const QUALITY_RULES = [
  [/^images\/(staff|main\/department|next-generation)\//, 90],
  [/^images\/main\/pastor(-emeritus)?\.webp$/, 90], // 섬기는 이들 맨 위 칸(담임·원로목사)
];

const args = process.argv.slice(2);
const force = args.includes('--force');
const check = args.includes('--check');

const walk = async dir =>
  (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map(e =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
      )
    )
  ).flat();

const posix = p => p.split(path.sep).join('/');
const qualityFor = rel => QUALITY_RULES.find(([re]) => re.test(posix(rel)))?.[1] ?? QUALITY;

const sources = (await walk(ROOT))
  // JPG 는 대상이 아니다 — 먼저 `pnpm images:webp` 로 WebP 로 바꾼다(회전 보정도 거기서 한다).
  .filter(f => !f.startsWith(OUT_DIR + path.sep) && /\.(webp|png)$/i.test(f))
  .sort();

// 원본마다 만들 크기 계획
const plan = [];
for (const file of sources) {
  const { width } = await sharp(file).metadata();
  const rel = path.relative(ROOT, file);
  const base = rel.replace(/\.[^.]+$/, '');
  const quality = qualityFor(rel);
  // 화질도 해시에 넣는다 — 화질 규칙을 바꾸면 이름이 바뀌어 다시 만들어진다.
  const hash = createHash('sha256')
    .update(await readFile(file))
    .update(`q${quality}`)
    .digest('hex')
    .slice(0, 8);
  const variants = WIDTHS.filter(w => w <= width * MAX_RATIO).map(w => ({
    width: w,
    name: `w${w}`,
    file: path.join(OUT_DIR, `${base}.${hash}.w${w}.webp`),
  }));
  // PNG 는 원본 크기의 WebP 도 만들어 맨 위 칸(Infinity)에 둔다 — 큰 폭 요청이 무거운 PNG 원본으로 떨어지지 않게.
  if (!/\.webp$/i.test(file) && width >= WIDTHS[0]) {
    variants.push({
      width: Infinity,
      name: 'full',
      file: path.join(OUT_DIR, `${base}.${hash}.full.webp`),
    });
  }
  if (variants.length) plan.push({ file, rel, variants, quality });
}

const expected = new Set(plan.flatMap(p => p.variants.map(v => v.file)));
const existing = existsSync(OUT_DIR) ? await walk(OUT_DIR) : [];
// 우리가 만든 .webp 만 정리 대상이다(.DS_Store 같은 다른 파일은 건드리지 않는다).
const stale = existing.filter(f => /\.webp$/i.test(f) && !expected.has(f));
const missing = [...expected].filter(f => !existsSync(f));

// 목록 파일 — 원본과 크기 파일을 모두 정적 import 해 빌드가 해시 붙은 주소(1년 캐시)를 만들게 한다.
const lines = [
  '// 자동 생성 파일 — 직접 고치지 않는다. 사진을 넣거나 바꾼 뒤 `pnpm images:variants` 로 다시 만든다.',
  "import type { VariantLadder } from '@/shared/lib/photoVariant';",
];
const entries = [];
plan.forEach((p, i) => {
  lines.push(`import o${i} from './${posix(p.rel)}';`);
  p.variants.forEach(v => {
    lines.push(`import o${i}${v.name} from './${posix(path.relative(ROOT, v.file))}';`);
  });
  const ladder = p.variants.map(v => `[${v.width}, o${i}${v.name}.src]`).join(', ');
  entries.push(`  [o${i}.src]: [${ladder}],`);
});
lines.push(
  '',
  '/** 원본 사진 주소 → 미리 만든 크기 목록(가로 오름차순). */',
  'export const PHOTO_VARIANTS: Record<string, VariantLadder> = {',
  ...entries,
  '};',
  ''
);
const manifest = lines.join('\n');
const manifestCurrent = existsSync(MANIFEST) && (await readFile(MANIFEST, 'utf8')) === manifest;

if (check) {
  const problems = [
    ...missing.map(f => `없음: ${f}`),
    ...stale.map(f => `원본 없는 크기 파일: ${f}`),
    ...(manifestCurrent ? [] : [`목록 파일이 최신이 아님: ${MANIFEST}`]),
  ];
  if (problems.length) {
    console.error(problems.join('\n'));
    console.error('\n`pnpm images:variants` 를 실행해 맞춘다.');
    process.exit(1);
  }
  console.log(`사진 ${plan.length}장 · 크기 파일 ${expected.size}개 — 모두 최신`);
  process.exit(0);
}

for (const f of stale) await rm(f);

let made = 0;
let bytes = 0;
for (const p of plan) {
  for (const v of p.variants) {
    if (!force && existsSync(v.file)) continue;
    await mkdir(path.dirname(v.file), { recursive: true });
    const image = sharp(p.file);
    if (Number.isFinite(v.width)) image.resize({ width: v.width });
    // 임시 파일에 쓰고 이름을 바꾼다 — 도중에 끊겨도 잘린 파일이 «이미 있음»으로 남지 않는다.
    const tmp = `${v.file}.tmp`;
    const info = await image.webp({ quality: p.quality, effort: 6 }).toFile(tmp);
    await rename(tmp, v.file);
    made += 1;
    bytes += info.size;
  }
}
await writeFile(MANIFEST, manifest);

console.log(
  `사진 ${plan.length}장 · 크기 파일 ${expected.size}개(새로 만든 것 ${made}개, ${(bytes / 1024).toFixed(0)}KB) · 지운 것 ${stale.length}개`
);
