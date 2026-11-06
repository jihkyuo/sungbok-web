#!/usr/bin/env node
// design:audit — 실제 렌더를 기기 폭별로 측정해 반응형 기준 위반을 보고한다.
//
//   pnpm dev                      # 먼저 개발 서버(3005)를 띄운다
//   pnpm design:audit             # 모든 비-placeholder 라우트 × 375/768/1024/1280
//   pnpm design:audit --widths 375 --routes /,/about/staff
//   pnpm design:audit --routes /design --full   # 캡처를 페이지 전체 길이로
//
// 기준(설계 .md/specs/2026-11-05-design-system-design.md §5.5): 가로 넘침 0, 터치 영역 44px,
// 한글 13px·라틴 12px·입력칸 16px 이상. 판정은 src/shared/lib/designAudit.ts(테스트 있음).
//
// 왜 CDP 인가: headless 크롬의 --window-size 는 창 최소 폭(500px) 때문에 375 측정이 틀린다.
// Emulation.setDeviceMetricsOverride 로 기기 폭을 직접 흉내 낸다.
//
// 환경변수: AUDIT_BASE_URL(기본 http://localhost:3005), CHROME_PATH(기본 macOS Chrome).
// 캡처: .design-audit/<폭>/<라우트>.png (gitignore). 위반이 있으면 exit 1(수동 도구, 커밋 게이트 아님).

import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  judgeFontSizes,
  judgeOverflow,
  judgeTouchTargets,
  parseWidths,
  withTimeout,
} from '../src/shared/lib/designAudit.ts';
import { childHref, sectionHref, sections } from '../src/shared/config/siteNav.ts';

const BASE = process.env.AUDIT_BASE_URL ?? 'http://localhost:3005';
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = '.design-audit';
const ROUTE_TIMEOUT_MS = 30_000;
const LOAD_TIMEOUT_MS = 15_000; // 개발 서버 첫 컴파일 포함
const SETTLE_MS = 2_000; // load 뒤 Reveal·폰트 교체가 자리 잡는 시간
const CAPTURE_TIMEOUT_MS = 5_000;
const EXTERNAL_FONT_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

const arg = name => {
  const i = process.argv.indexOf(`--${name}`);
  const v = i > -1 ? process.argv[i + 1] : undefined;
  if (i > -1 && (v === undefined || v.startsWith('--'))) {
    console.error(`--${name} 에 값이 없습니다`);
    process.exit(2);
  }
  return v;
};

const defaultRoutes = () => [
  '/',
  ...sections.flatMap(s =>
    s.children?.length ? s.children.map(c => childHref(s, c)) : [sectionHref(s)]
  ),
];

let widths;
try {
  widths = parseWidths(arg('widths'));
} catch (e) {
  console.error(e.message);
  process.exit(2);
}
const routes = arg('routes')?.split(',') ?? defaultRoutes();
const FULL_PAGE = process.argv.includes('--full'); // 캡처를 페이지 전체 길이로
const sleep = ms => new Promise(r => setTimeout(r, ms));

// --- Chrome + CDP ---------------------------------------------------------------
const profile = mkdtempSync(join(tmpdir(), 'design-audit-'));
const port = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    // 백그라운드 판정으로 렌더가 멈추지 않게 한다(캡처가 프레임을 못 받아 멈추는 증상 완화)
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--hide-scrollbars',
    'about:blank',
  ],
  { stdio: 'ignore' }
);
const cleanup = async () => {
  const exited = new Promise(r => chrome.once('exit', r));
  chrome.kill();
  await withTimeout(exited, 3000);
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch {
    /* 임시 프로필 — 지우지 못해도 OS 가 정리한다 */
  }
};

// 어떤 경로로 죽어도 headless 크롬과 임시 프로필을 남기지 않는다
const die = async reason => {
  console.error(`design:audit 중단 — ${reason?.message ?? reason}`);
  await cleanup();
  process.exit(2);
};
process.on('SIGINT', () => die('사용자 중단'));
process.on('unhandledRejection', die);

