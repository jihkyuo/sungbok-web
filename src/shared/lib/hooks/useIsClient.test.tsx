import { renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { useIsClient } from './useIsClient';

function Probe() {
  return <span>{useIsClient() ? 'client' : 'server'}</span>;
}

describe('useIsClient', () => {
  it('서버 렌더(HTML)에서는 false — 하이드레이션 첫 렌더와 맞춘다', () => {
    expect(renderToString(<Probe />)).toContain('server');
  });

  it('브라우저에 마운트되면 true', () => {
    const { result } = renderHook(() => useIsClient());
    expect(result.current).toBe(true);
  });
});
