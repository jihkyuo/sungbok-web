// 유튜브 Data API v3 호출 — 서버 전용. 브라우저에서 부르면 쿼터가 방문자 수만큼 들고 키가 번들에 실린다.
// fetch 를 쓰는 이유: Next Data Cache(`next.revalidate`)는 fetch 에만 걸린다. 200 응답만 캐시된다.

import 'server-only'; // 화면(클라이언트) 코드가 가져다 쓰면 빌드가 실패한다 — 키·쿼터는 서버에만

import { z } from 'zod';

const API = 'https://www.googleapis.com/youtube/v3/';

// 키는 서버 전용 이름(YOUTUBE_API_KEY)만 읽는다. 옛 NEXT_PUBLIC_ 이름은 브라우저 번들에 실릴 수 있어 버렸다(ADR 0010).
const apiKey = () => process.env.YOUTUBE_API_KEY || '';

/** 유튜브 응답 실패. reason 은 유튜브가 알려 준 이유(예: quotaExceeded) — 우리 API 응답 상태를 가르는 데 쓴다. */
export class YoutubeApiError extends Error {
  constructor(
    readonly path: string,
    readonly status: number,
    readonly reason?: string
  ) {
    super(`${path} ${status}${reason ? ` ${reason}` : ''}`);
    this.name = 'YoutubeApiError';
  }
}

/** 유튜브에 닿지 못함(망 오류) — fetch 가 응답을 못 받았다. 우리 코드 버그(TypeError)와 구분하려고 따로 둔다. */
export class YoutubeNetworkError extends Error {
  constructor(
    readonly path: string,
    readonly cause: unknown
  ) {
    super(`${path} network error`);
    this.name = 'YoutubeNetworkError';
  }
}

/**
 * 200 응답이지만 모양이 스키마와 다름 — 유튜브가 필드를 바꾸거나 뺐다. 다시 받아도 같으므로 재시도하지 않고(502),
 * 마지막 성공분으로 버틸지는 호출부가 정한다(홈 피드는 버틴다). message 에 어긋난 위치(예: `items.0.id`)를 담아 서버 로그에서 바로 보이게 한다.
 */
export class YoutubeShapeError extends Error {
  constructor(
    readonly path: string,
    readonly detail: string
  ) {
    super(`${path} unexpected response shape: ${detail}`);
    this.name = 'YoutubeShapeError';
  }
}

const describeIssues = (issues: z.core.$ZodIssue[]) =>
  issues
    .slice(0, 3)
    .map(i => `${i.path.map(String).join('.') || '(root)'}: ${i.message}`)
    .join('; ');

const reasonOf = async (r: Response): Promise<string | undefined> => {
  try {
    const body = (await r.json()) as { error?: { errors?: { reason?: string }[] } };
    return body.error?.errors?.[0]?.reason;
  } catch {
    return undefined; // 오류 본문이 JSON 이 아닐 때(HTML 등)
  }
};

// 유튜브가 응답 없이 멈추면 우리 API·페이지 재생성도 함께 멈춘다 — 10초에 끊고 일시 장애(503)로 돌려준다.
// 단, Next 가 낡은 캐시 항목을 뒤에서 새로 받을 때는 이 제한(signal)을 떼고 부른다(Next 동작). 그 경우 방문자는
// 캐시된 응답을 바로 받으므로 화면이 멈추지는 않는다.
const TIMEOUT_MS = 10_000;

/**
 * 유튜브 응답과 그 응답을 유튜브가 만든 시각(Date 헤더)을 함께 준다. Next Data Cache 는 다시 받기가 실패하면
 * 옛 응답을 조용히 계속 내주므로, 이 시각으로 «캐시에 남은 옛 응답»인지 알 수 있다(예: 끝난 라이브 걸러내기).
 * 키는 주소가 아닌 헤더로 보낸다 — 주소에 넣으면 캐시 파일·로그에 그대로 남는다(Next 는 authorization·cookie
 * 헤더가 있을 때만 캐시를 건너뛰므로 이 헤더는 캐시에 영향이 없다).
 */
