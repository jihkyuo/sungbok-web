import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearPlayIntent,
  requestPlay,
  takeStepFocus,
  wantsPlay,
} from '@/domains/worship-video/api/playIntent';
import {
  rememberListScroll,
  resetSermonListState,
  takeListReturn,
} from '@/domains/worship-video/api/sermonListState';
import { SINGLES } from '@/domains/worship-video/api/sermonParse';
import {
  sermonDescriptionQueryKey,
  sermonLibraryQueryKey,
} from '@/domains/worship-video/api/worshipVideoQueries';
import type { Sermon } from '@/domains/worship-video/api/worshipVideo.types';

import { SermonWatchPage } from './index';

// 링크는 주소만 확인한다 — 눌러도 실제로 이동하지 않게(테스트에는 Next 라우터가 없다)
vi.mock('next/link', () => ({
  default: ({
    href,
    onClick,
    children,
    scroll,
    prefetch,
    ...rest
  }: ComponentProps<'a'> & { href: string; scroll?: boolean; prefetch?: boolean }) => (
    // Next 링크 전용 옵션(scroll·prefetch)은 <a> 에 넘기지 않고, 확인할 수 있게 data-* 로 적어 둔다
    <a
      href={href}
      data-scroll={scroll === undefined ? undefined : String(scroll)}
      data-prefetch={prefetch === undefined ? undefined : String(prefetch)}
      onClick={e => {
        onClick?.(e);
        e.preventDefault();
      }}
      {...rest}
    >
      {children}
    </a>
  ),
}));

// 사이트 스크롤(Lenis) — 기본은 없음(창 스크롤로 떨어진다). 운영에서는 늘 있으므로 그 경로는 테스트가 넣어 확인한다
const lenisBox = vi.hoisted(() => ({
  current: undefined as
    { resize: ReturnType<typeof vi.fn>; scrollTo: ReturnType<typeof vi.fn> } | undefined,
}));
vi.mock('lenis/react', () => ({ useLenis: () => lenisBox.current }));

const sermon = (over: Partial<Sermon> & Pick<Sermon, 'id' | 'date'>): Sermon => ({
  title: `제목 ${over.id}`,
  series: SINGLES,
  dateFrom: 'sermon',
  thumbnail: `https://i.ytimg.com/vi/${over.id}/hqdefault.jpg`,
  poster: `https://i.ytimg.com/vi/${over.id}/maxresdefault.jpg`,
  ...over,
});

// 최신순 — 사도행전 강해 20편 + 마태복음강해 2편 + 단편 2편
const ACTS = Array.from({ length: 20 }, (_, i) => {
  const no = 20 - i;
  const day = new Date(Date.UTC(2026, 9, 25) - i * 7 * 864e5).toISOString().slice(0, 10);
  return sermon({ id: `a${no}`, series: '사도행전 강해', no, date: day });
});
const LIB: Sermon[] = [
  ...ACTS,
  sermon({ id: 'm151', series: '마태복음강해', no: 151, date: '2025-01-26' }),
  sermon({ id: 'm150', series: '마태복음강해', no: 150, date: '2025-01-19' }),
  sermon({ id: 'one2', occasion: '송구영신예배', date: '2024-12-31' }),
  sermon({ id: 'one1', occasion: '성탄예배', date: '2024-12-25' }),
];
const LONG = '[사도행전 강해 20]\n*설교본문: 사도행전 20:1-5\n셋째 줄\n넷째 줄\n#성복교회';

