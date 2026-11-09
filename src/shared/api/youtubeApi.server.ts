// 유튜브 Data API v3 호출 — 서버 전용. 브라우저에서 부르면 쿼터가 방문자 수만큼 들고 키가 번들에 실린다.
// fetch 를 쓰는 이유: Next Data Cache(`next.revalidate`)는 fetch 에만 걸린다. 200 응답만 캐시된다.

import 'server-only'; // 화면(클라이언트) 코드가 가져다 쓰면 빌드가 실패한다 — 키·쿼터는 서버에만

const API = 'https://www.googleapis.com/youtube/v3/';

// 키는 서버 전용 이름(YOUTUBE_API_KEY)을 쓴다. Vercel 환경변수 이름을 바꾸기 전까지만 옛 이름도 읽는다(그 뒤 지운다).
const apiKey = () => process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';

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
export const youtubeGetDated = async <T>(
  path: string,
  params: Record<string, string>,
  revalidate: number
): Promise<{ data: T; fetchedAt: number }> => {
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
  let data: T;
  try {
    data = (await r.json()) as T;
  } catch (e) {
    // JSON 이 아니면 SyntaxError(다시 받아도 같다) — 그대로. 그 밖(연결 끊김 TypeError, 10초 제한 TimeoutError)은
    // 유튜브에 제대로 닿지 못한 것이라 망 오류(503 으로 재시도).
    if (e instanceof SyntaxError) throw e;
    throw new YoutubeNetworkError(path, e);
  }
  const date = Date.parse(r.headers?.get('date') ?? '');
  return { data, fetchedAt: Number.isNaN(date) ? Date.now() : date };
};

export const youtubeGet = async <T>(
  path: string,
  params: Record<string, string>,
  revalidate: number
): Promise<T> => (await youtubeGetDated<T>(path, params, revalidate)).data;

/** 유튜브 응답의 썸네일 묶음(크기 이름 → 주소). 크기는 영상마다 있기도 없기도 하다. */
export type YoutubeThumbnails = Record<string, { url?: string } | undefined>;
type ThumbnailSize = 'maxres' | 'standard' | 'high' | 'medium' | 'default';

/** 원하는 크기 순서대로 처음 있는 썸네일 주소. 없으면 '' — 삭제·비공개 영상은 썸네일이 비어 온다. */
export const pickThumbnail = (t: YoutubeThumbnails | undefined, order: ThumbnailSize[]): string =>
  order.map(size => t?.[size]?.url).find(Boolean) ?? '';
