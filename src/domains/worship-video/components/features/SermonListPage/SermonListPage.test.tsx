import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearPlayIntent, wantsPlay } from '@/domains/worship-video/api/playIntent';
import {
  markListReturn,
  rememberListScroll,
  resetSermonListState,
  takeListReturn,
} from '@/domains/worship-video/api/sermonListState';
import { SINGLES } from '@/domains/worship-video/api/sermonParse';
import { sermonLibraryQueryKey } from '@/domains/worship-video/api/worshipVideoQueries';
import type { Sermon } from '@/domains/worship-video/api/worshipVideo.types';

import { SermonListPage } from './index';

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

// 최신순 — 사도행전 강해 20편(주 1회, 최신 2026-10-25 주일) + 마태복음강해 2편 + 단편 1편
const ACTS = Array.from({ length: 20 }, (_, i) => {
  const no = 20 - i;
  const day = new Date(Date.UTC(2026, 9, 25) - i * 7 * 864e5).toISOString().slice(0, 10);
  return sermon({
    id: `a${no}`,
    series: '사도행전 강해',
    no,
    date: day,
    passage: `사도행전 ${no}:1-5`,
    preacher: '이요셉 목사',
  });
});
const LIB: Sermon[] = [
  ...ACTS,
  sermon({ id: 'm151', series: '마태복음강해', no: 151, date: '2025-01-26' }),
  sermon({ id: 'm150', series: '마태복음강해', no: 150, date: '2025-01-19' }),
  sermon({ id: 'one', occasion: '송구영신예배', date: '2024-12-31', dateFrom: 'upload' }),
];

const renderPage = (sermons: Sermon[] | null = LIB) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  if (sermons) client.setQueryData(sermonLibraryQueryKey('sunday'), sermons);
  return render(
    <QueryClientProvider client={client}>
      <SermonListPage page="sunday" />
    </QueryClientProvider>
  );
};
const list = () => screen.getByRole('region', { name: '설교 목록' });
const rows = () => within(list()).queryAllByRole('listitem');
const rowLinks = () => rows().map(li => within(li).getByRole('link'));
const search = () => within(list()).getByRole('searchbox', { name: '설교 검색' });
const chips = () => within(list()).getByRole('group', { name: '시리즈' });

beforeEach(() => {
  resetSermonListState();
  clearPlayIntent();
  lenisBox.current = undefined;
});
afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
});

describe('SermonListPage — 최신 설교', () => {
  it('가장 최근 설교 한 편을 크게 보인다 — 날짜·요일, 본문, 설교자', () => {
    renderPage();
    const latest = screen.getByRole('region', { name: '제목 a20' });
    expect(within(latest).getByText('최신 설교')).toBeInTheDocument();
    expect(within(latest).getByText('2026.10.25 · 주일')).toBeInTheDocument();
    expect(within(latest).getByText('사도행전 20:1-5')).toBeInTheDocument();
    expect(within(latest).getByText('이요셉 목사')).toBeInTheDocument();
  });

  it('«설교 시청하기» 는 그 설교 페이지로 가고, 들어가자마자 재생하게 요청한다', () => {
    renderPage();
    const cta = screen.getByRole('link', { name: '설교 시청하기' });
    expect(cta).toHaveAttribute('href', '/worship/sunday/a20');
    expect(wantsPlay('a20')).toBe(false);
    fireEvent.click(cta);
    expect(wantsPlay('a20')).toBe(true);
  });

  it('«설교 시청하기» 로 떠날 때도 돌아올 자리를 적어 둔다', () => {
    renderPage();
    Object.defineProperty(window, 'scrollY', { value: 120, configurable: true });
    fireEvent.click(screen.getByRole('link', { name: '설교 시청하기' }));
    markListReturn('sunday');
    expect(takeListReturn('sunday')).toBe(120);
  });

  it('새 탭으로 여는 클릭(Cmd·Ctrl)은 재생 요청을 남기지 않는다 — 이 탭은 그대로다', () => {
    renderPage();
    fireEvent.click(screen.getByRole('link', { name: '설교 시청하기' }), { metaKey: true });
    fireEvent.click(rowLinks()[0], { ctrlKey: true });
    expect(wantsPlay('a20')).toBe(false);
    expect(wantsPlay('a19')).toBe(false);
  });

  it('표지도 같은 곳으로 가지만 키보드·화면낭독기에는 «설교 시청하기» 하나만 보인다(같은 링크를 두 번 거치지 않게)', () => {
    renderPage();
    const latest = screen.getByRole('region', { name: '제목 a20' });
    expect(within(latest).getAllByRole('link')).toHaveLength(1);
    const cover = latest.querySelector('a[aria-hidden="true"]')!;
    expect(cover).toHaveAttribute('href', '/worship/sunday/a20');
    expect(cover).toHaveAttribute('tabindex', '-1');
  });

  it('설교가 한 편뿐이면 그 한 편은 «최신 설교» 에만 보인다 — 아래 목록에 «검색 결과가 없습니다» 를 띄우지 않는다', () => {
    renderPage([sermon({ id: 'x', date: '2026-12-31' })]);
    expect(rows()).toHaveLength(0);
    expect(within(list()).getByText('1편')).toBeInTheDocument();
    expect(within(list()).queryByText('검색 결과가 없습니다.')).toBeNull();
  });

  it('본문·설교자가 없는 설교는 그 줄을 그리지 않는다', () => {
    renderPage([sermon({ id: 'x', date: '2026-12-31' })]);
    const latest = screen.getByRole('region', { name: '제목 x' });
    expect(within(latest).queryByText('본문')).toBeNull();
    expect(within(latest).queryByText('설교')).toBeNull();
    // 주일이 아닌 날은 요일 이름
    expect(within(latest).getByText('2026.12.31 · 목요일')).toBeInTheDocument();
  });
});

