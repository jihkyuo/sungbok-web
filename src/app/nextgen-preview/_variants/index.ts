// 임시 시안 레지스트리 — 확정 후 nextgen-preview 폴더째 삭제. (격리: 기존 next-generation-preview와 무관)
// 킵: B·C·E·K·O·Q·T·V·별의 현상. 참고: W·Y. 신규(O·T·Q 합본, 탭 끝): 합본 포커스/커서 카드/피사계심도/스포트라이트/몰입 확장.
import type { ComponentType } from 'react';

import { CommunityGallery } from '@/domains/home/components/widgets/CommunityGallery';

import { VariantB } from './VariantB';
import { VariantC } from './VariantC';
import { VariantCursorCard } from './VariantCursorCard';
import { VariantDevelop } from './VariantDevelop';
import { VariantE } from './VariantE';
import { VariantK } from './VariantK';
import { VariantO } from './VariantO';
import { VariantQ } from './VariantQ';
import { VariantT } from './VariantT';
import { VariantV } from './VariantV';
import { VariantW } from './VariantW';
import { VariantY } from './VariantY';

export type NextgenVariant = {
  id: string;
  label: string;
  title: string;
  desc: string;
  C: ComponentType;
};

export const NEXTGEN_VARIANTS: NextgenVariant[] = [
  // ── 킵 ──
  { id: 'develop', label: '별의 현상', title: '다음세대', desc: '[킵] 풀블리드 오픈 별밭. 활성 별만 사진으로 현상. 클릭=대형 디테일 만개', C: VariantDevelop },
  { id: 't', label: 'T 자기장 성도', title: '다음세대', desc: '[킵] 커서 근처 별 자동 활성 + 우측 도시에 패널', C: VariantT },
  { id: 'v', label: 'V 성문', title: '다음세대', desc: '[킵] 히트존+자동 투어, 클릭 시 몰입 디테일', C: VariantV },
  { id: 'q', label: 'Q 포커스 풀', title: '다음세대', desc: '[킵] 성운 다층 피사계심도 + 랙 포커스', C: VariantQ },
  { id: 'o', label: 'O 심도 성단', title: '다음세대', desc: '[킵] 다층 별 시차 + 호버 카드', C: VariantO },
  { id: 'k', label: 'K 별자리+스포트', title: '다음세대', desc: '[킵] 별 호버 시 배경 스포트라이트', C: VariantK },
  { id: 'e', label: 'E 오로라 글래스', title: '다음세대', desc: '[킵] 오로라 위 글래스 카드', C: VariantE },
  { id: 'c', label: 'C 별자리', title: '다음세대', desc: '[킵] 빛점 별자리 + 지평선 여명', C: VariantC },
  { id: 'b', label: 'B 스포트라이트', title: '다음세대', desc: '[킵] 대형 타이포 리스트 + 배경 스포트라이트', C: VariantB },
  // ── 참고 ──
  { id: 'w', label: 'W 풀블리드(참고)', title: '다음세대', desc: '[참고] 배경 풀블리드+타이포·클릭 선명화', C: VariantW },
  { id: 'y', label: 'Y 갤럭시 줌(참고)', title: '다음세대', desc: '[참고] 클릭 줌-인 풀섹션', C: VariantY },
  { id: 'current', label: '0 현재(밝음)', title: '한 사람을 환대하는 공동체', desc: '[참고] 현재 라이브 CommunityGallery', C: CommunityGallery },
  // ── 합본 채택안 (고도화) ──
  {
    id: 'cursorcard',
    label: 'Z 커서 카드',
    title: '다음세대',
    desc: '[합본·고도화] O 심도(5겹 시차) + T 밤하늘(은하수·반짝임 다양·딥나잇) + 자기장 + 커서 추종 카드. blur 제거(배경 별 또렷)',
    C: VariantCursorCard,
  },
];
