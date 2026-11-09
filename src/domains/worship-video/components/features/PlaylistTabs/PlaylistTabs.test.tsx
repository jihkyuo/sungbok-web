import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  PLAYLISTS_QUERY_KEY,
  playlistVideosQueryKey,
} from '@/domains/worship-video/api/worshipVideoQueries';

import { PlaylistTabs } from './index';

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

type Res = { ok: boolean; status: number; json: () => Promise<unknown> };
const okRes = (body: unknown): Res => ({ ok: true, status: 200, json: async () => body });
const fail = (status: number): Res => ({ ok: false, status, json: async () => ({}) });
const videosOf = (id: string) => [
  { id: `${id}-v1`, title: `${id} 영상`, thumbnail: 'https://i.ytimg.com/vi/x/hq.jpg' },
];
const PLAYLISTS = [
  { id: 'A', title: '탭A' },
  { id: 'B', title: '탭B' },
];

const fetchMock = vi.fn();
// 상황별 응답 — 기본은 모두 성공. 테스트가 바꾼다.
let playlistsRes: () => Res | Promise<Res>;
let videosRes: (id: string) => Res | Promise<Res>;

beforeEach(() => {
  playlistsRes = () => okRes(PLAYLISTS);
  videosRes = id => okRes(videosOf(id));
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (url: string) => {
    if (url === '/api/worship-video/playlists') return playlistsRes();
    return videosRes(new URL(url, 'http://x').searchParams.get('playlistId') ?? '');
  });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

let client: QueryClient;
const setup = ({
  hydrate,
  wrap = n => n,
}: { hydrate?: QueryClient; wrap?: (n: ReactNode) => ReactNode } = {}) => {
  client = new QueryClient(); // 재시도 정책은 훅이 정한다 — 기본값을 두지 않는다
  const tabs = hydrate ? (
    <HydrationBoundary state={dehydrate(hydrate)}>
      <PlaylistTabs />
    </HydrationBoundary>
  ) : (
    <PlaylistTabs />
  );
  return render(wrap(<QueryClientProvider client={client}>{tabs}</QueryClientProvider>));
};

const fetchedFor = (id: string) =>
  fetchMock.mock.calls.filter(([url]) => String(url).includes(`playlistId=${id}`)).length;
const FAIL = '영상 목록을 불러오지 못했습니다.';
const LOADING = '영상 목록을 불러오는 중입니다.';

describe('PlaylistTabs', () => {
  it('서버가 미리 채운 재생목록·첫 탭 영상이 있으면 요청 없이 바로 보인다', () => {
    const server = new QueryClient();
    server.setQueryData(PLAYLISTS_QUERY_KEY, PLAYLISTS);
    server.setQueryData(playlistVideosQueryKey('A'), videosOf('A'));
    setup({ hydrate: server });
    expect(screen.getByRole('tab', { name: '탭A' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('A 영상')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('서버가 못 채웠으면(빌드 중 실패 등) 화면이 재생목록·첫 탭 영상을 직접 받는다', async () => {
    setup();
    expect(screen.getByText(LOADING)).toBeInTheDocument();
    expect(await screen.findByText('A 영상')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/worship-video/playlists');
  });

  it('재생목록을 다시 받았는데 보던 탭이 빠졌으면 첫 탭으로 — 탭 버튼만 남고 내용이 비지 않게', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(await screen.findByRole('tab', { name: '탭B' }));
    expect(await screen.findByText('B 영상')).toBeInTheDocument();

    playlistsRes = () => okRes([{ id: 'A', title: '탭A' }]); // B 가 빠짐
    await act(() => client.refetchQueries({ queryKey: PLAYLISTS_QUERY_KEY }));
    // react-query 는 변경 알림을 다음 틱에 보낸다 — 화면 갱신을 기다린다
    await waitFor(() => expect(screen.queryByRole('tab', { name: '탭B' })).toBeNull());
    expect(screen.getByRole('tab', { name: '탭A' })).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByText('A 영상')).toBeInTheDocument();

    playlistsRes = () => okRes(PLAYLISTS); // B 가 다시 생겨도 저절로 B 로 돌아가지 않는다
    await act(() => client.refetchQueries({ queryKey: PLAYLISTS_QUERY_KEY }));
    await screen.findByRole('tab', { name: '탭B' });
    expect(screen.getByRole('tab', { name: '탭A' })).toHaveAttribute('aria-selected', 'true');
  });

  it('상태 문구는 화면낭독기가 읽는다(role=status)', async () => {
    setup();
    expect(screen.getByRole('status')).toHaveTextContent(LOADING);
  });

  it('재생목록에 볼 수 있는 영상이 없으면 그 문구도 알림 영역 안에서 읽힌다', async () => {
    videosRes = () => okRes([]);
    setup();
    expect(
      await screen.findByText('이 재생목록에 볼 수 있는 영상이 없습니다.')
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      '이 재생목록에 볼 수 있는 영상이 없습니다.'
    );
  });

  it('재생목록이 정말 없으면 «없음»을 말한다', async () => {
    playlistsRes = () => okRes([]);
    setup();
    expect(await screen.findByText('아직 등록된 영상 재생목록이 없습니다.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('아직 등록된 영상 재생목록이 없습니다.');
  });

  it('재생목록 받기가 실패하면 실패 문구와 «다시 시도»', async () => {
    playlistsRes = () => fail(502);
    const user = userEvent.setup();
    setup();
    expect(await screen.findByText(FAIL)).toBeInTheDocument();
    // 알림 영역(role=status)은 불러오는 중 → 실패로 바뀌어도 그대로 남고 글자만 바뀐다 — 화면낭독기가 변화를 읽게
    expect(screen.getByRole('status')).toHaveTextContent(FAIL);
    let release: (r: Res) => void = () => {};
    playlistsRes = () => new Promise<Res>(r => (release = r));
    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    // 불러오는 중으로 바뀌어도 포커스는 같은 자리에 — 문서 맨 위로 튀지 않게
    expect(screen.getByText(LOADING)).toBeInTheDocument();
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toHaveAttribute('data-focus-host');
    await act(async () => release(okRes(PLAYLISTS)));
    expect(await screen.findByText('A 영상')).toBeInTheDocument();
    // 성공해서 탭이 나타나도 포커스는 같은 자리(탭을 감싼 상자)에 — 문서 맨 위로 튀지 않게
    expect(document.activeElement).toHaveAttribute('data-focus-host');
  });

  it('실패한 탭은 그 탭만 실패 문구, 다른 탭을 들렀다 돌아오면 알아서 다시 받는다', async () => {
    videosRes = id => (id === 'A' ? fail(502) : okRes(videosOf(id)));
    const user = userEvent.setup();
    setup();
    expect(await screen.findByText(FAIL)).toBeInTheDocument();

    videosRes = id => okRes(videosOf(id)); // 회복
    await user.click(screen.getByRole('tab', { name: '탭B' }));
    expect(await screen.findByText('B 영상')).toBeInTheDocument();
    expect(screen.queryByText(FAIL)).toBeNull();

    await user.click(screen.getByRole('tab', { name: '탭A' }));
    expect(await screen.findByText('A 영상')).toBeInTheDocument();
  });

  it('«다시 시도» 로 그 자리에서 다시 받고, 포커스는 그 탭 버튼으로 옮긴다(포커스가 보이는 곳)', async () => {
    videosRes = id => (id === 'A' ? fail(502) : okRes(videosOf(id)));
    const user = userEvent.setup();
    setup();
    expect(await screen.findByText(FAIL)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(FAIL); // 탭 안에서도 알림 영역은 하나로 남는다
    videosRes = id => okRes(videosOf(id));
    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(screen.getByRole('tab', { name: '탭A' })).toHaveFocus(); // 사라질 버튼 대신 — 문서 맨 위로 튀지 않게
    expect(await screen.findByText('A 영상')).toBeInTheDocument();
  });

  it('불러오는 도중 떠났다 돌아와도 처음부터 다시 받지 않는다(받던 요청을 이어 받는다)', async () => {
    let release: (r: Res) => void = () => {};
    videosRes = id => (id === 'A' ? new Promise<Res>(r => (release = r)) : okRes(videosOf(id)));
    const user = userEvent.setup();
    setup();
    expect(await screen.findByText('탭B')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: '탭B' }));
    expect(await screen.findByText('B 영상')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: '탭A' }));
    await act(async () => release(okRes(videosOf('A'))));
    expect(await screen.findByText('A 영상')).toBeInTheDocument();
    expect(fetchedFor('A')).toBe(1);
  });

  it('성공한 탭은 다른 탭을 다녀와도 다시 요청하지 않는다(캐시 유지)', async () => {
    const user = userEvent.setup();
    setup();
    expect(await screen.findByText('A 영상')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: '탭B' }));
    expect(await screen.findByText('B 영상')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: '탭A' }));
    expect(await screen.findByText('A 영상')).toBeInTheDocument();
    expect(fetchedFor('A')).toBe(1);
  });

  it('개발 모드(StrictMode)에서도 요청은 한 번', async () => {
    setup({ wrap: n => <StrictMode>{n}</StrictMode> });
    expect(await screen.findByText('A 영상')).toBeInTheDocument();
    expect(fetchedFor('A')).toBe(1);
  });

  it('쿼터 소진(429)은 다시 요청하지 않는다 — 쿼터를 더 태우지 않게', async () => {
    videosRes = () => fail(429);
    setup();
    expect(await screen.findByText(FAIL)).toBeInTheDocument();
    await act(() => new Promise(r => setTimeout(r, 1200))); // 재시도가 있었다면 1초 안에 나간다
    expect(fetchedFor('A')).toBe(1);
  });

  it('유튜브 일시 장애(503)는 잠시 뒤 다시 시도해 회복한다', async () => {
    let first = true;
    videosRes = id => {
      if (first) {
        first = false;
        return fail(503);
      }
      return okRes(videosOf(id));
    };
    setup();
    expect(await screen.findByText('A 영상', undefined, { timeout: 3000 })).toBeInTheDocument();
    expect(fetchedFor('A')).toBe(2);
  });
});
