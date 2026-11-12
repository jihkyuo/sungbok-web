import { FOCUS_RING } from '@/shared/components/ui/focusRing';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/**
 * 예배 설교 영상 영역의 상태 문구(불러오는 중·실패·없음). 가로 여백은 두지 않는다 — 머리 메뉴 줄과 같은 왼쪽 선.
 */
export const STATUS_CLASS = 'text-b1-sub py-10';

export const StatusText = ({ children }: { children: ReactNode }) => (
  <p className={STATUS_CLASS}>{children}</p>
);

/**
 * 상태 알림 영역(role=status). 불러오는 중 → 실패·없음으로 바뀌어도 이 상자는 그대로 남고 안쪽만 바뀌어야
 * 화면낭독기가 변화를 읽는다 — 상태마다 새 상자를 끼우면 알림 영역째 빠져 놓친다.
 */
export const StatusRegion = ({ children }: { children: ReactNode }) => (
  <div role="status">{children}</div>
);

export const LoadingStatus = () => <StatusText>영상 목록을 불러오는 중입니다.</StatusText>;

/**
 * 실패 문구 + «다시 시도». 누른 버튼은 곧 사라지므로 포커스를 감싼 상자(data-focus-host, 포커스 링 있음)로 옮긴다 —
 * 그러지 않으면 포커스가 문서 맨 위로 튄다.
 */
const focusTargetOf = (el: HTMLElement) => el.closest<HTMLElement>('[data-focus-host]');

export const RetryStatus = ({ onRetry }: { onRetry: () => void }) => (
  <div className={`${STATUS_CLASS} flex flex-wrap items-center gap-x-3 gap-y-2`}>
    <p>영상 목록을 불러오지 못했습니다.</p>
    <button
      type="button"
      onClick={e => {
        const target = focusTargetOf(e.currentTarget);
        onRetry();
        target?.focus({ preventScroll: true });
      }}
      // 보이는 모양은 글자 링크, 누르는 영역은 위아래로 넓힌다(-my-2 py-2).
      // outline 은 포커스일 때만 숨긴다(focus-visible:) — 고대비 모드에서 늘 테두리가 그려지지 않게.
      className={cn(
        'text-b1-accent -my-2 rounded py-2 underline underline-offset-4 focus-visible:outline-hidden',
        FOCUS_RING
      )}
    >
      다시 시도
    </button>
  </div>
);

/**
 * 쿼리 하나의 상태 알림 — 알림 영역(StatusRegion) 안에서 불러오는 중 ↔ 실패(다시 시도) ↔ 빈 결과 문구를 바꿔 끼운다.
 * 받은 결과가 있고 비어 있지 않으면 부르는 쪽이 목록을 그린다.
 */
export const QueryStatus = ({
  query,
  empty,
}: {
  query: { data?: unknown; isError: boolean; isFetching: boolean; refetch: () => unknown };
  empty: string;
}) => (
  <StatusRegion>
    {query.data ? (
      <StatusText>{empty}</StatusText>
    ) : query.isError && !query.isFetching ? (
      <RetryStatus onRetry={() => query.refetch()} />
    ) : (
      <LoadingStatus />
    )}
  </StatusRegion>
);