// 실제 앱처럼 설교마다 화면을 새로 만든다 — Next 는 주소의 영상 id 가 바뀌면 그 아래 화면을 통째로 다시 만든다
const tree = (client: QueryClient, videoId: string) => (
  <QueryClientProvider client={client}>
    <SermonWatchPage key={videoId} page="sunday" videoId={videoId} />
  </QueryClientProvider>
);
const renderPage = (videoId = 'a20', sermons: Sermon[] | null = LIB) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  if (sermons) {
    client.setQueryData(sermonLibraryQueryKey('sunday'), sermons);
    for (const s of sermons) client.setQueryData(sermonDescriptionQueryKey('sunday', s.id), LONG);
  }
  const view = render(tree(client, videoId));
  return { ...view, go: (id: string) => view.rerender(tree(client, id)) };
};
const frame = () => document.querySelector('iframe')!;
const nav = () => screen.getByRole('navigation', { name: '설교 이동' });
const side = () => screen.getByRole('complementary', { name: '설교 목록' });
const episodes = () => within(side()).getAllByRole('listitem');
// 플레이어가 부모 창에 보내는 상태 알림
const playerSays = (playerState: number) =>
  act(() => {
    window.dispatchEvent(
      new MessageEvent('message', {
        data: JSON.stringify({ event: 'infoDelivery', info: { playerState } }),
        source: frame().contentWindow,
      })
    );
  });

// 화면 위치 맞추기는 다음 프레임에 한다 — 예약된 것을 모아 두었다가 돌린다
let frames: FrameRequestCallback[] = [];
const flushFrames = () =>
  act(() => {
    const run = frames;
    frames = [];
    run.forEach(cb => cb(0));
  });

beforeEach(() => {
  resetSermonListState();
  clearPlayIntent();
  lenisBox.current = undefined;
  document.documentElement.style.scrollPaddingTop = '';
  frames = [];
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
  vi.stubGlobal('cancelAnimationFrame', () => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
});

describe('SermonWatchPage — 플레이어', () => {
  it('처음부터 유튜브 플레이어를 둔다(우리 재생 버튼 없음) — 주소로 바로 들어오면 자동재생하지 않는다', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 2, name: '제목 a20' })).toBeInTheDocument();
    expect(frame().src).toBe(
      'https://www.youtube-nocookie.com/embed/a20?rel=0&playsinline=1&enablejsapi=1'
    );
    expect(frame().title).toBe('제목 a20 설교 영상');
    expect(screen.queryByRole('button', { name: /재생/ })).toBeNull();
  });

  it('설교를 눌러 넘어왔으면 들어오자마자 재생을 요청한다', () => {
    requestPlay('a20');
    renderPage();
    expect(frame().src).toContain('&autoplay=1');
  });

  it('재생 요청은 한 번 쓰고 지운다 — 뒤로·앞으로 가기로 다시 들어오면 누르지 않았으니 멈춘 채로 뜬다', () => {
    requestPlay('a20');
    const first = renderPage();
    expect(frame().src).toContain('&autoplay=1');
    expect(wantsPlay('a20')).toBe(false);
    first.unmount();

    renderPage();
    expect(frame().src).not.toContain('autoplay');
    expect(within(side()).getByText('현재 영상')).toBeInTheDocument();
  });

  it('보는 중에 다른 설교를 눌러도(이동 전) 지금 플레이어의 주소는 바뀌지 않는다 — 바뀌면 영상이 처음부터 다시 시작한다', () => {
    requestPlay('a20');
    const view = renderPage();
    const before = frame();
    requestPlay('a19');
    view.go('a20'); // 이동 전에 화면이 다시 그려진 경우
    expect(frame()).toBe(before);
    expect(frame().src).toContain('&autoplay=1');
  });

  it('다른 설교로 넘어가면 플레이어를 새로 붙인다', () => {
    const view = renderPage();
    const before = frame();
    requestPlay('a19');
    view.go('a19');
    expect(frame()).not.toBe(before);
    expect(frame().src).toBe(
      'https://www.youtube-nocookie.com/embed/a19?rel=0&playsinline=1&enablejsapi=1&autoplay=1'
    );
    expect(screen.getByRole('heading', { level: 2, name: '제목 a19' })).toBeInTheDocument();
  });
});

