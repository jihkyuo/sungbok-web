// 설교 목록 계산(순수) — 정렬·검색·시리즈 묶기. 서버가 한 번 실어 보낸 설교 배열을 화면에서 그대로 다룬다
// (목록을 바꿀 때마다 서버·유튜브를 부르지 않는다).
import { SINGLES } from './sermonParse';
import type { Sermon, SermonSeries } from './worshipVideo.types';

/** 전체 목록을 한 번에 더 보여 주는 편수(처음에도 이만큼). */
export const PAGE_STEP = 12;

export type ListQuery = {
  q: string;
  /** 시리즈 이름. '' 이면 전체 */
  series: string;
  sort: 'new' | 'old';
};

/** 날짜 최신순, 같은 날은 회차 큰 순. 서버가 이 순서로 내려 주고 화면은 이 순서를 믿는다. */
export const sortSermons = (list: readonly Sermon[]): Sermon[] =>
  [...list].sort((a, b) => b.date.localeCompare(a.date) || (b.no ?? 0) - (a.no ?? 0));

// 본문 표기의 «:» 앞뒤 공백은 올리는 사람마다 다르다(«10:8» · «10: 8») — 비교할 땐 붙여서 본다
const tight = (v: string) => v.replace(/\s*:\s*/g, ':');

// «N장 M절»·«N장»·«M절» 을 «N:M» 꼴로 — 검색어와 목록 글 양쪽에 똑같이 적용해 표기 차이를 없앤다
const verseForm = (v: string) =>
  tight(
    v
      .toLowerCase()
      .replace(/(\d+)\s*장\s*(\d+)/g, '$1:$2')
      .replace(/(\d+)\s*장/g, '$1:')
      .replace(/(\d)\s*절/g, '$1')
  );

/** 검색어를 본문 표기에 맞춘다 — «12장» → «12:», «13장 4절» → «13:4». 소문자·앞뒤 공백 제거. */
export const searchKey = (q: string): string => verseForm(q.trim());

const searchText = (s: Sermon) =>
  [s.title, s.passage, s.series, s.occasion, s.no !== undefined && `${s.no}편`]
    .filter(Boolean)
    .join(' ');

// 숫자로 시작하는 검색어는 앞이 숫자가 아닌 자리에서만 맞춘다 — «2:» 가 «12:» 안에서 걸리지 않게
const includesAtBoundary = (text: string, key: string): boolean => {
  if (!/^\d/.test(key)) return text.includes(key);
  for (let i = text.indexOf(key); i >= 0; i = text.indexOf(key, i + 1)) {
    if (i === 0 || !/\d/.test(text[i - 1])) return true;
  }
  return false;
};

/** sermons 는 최신순이어야 한다(sortSermons). 오래된 순은 그 역순. */
export const filterSermons = (sermons: readonly Sermon[], query: ListQuery): Sermon[] => {
  const raw = tight(query.q.trim().toLowerCase());
  const key = searchKey(query.q);
  const list = sermons.filter(s => {
    if (query.series && s.series !== query.series) return false;
    if (!raw) return true;
    const text = searchText(s);
    // 친 그대로(제목 속 «12장» 같은 글자) 또는 본문 표기로 바꾼 것(«12장» → «12:»)
    return tight(text.toLowerCase()).includes(raw) || includesAtBoundary(verseForm(text), key);
  });
  return query.sort === 'old' ? list.reverse() : list;
};

/** 시리즈 목록 — 최근 편이 있는 시리즈부터. 단편 설교는 시리즈가 아닌 묶음이라 늘 맨 뒤. 입력 순서와 무관하다. */
export const buildSeries = (sermons: readonly Sermon[]): SermonSeries[] => {
  const map = new Map<string, SermonSeries>();
  for (const s of sermons) {
    const cur = map.get(s.series);
    if (!cur) {
      map.set(s.series, { name: s.series, count: 1, latest: s.date, thumbnail: s.thumbnail });
      continue;
    }
    cur.count++;
    if (s.date > cur.latest) {
      cur.latest = s.date;
      cur.thumbnail = s.thumbnail;
    }
  }
  const all = [...map.values()].sort((a, b) => b.latest.localeCompare(a.latest));
  return [...all.filter(x => x.name !== SINGLES), ...all.filter(x => x.name === SINGLES)];
};

/**
 * 그 시리즈의 편 — 회차 큰 편부터. 날짜가 아니라 회차로 세운다: 설교일을 못 찾아 업로드 날짜를 쓴 편이 섞이면
 * 날짜순은 회차 순서와 어긋난다(이전/다음 편도 이 순서를 쓴다). 단편 설교는 회차가 없어 날짜순 그대로.
 */