let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  await sleep(200);
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    wsUrl = list.find(t => t.type === 'page')?.webSocketDebuggerUrl;
  } catch {
    /* 아직 기동 중 */
  }
}
if (!wsUrl) {
  console.error(`Chrome 디버깅 포트에 붙지 못했습니다 (CHROME_PATH=${CHROME})`);
  await cleanup();
  process.exit(2);
}

const ws = new WebSocket(wsUrl);
if ((await withTimeout(new Promise(r => (ws.onopen = r)), 5000)) === 'timeout') {
  await die('CDP WebSocket 연결 시간 초과');
}
let seq = 0;
const pending = new Map();
const eventWaiters = new Map(); // method → resolve[]
const externalFontRequests = new Set();
let lastDocumentStatus = 0;
let mainFrameId; // iframe(유튜브 임베드 등) 응답이 페이지 상태를 덮어쓰지 않게 메인 프레임만 본다
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
    return;
  }
  if (
    m.method === 'Network.responseReceived' &&
    m.params.type === 'Document' &&
    m.params.frameId === mainFrameId
  ) {
    lastDocumentStatus = m.params.response.status;
  }
  if (m.method === 'Network.requestWillBeSent') {
    const url = m.params.request.url;
    if (EXTERNAL_FONT_HOSTS.some(h => url.includes(h))) externalFontRequests.add(url);
  }
  const waiters = eventWaiters.get(m.method);
  if (waiters) {
    eventWaiters.delete(m.method);
    waiters.forEach(r => r(m.params));
  }
};
const rawSend = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, m =>
      m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)
    );
    ws.send(JSON.stringify({ id, method, params }));
  });
const nextEvent = method =>
  new Promise(r => eventWaiters.set(method, [...(eventWaiters.get(method) ?? []), r]));

try {
  await rawSend('Page.enable');
  await rawSend('Network.enable');
  // 메인 프레임 id 는 탭이 살아 있는 동안 같다 — 응답 이벤트가 navigate 결과보다 먼저 와도 놓치지 않게 미리 받아 둔다
  mainFrameId = (await rawSend('Page.getFrameTree')).frameTree.frame.id;
  await rawSend('Emulation.setFocusEmulationEnabled', { enabled: true });
  await rawSend('Page.setWebLifecycleState', { state: 'active' });
// 첫 캡처는 컴포지터가 아직 프레임을 안 만들어 멈추는 일이 잦다 → 빈 화면으로 한 번 데워 둔다
  await withTimeout(rawSend('Page.captureScreenshot', { format: 'png' }), CAPTURE_TIMEOUT_MS);
} catch (e) {
  await die(e);
}

// 페이지 안에서 실행 — 측정값만 모아 돌려준다(판정은 Node 쪽 순수 함수).
// "보인다" = 크기가 있고, 조상까지 포함해 display/visibility 숨김이 아니며(checkVisibility),
// (opacity 는 보지 않는다 — Reveal 은 스크롤 전까지 opacity 0 이지만 실제 콘텐츠다)
// inert·aria-hidden 패널 밖이고, 가로로 화면 안에 걸쳐 있다(옆으로 밀려난 메뉴 제외).
const COLLECT = `(() => {
  const vw = document.documentElement.clientWidth;
  const visible = el => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0 || r.right <= 0 || r.left >= vw) return false;
    if (el.closest('[inert], [aria-hidden="true"]')) return false;
    return el.checkVisibility({ visibilityProperty: true });
  };
  // 보이는 크기는 작아도 ::before/::after 가상 영역(after:-inset-* 등)으로 누르는 영역을 넓힌 부품은 그 영역으로 잰다
  const hitBox = el => {
    const r = el.getBoundingClientRect();
    const n = v => parseFloat(v) || 0;
    let w = r.width, h = r.height;
    for (const pseudo of ['::before', '::after']) {
      const a = getComputedStyle(el, pseudo);
      if (a.content === 'none' || a.position !== 'absolute') continue;
      w = Math.max(w, r.width - n(a.left) - n(a.right));
      h = Math.max(h, r.height - n(a.top) - n(a.bottom));
    }
    return { w, h };
  };
  const targets = [...document.querySelectorAll('a, button, [role=button], [role=tab]')].filter(visible).map(el => {
    const b = hitBox(el);
    return { label: (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 24),
      tag: el.tagName.toLowerCase(), role: el.getAttribute('role'), inParagraph: !!el.closest('p'),
      width: b.w, height: b.h };
  });
  const texts = [];
  for (const el of document.querySelectorAll('body *')) {
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    if (!own || !visible(el)) continue;
    texts.push({ text: own, fontSizePx: parseFloat(getComputedStyle(el).fontSize), isFormControl: false });
  }
  for (const el of document.querySelectorAll('input, textarea, select')) {
    if (!visible(el)) continue;
    texts.push({ text: el.getAttribute('aria-label') || el.name || el.type || 'input',
      fontSizePx: parseFloat(getComputedStyle(el).fontSize), isFormControl: true });
  }
  return JSON.stringify({ scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight,
    placeholder: !!document.querySelector('[data-page-placeholder]'), targets, texts });
})()`;

