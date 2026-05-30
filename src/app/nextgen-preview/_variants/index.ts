// 임시 시안 레지스트리 — 확정 후 nextgen-preview 폴더째 삭제. (격리: 기존 next-generation-preview와 무관)
// 킵: B·C·E·K·O·Q·T·V·별의 현상. 참고: W·Y. 신규(O·T·Q 합본, 탭 끝): 합본 포커스/커서 카드/피사계심도/스포트라이트/몰입 확장.
import type { ComponentType } from 'react';

import { CommunityGallery } from '@/domains/home/components/widgets/CommunityGallery';

import { VariantB } from './VariantB';
import { VariantC } from './VariantC';
import { VariantCursorCard } from './VariantCursorCard';
import { VariantDevelop } from './VariantDevelop';
import { VariantDive } from './VariantDive';
import { VariantDof } from './VariantDof';
import { VariantE } from './VariantE';
import { VariantFocus } from './VariantFocus';
import { VariantK } from './VariantK';
import { VariantO } from './VariantO';
import { VariantQ } from './VariantQ';
import { VariantSpotlight } from './VariantSpotlight';
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
  // ── O·T·Q 합본 신규 5안 (탭 끝) ──
  {
    id: 'focus',
    label: '◆ 합본 포커스',
    title: '다음세대',
    desc: '[합본·권장] 풀블리드 별밭 + T 자기장 + O 심도/시차/별 사이즈 + Q 카드+활성 강조+주변 blur·dim. 클릭=잠금',
    C: VariantFocus,
  },
  {
    id: 'cursorcard',
    label: '◆ 커서 카드',
    title: '다음세대',
    desc: '[합본] 정보 카드가 커서를 따라옴(이동 0) + 활성 강조 + 랙 포커스. 클릭=고정',
    C: VariantCursorCard,
  },
  {
    id: 'dof',
    label: '◆ 피사계심도',
    title: '다음세대',
    desc: '[합본] 주변 흐림을 깊이 기반 보케로(먼 별일수록 더 흐림), 활성 초점면 또렷 + 카드',
    C: VariantDof,
  },
  {
    id: 'spotlight',
    label: '◆ 스포트라이트',
    title: '다음세대',
    desc: '[합본] 활성 별 따라가는 빛 마스크(바깥 어둡게+탈채도) + 카드. 플라네타리움 결',
    C: VariantSpotlight,
  },
  {
    id: 'dive',
    label: '◆ 몰입 확장',
    title: '다음세대',
    desc: '[합본] 호버=카드 미리보기+랙 포커스, 클릭=대형 인플레이스 몰입 디테일(딥 인포)',
    C: VariantDive,
  },
];
