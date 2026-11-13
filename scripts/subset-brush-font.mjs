#!/usr/bin/env node
// 붓글씨체(Nanum Brush Script)에서 화면에 쓰는 글자만 뽑아 작은 폰트 파일 하나로 만든다.
//   pnpm fonts:brush
// 붓글씨(.b1-brush)는 인사 한마디에만 쓰는데, 조각 폰트로는 글자가 흩어져 있어 4개 파일(~118KB)을 받았다.
// 글자를 바꾸면 아래 TEXT 를 고치고 다시 실행한 뒤, 끝에 찍히는 unicode-range 를 globals.css 의 'Sungbok Brush' 에 옮긴다.
// 옮기지 않아도 화면은 깨지지 않는다 — 빠진 글자는 뒤 순서의 조각 폰트('Nanum Brush Script')에서 받는다.
import { readFile, writeFile } from 'node:fs/promises';
import subsetFont from 'subset-font';

// 공백을 꼭 넣는다 — 브라우저는 줄 높이를 잴 때 «공백을 가진 첫 폰트»를 받으므로, 빠지면 조각 폰트(라틴, ~19KB)를 따로 받는다.
const TEXT = ' 할렐루야!';
const SOURCE =
  'node_modules/@fontsource/nanum-brush-script/files/nanum-brush-script-korean-400-normal.woff2';
const OUT = 'src/assets/fonts/sungbok-brush.woff2';

const chars = [...new Set(TEXT)].sort();
const out = await subsetFont(await readFile(SOURCE), chars.join(''), { targetFormat: 'woff2' });
await writeFile(OUT, out);

const range = chars
  .map(c => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`)
  .join(', ');
console.log(`${OUT}  ${out.length}B  글자 ${chars.length}개`);
console.log(`unicode-range: ${range};`);
