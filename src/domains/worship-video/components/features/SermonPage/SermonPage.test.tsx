import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SINGLES } from '@/domains/worship-video/api/sermonParse';
import {
  sermonDescriptionQueryKey,
  sermonLibraryQueryKey,
} from '@/domains/worship-video/api/worshipVideoQueries';
import type { Sermon } from '@/domains/worship-video/api/worshipVideo.types';

import { SermonPage } from './index';

const sermon = (over: Partial<Sermon> & Pick<Sermon, 'id' | 'date'>): Sermon => ({
  title: `제목 ${over.id}`,
  series: SINGLES,
  dateFrom: 'sermon',
  thumbnail: `https://i.ytimg.com/vi/${over.id}/hqdefault.jpg`,
  poster: `https://i.ytimg.com/vi/${over.id}/maxresdefault.jpg`,
  ...over,
});

// 최신순 — 사도행전 강해 20편(주 1회) + 마태복음강해 2편 + 단편 1편
const ACTS = Array.from({ length: 20 }, (_, i) => {
  const no = 20 - i;
  const day = new Date(Date.UTC(2026, 9, 25) - i * 7 * 864e5).toISOString().slice(0, 10);
  return sermon({
    id: `a${no}`,
    series: '사도행전 강해',
    no,
    date: day,
    passage: `사도행전 ${no}:1-5`,
  });
});
const LIB: Sermon[] = [
  ...ACTS,
  sermon({ id: 'm151', series: '마태복음강해', no: 151, date: '2025-01-26' }),
  sermon({ id: 'm150', series: '마태복음강해', no: 150, date: '2025-01-19' }),
  sermon({ id: 'one', occasion: '송구영신예배', date: '2024-12-31', dateFrom: 'upload' }),
];
const LONG = '[사도행전 강해 20]\n*설교본문: 사도행전 20:1-5\n셋째 줄\n넷째 줄\n#성복교회';

const renderPage = (sermons: Sermon[] = LIB, description: string | null = LONG) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(sermonLibraryQueryKey('sunday'), sermons);
  if (description !== null) {
    for (const s of sermons) {
      client.setQueryData(sermonDescriptionQueryKey('sunday', s.id), description);
    }
  }
  const view = render(
    <QueryClientProvider client={client}>
      <SermonPage page="sunday" />
    </QueryClientProvider>
  );
  return { ...view, client };
};
const findList = () => screen.getByRole('region', { name: '설교 찾기' });
const listItems = () => within(findList()).getAllByRole('listitem');

// 고른 뒤의 스크롤·포커스는 다음 프레임에 한다(새 영상으로 그려진 뒤) — 예약된 것을 모아 두었다가 돌린다
let frames: FrameRequestCallback[] = [];
const flushFrames = () =>
  act(() => {
    const run = frames;
    frames = [];
    run.forEach(cb => cb(0));
  });

beforeEach(() => {
  window.history.replaceState(null, '', '/worship/sunday');
  frames = [];
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
});