class Cancelled extends Error {}

/**
 * 라우트 하나 측정. withTimeout 은 이 함수를 멈추지 못하므로, 시간 초과 뒤에는 token.cancelled 로
 * 남은 CDP 명령을 막는다 — 안 그러면 뒤늦게 돈 명령이 다음 라우트의 화면 크기를 바꿔 측정을 오염시킨다.
 */
const auditOne = async (width, route, token) => {
  const send = (method, params) => {
    if (token.cancelled) throw new Cancelled();
    return rawSend(method, params);
  };
  const metrics = height => ({ width, height, deviceScaleFactor: 1, mobile: width < 768 });

  await send('Emulation.setDeviceMetricsOverride', metrics(900));
  await send('Emulation.setTouchEmulationEnabled', { enabled: width < 1024, maxTouchPoints: 5 });
  const loaded = nextEvent('Page.loadEventFired');
  lastDocumentStatus = 0;
  await send('Page.navigate', { url: BASE + route });
  // load 가 늦어도(유튜브 임베드·큰 사진) 렌더는 됐을 수 있으니 측정은 계속한다 — 결과에 경고만 남긴다
  const loadTimedOut = (await withTimeout(loaded, LOAD_TIMEOUT_MS)) === 'timeout';
  if (loadTimedOut) slowLoads.push(`${width} ${route}`);
  // 서버 오류 페이지(개발 오버레이)를 재면 엉뚱한 위반이 나온다 — 오류로 보고하고 측정하지 않는다
  if (lastDocumentStatus >= 400) throw new Error(`HTTP ${lastDocumentStatus} — 페이지가 렌더되지 않음`);
  await sleep(SETTLE_MS);

  const evalRes = await send('Runtime.evaluate', { expression: COLLECT, returnByValue: true });
  if (evalRes.exceptionDetails) {
    const ex = evalRes.exceptionDetails;
    throw new Error(`측정 스크립트 오류: ${ex.exception?.description ?? ex.text}`);
  }
  const m = JSON.parse(evalRes.result.value);
  if (m.placeholder) return { skipped: true, captured: false, violations: [] };

  // 캡처는 best-effort. headless 는 화면이 그대로면 새 프레임을 만들지 않아 캡처가 멈추는 페이지가 있다
  // (원인 미해결 — 홈·섬기는 이들에서 재현). 멈추면 높이를 1px 흔들어 프레임을 강제하고 한 번 더 시도한다.
  const shotParams = FULL_PAGE
    ? { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: m.scrollHeight, scale: 1 } }
    : { format: 'png' };
  let shot = await withTimeout(send('Page.captureScreenshot', shotParams), CAPTURE_TIMEOUT_MS * (FULL_PAGE ? 3 : 1));
  if (shot === 'timeout') {
    await send('Emulation.setDeviceMetricsOverride', metrics(901));
    shot = await withTimeout(send('Page.captureScreenshot', shotParams), CAPTURE_TIMEOUT_MS * (FULL_PAGE ? 3 : 1));
  }
  const captured = shot !== 'timeout';
  if (captured) {
    const dir = join(OUT, String(width));
    mkdirSync(dir, { recursive: true });
    const name = route === '/' ? 'home' : route.slice(1).replaceAll('/', '-');
    writeFileSync(join(dir, `${name}.png`), Buffer.from(shot.data, 'base64'));
  }
  return {
    skipped: false,
    captured,
    violations: [
      // mobile 흉내에서는 넘친 만큼 innerWidth 도 늘어나므로 기준은 흉내 낸 폭이다
      ...judgeOverflow(width, m.scrollWidth),
      // 터치 영역은 터치 기기 폭(1024 미만)에서만 본다 — PC 폭은 마우스라 설계 §5.5 의 44px 대상이 아니다
      ...(width < 1024 ? judgeTouchTargets(m.targets) : []),
      ...judgeFontSizes(m.texts),
    ],
  };
};

