import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  /** 상단 작은 라벨 (예: '● COMMUNITY') */
  eyebrow?: ReactNode;
  /** 우측 슬롯 (예: 'ALL SERVICES →' 링크, 설명 문단) */
  action?: ReactNode;
  /** standard: 일반 섹션 / editorial: 대형 타이포 섹션 */
  tier?: 'standard' | 'editorial';
  className?: string;
}

/**
 * 홈 섹션 타이틀 — 2티어 규격. 위계는 유지하되 크기 체계를 통일.
 */
export const SectionTitle = ({
  title,
  eyebrow,
  action,
  tier = 'standard',
  className,
}: Props) => {
  return (
    <div className={cn('mb-8 md:mb-10', className)}>
      {eyebrow && (
        <div className="b1-mono text-b1-accent mb-3 text-[11px] font-semibold tracking-[0.16em]">
          {eyebrow}
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2
          className={cn(
            'text-b1-text m-0 font-bold text-balance',
            tier === 'editorial'
              ? 'text-[36px] leading-[1.05] tracking-[-0.03em] md:text-[54px]'
              : 'text-[26px] tracking-[-0.02em] md:text-[34px]'
          )}
        >
          {title}
        </h2>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
};
