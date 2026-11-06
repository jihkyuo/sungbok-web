/**
 * 세로 스크롤바 폭. CSS `100vw` 는 스크롤바까지 포함해서, 화면 끝까지 꽉 채우는 연출(full-bleed)이
 * 스크롤바 폭만큼 넘쳐 가로 스크롤이 생긴다. 이 값을 `--sbw` 로 두고 `calc(100vw - var(--sbw))` 로 쓴다.
 * 휴대폰·트랙패드(겹치는 스크롤바)는 0.
 */
export const scrollbarWidth = (innerWidth: number, clientWidth: number): number =>
  Math.max(0, innerWidth - clientWidth);
