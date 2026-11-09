import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchJson, HttpError, NetworkError, retryTransient } from './fetchJson';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('fetchJson', () => {
  it('성공하면 JSON 을 돌려준다', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ a: 1 }) });
    await expect(fetchJson('/api/x')).resolves.toEqual({ a: 1 });
    expect(fetchMock).toHaveBeenCalledWith('/api/x');
  });

  it('응답이 실패면 상태를 담은 HttpError', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    await expect(fetchJson('/api/x')).rejects.toMatchObject({ name: 'HttpError', status: 503 });
  });

  it('본문을 받다가 끊기면(TypeError)도 NetworkError, 본문이 JSON 이 아니면(SyntaxError) 그대로', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new TypeError('terminated');
      },
    });
    await expect(fetchJson('/api/x')).rejects.toBeInstanceOf(NetworkError);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token <');
      },
    });
    await expect(fetchJson('/api/x')).rejects.toBeInstanceOf(SyntaxError);
  });

  it('응답을 아예 못 받으면(망 끊김) NetworkError', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(fetchJson('/api/x')).rejects.toBeInstanceOf(NetworkError);
  });
});

describe('retryTransient — 다시 해서 풀릴 수 있는 실패만 두 번까지', () => {
  it('망 끊김은 두 번까지, 서버 일시 장애(503)는 한 번만 — 장애 중 유튜브 부하를 키우지 않게', () => {
    expect(retryTransient(0, new NetworkError(new TypeError('x')))).toBe(true);
    expect(retryTransient(1, new NetworkError(new TypeError('x')))).toBe(true);
    expect(retryTransient(2, new NetworkError(new TypeError('x')))).toBe(false);
    expect(retryTransient(0, new HttpError(503))).toBe(true);
    expect(retryTransient(1, new HttpError(503))).toBe(false);
  });

  it('쿼터 소진(429)·요청 오류(4xx)·유튜브 오류(502)·응답 모양 오류는 다시 시도하지 않는다', () => {
    expect(retryTransient(0, new HttpError(429))).toBe(false);
    expect(retryTransient(0, new HttpError(404))).toBe(false);
    expect(retryTransient(0, new HttpError(502))).toBe(false);
    expect(retryTransient(0, new SyntaxError('Unexpected token <'))).toBe(false);
    expect(retryTransient(0, new TypeError('x is undefined'))).toBe(false); // 코드 버그
  });
});
