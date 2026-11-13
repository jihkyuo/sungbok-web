// 예배 페이지 ↔ 유튜브 재생목록 — 어느 재생목록의 영상을 어느 페이지에 보일지 여기서 정한다(2026-11-12 결정).
// 관리자는 지금처럼 예배별 재생목록에 올리기만 한다. 페이지 안의 분류(설교 목록 칩)는 영상 제목의
// «시리즈 N» 에서 자동으로 나온다(sermonParse). 여기 없는 재생목록(예배 찬양·장별 마태복음 등)은 어디에도 나오지 않는다.
//
// 다른 예배 페이지를 만들 때 한 줄씩 더한다 — 채널 재생목록 후보(2026-11 확인, 구현 때 다시 확인):
//   friday : PLE3XUsm60vXReuAeLlqN54aIFNDyQl8yZ(4. 금요 생수의 강) · PLE3XUsm60vXQS7HcbZ2unTf-nZfjLWXsQ(월삭 새벽예배)
//   special: PLE3XUsm60vXQIhfSvF57R--X8IP4EfWOh(특별집회 및 행사)
//   weekday: PLE3XUsm60vXTx8rr94k4rogJT49esdsAy(새벽예배 설교) · PLE3XUsm60vXTP1fQoyGAlSCyGlHHQKnc7(수요, 금요, 주일 5부 교구목사설교)
export const WORSHIP_PAGES = {
  // 주일 예배 설교
  sunday: ['PLE3XUsm60vXSn-fvZtoUk-VrDlESt0jDJ'],
} as const satisfies Record<string, readonly string[]>;

export type WorshipPage = keyof typeof WORSHIP_PAGES;

/** 주소에서 온 값이 설정에 있는 페이지 이름인지 — Route Handler 가 임의 값으로 유튜브를 부르지 않게. */
export const isWorshipPage = (v: unknown): v is WorshipPage =>
  typeof v === 'string' && Object.hasOwn(WORSHIP_PAGES, v);

/** 예배 페이지 주소 — 영상 id 가 없으면 설교 목록(/worship/sunday), 있으면 그 설교(/worship/sunday/영상id). */
export const sermonPath = (page: WorshipPage, videoId?: string): string =>
  videoId ? `/worship/${page}/${encodeURIComponent(videoId)}` : `/worship/${page}`;