describe('SermonWatchPage — 이전 · 목록 · 다음', () => {
  it('시리즈는 회차 번호로 — 이전(오래된 편)·다음(최신 편) 설교 페이지로 가고 재생을 요청한다', () => {
    renderPage('a19');
    const older = within(nav()).getByRole('link', { name: '이전 편: 18편' });
    const newer = within(nav()).getByRole('link', { name: '다음 편: 20편' });
    expect(older).toHaveAttribute('href', '/worship/sunday/a18');
    expect(older).toHaveTextContent('18편');
    expect(newer).toHaveAttribute('href', '/worship/sunday/a20');
    fireEvent.click(older);
    expect(wantsPlay('a18')).toBe(true);
  });

  it('끝 편은 그쪽이 흐린 글자뿐이다(링크 아님) — «첫 편»·«최신 편»', () => {
    renderPage('a20');
    expect(within(nav()).queryByRole('link', { name: /다음/ })).toBeNull();
    expect(within(nav()).getByText('최신 편')).toHaveAttribute('aria-disabled', 'true');
    renderPage('a1');
    expect(screen.getAllByText('첫 편').at(-1)).toHaveAttribute('aria-disabled', 'true');
  });

  it('이전·다음으로 넘어오면 새 화면의 같은 쪽 링크에 키보드 포커스를 되돌려 놓는다(이어서 넘길 수 있게)', () => {
    const view = renderPage('a10');
    fireEvent.click(within(nav()).getByRole('link', { name: '이전 편: 9편' }));
    view.go('a9'); // 화면이 새로 만들어진다 — 누른 링크는 사라졌다
    expect(within(nav()).getByRole('link', { name: '이전 편: 8편' })).toHaveFocus();
  });

  it('넘어온 쪽이 끝 편이라 링크가 없으면 바로 옆 «목록» 으로 포커스를 옮긴다 — 문서 맨 위로 튀지 않게', () => {
    const view = renderPage('a19');
    fireEvent.click(within(nav()).getByRole('link', { name: '다음 편: 20편' }));
    view.go('a20');
    expect(within(nav()).getByRole('link', { name: '목록' })).toHaveFocus();
  });

  it('이전·다음으로 온 것이 아니면(목록·옆 목록·주소) 포커스를 건드리지 않는다', () => {
    renderPage('a10');
    expect(document.body).toHaveFocus();
  });

  it('새 탭으로 여는 클릭(Cmd·Ctrl)은 재생 요청·포커스 표시를 남기지 않는다', () => {
    renderPage('a10');
    fireEvent.click(within(nav()).getByRole('link', { name: '이전 편: 9편' }), { metaKey: true });
    expect(wantsPlay('a9')).toBe(false);
    expect(takeStepFocus()).toBeNull();
  });

  it('단편 설교도 단편끼리 날짜 순으로 넘어간다 — «이전»·«다음»', () => {
    renderPage('one2');
    const older = within(nav()).getByRole('link', { name: '이전 설교: 제목 one1' });
    expect(older).toHaveAttribute('href', '/worship/sunday/one1');
    expect(older).toHaveTextContent('이전');
    expect(within(nav()).getByText('다음')).toHaveAttribute('aria-disabled', 'true');
  });

  it('«목록» 은 설교 목록으로 — 보던 자리로 돌아간다고 표시해 둔다', () => {
    renderPage('a19');
    rememberListScroll('sunday', 1840);
    const toList = within(nav()).getByRole('link', { name: '목록' });
    expect(toList).toHaveAttribute('href', '/worship/sunday');
    // 화면을 맨 위로 올리지 않는다 — 자리는 목록 화면이 맞춘다
    expect(toList).toHaveAttribute('data-scroll', 'false');
    fireEvent.click(toList);
    expect(takeListReturn('sunday')).toBe(1840);
  });

  it('«목록» 을 새 탭으로 열면(Cmd·Ctrl) 돌아간다는 표시를 남기지 않는다 — 이 탭은 그대로다', () => {
    renderPage('a19');
    rememberListScroll('sunday', 1840);
    fireEvent.click(within(nav()).getByRole('link', { name: '목록' }), { ctrlKey: true });
    expect(takeListReturn('sunday')).toBeUndefined();
  });
});

