import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';
import * as React from 'react';

import { Button, buttonVariants } from '@/shared/components/ui/button';
import { FOCUS_RING } from '@/shared/components/ui/focusRing';
import { cn } from '@/shared/lib/utils';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="페이지"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      // 쪽 번호가 많으면 좁은 화면에서 다음 줄로 넘긴다(가로 스크롤 금지)
      className={cn(
        'flex flex-row flex-wrap items-center justify-center gap-x-1 gap-y-2',
        className
      )}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'button'>;

// 키보드로 누를 수 있게 button. 비활성은 aria-disabled — disabled 를 쓰면 끝에 닿을 때 포커스가 사라진다.
// 비활성이면 이 부품이 클릭·키·포인터 등 모든 이벤트 처리를 떼어 낸다 — 호출부마다 가드를 두지 않아도 된다.
function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  const disabled = props['aria-disabled'] === true || props['aria-disabled'] === 'true';
  const rest = disabled
    ? Object.fromEntries(
        Object.entries(props).filter(([k, v]) => !(/^on[A-Z]/.test(k) && typeof v === 'function'))
      )
    : props;
  return (
    <button
      type="button"
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        FOCUS_RING,
        'cursor-pointer',
        // 비활성은 글자색을 흐린 토큰으로(아이콘은 currentColor 를 따라감) — 버튼째 opacity 를 낮추면 포커스 링까지 흐려진다.
        'aria-disabled:text-b1-muted aria-disabled:hover:text-b1-muted aria-disabled:cursor-default aria-disabled:hover:bg-transparent',
        className
      )}
      {...rest}
    />
  );
}

function PaginationPrevious({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="이전 페이지"
      size="default"
      className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">{children ?? '이전'}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="다음 페이지"
      size="default"
      className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
      {...props}
    >
      <span className="hidden sm:block">{children ?? '다음'}</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

// 누르면 여러 쪽을 건너뛰는 생략부호 버튼 — 쪽 번호 버튼과 같은 모양·링. 라벨을 안 주면 기본 이름을 쓴다.
function PaginationJump({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      type="button"
      data-slot="pagination-jump"
      aria-label="페이지 건너뛰기"
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'icon' }),
        FOCUS_RING,
        'cursor-pointer',
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" aria-hidden />
    </button>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationJump,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