export const youtubeGetDated = async <S extends z.ZodType>(
  path: string,
  params: Record<string, string>,
  revalidate: number,
  schema: S
): Promise<{ data: z.output<S>; fetchedAt: number }> => {
  const u = new URL(API + path);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  let r: Response;
  try {
    r = await fetch(u.toString(), {
      headers: { 'X-goog-api-key': apiKey() },
      next: { revalidate },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    throw new YoutubeNetworkError(path, e); // 망 오류·시간 초과
  }
  if (!r.ok) throw new YoutubeApiError(path, r.status, await reasonOf(r));
  let body: unknown;
  try {
    body = await r.json();
  } catch (e) {
    // JSON 이 아니면 SyntaxError(다시 받아도 같다) — 그대로. 그 밖(연결 끊김 TypeError, 10초 제한 TimeoutError)은
    // 유튜브에 제대로 닿지 못한 것이라 망 오류(503 으로 재시도).
    if (e instanceof SyntaxError) throw e;
    throw new YoutubeNetworkError(path, e);
  }
  // 타입만 붙이지 않고 실제 모양을 검사한다 — 어긋나면 화면이 조용히 깨지는 대신 여기서 이유와 함께 실패한다.
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new YoutubeShapeError(path, describeIssues(parsed.error.issues));
  const data = parsed.data;
  const date = Date.parse(r.headers?.get('date') ?? '');
  return { data, fetchedAt: Number.isNaN(date) ? Date.now() : date };
};

export const youtubeGet = async <S extends z.ZodType>(
  path: string,
  params: Record<string, string>,
  revalidate: number,
  schema: S
): Promise<z.output<S>> => (await youtubeGetDated(path, params, revalidate, schema)).data;

// 같은 경고는 서버 인스턴스당 한 번 — Data Cache 의 같은 응답을 요청마다 다시 검사하므로 그대로 찍으면 로그가 불어난다.
const warned = new Set<string>();

/**
 * 목록(items) 스키마 — 항목마다 따로 검사해 어긋난 항목만 뺀다. 영상 하나(처리 중·비공개 등)의 모양 때문에
 * 목록 전체가 실패하지 않게. 없거나 null 이면 빈 목록(빈 재생목록). 배열이 아닌 다른 값이면 응답 전체의 모양이
 * 바뀐 것이라 실패(YoutubeShapeError)한다. 경고에는 어느 응답·몇 번째 항목인지 적는다.
 */
export const validItems = <S extends z.ZodType>(path: string, item: S) =>
  z
    .array(z.unknown())
    .nullish()
    .transform(list =>
      (list ?? []).flatMap((x, i) => {
        const r = item.safeParse(x);
        if (r.success) return [r.data as z.output<S>];
        const msg = `[youtube] ${path} items[${i}] 모양이 어긋나 뺀다: ${describeIssues(r.error.issues)}`;
        if (!warned.has(msg)) {
          warned.add(msg);
          console.warn(msg);
        }
        return [];
      })
    );

/** 유튜브 응답의 썸네일 묶음(크기 이름 → 주소). 크기는 영상마다 있기도 없기도 하다. */
export const youtubeThumbnailsSchema = z.record(
  z.string(),
  z.object({ url: z.string().optional() }).optional()
);
export type YoutubeThumbnails = z.output<typeof youtubeThumbnailsSchema>;
type ThumbnailSize = 'maxres' | 'standard' | 'high' | 'medium' | 'default';

/** 원하는 크기 순서대로 처음 있는 썸네일 주소. 없으면 '' — 삭제·비공개 영상은 썸네일이 비어 온다. */
export const pickThumbnail = (t: YoutubeThumbnails | undefined, order: ThumbnailSize[]): string =>
  order.map(size => t?.[size]?.url).find(Boolean) ?? '';
