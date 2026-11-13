import { fireEvent, render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { YoutubeThumb } from './index';

const SRC = 'https://i.ytimg.com/vi/abc123/maxresdefault.jpg';

describe('YoutubeThumb', () => {
  it('우리 변환기(/_next/image)를 거치지 않고 유튜브의 크기별 WebP 주소로 srcset 을 만든다', () => {
    const { container } = render(<YoutubeThumb src={SRC} alt="" fill sizes="320px" />);
    const srcset = container.querySelector('img')?.getAttribute('srcset') ?? '';
    expect(srcset).toContain('https://i.ytimg.com/vi_webp/abc123/mqdefault.webp');
    expect(srcset).toContain('https://i.ytimg.com/vi_webp/abc123/maxresdefault.webp');
    expect(srcset).not.toContain('/_next/image');
    expect(srcset).not.toContain('.jpg');
  });

  it('WebP 를 받지 못하면 JPG 주소로 바꾼다', () => {
    const { container } = render(<YoutubeThumb src={SRC} alt="" fill sizes="320px" />);
    fireEvent.error(container.querySelector('img')!);
    const srcset = container.querySelector('img')?.getAttribute('srcset') ?? '';
    expect(srcset).toContain('https://i.ytimg.com/vi/abc123/mqdefault.jpg');
    expect(srcset).not.toContain('.webp');
  });

  it('WebP 자리에 유튜브의 «없음» 자리표시 그림(120x90)이 오면 JPG 주소로 바꾼다', async () => {
    // 유튜브는 없는 썸네일에도 그림(120x90)을 돌려줘 error 가 아니라 load 가 난다
    const { container } = render(<YoutubeThumb src={SRC} alt="" fill sizes="320px" />);
    const img = container.querySelector('img')!;
    Object.defineProperty(img, 'naturalWidth', { value: 120 });
    Object.defineProperty(img, 'naturalHeight', { value: 90 });
    fireEvent.load(img);
    // next/image 는 그림 디코딩을 기다린 뒤 onLoad 를 부른다
    await waitFor(() => {
      const srcset = container.querySelector('img')?.getAttribute('srcset') ?? '';
      expect(srcset).toContain('https://i.ytimg.com/vi/abc123/mqdefault.jpg');
      expect(srcset).not.toContain('.webp');
    });
  });

  it('JPG 로 바꾼 뒤 다른 영상으로 바뀌면 다시 WebP 부터 쓴다', () => {
    const { container, rerender } = render(<YoutubeThumb src={SRC} alt="" fill sizes="320px" />);
    fireEvent.error(container.querySelector('img')!);
    rerender(
      <YoutubeThumb
        src="https://i.ytimg.com/vi/other99/maxresdefault.jpg"
        alt=""
        fill
        sizes="320px"
      />
    );
    const srcset = container.querySelector('img')?.getAttribute('srcset') ?? '';
    expect(srcset).toContain('https://i.ytimg.com/vi_webp/other99/mqdefault.webp');
  });

  it('wide 면 16:9 크기만 쓴다(4:3 인 hq·sd 제외)', () => {
    const { container } = render(<YoutubeThumb src={SRC} alt="" fill sizes="320px" wide />);
    const srcset = container.querySelector('img')?.getAttribute('srcset') ?? '';
    expect(srcset).toContain('mqdefault.webp');
    expect(srcset).not.toContain('hqdefault');
    expect(srcset).not.toContain('sddefault');
  });

  it('유튜브 썸네일이 아닌 주소는 그대로 싣는다', () => {
    const { container } = render(
      <YoutubeThumb src="https://example.com/a.jpg" alt="" fill sizes="320px" />
    );
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('https://example.com/a.jpg');
    expect(img?.getAttribute('srcset')).toBeNull();
  });
});
