// 설교 화면(목록 페이지·설교 한 편 페이지) 부품이 함께 쓰는 클래스 묶음 — 값만 둔다.
import { FOCUS_RING } from '@/shared/components/ui/focusRing';

/** 키보드 포커스 링 — 브라우저 기본 선은 포커스일 때만 숨긴다(고대비 모드에서 늘 테두리가 그려지지 않게). */
export const FOCUS = `focus-visible:outline-hidden ${FOCUS_RING}`;

// 터치 영역(DESIGN.md §7: 1024 미만 44×44 이상) — 보이는 크기는 두고 가상 영역으로 위아래를 넓힌다.
// lg 이상(마우스)은 넓히지 않는다 — 줄바꿈된 칩끼리 누르는 영역이 겹친다.
const HIT = "relative max-lg:before:absolute max-lg:before:inset-x-0 max-lg:before:content-['']";
/** 높이 34px 알약용 — 가상 영역은 테두리 안쪽에서 재므로 테두리 1px 을 더해 위아래 6px */
export const HIT_34 = `${HIT} max-lg:before:-inset-y-[6px]`;
/** 높이 36px 요소용(위아래 4px) */
export const HIT_36 = `${HIT} max-lg:before:-inset-y-1`;

/** 알약 버튼(시리즈 칩·이전/다음 편) 공통 모양 */
export const PILL =
  'border-b1-border bg-b1-surface text-caption inline-flex h-[34px] shrink-0 items-center gap-1 rounded-full border px-3 whitespace-nowrap transition-colors duration-fast';

/** 테두리 버튼(«설교 더보기», 휴대폰의 링크 복사·유튜브에서 보기) — 높이·글씨는 쓰는 곳이 정한다 */
export const OUTLINE_BTN =
  'border-b1-border bg-b1-surface text-b1-text inline-flex items-center justify-center gap-2 rounded-md border font-semibold transition-colors duration-fast hover:border-b1-accent-soft hover:bg-b1-accent-soft';

/** 줄을 넘기는 동그란 화살표 버튼(30px) — 누르는 영역은 가상 영역으로 44px(테두리 안쪽 28 + 8×2) */
export const ARROW_BTN =
  "border-b1-border bg-b1-surface text-b1-text relative grid size-[30px] place-items-center rounded-full border before:absolute before:-inset-2 before:content-['']";
