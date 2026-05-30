// 임시 시안 레지스트리 — 확정 후 nextgen-preview 폴더째 삭제. (격리: 기존 next-generation-preview와 무관)
// 다크(여명 아크) 라운드: LP 어둠을 이어받아 섹션 안에서 새벽처럼 밝아져 교회소식으로 연결.
// 킵: B 스포트라이트 · C 별자리 · E 오로라 글래스 · K=C발전(별 호버 시 B효과).
// L~P = C(별자리)를 여러 방면으로 변형한 천체 시안들.
import type { ComponentType } from 'react';

import { CommunityGallery } from '@/domains/home/components/widgets/CommunityGallery';

import { VariantB } from './VariantB';
import { VariantC } from './VariantC';
import { VariantE } from './VariantE';
import { VariantK } from './VariantK';
import { VariantL } from './VariantL';
import { VariantM } from './VariantM';
import { VariantN } from './VariantN';
import { VariantO } from './VariantO';
import { VariantP } from './VariantP';

export type NextgenVariant = {
  id: string;
  label: string;
  title: string;
  desc: string;
  C: ComponentType;
};

export const NEXTGEN_VARIANTS: NextgenVariant[] = [
  // ── 킵한 시안 ──
  {
    id: 'b',
    label: 'B 스포트라이트',
    title: '다음세대',
    desc: '[킵·다크] 대형 타이포 리스트. 가리키면 그 부서 사진이 배경 스포트라이트로(럭셔리·절제)',
    C: VariantB,
  },
  {
    id: 'c',
    label: 'C 별자리',
    title: '다음세대',
    desc: '[킵·다크] 밤하늘 빛점 별자리 + 자라남 경로. 하단 지평선이 여명으로 타오름(분위기·추상)',
    C: VariantC,
  },
  {
    id: 'e',
    label: 'E 오로라 글래스',
    title: '다음세대',
    desc: '[킵·다크] 오로라 위에 떠 있는 프로스티드 글래스 카드(미세 플로트). 하단 여명으로 풀림',
    C: VariantE,
  },
  // ── C 발전형 (별 호버 시 B 스포트라이트) ──
  {
    id: 'k',
    label: 'K 별자리+스포트',
    title: '다음세대',
    desc: '[C발전·다크] 별자리 빛점을 가리키면 그 부서 사진이 배경 전면 스포트라이트로 떠오름(C×B)',
    C: VariantK,
  },
  // ── C 변형(천체) 5안 ──
  {
    id: 'l',
    label: 'L 궤도 성좌',
    title: '다음세대',
    desc: '[C변형·다크] 중심 코어 둘레 동심 타원 궤도에 아홉 세대가 놓인 별자리. 반짝/부유 + 호버 카드',
    C: VariantL,
  },
  {
    id: 'm',
    label: 'M 은하 나선',
    title: '다음세대',
    desc: '[C변형·다크] 중심(영아부)→바깥(엘림가족부)으로 감기는 나선 은하. 희미한 나선팔 + 호버 카드',
    C: VariantM,
  },
  {
    id: 'n',
    label: 'N 유성 라인',
    title: '다음세대',
    desc: '[C변형·다크] 별자리 잇는 선이 그어지듯 그려지고 이따금 유성이 흐름. 호버 카드',
    C: VariantN,
  },
  {
    id: 'o',
    label: 'O 심도 성단',
    title: '다음세대',
    desc: '[C변형·다크] 여러 겹 별이 깊이를 이루고 커서를 따라 시차로 움직임(parallax). 호버 카드',
    C: VariantO,
  },
  {
    id: 'p',
    label: 'P 달+별자리',
    title: '다음세대',
    desc: '[C변형·다크] 떠오르는 큰 달을 둘러 아홉 부서 별이 호를 그림. 달빛→여명. 호버 카드',
    C: VariantP,
  },
  // ── 참고 ──
  {
    id: 'current',
    label: '0 현재(밝음)',
    title: '한 사람을 환대하는 공동체',
    desc: '[참고] 현재 라이브 CommunityGallery(밝은 카드 그리드) — 다크 전환 전 대비용',
    C: CommunityGallery,
  },
];