export const seriesSermons = (sermons: readonly Sermon[], name: string): Sermon[] => {
  const list = sermons.filter(s => s.series === name);
  return name === SINGLES ? list : list.sort((a, b) => (b.no ?? -1) - (a.no ?? -1));
};

/** 칩 줄에 보일 시리즈 — 최근 n개. 보고 있는 시리즈가 그 안에 없으면 마지막 자리에 넣는다. */
export const topSeries = (series: readonly SermonSeries[], current: string, n = 4) => {
  const top = series.slice(0, n);
  const cur = series.find(x => x.name === current);
  if (cur && !top.includes(cur)) top[top.length - 1] = cur;
  return top;
};

/** 전체 시리즈 고르기 상자의 묶음 — 최근 편의 연도별(최근 연도부터), 단편 설교는 맨 뒤 묶음. */
export const seriesByYear = (series: readonly SermonSeries[]): [string, SermonSeries[]][] => {
  const groups = new Map<string, SermonSeries[]>();
  for (const s of series) {
    const label = s.name === SINGLES ? '단편' : `${s.latest.slice(0, 4)}년`;
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(s);
  }
  return [...groups];
};

/**
 * 이전(오래된)·다음(최신) 편 — 설교 목록에 보이는 순서(seriesSermons) 그대로: 시리즈는 회차, 단편 설교는 단편끼리 날짜.
 * 없는 쪽은 싣지 않는다.
 */
export const neighbors = (
  sermons: readonly Sermon[],
  id: string
): { older?: Sermon; newer?: Sermon } => {
  const cur = sermons.find(s => s.id === id);
  if (!cur) return {};
  const list = seriesSermons(sermons, cur.series);
  const i = list.indexOf(cur);
  const older = list[i + 1];
  const newer = list[i - 1];
  return { ...(older && { older }), ...(newer && { newer }) };
};

/**
 * 목록 페이지에 그릴 줄 — 조건이 하나도 없는 첫 화면(전체·최신순·검색 없음)에서는 맨 앞(최신 설교)을 뺀다.
 * 바로 위에 «최신 설교» 로 크게 보이므로 두 번 그리지 않는다. 조건을 걸면 최신 설교도 결과에 나온다.
 */
export const listRows = (sermons: readonly Sermon[], query: ListQuery): Sermon[] => {
  const list = filterSermons(sermons, query);
  return !query.q.trim() && !query.series && query.sort === 'new' ? list.slice(1) : list;
};

const WEEKDAYS = ['주일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

/** 달력 날짜(YYYY-MM-DD)의 요일 — 일요일은 «주일». 날짜 모양이 아니면 빈 문자열. */
export const weekdayLabel = (date: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return '';
  // 달력 날짜라 시간대와 무관하게 UTC 로 센다(ADR 0012)
  return WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()] ?? '';
};

/** 화면 날짜 — 설교일은 «2026.10.25», 업로드 날짜는 «업로드 2026.10.25»(설교일이 아닐 수 있다). */
export const dateLabel = (s: Sermon): string =>
  `${s.dateFrom === 'upload' ? '업로드 ' : ''}${s.date.replaceAll('-', '.')}`;

/** 분류 표시 — 시리즈는 «이름 N편», 단편은 절기·주제 이름(없으면 «단편 설교»). */
export const sermonTag = (s: Sermon): string =>
  s.no !== undefined ? `${s.series} ${s.no}편` : (s.occasion ?? s.series);

const escapeRegExp = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * 글에서 검색어와 맞는 조각을 가른다(목록의 검색어 강조용). filterSermons 와 같은 기준 —
 * 친 그대로와 본문 표기로 바꾼 것(«12장» → «12:») 둘 다 찾는다.
 */
export const highlightParts = (text: string, q: string): { text: string; hit: boolean }[] => {
  const raw = q.trim();
  if (!raw) return [{ text, hit: false }];
  const keys = [...new Set([raw, searchKey(q)])].sort((a, b) => b.length - a.length);
  // filterSermons 와 같은 기준 — «:» 앞뒤 공백은 있든 없든, 숫자로 시작하면 앞이 숫자가 아닌 자리에서만
  const pattern = keys
    .map(k => (/^\d/.test(k) ? '(?<!\\d)' : '') + escapeRegExp(k).replace(/\s*:\s*/g, '\\s*:\\s*'))
    .join('|');
  const re = new RegExp(`(${pattern})`, 'gi');
  // 캡처 그룹으로 나누면 홀수 번째가 맞은 조각이다
  return text
    .split(re)
    .map((part, i) => ({ text: part, hit: i % 2 === 1 }))
    .filter(p => p.text);
};