describe('SermonWatchPage — 설명·공유', () => {
  it('설명란은 날짜 줄과 3줄만 보이고 «…더보기» 로 펼친다', () => {
    renderPage();
    expect(screen.getByText('2026.10.25')).toBeInTheDocument();
    const more = screen.getByRole('button', { name: '…더보기' });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(more);
    expect(screen.getByRole('button', { name: '간략히' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('«링크 복사» 는 이 페이지 주소를 복사하고 결과를 알린다', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderPage();
    // 휴대폰용(설명 아래)과 태블릿·PC용(분류 표시 옆) 두 벌 — 화면 폭에 따라 하나만 보인다
    const copies = screen.getAllByRole('button', { name: '링크 복사' });
    expect(copies).toHaveLength(2);
    await act(async () => {
      fireEvent.click(copies[0]);
    });
    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(screen.getAllByRole('status').at(-1)).toHaveTextContent('링크를 복사했습니다.');
  });

  it('«유튜브에서 보기» 는 유튜브의 그 영상을 새 창으로 연다', () => {
    renderPage('a19');
    for (const link of screen.getAllByRole('link', { name: /유튜브에서 보기/ })) {
      expect(link).toHaveAttribute('href', 'https://www.youtube.com/watch?v=a19');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});

describe('SermonWatchPage — 설교 목록(옆·아래)', () => {
  it('보고 있는 설교의 시리즈가 펼쳐져 있고, 그 설교에 표시가 붙는다 — 재생 전이면 «현재 영상»', () => {
    renderPage('a19');
    expect(within(side()).getByText('재생목록 3개')).toBeInTheDocument();
    expect(within(side()).getByRole('button', { name: '사도행전 강해' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(episodes()).toHaveLength(20);
    const current = within(side()).getByRole('link', { current: true });
    expect(current).toHaveAttribute('href', '/worship/sunday/a19');
    expect(within(current).getByText('현재 영상')).toBeInTheDocument();
  });

  it('눌러서 넘어온 설교는 «재생 중» 으로 표시한다', () => {
    requestPlay('a19');
    renderPage('a19');
    expect(within(side()).getByText('재생 중')).toBeInTheDocument();
  });

  it('플레이어가 알려 주는 상태를 따른다 — 재생하면 «재생 중», 멈추면 «현재 영상»', () => {
    renderPage('a19');
    playerSays(1);
    expect(within(side()).getByText('재생 중')).toBeInTheDocument();
    playerSays(2);
    expect(within(side()).getByText('현재 영상')).toBeInTheDocument();
    // 눌러서 넘어왔어도 자동재생이 막혀 멈춰 있으면(플레이어가 알려 준 대로) 재생 중이 아니다
    requestPlay('a19');
    playerSays(-1);
    expect(within(side()).getByText('현재 영상')).toBeInTheDocument();
  });

  it('다른 설교를 눌러도(이동 전) 지금 영상의 표시는 그대로다 — 요청이 옮겨 갔다고 «현재 영상» 으로 바뀌지 않는다', () => {
    requestPlay('a19');
    const view = renderPage('a19');
    requestPlay('a18');
    view.go('a19'); // 이동 전에 화면이 다시 그려진 경우
    expect(within(side()).getByText('재생 중')).toBeInTheDocument();
  });

  it('회차를 누르면 그 설교 페이지로 가고 재생을 요청한다', () => {
    renderPage('a19');
    const third = within(episodes()[2]).getByRole('link');
    expect(third).toHaveAttribute('href', '/worship/sunday/a18');
    expect(third).toHaveAttribute('data-prefetch', 'false'); // 회차마다 미리 받지 않는다
    fireEvent.click(third);
    expect(wantsPlay('a18')).toBe(true);
  });

  it('다른 시리즈 칩을 눌러 둘러봐도 보던 영상은 그대로 재생된다 — 표시는 그 영상이 든 시리즈에서만 보인다', () => {
    renderPage('a19');
    const before = frame();
    fireEvent.click(within(side()).getByRole('button', { name: '마태복음강해' }));
    expect(frame()).toBe(before);
    expect(episodes()).toHaveLength(2);
    expect(within(side()).queryByText('현재 영상')).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: '제목 a19' })).toBeInTheDocument();
  });

  it('«전체 N개» 로 모든 시리즈를 연도별로 펼쳐 고른다', () => {
    renderPage('a19');
    const all = within(side()).getByRole('button', { name: '전체 3개' });
    expect(all).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(all);
    expect(within(side()).getByText('2026년')).toBeInTheDocument();
    expect(within(side()).getByText('단편')).toBeInTheDocument();
    fireEvent.click(within(side()).getByRole('button', { name: /단편 설교\s*영상 2개/ }));
    expect(episodes()).toHaveLength(2);
    // 고르면 상자가 닫히고, 누른 카드가 사라지므로 포커스는 상자를 연 버튼으로 돌아온다
    expect(within(side()).getByRole('button', { name: '전체 3개' })).toHaveFocus();
  });

  it('다른 설교로 넘어가면 둘러보던 시리즈는 잊고 그 설교의 시리즈를 펼친다', () => {
    const view = renderPage('a19');
    fireEvent.click(within(side()).getByRole('button', { name: '마태복음강해' }));
    view.go('one2');
    expect(within(side()).getByRole('button', { name: SINGLES })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(episodes()).toHaveLength(2);
  });
});

describe('SermonWatchPage — 화면 위치', () => {
  const place = (playerTop: number, navBottom: number) => {
    vi.spyOn(frame().parentElement!.parentElement!, 'getBoundingClientRect').mockReturnValue({
      top: playerTop,
    } as DOMRect);
    vi.spyOn(nav(), 'getBoundingClientRect').mockReturnValue({ bottom: navBottom } as DOMRect);
  };

  it('눌러서 넘어왔는데 플레이어~이동 버튼이 한 화면에 안 들어오면 플레이어가 맨 위에 오게 맞춘다', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    requestPlay('a19');
    renderPage('a19');
    place(368, 883); // 화면 높이(jsdom 768)를 넘는다
    flushFrames();
    expect(scrollTo).toHaveBeenCalledWith({ top: 368, behavior: 'instant' });
  });

  it('한 화면에 다 들어오면 그대로 둔다', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    requestPlay('a19');
    renderPage('a19');
    place(245, 577);
    flushFrames();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('주소로 바로 들어온 경우에는 맨 위 그대로 둔다', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    renderPage('a19');
    flushFrames();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('사이트 스크롤(Lenis)이 있으면 페이지 크기를 다시 재게 한 뒤, 고정 헤더 여백만큼 띄워 바로 간다', () => {
    lenisBox.current = { resize: vi.fn(), scrollTo: vi.fn() };
    document.documentElement.style.scrollPaddingTop = '80px';
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    requestPlay('a19');
    renderPage('a19');
    place(368, 883);
    flushFrames();
    const { resize, scrollTo: lenisScrollTo } = lenisBox.current;
    expect(lenisScrollTo).toHaveBeenCalledWith(288, { immediate: true }); // 368 − 80
    expect(resize.mock.invocationCallOrder[0]).toBeLessThan(
      lenisScrollTo.mock.invocationCallOrder[0]
    );
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('플레이어가 고정 헤더에 가려 있으면(위로 넘어가 있으면) 맞춘다', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    document.documentElement.style.scrollPaddingTop = '80px';
    requestPlay('a19');
    renderPage('a19');
    place(40, 500); // 헤더 여백 80px 보다 위
    flushFrames();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
  });
});

describe('SermonWatchPage — 상태', () => {
  it('목록에 없는 영상이면 찾을 수 없다고 알리고 목록으로 보낸다', () => {
    renderPage('nope');
    expect(screen.getByRole('status')).toHaveTextContent('이 설교 영상을 찾을 수 없습니다.');
    expect(screen.getByRole('link', { name: '설교 목록' })).toHaveAttribute(
      'href',
      '/worship/sunday'
    );
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('설교가 한 편도 없으면 그렇게 알린다', () => {
    renderPage('a20', []);
    expect(screen.getByRole('status')).toHaveTextContent('아직 등록된 설교 영상이 없습니다.');
  });
});
