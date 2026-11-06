// 다음세대 부서 페이지 데이터 계약. 부서마다 `domains/next-generation/data/<slug>.ts` 하나가 이 모양으로 채운다.
import type { StaticImageData } from 'next/image';

export interface Photo {
  /** 리스트 key — 같은 사진을 두 번 써도 고유해야 한다 */
  id: string;
  src: StaticImageData;
  /** 대체 텍스트만. 화면에 보이는 캡션은 두지 않는다 */
  alt: string;
}

export interface Staff {
  name: string;
  /** 직함(간사·전도사·부장 등) */
  role: string;
  photo: StaticImageData;
  /** 담당자 인사말 한두 문장(사실 톤). 없을 수 있음 */
  greeting?: string;
}

export interface Department {
  name: string;
  /** 대상 나이 */
  ages: string;
  /** 첫 사진 위에 얹는 한 줄 */
  tagline: string;
  /** 소개 문단 */
  intro: string;
  worship: { day: string; time: string; place: string };
  staff: Staff[];
  /** 정보 덩어리 맨 아래 한 줄(처음 오는 가정 안내 등). 부서 취합 전까지는 자리 표시 문구 */
  extra: string;
}

export interface DepartmentPageProps {
  dept: Department;
  /** photos[0] 이 들어서는 한 장(도입부), 나머지가 쇼케이스. 개수 상한 없음 */
  photos: Photo[];
}
