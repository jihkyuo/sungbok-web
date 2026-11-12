// 유튜브 제목·설명에서 설교 정보를 읽는다(순수) — 관리자는 유튜브에 올리기만 하고, 분류는 여기서 정한다.
// 제목 형식: «시리즈 N | 제목 | 본문 | 설교자». 본문·설교자 칸은 빠질 수 있고, 첫 칸에 회차가 없으면 단편이다.
// 근거·표본: .md/specs/2026-11-12-worship-sermon-g-plan.md

/** 시리즈 번호가 없는 설교를 모으는 분류 이름(화면의 칩·선택칸에 그대로 보인다). */
export const SINGLES = '단편 설교';

export type ParsedTitle = {
  /** 시리즈 이름. 회차가 없으면 SINGLES */
  series: string;
  no?: number;
  /** 단편의 첫 칸(절기·주제 이름. 예: 성찬식, 맥추감사주일) */
  occasion?: string;
  title: string;
  passage?: string;
  preacher?: string;
};

// 설교자 칸: 이름 + 직분(«이요셉 목사»·«이요셉 담임목사»). «하나님이 부르신 목사» 같은 제목과 구분하려고 이름은 한 낱말만 본다.
const PREACHER = /^\S{2,5}\s?(원로|담임|부)?\s?(목사|전도사|강도사|선교사|장로|교수|간사)(님)?$/;
// 본문 칸: 구절 표기(13:4-7 · 12장 · 시편 23편)가 있고 구절로 끝난다 — «요한복음 3:16의 약속» 은 제목이다.
// «N편» 은 시편만 본문으로 본다(«감사 2편» 같은 제목과 구분).
const PASSAGE = /\d+\s*:\s*\d+|\d+\s*장|시편\s?\d+편/;
const PASSAGE_END = /[\d장절편]$/;
const isPassage = (field: string) => PASSAGE.test(field) && PASSAGE_END.test(field);
// 첫 칸 «시리즈 이름 N» — 회차는 세 자리까지, 이름은 글자로 끝난다. «송구영신예배 2026»(연도)·«2026.11.08»(날짜)은 회차가 아니다.
const NUMBERED = /^(.*[^\d\s.·/-])\s*(\d{1,3})$/;

export const parseSermonTitle = (raw: string): ParsedTitle => {
  const whole = raw.trim();
  const fields = whole.split('|').map(f => f.trim());
  if (fields.length < 2) return { series: SINGLES, title: whole };

  // 끝의 빈 칸은 버린다(«… | 본문 | » — 설교자 칸을 비워 둔 제목)
  while (fields.length > 1 && fields.at(-1) === '') fields.pop();

  const out: Partial<ParsedTitle> = {};
  // 시리즈 편(첫 칸에 회차)은 제목이 꼭 있다 — 첫 칸 다음의 하나뿐인 칸은 설교자·본문 모양이어도 제목이다
  // («믿음 3 | 신실한 목사», «믿음 3 | 요한복음 3:16»). 그래서 떼어 낼 땐 첫 칸과 제목 칸을 남길 수 있을 때만 뗀다.
  const keep = NUMBERED.test(fields[0]) ? 2 : 1;
  // 설교자 칸: 이름 + 직분 모양이거나, 네 칸 이상(정해 둔 형식)의 마지막 칸 — 초청 설교자·소속이 붙은 표기
  // («성복교회 이요셉 목사», «홍길동 집사»)도 자리로 읽는다. 본문 모양이면 설교자 칸이 빠진 것이다.
  const tail = fields.at(-1)!;
  const preacherAt = PREACHER.test(tail) || (fields.length >= 4 && !isPassage(tail));
  if (fields.length > keep && preacherAt) out.preacher = fields.pop();
  // 본문 칸은 빠지거나 비어 올 수 있다(«… |  | 이요셉 목사»)
  if (fields.length > keep) {
    const last = fields.at(-1)!;
    if (last === '') fields.pop();
    else if (isPassage(last)) out.passage = fields.pop();
  }

  const rest = fields.filter(Boolean);
  if (rest.length === 0) return { series: SINGLES, title: whole };
  if (rest.length === 1) return { series: SINGLES, title: rest[0], ...out };

  const [head, ...titleParts] = rest;
  const title = titleParts.join(' | ');
  const numbered = NUMBERED.exec(head);
  return numbered
    ? { series: numbered[1], no: Number(numbered[2]), title, ...out }
    : { series: SINGLES, occasion: head, title, ...out };
};

const KO_DATE = /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/;

/** 글 안의 첫 «YYYY년 M월 D일» 을 달력 날짜(YYYY-MM-DD)로. 없거나 달력에 없는 날이면 undefined. */
export const dateInText = (text: string): string | undefined => {
  const m = KO_DATE.exec(text);
  if (!m) return undefined;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  // 달력에 있는 날인지 — Date 가 넘치는 값을 다음 달로 넘기는 것을 이용해 되읽어 비교한다(시간대와 무관하게 UTC 로)
  const t = new Date(Date.UTC(y, mo - 1, d));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== mo - 1 || t.getUTCDate() !== d) {
    return undefined;
  }
  return `${m[1]}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

export type ParsedDescription = {
  /** 설교일(YYYY-MM-DD) — 설명 첫 줄에 날짜가 있을 때만 */
  date?: string;
  /** 화면에 보일 본문 — 날짜 줄(굵은 날짜 줄과 겹친다)과 그 뒤 빈 줄을 뺀 것 */
  body: string;
};

export const parseSermonDescription = (raw: string): ParsedDescription => {
  const lines = raw.replace(/\r\n?/g, '\n').split('\n');
  // 첫 글줄(빈 줄로 시작하는 설명도 있다)에 날짜가 있어야 설교일이다 — 본문 중간의 날짜는 설교일로 보지 않는다
  const first = lines.findIndex(line => line.trim());
  const date = first < 0 ? undefined : dateInText(lines[first]);
  if (!date) return { body: raw };
  let i = first + 1;
  while (i < lines.length && !lines[i].trim()) i++;
  return { date, body: lines.slice(i).join('\n') };
};
