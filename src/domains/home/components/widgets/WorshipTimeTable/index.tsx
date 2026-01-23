'use client';

import { WorshipTimeTableMini } from '@/domains/home/components/widgets/WorshipTimeTable/WorshipTimeTableMini';
import { WorshipTimeTableWide } from '@/domains/home/components/widgets/WorshipTimeTable/WorshipTimeTableWide';
import { useScrollFadeIn } from '@/shared/lib/hooks/useScrollFadeIn';
import { cn } from '@/shared/lib/utils';

export const WorshipTimeTable = () => {
  const { ref, isVisible } = useScrollFadeIn({ threshold: 0.1, rootMargin: '-50px' });

  return (
    <div
      ref={ref}
      className={cn(
        'py-30 transition-all duration-1000',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      )}
    >
      <div className={'hidden lg:block'}>
        <WorshipTimeTableWide />
      </div>

      <div className={'block lg:hidden'}>
        <WorshipTimeTableMini />
      </div>
    </div>
  );
};