// --- 실행 -----------------------------------------------------------------------
const rows = [];
const missingCaptures = [];
const slowLoads = [];
let skipped = 0;
for (const width of widths) {
  for (const route of routes) {
    const token = { cancelled: false };
    let res;
    try {
      res = await withTimeout(auditOne(width, route, token), ROUTE_TIMEOUT_MS);
    } catch (e) {
      token.cancelled = true;
      rows.push([width, route, 'error', e.message]);
      continue;
    }
    if (res === 'timeout') {
      token.cancelled = true;
      rows.push([width, route, 'timeout', `${ROUTE_TIMEOUT_MS / 1000}s 안에 측정이 끝나지 않음`]);
      // about:blank 의 load 를 여기서 소비해야 다음 라우트의 load 대기를 잘못 풀지 않는다
      const blank = nextEvent('Page.loadEventFired');
      await rawSend('Page.navigate', { url: 'about:blank' }).catch(() => {});
      await withTimeout(blank, LOAD_TIMEOUT_MS);
      continue;
    }
    if (res.skipped) skipped++;
    else if (!res.captured) missingCaptures.push([width, route]);
    for (const v of res.violations) rows.push([width, route, v.kind, v.detail]);
  }
}

// 캡처만 실패한 라우트는 한 번 더 돌려 캡처를 채운다(위반은 첫 측정 것만 쓴다)
for (const [width, route] of missingCaptures.splice(0)) {
  const token = { cancelled: false };
  const res = await withTimeout(auditOne(width, route, token), ROUTE_TIMEOUT_MS).catch(() => 'timeout');
  if (res === 'timeout' || !res.captured) {
    token.cancelled = true;
    missingCaptures.push([width, route]);
  }
}

ws.close();
await cleanup();

for (const [w, r, k, d] of rows) {
  console.log(`${String(w).padEnd(5)} ${r.padEnd(32)} ${k.padEnd(9)} ${d}`);
}
const byKind = rows.reduce((acc, [, , k]) => ({ ...acc, [k]: (acc[k] ?? 0) + 1 }), {});
console.log(
  `\n폭 ${widths.join('/')} × 라우트 ${routes.length}개 (준비 중 건너뜀 ${skipped}) — 위반 ${rows.length}건 ${JSON.stringify(byKind)}`
);
console.log(
  externalFontRequests.size
    ? `⚠️  외부 폰트 요청 ${externalFontRequests.size}건: ${[...externalFontRequests].slice(0, 3).join(', ')}`
    : '외부 폰트 요청 0건'
);
if (missingCaptures.length) {
  console.log(`⚠️  캡처 실패 ${missingCaptures.length}건(측정은 정상): ${missingCaptures.map(([w, r]) => `${w} ${r}`).join(', ')}`);
}
if (slowLoads.length) {
  console.log(`⚠️  load ${LOAD_TIMEOUT_MS / 1000}s 초과(측정은 진행): ${slowLoads.join(', ')}`);
}
console.log(`캡처: ${OUT}/<폭>/<라우트>.png`);
process.exit(rows.length ? 1 : 0);
