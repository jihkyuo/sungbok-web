import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PlaylistVideo } from '@/domains/worship-video/api/worshipVideo.types';

const videos = { list: [] as PlaylistVideo[] };
const lenisRef = vi.hoisted(() => ({ current: undefined as unknown }));
vi.mock('lenis/react', () => ({ useLenis: () => lenisRef.current }));
vi.mock('next/image', () => ({
  default: ({ alt, unoptimized }: { alt: string; unoptimized?: boolean }) => (
    <span data-alt={alt} data-unoptimized={String(!!unoptimized)} />
  ),
}));

import { PlaylistGrid } from './index';

const make = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: `v${i + 1}`,
    title: `영상 ${i + 1}`,
    thumbnail: `https://i.ytimg.com/vi/v${i}/hqdefault.jpg`,
  }));

let lenis: { resize: ReturnType<typeof vi.fn>; scrollTo: ReturnType<typeof vi.fn> };
beforeEach(() => {
  lenis = { resize: vi.fn(), scrollTo: vi.fn() };
  lenisRef.current = lenis; // 사이트는 늘 ReactLenis(root) 안 — 스크롤은 Lenis 한 경로
});

describe('PlaylistGrid', () => {
  it('쪽을 넘기면 그 쪽 영상으로 바뀌고, 목록 위가 화면 밖이면 목록 처음으로 올려 준다', async () => {
    videos.list = make(25);
    render(<PlaylistGrid videos={videos.list} />);
    expect(screen.getByText('영상 1')).toBeInTheDocument();
    const top = screen.getByTestId('playlist-top');
    top.getBoundingClientRect = () => ({ top: -400 }) as DOMRect;
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByText('영상 11')).toBeInTheDocument();
    expect(screen.queryByText('영상 1')).toBeNull();
    // 새 쪽이 그려진 뒤(다음 프레임)에 잰다
    await waitFor(() => expect(lenis.scrollTo).toHaveBeenCalled());
  });

  it('썸네일 대체 텍스트는 비운다 — 바로 아래 제목과 두 번 읽히지 않게', () => {
    videos.list = make(1);
    const { container } = render(<PlaylistGrid videos={videos.list} />);
    expect(container.querySelector('[data-alt]')).toHaveAttribute('data-alt', '');
  });

  it('지금 보는 쪽을 다시 눌러도 위로 튀지 않는다', async () => {
    videos.list = make(25);
    render(<PlaylistGrid videos={videos.list} />);
    const top = screen.getByTestId('playlist-top');
    top.getBoundingClientRect = () => ({ top: -400 }) as DOMRect;
    await userEvent.click(screen.getByRole('button', { name: '1' }));
    await new Promise(r => requestAnimationFrame(() => r(null)));
    expect(lenis.scrollTo).not.toHaveBeenCalled();
  });

  it('Lenis 가 있으면 Lenis 로 움직이고 헤더 여백은 Lenis 에 맡긴다(scroll-padding 을 두 번 빼지 않게)', async () => {
    videos.list = make(25);
    render(<PlaylistGrid videos={videos.list} />);
    const top = screen.getByTestId('playlist-top');
    top.getBoundingClientRect = () => ({ top: -400 }) as DOMRect;
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    await waitFor(() => expect(lenis.scrollTo).toHaveBeenCalledWith(top, { immediate: false }));
  });

  it('목록 위로 올려 줄 때 키보드 포커스도 목록 처음으로 옮긴다(아래 페이지 줄에 남지 않게)', async () => {
    videos.list = make(25);
    render(<PlaylistGrid videos={videos.list} />);
    const top = screen.getByTestId('playlist-top');
    top.getBoundingClientRect = () => ({ top: -400 }) as DOMRect;
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    await waitFor(() => expect(top).toHaveFocus());
  });

  it('허용 목록(i.ytimg.com/vi/) 밖 썸네일은 최적화 없이 그대로 쓴다 — 한 장 때문에 탭이 깨지지 않게', () => {
    videos.list = [
      { id: 'a', title: '영상 a', thumbnail: 'https://i.ytimg.com/vi/a/hqdefault.jpg' },
      { id: 'b', title: '영상 b', thumbnail: 'https://i9.ytimg.com/vi_webp/b/x.webp' },
    ];
    const { container } = render(<PlaylistGrid videos={videos.list} />);
    const imgs = container.querySelectorAll('[data-alt]');
    expect(imgs[0]).toHaveAttribute('data-unoptimized', 'false');
    expect(imgs[1]).toHaveAttribute('data-unoptimized', 'true');
  });

  it('Lenis 가 없어도(다른 레이아웃) 목록 처음으로 올리고 포커스를 옮긴다', async () => {
    lenisRef.current = undefined;
    Element.prototype.scrollIntoView = vi.fn();
    videos.list = make(25);
    render(<PlaylistGrid videos={videos.list} />);
    const top = screen.getByTestId('playlist-top');
    top.getBoundingClientRect = () => ({ top: -400 }) as DOMRect;
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    await waitFor(() => expect(top).toHaveFocus());
    expect(top.scrollIntoView).toHaveBeenCalled();
  });
});
