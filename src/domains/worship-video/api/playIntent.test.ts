import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearPlay,
  clearPlayIntent,
  requestPlay,
  requestStepFocus,
  takeStepFocus,
  wantsPlay,
} from './playIntent';

beforeEach(() => {
  clearPlayIntent();
});

describe('playIntent — 들어오자마자 재생', () => {
  it('주소로 바로 들어온 경우(공유 링크·새로고침)에는 재생 요청이 없다', () => {
    expect(wantsPlay('a')).toBe(false);
  });

  it('설교를 눌러 넘어온 경우 그 영상은 들어오자마자 재생한다 — 다른 영상은 아니다', () => {
    requestPlay('a');
    expect(wantsPlay('a')).toBe(true);
    expect(wantsPlay('b')).toBe(false);
    // 읽어도 지워지지 않는다(렌더 중 여러 번 읽힌다)
    expect(wantsPlay('a')).toBe(true);
  });

  it('다른 설교를 누르면 요청이 그쪽으로 옮겨 간다', () => {
    requestPlay('a');
    requestPlay('b');
    expect(wantsPlay('a')).toBe(false);
    expect(wantsPlay('b')).toBe(true);
  });

  it('설교 페이지가 요청을 쓴 뒤에는 지운다 — 뒤로·앞으로 가기로 다시 들어오면 누르지 않았으니 재생하지 않는다', () => {
    requestPlay('a');
    clearPlay('a');
    expect(wantsPlay('a')).toBe(false);
  });

  it('다른 영상의 요청은 지우지 않는다(방금 누른 다음 설교의 요청이 남아야 한다)', () => {
    requestPlay('b');
    clearPlay('a');
    expect(wantsPlay('b')).toBe(true);
  });
});

describe('playIntent — 이전·다음을 누른 뒤의 포커스', () => {
  it('누른 쪽을 한 번만 돌려준다 — 새 설교 페이지가 같은 쪽 버튼에 포커스를 되돌려 놓는 데 쓴다', () => {
    expect(takeStepFocus()).toBeNull();
    requestStepFocus('newer');
    expect(takeStepFocus()).toBe('newer');
    expect(takeStepFocus()).toBeNull();
  });

  it('마지막으로 누른 쪽이 남는다', () => {
    requestStepFocus('newer');
    requestStepFocus('older');
    expect(takeStepFocus()).toBe('older');
  });
});
