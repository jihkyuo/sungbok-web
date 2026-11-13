'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// 알림 문구를 보이는 시간
const SHOW_FOR = 2600;

/**
 * «링크 복사» — 지금 페이지 주소를 클립보드에 넣고 결과 문구를 잠깐 돌려준다(message, 없으면 null).
 * 복사가 막힌 환경(권한 거부, 보안 연결이 아닌 주소)에서는 주소창에서 복사하라고 알린다.
 */
export const useCopyLink = () => {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    let copied = false;
    try {
      // 보안 연결이 아니면 navigator.clipboard 자체가 없다 — 그때도 아래 catch 로 간다
      await navigator.clipboard.writeText(window.location.href);
      copied = true;
    } catch {
      copied = false;
    }
    setMessage(
      copied ? '링크를 복사했습니다.' : '복사하지 못했습니다. 주소창의 주소를 복사해 주세요.'
    );
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), SHOW_FOR);
  }, []);

  return { message, copy };
};
