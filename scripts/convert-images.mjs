#!/usr/bin/env node
// 사진(JPG/JPEG)을 WebP 로 한 번 변환해 레포에 둔다 — 런타임/빌드 때 다시 변환하지 않는다.
//   pnpm images:webp                 # src/assets 아래 모든 .jpg/.jpeg → 같은 자리 .webp (원본 유지)
//   pnpm images:webp --replace       # 변환 후 원본 삭제(import 경로는 직접 .webp 로 바꾼다)
//   pnpm images:webp path/a.jpg ...  # 지정 파일만
// 변환한 뒤 `pnpm images:variants` 로 화면 폭별 크기 파일도 만든다(scripts/photo-variants.mjs).
// 기준: 긴 변이 아니라 "가로" 최대 1920px(풀블리드 기준), 품질 82. WebP 는 iOS 14·Safari 14(2020) 이후 전부 지원.
import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const MAX_WIDTH = 1920;
const QUALITY = 82;

const args = process.argv.slice(2);
const replace = args.includes('--replace');
const explicit = args.filter(a => !a.startsWith('--'));

const walk = async dir =>
  (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map(e =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
      )
    )
  ).flat();

const files = (explicit.length ? explicit : await walk('src/assets')).filter(f =>
  /\.jpe?g$/i.test(f)
);

let before = 0;
let after = 0;
for (const file of files) {
  const out = file.replace(/\.jpe?g$/i, '.webp');
  const info = await sharp(file)
    .rotate() // EXIF 회전값을 픽셀에 반영
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(out);
  const src = (await stat(file)).size;
  before += src;
  after += info.size;
  console.log(
    `${(src / 1024).toFixed(0).padStart(6)}KB → ${(info.size / 1024).toFixed(0).padStart(5)}KB  ${info.width}x${info.height}  ${out}`
  );
  if (replace) await unlink(file);
}
console.log(
  `\n${files.length}장: ${(before / 1048576).toFixed(1)}MB → ${(after / 1048576).toFixed(1)}MB`
);