describe('SermonListPage — 설교 목록', () => {
  it('첫 화면은 최신 설교를 뺀 12편 — 위에 크게 보인 설교를 두 번 그리지 않는다. 편수는 전체', () => {
    renderPage();
    expect(rows()).toHaveLength(12);
    expect(rowLinks()[0]).toHaveAttribute('href', '/worship/sunday/a19');
    expect(within(list()).getByText('23편')).toBeInTheDocument();
  });

  it('설교 줄은 미리 받지 않는다 — 줄마다 목록 전체가 실린 설교 페이지를 받지 않게', () => {
    renderPage();
    for (const link of rowLinks()) expect(link).toHaveAttribute('data-prefetch', 'false');
  });

  it('설교 줄을 누르면 재생을 요청하고 돌아올 자리(스크롤 위치)를 적어 둔다', () => {
    renderPage();
    Object.defineProperty(window, 'scrollY', { value: 1840, configurable: true });
    fireEvent.click(rowLinks()[2]);
    expect(wantsPlay('a17')).toBe(true);
    markListReturn('sunday');
    expect(takeListReturn('sunday')).toBe(1840);
  });

  it('«설교 더보기» 를 누르면 12편씩 더 보이고, 다 보이면 버튼이 사라진다 — 키보드 포커스는 새로 나온 첫 설교로', () => {
    renderPage();
    fireEvent.click(within(list()).getByRole('button', { name: '설교 더보기' }));
    expect(rows()).toHaveLength(22);
    expect(rowLinks()[12]).toHaveFocus();
    expect(within(list()).queryByRole('button', { name: '설교 더보기' })).toBeNull();
    expect(within(list()).getByRole('status')).toHaveTextContent('23편 중 22편 표시');
  });

  it('검색 — 치는 대로 걸러지고(검색 버튼 없음) 맞은 글자를 표시한다. 조건을 걸면 최신 설교도 결과에 나온다', () => {
    renderPage();
    expect(within(list()).queryByRole('button', { name: '검색' })).toBeNull();
    fireEvent.change(search(), { target: { value: '20장' } });
    expect(rowLinks().map(a => a.getAttribute('href'))).toEqual(['/worship/sunday/a20']);
    expect(list().querySelector('mark')).toHaveTextContent('20:');
    expect(within(list()).getByText('1편')).toBeInTheDocument();
  });

  it('검색 결과가 없으면 한 문장으로 알린다', () => {
    renderPage();
    fireEvent.change(search(), { target: { value: '없는말' } });
    expect(rows()).toHaveLength(0);
    expect(within(list()).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('시리즈 칩 — 전체와 모든 시리즈가 한 줄에 있고, 고르면 그 시리즈만 보인다', () => {
    renderPage();
    const names = within(chips())
      .getAllByRole('button')
      .map(b => b.textContent);
    expect(names).toEqual(['전체', '사도행전 강해', '마태복음강해', SINGLES]);
    expect(within(chips()).getByRole('button', { name: '전체' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    fireEvent.click(within(chips()).getByRole('button', { name: '마태복음강해' }));
    expect(rowLinks().map(a => a.getAttribute('href'))).toEqual([
      '/worship/sunday/m151',
      '/worship/sunday/m150',
    ]);
    expect(within(chips()).getByRole('button', { name: '마태복음강해' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('조건을 바꾸면 첫 12편부터 다시 보인다', () => {
    renderPage();
    fireEvent.click(within(list()).getByRole('button', { name: '설교 더보기' }));
    fireEvent.click(within(chips()).getByRole('button', { name: '사도행전 강해' }));
    expect(rows()).toHaveLength(12);
  });

  it('오래된 순 — 가장 오래된 설교부터, 최신 설교도 목록 끝에 나온다', () => {
    renderPage();
    fireEvent.click(within(list()).getByRole('button', { name: '오래된 순' }));
    expect(rowLinks()[0]).toHaveAttribute('href', '/worship/sunday/one');
    fireEvent.click(within(list()).getByRole('button', { name: '설교 더보기' }));
    expect(rowLinks().at(-1)).toHaveAttribute('href', '/worship/sunday/a20');
  });

  it('업로드 날짜로 대신한 설교는 «업로드» 를 붙인다', () => {
    renderPage();
    fireEvent.click(within(chips()).getByRole('button', { name: SINGLES }));
    expect(rows()[0]).toHaveTextContent('송구영신예배 · 업로드 2024.12.31');
  });

  it('설교를 보고 돌아와도(화면이 새로 만들어져도) 검색어·시리즈·보인 편수가 그대로다', () => {
    const first = renderPage();
    fireEvent.click(within(chips()).getByRole('button', { name: '사도행전 강해' }));
    fireEvent.click(within(list()).getByRole('button', { name: '설교 더보기' }));
    expect(rows()).toHaveLength(20);
    first.unmount();

    renderPage();
    expect(rows()).toHaveLength(20);
    expect(within(chips()).getByRole('button', { name: '사도행전 강해' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});

describe('SermonListPage — 돌아올 자리', () => {
  it('설교 페이지의 «목록» 으로 돌아왔으면 떠날 때의 자리로 간다', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    rememberListScroll('sunday', 1840);
    markListReturn('sunday');
    renderPage();
    expect(scrollTo).toHaveBeenCalledWith({ top: 1840, behavior: 'instant' });
  });

  it('메뉴로 새로 들어온 경우에는 화면 위치를 건드리지 않고, 적어 둔 자리는 버린다', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    rememberListScroll('sunday', 1840);
    renderPage();
    expect(scrollTo).not.toHaveBeenCalled();
    // 나중에 «목록» 으로 돌아와도 그 낡은 자리로 가지 않는다
    markListReturn('sunday');
    expect(takeListReturn('sunday')).toBe(0);
  });

  it('사이트 스크롤(Lenis)이 있으면 페이지 크기를 다시 재게 한 뒤 그 자리로 바로 간다', () => {
    // 방금 떠난 설교 페이지가 더 짧다 — 다시 재지 않으면 그 페이지의 스크롤 한도에 잘린다
    lenisBox.current = { resize: vi.fn(), scrollTo: vi.fn() };
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    rememberListScroll('sunday', 1840);
    markListReturn('sunday');
    renderPage();
    const { resize, scrollTo: lenisScrollTo } = lenisBox.current;
    expect(lenisScrollTo).toHaveBeenCalledWith(1840, { immediate: true, force: true });
    expect(resize.mock.invocationCallOrder[0]).toBeLessThan(
      lenisScrollTo.mock.invocationCallOrder[0]
    );
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

describe('SermonListPage — 상태', () => {
  it('설교가 한 편도 없으면 그렇게 알린다', () => {
    renderPage([]);
    expect(screen.getByRole('status')).toHaveTextContent('아직 등록된 설교 영상이 없습니다.');
  });

  it('받는 중에는 불러오는 중이라고 알린다', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {}))
    );
    renderPage(null);
    expect(screen.getByRole('status')).toHaveTextContent('영상 목록을 불러오는 중입니다.');
    vi.unstubAllGlobals();
  });
});
