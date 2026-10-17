import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { claimAudio, getAudioOwner, releaseAudio, subscribeAudio, useAudioFocus } from './audioFocus';

beforeEach(() => {
  releaseAudio();
});

describe('audioFocus (홈 단일 소리 주인)', () => {
  it('처음엔 주인이 없다', () => {
    expect(getAudioOwner()).toBeNull();
  });
  it('claim 하면 그 id 가 주인이 되고 구독자에게 알린다', () => {
    const cb = vi.fn();
    const off = subscribeAudio(cb);
    claimAudio('live');
    expect(getAudioOwner()).toBe('live');
    expect(cb).toHaveBeenCalledWith('live');
    off();
  });
  it('다른 id 가 claim 하면 이전 주인은 밀려난다', () => {
    claimAudio('live');
    claimAudio('reel');
    expect(getAudioOwner()).toBe('reel');
  });
  it('release(id) 는 그 id 가 주인일 때만 비운다', () => {
    claimAudio('live');
    releaseAudio('reel');
    expect(getAudioOwner()).toBe('live');
    releaseAudio('live');
    expect(getAudioOwner()).toBeNull();
  });
  it('useAudioFocus: active 는 내 id 가 주인일 때만 true, 다른 곳이 켜면 false 로 바뀐다', () => {
    const { result } = renderHook(() => useAudioFocus('reel'));
    expect(result.current.active).toBe(false);
    act(() => result.current.claim());
    expect(result.current.active).toBe(true);
    act(() => claimAudio('lp'));
    expect(result.current.active).toBe(false);
    act(() => result.current.release());
    expect(getAudioOwner()).toBe('lp');
  });
});
