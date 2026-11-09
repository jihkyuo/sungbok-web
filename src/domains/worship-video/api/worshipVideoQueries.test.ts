import { describe, expect, it } from 'vitest';

import {
  PLAYLISTS_QUERY_KEY,
  playlistVideosQueryKey,
  toPlaylists,
  toVideos,
} from './worshipVideoQueries';

describe('쿼리 키 — 서버 미리 받기와 화면 훅이 같은 키를 쓴다', () => {
  it('재생목록 목록·재생목록별 영상', () => {
    expect(PLAYLISTS_QUERY_KEY).toEqual(['worship-playlists']);
    expect(playlistVideosQueryKey('PL1')).toEqual(['worship-video', 'PL1']);
  });
});

describe('toVideos', () => {
  it('응답이 배열이 아니면(프록시 오류 봉투 등) 실패로 처리한다 — 화면을 깨뜨리지 않게', () => {
    expect(toVideos([{ id: 'a', title: 't', thumbnail: 'x' }])).toHaveLength(1);
    expect(() => toVideos({ items: [] })).toThrow();
    expect(() => toVideos(null)).toThrow();
  });

  it('모양이 맞지 않는 항목(썸네일·제목·id 빠짐)은 걸러낸다 — 한 항목 때문에 목록 전체가 깨지지 않게', () => {
    const ok = { id: 'a', title: 't', thumbnail: 'x' };
    expect(
      toVideos([ok, { id: 'b', title: 't' }, { id: 'c', title: 't', thumbnail: '' }, null])
    ).toEqual([ok]);
  });
});

describe('toPlaylists', () => {
  it('배열이 아니면 실패, id 없는 항목은 걸러낸다(제목은 비어도 된다)', () => {
    expect(() => toPlaylists({})).toThrow();
    expect(
      toPlaylists([{ id: 'A', title: '주일' }, { title: 'x' }, { id: 'B', title: '' }])
    ).toEqual([
      { id: 'A', title: '주일' },
      { id: 'B', title: '' },
    ]);
  });
});
