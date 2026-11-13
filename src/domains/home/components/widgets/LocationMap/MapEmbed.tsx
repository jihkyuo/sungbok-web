'use client';

import { MapPin } from 'lucide-react';
import { useRef } from 'react';

import { useNearViewport } from '@/shared/lib/hooks/useNearViewport';

/**
 * 구글 지도 임베드(스크립트·타일 약 1.8MB)는 지도 자리가 실제로 화면에 들어왔을 때 붙인다.
 * `loading="lazy"` 는 브라우저가 화면 한참 앞(폰에서는 페이지 중간)부터 받아, 스크롤을 내린 채
 * 새로고침하면 보지도 않는 지도를 받느라 로딩이 길어졌다. 붙기 전에는 같은 크기의 자리표시를 둔다.
 */
export const MapEmbed = ({ query, title }: { query: string; title: string }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const visible = useNearViewport(boxRef, '0px');
  return (
    <div ref={boxRef} className="bg-b1-placeholder relative aspect-[4/3] w-full md:aspect-[16/10]">
      {visible ? (
        <iframe
          title={title}
          src={`https://www.google.com/maps?q=${query}&hl=ko&output=embed`}
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center" aria-hidden>
          <MapPin size={28} strokeWidth={1.6} className="text-b1-muted" />
        </div>
      )}
    </div>
  );
};