describe('SermonPage', () => {
  it('처음엔 최신 설교를 포스터로 보인다 — 누르면 그 자리에 유튜브 플레이어가 붙는다', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 2, name: '제목 a20' })).toBeInTheDocument();
    expect(document.querySelector('iframe')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '제목 a20 재생' }));
    const frame = document.querySelector('iframe')!;
    expect(frame.src).toContain('https://www.youtube-nocookie.com/embed/a20?autoplay=1');
    // 누른 버튼이 사라지므로 포커스를 플레이어로 옮긴다 — 문서 맨 위로 튀지 않게
    expect(frame).toHaveFocus();
  });

  it('포스터로 재생을 시작하면 그 영상을 주소에 남긴다(방문 기록은 그대로) — 보는 중에 새 설교가 올라와도 바뀌지 않는다', () => {
    const { client } = renderPage();
    const before = window.history.length;
    fireEvent.click(screen.getByRole('button', { name: '제목 a20 재생' }));
    expect(window.location.search).toBe('?v=a20');
    expect(window.history.length).toBe(before);

    // 다시 받기로 새 설교가 목록 맨 앞에 옴
    act(() => {
      client.setQueryData(sermonLibraryQueryKey('sunday'), [
        sermon({ id: 'new', date: '2026-11-01' }),
        ...LIB,
      ]);
    });
    expect(screen.getByRole('heading', { level: 2, name: '제목 a20' })).toBeInTheDocument();
    expect(document.querySelector('iframe')!.src).toContain('/embed/a20?');
  });

  it('지금 떠 있는(아직 포스터인) 영상을 목록에서 골라도 재생이 시작된다', () => {
    renderPage();
    expect(screen.queryByText('재생 중')).toBeNull(); // 재생 전에는 «재생 중» 을 붙이지 않는다
    fireEvent.click(within(listItems()[0]).getByRole('button'));

    expect(document.querySelector('iframe')!.src).toContain('/embed/a20?autoplay=1');
    expect(screen.getAllByText('재생 중').length).toBeGreaterThan(0);
  });

  it('이전·다음 편을 눌러도 누른 버튼이 남아 키보드 포커스를 잃지 않는다', () => {
    renderPage();
    const prev = screen.getByRole('button', { name: '이전 편: 19편' });
    prev.focus();
    fireEvent.click(prev);
    flushFrames();

    expect(screen.getByRole('heading', { level: 2, name: '제목 a19' })).toBeInTheDocument();
    expect(prev).toBeInTheDocument();
    expect(prev).toHaveFocus();
    expect(prev).toHaveAccessibleName('이전 편: 18편');
  });

  it('설명을 못 받으면 알리고 다시 받을 수 있다 — «설명 없음» 처럼 보이지 않게', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({}) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ body: '다시 받은 설명' }),
      });
    vi.stubGlobal('fetch', fetchMock);
    renderPage(LIB, null);

    expect(await screen.findByText(/설명을 불러오지 못했습니다/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(await screen.findByText('다시 받은 설명')).toBeInTheDocument();
    expect(screen.queryByText(/설명을 불러오지 못했습니다/)).toBeNull();
  });

  it('전체 목록에서 고르면 주소에 남기고(?v=) 포스터 없이 바로 재생한다', () => {
    renderPage();
    fireEvent.click(within(listItems()[3]).getByRole('button'));

    expect(window.location.search).toBe('?v=a17');
    expect(screen.getByRole('heading', { level: 2, name: '제목 a17' })).toBeInTheDocument();
    expect(document.querySelector('iframe')!.src).toContain('/embed/a17?autoplay=1');
  });

  it('플레이어가 화면 밖이면(아래 목록에서 고름) 플레이어로 올리고 포커스를 제목으로 옮긴다', () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    // 플레이어가 화면 위로 500px 지나가 있는 상태
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: -500,
      bottom: -300,
    } as DOMRect);
    Object.defineProperty(window, 'scrollY', { value: 1200, configurable: true });
    renderPage();
    fireEvent.click(within(listItems()[3]).getByRole('button'));
    flushFrames();

    expect(scrollTo).toHaveBeenCalledWith({ top: 700, behavior: 'smooth' });
    expect(screen.getByRole('heading', { level: 2, name: '제목 a17' })).toHaveFocus();
  });

  it('플레이어가 일부 가려진 채 이전·다음 편을 눌러도 포커스는 누른 버튼에 남는다 — 키보드로 이어서 넘길 수 있게', () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: -100,
      bottom: 300,
    } as DOMRect);
    renderPage();
    const prev = screen.getByRole('button', { name: '이전 편: 19편' });
    prev.focus();
    fireEvent.click(prev);
    flushFrames();

    expect(scrollTo).toHaveBeenCalled(); // 플레이어는 올려 보이고
    expect(prev).toHaveFocus(); // 포커스는 그대로
  });

  it('플레이어가 화면에 다 보이면(옆 회차 목록에서 고름) 스크롤하지 않는다', () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    renderPage(); // jsdom 의 위치값은 모두 0 — 화면 안에 다 보이는 것으로 본다
    const side = screen.getByRole('complementary', { name: '설교 목록' });
    fireEvent.click(within(side).getAllByRole('listitem')[2].querySelector('button')!);
    flushFrames();

    expect(screen.getByRole('heading', { level: 2, name: '제목 a18' })).toBeInTheDocument();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('주소의 ?v= 로 들어오면 그 영상을 포스터로 보이고, 목록에 없는 id 면 최신 설교로 떨어진다', () => {
    window.history.replaceState(null, '', '/worship/sunday?v=m150');
    const { unmount } = renderPage();
    expect(screen.getByRole('heading', { level: 2, name: '제목 m150' })).toBeInTheDocument();
    expect(document.querySelector('iframe')).toBeNull();
    unmount();

    window.history.replaceState(null, '', '/worship/sunday?v=deleted');
    renderPage();
    expect(screen.getByRole('heading', { level: 2, name: '제목 a20' })).toBeInTheDocument();
  });

  it('이전·다음 편 — 최신 편은 다음이 없고, 이전 편을 누르면 그 편으로 간다', () => {
    renderPage();
    expect(screen.getByRole('button', { name: '다음 편 없음(최신 편)' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '이전 편: 19편' }));
    expect(screen.getByRole('heading', { level: 2, name: '제목 a19' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다음 편: 20편' })).toBeEnabled();
  });

  it('단편 설교는 이전·다음 편 버튼이 없고, 날짜에 «업로드» 를 붙인다(설교일을 못 찾은 영상)', () => {
    window.history.replaceState(null, '', '/worship/sunday?v=one');
    renderPage();
    expect(screen.queryByRole('button', { name: /이전 편/ })).toBeNull();
    expect(screen.getAllByText('업로드 2024.12.31').length).toBeGreaterThan(0);
    expect(screen.getAllByText('송구영신예배').length).toBeGreaterThan(0);
  });

  it('설교 목록 — 칩을 누르면 그 시리즈의 회차가 보이고, 영상을 고르면 그 영상의 시리즈로 돌아온다', () => {
    renderPage();
    const side = screen.getByRole('complementary', { name: '설교 목록' });
    expect(within(side).getByText('재생목록 3개')).toBeInTheDocument();
    expect(within(side).getByRole('list', { name: '사도행전 강해 영상' })).toBeInTheDocument();

    fireEvent.click(within(side).getByRole('button', { name: '마태복음강해' }));
    const episodes = within(side).getByRole('list', { name: '마태복음강해 영상' });
    expect(within(episodes).getAllByRole('listitem')).toHaveLength(2);
    // 둘러보기만 했을 뿐 재생 중인 영상은 그대로
    expect(screen.getByRole('heading', { level: 2, name: '제목 a20' })).toBeInTheDocument();

    fireEvent.click(within(episodes).getAllByRole('button')[1]);
    expect(screen.getByRole('heading', { level: 2, name: '제목 m150' })).toBeInTheDocument();
    expect(within(side).getByRole('button', { name: '마태복음강해' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('전체 고르기 — 연도별로 모든 시리즈를 보이고, 고르면 닫힌다', () => {
    renderPage();
    const side = screen.getByRole('complementary', { name: '설교 목록' });
    const toggle = within(side).getByRole('button', { name: '전체 3개' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(within(side).getByText('2026년')).toBeInTheDocument();
    expect(within(side).getByText('영상 20개')).toBeInTheDocument();

    fireEvent.click(within(side).getByRole('button', { name: /단편 설교.*영상 1개/ }));
    expect(within(side).getByRole('list', { name: '단편 설교 영상' })).toBeInTheDocument();
    expect(within(side).queryByText('2026년')).toBeNull();
  });

  it('설명란 — 긴 설명은 접혀 있고 «더보기» 로 펼친다. 영상이 바뀌면 다시 접힌다', () => {
    renderPage();
    const more = screen.getByRole('button', { name: '…더보기' });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(more);
    expect(screen.getByRole('button', { name: '간략히' })).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('button', { name: '이전 편: 19편' }));
    expect(screen.getByRole('button', { name: '…더보기' })).toBeInTheDocument();
  });

  it('찾기 — 처음엔 12편만 그리고, 검색·시리즈·정렬은 받은 목록에서 바로 거른다', () => {
    renderPage();
    expect(listItems()).toHaveLength(12);
    expect(within(findList()).getByText('23편')).toBeInTheDocument();

    // «12장» 은 본문 표기(12:)로 찾는다
    fireEvent.change(screen.getByRole('searchbox', { name: '설교 검색' }), {
      target: { value: '12장' },
    });
    expect(listItems()).toHaveLength(1);
    expect(within(listItems()[0]).getByText('12:')).toBeInTheDocument(); // 강조된 조각

    fireEvent.change(screen.getByRole('searchbox', { name: '설교 검색' }), {
      target: { value: '없는 말' },
    });
    expect(within(findList()).getByText(/찾는 설교가 없습니다/)).toBeInTheDocument();

    fireEvent.change(screen.getByRole('searchbox', { name: '설교 검색' }), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: '시리즈' }), {
      target: { value: '마태복음강해' },
    });
    expect(listItems()).toHaveLength(2);

    fireEvent.change(screen.getByRole('combobox', { name: '시리즈' }), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: '오래된 순' }));
    expect(
      within(listItems()[0]).getByText(/송구영신예배 · 업로드 2024\.12\.31/)
    ).toBeInTheDocument();
  });

  it('무한스크롤 — 끝 표시가 화면 가까이 오면 12편씩 더 그리고, 다 그리면 끝 표시가 없다', () => {
    // 관찰을 시작하면 곧바로 «보인다» 고 알리는 관찰자
    const observers: (() => void)[] = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(private cb: IntersectionObserverCallback) {}
        observe(el: Element) {
          observers.push(() =>
            this.cb(
              [{ isIntersecting: true, target: el } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver
            )
          );
        }
        disconnect() {}
        unobserve() {}
      }
    );
    renderPage();
    expect(listItems()).toHaveLength(12);
    expect(within(findList()).getByRole('status')).toHaveTextContent('23편 중 12편 표시');

    act(() => observers.shift()!());
    expect(listItems()).toHaveLength(23);
    expect(within(findList()).getByRole('status')).toHaveTextContent('23편 중 23편 표시');
    // 다 그렸으면 끝 표시(다음 관찰)가 없다
    expect(observers).toHaveLength(0);
  });

  it('설교가 없으면 안내 문구만 보인다', () => {
    renderPage([]);
    expect(screen.getByRole('status')).toHaveTextContent('아직 등록된 설교 영상이 없습니다.');
  });
});
