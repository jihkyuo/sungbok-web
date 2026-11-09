// 홈 단일 소리 주인(audio focus). 홈에는 소리를 낼 수 있는 영상이 여럿(라이브 띠·광고 릴·청년 LP)이지만
// 소리는 한 번에 하나만 난다 — 어디서 소리를 켜면(claim) 나머지는 구독으로 알림을 받아 스스로 음소거한다.
'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

type Listener = (owner: string | null) => void;

let owner: string | null = null;
const listeners = new Set<Listener>();

const emit = () => listeners.forEach(l => l(owner));

export const getAudioOwner = () => owner;

/** id 가 소리 주인이 된다. 이전 주인은 구독 콜백으로 밀려난 사실을 안다. */
export const claimAudio = (id: string) => {
  if (owner === id) return;
  owner = id;
  emit();
};

/** id 가 주인일 때만 비운다. id 생략 시 무조건 비움(테스트·언마운트). */
export const releaseAudio = (id?: string) => {
  if (id !== undefined && owner !== id) return;
  if (owner === null) return;
  owner = null;
  emit();
};

export const subscribeAudio = (l: Listener) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/**
 * 영상 하나가 쓰는 훅. `active` 가 false 로 바뀌면 그 영상은 음소거해야 한다.
 * 언마운트 시 내가 주인이면 비운다.
 */
export const useAudioFocus = (id: string) => {
  // 주인은 모듈 바깥 저장소 — useSyncExternalStore 로 읽어 구독·id 변경을 React 가 맞춘다(effect 안 setState 없음).
  const active = useSyncExternalStore(
    subscribeAudio,
    () => owner === id,
    () => false
  );
  useEffect(() => () => releaseAudio(id), [id]);
  const claim = useCallback(() => claimAudio(id), [id]);
  const release = useCallback(() => releaseAudio(id), [id]);
  return { active, claim, release };
};
