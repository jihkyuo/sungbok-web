// 사이트 공용 포커스 링(b1 토큰). 공용 buttonVariants 의 회색 반투명 링은 b1 배경에서 거의 안 보여 이걸 덧씌운다.
// buttonVariants 와 함께 쓸 땐 그 뒤에 둬야 tailwind-merge 가 이쪽을 남긴다(앞에 두면 지워진다).
export const FOCUS_RING =
  'focus-visible:ring-b1-accent focus-visible:ring-offset-b1-bg focus-visible:ring-2 focus-visible:ring-offset-2';
