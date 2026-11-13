// 예배 설교 쿼리 공용 모듈(순수) — 서버 미리 받기(worshipVideoPrefetch.server)와 화면 훅(useSermonLibrary)이 함께 쓴다.
// 'use client' 파일에 두면 서버에서는 실제 값이 아니라 클라이언트 참조로 바뀌어 키가 어긋난다 — 그래서 여기.
import type { WorshipPage } from '../config/worshipPages';
import type { Sermon } from './worshipVideo.types';

export const sermonLibraryQueryKey = (page: WorshipPage) => ['worship-library', page] as const;
export const sermonDescriptionQueryKey = (page: WorshipPage, videoId: string) =>
  ['worship-description', page, videoId] as const;

const text = (v: unknown): v is string => typeof v === 'string' && !!v;
const optional = (v: unknown, type: 'string' | 'number') => v === undefined || typeof v === type;

const isSermon = (v: unknown): v is Sermon => {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  return (
    text(s.id) &&
    typeof s.title === 'string' &&
    text(s.series) &&
    // 정렬·표시가 이 모양에 기댄다(sermonList)
    typeof s.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(s.date) &&
    (s.dateFrom === 'sermon' || s.dateFrom === 'upload') &&
    text(s.thumbnail) &&
    text(s.poster) &&
    optional(s.no, 'number') &&
    optional(s.occasion, 'string') &&
    optional(s.passage, 'string') &&
    optional(s.preacher, 'string')
  );
};

/**
 * 응답 본문을 설교 목록으로 — 배열이 아니면(프록시·CDN 오류 봉투 같은 200) 실패로 처리하고,
 * 모양이 맞지 않는 항목은 걸러 한 항목 때문에 목록 전체가 깨지지 않게 한다.
 */
export const toSermons = (body: unknown): Sermon[] => {
  if (!Array.isArray(body)) throw new Error('worship-video: 설교 배열이 아닌 응답');
  return body.filter(isSermon);
};

/** 응답 본문({ body })에서 설명 글을 꺼낸다. 빈 글은 정상(설명 없는 영상), 모양이 다르면 실패. */
export const toDescription = (body: unknown): string => {
  const value = (body as { body?: unknown } | null)?.body;
  if (typeof value !== 'string') throw new Error('worship-video: 설명 글이 아닌 응답');
  return value;
};
