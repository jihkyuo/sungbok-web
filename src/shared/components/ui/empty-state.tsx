import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

/** 빈 목록 안내 — 사실 진술 한 줄 + 다음 동작(DESIGN.md 카피 톤). */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        'border-b1-border flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-12 text-center',
        className
      )}
    >
      <h3 className="text-title text-b1-text m-0">{title}</h3>
      {description && <p className="text-body-sm text-b1-sub m-0">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
