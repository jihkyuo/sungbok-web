// 서버(worshipVideo.server)와 화면(useSermonLibrary·부품)이 함께 쓰는 모양. 화면에 필요한 필드만 둔다.
// 설교 라이브러리(G안, 2026-11-12) — .md/specs/2026-11-12-worship-sermon-g-plan.md

/** 설교 한 편. 서버가 유튜브 제목·설명에서 읽어 만든다(sermonParse). */
export type Sermon = {
  id: string;
  /** 제목 칸 — 형식 밖 제목이면 유튜브 제목 전체 */
  title: string;
  /** 시리즈 이름(제목의 «시리즈 N»). 회차가 없으면 SINGLES(«단편 설교») */
  series: string;
  no?: number;
  /** 단편의 절기·주제 이름(성찬식·맥추감사주일 등) */
  occasion?: string;
  passage?: string;
  /** 달력 날짜 YYYY-MM-DD(한국 기준) — 설명 첫 줄의 설교일, 없으면 유튜브 업로드 날짜 */
  date: string;
  /** 날짜의 출처. 'upload' 면 화면에 «업로드» 를 붙인다(설교일이 아닐 수 있다) */
  dateFrom: 'sermon' | 'upload';
  /** 목록용(high 480px) */
  thumbnail: string;
  /** 플레이어 포스터용(큰 것부터) */
  poster: string;
};

/** 설교 목록의 칩 하나 = 시리즈 하나. 설교 배열에서 계산한다(sermonList.buildSeries). */
export type SermonSeries = {
  name: string;
  count: number;
  /** 가장 최근 편의 날짜·썸네일 */
  latest: string;
  thumbnail: string;
};
