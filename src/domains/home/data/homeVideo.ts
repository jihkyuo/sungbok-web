// 홈 영상 섹션(라이브 스테이지·광고 릴) — 공유 상수·화면 어휘.
// 유튜브 연동 규칙 정본: .md/specs/2026-10-11-home-video-sections-analysis.md

export const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID ?? 'UClz4pOT6Kmuy8MvR3cyHPjA';
/** 채널 업로드 재생목록 (UC… → UU…) */
export const UPLOADS_PLAYLIST_ID = 'UU' + CHANNEL_ID.slice(2);
/** 광고 재생목록 stand-in — 채널에 "홈 광고" 목록이 생기면 이 ID만 교체. 현재: "예배 찬양"(52개, 16:9) */
export const NOTICE_PLAYLIST_ID = 'PLE3XUsm60vXQqVUmssxKMcqBV8SrrobsT';
/** 최신 설교 판별 기준 설교자(제목 마지막 분절 / 설명 `*설교:`) */
export const SERMON_PREACHER = '이요셉 목사';

/** 화면 어휘 — 사실 진술 톤. 섹션 제목·"재생 중"·"다음" 같은 설명 라벨은 두지 않는다(사용자 결정). */
export const LABELS = {
  liveSection: '라이브',
  onAir: '라이브 중',
  latestSermon: '최신 설교',
  preacher: '이요셉 담임목사',
  channel: '성복교회 유튜브',
  watchOnYoutube: '유튜브에서 보기',
  unmute: '소리 켜기',
  mute: '소리 끄기',
} as const;
