// 브라우저에서 우리 API(Route Handler)를 부르는 공용 fetch — 실패 종류를 갈라 재시도 정책(retryTransient)에 넘긴다.

/** 응답은 받았지만 실패 상태(4xx·5xx). */
export class HttpError extends Error {
  constructor(readonly status: number) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
  }
}

/** 응답을 아예 못 받음(망 끊김·DNS 등) — fetch 가 던진 오류를 감싼다. */
export class NetworkError extends Error {
  constructor(readonly cause: unknown) {
    super('network error');
    this.name = 'NetworkError';
  }
}

export const fetchJson = async <T>(url: string): Promise<T> => {
  let r: Response;
  try {
    r = await fetch(url);
  } catch (e) {
    throw new NetworkError(e);
  }
  if (!r.ok) throw new HttpError(r.status);
  try {
    return (await r.json()) as T;
  } catch (e) {
    // 본문을 받다가 연결이 끊기면 TypeError — 망 끊김이다. 본문이 JSON 이 아니면 SyntaxError(다시 해도 같다).
    if (e instanceof TypeError) throw new NetworkError(e);
    throw e;
  }
};

/**
 * react-query retry 정책 — 다시 해서 풀릴 수 있는 실패만. 망 끊김은 두 번까지, 서버가 503 으로 알린 유튜브 일시 장애는
 * 한 번만(실패 응답은 캐시되지 않아 재시도마다 유튜브에 닿는다 — 장애 중 부하를 키우지 않게).
 * 쿼터 소진(429)·요청 오류·유튜브 오류(502)·응답 모양 오류·코드 버그는 다시 해도 같다(쿼터만 더 탄다).
 * 재시도 간격은 react-query 기본(1초 → 2초).
 */
export const retryTransient = (failureCount: number, error: unknown) =>
  (error instanceof NetworkError && failureCount < 2) ||
  (error instanceof HttpError && error.status === 503 && failureCount < 1);
