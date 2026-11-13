import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCopyLink } from './useCopyLink';

const stubClipboard = (writeText: (text: string) => Promise<void>) =>
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

beforeEach(() => {
  vi.useFakeTimers();
  window.history.replaceState(null, '', '/worship/sunday/abc');
});
afterEach(() => {
  vi.useRealTimers();
  Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
});

describe('useCopyLink', () => {
  it('지금 페이지 주소를 복사하고 알림 문구를 잠깐 띄운다', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    const { result } = renderHook(() => useCopyLink());
    expect(result.current.message).toBeNull();

    await act(() => result.current.copy());
    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(result.current.message).toBe('링크를 복사했습니다.');

    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.message).toBeNull();
  });

  it('복사가 막히면(권한 거부) 주소창에서 복사하라고 알린다', async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    const { result } = renderHook(() => useCopyLink());
    await act(() => result.current.copy());
    expect(result.current.message).toBe('복사하지 못했습니다. 주소창의 주소를 복사해 주세요.');
  });

  it('복사 기능이 없는 브라우저(보안 연결이 아닌 주소)에서도 깨지지 않는다', async () => {
    const { result } = renderHook(() => useCopyLink());
    await act(() => result.current.copy());
    expect(result.current.message).toBe('복사하지 못했습니다. 주소창의 주소를 복사해 주세요.');
  });

  it('연달아 누르면 알림 시간이 마지막 누름부터 다시 센다', async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined));
    const { result } = renderHook(() => useCopyLink());
    await act(() => result.current.copy());
    act(() => vi.advanceTimersByTime(2000));
    await act(() => result.current.copy());
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.message).toBe('링크를 복사했습니다.');
  });

  it('떠나면 남은 알림 타이머를 지운다', async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined));
    const { result, unmount } = renderHook(() => useCopyLink());
    await act(() => result.current.copy());
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
