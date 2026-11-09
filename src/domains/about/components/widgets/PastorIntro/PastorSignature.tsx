// 목사님 편지의 맺음 — 직분 + 친필 서명. 서명은 화면에 들어오면 왼→오로 써진다.
'use client';

import { useScrollFadeIn } from '@/shared/lib/hooks/useScrollFadeIn';
import { cn } from '@/shared/lib/utils';
import Image, { type StaticImageData } from 'next/image';

// 클립(바깥)은 왼쪽에서 들어오고 서명(안쪽)은 같은 거리만큼 되밀어, 서명은 제자리에서 왼쪽부터 드러난다.
const WIPE =
  'transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none';

export const PastorSignature = ({
  label,
  name,
  sign,
}: {
  label: string;
  name: string;
  sign: StaticImageData;
}) => {
  // 서명 줄이 화면에 조금이라도 보이면 쓴다 — 페이지 전환 직후 이미 보이는 자리여도 스크롤 없이 바로 시작.
  const { ref, isVisible: signed } = useScrollFadeIn({ threshold: 0 });

  return (
    <div ref={ref} className="flex items-center gap-4">
      <span className="text-b1-sub text-body">{label}</span>
      <span className="block overflow-hidden">
        <span
          className={cn(
            'block overflow-hidden',
            WIPE,
            signed ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <Image
            src={sign}
            alt={name}
            className={cn(
              'h-auto w-[100px] mix-blend-multiply',
              WIPE,
              signed ? 'translate-x-0' : 'translate-x-full'
            )}
          />
        </span>
      </span>
    </div>
  );
};
