import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';

const { state, createPlayer, destroy, release } = vi.hoisted(() => ({
  state: { near: false },
  createPlayer: vi.fn(),
  destroy: vi.fn(),
  release: vi.fn(),
}));
vi.mock('@/domains/home/api/useHomeVideoFeed', () => ({
  useHomeVideoFeed: () => ({
    status: 'ready',
    error: null,
    notices: [],
    sermon: null,
    live: {
      id: 'live-video',
      title: '라이브',
      thumbnail: '/live.webp',
      description: '',
      publishedAt: '2026-11-13T10:00:00Z',
      durationSec: null,
      broadcast: 'live',
      liveStart: '2026-11-13T10:00:00Z',
    },
  }),
}));
vi.mock('@/shared/lib/hooks/useNearViewport', () => ({ useNearViewport: () => state.near }));
vi.mock('@/shared/lib/youtubePlayer', () => ({ createPlayer }));
vi.mock('@/shared/lib/audioFocus', () => ({
  getAudioOwner: () => null,
  useAudioFocus: () => ({ active: false, claim: () => {}, release }),
}));
vi.mock('@/shared/components/features/Reveal', () => ({
  Reveal: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('next/image', () => ({ default: () => null }));

import { LiveStage } from './index';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  state.near = false;
});

it('라이브 정보는 처음부터 표시하되 화면에서 먼 동안은 iframe을 만들지 않는다', () => {
  createPlayer.mockReturnValue(destroy);
  const { rerender, unmount } = render(<LiveStage />);
  expect(createPlayer).not.toHaveBeenCalled();
  state.near = true;
  rerender(<LiveStage />);
  expect(createPlayer).toHaveBeenCalledOnce();
  unmount();
  expect(destroy).toHaveBeenCalledOnce();
});
