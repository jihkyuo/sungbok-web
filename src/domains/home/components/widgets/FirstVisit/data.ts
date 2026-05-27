// '처음 오신 분께'(새신자) 섹션 콘텐츠.
// 등록절차·5주 과정은 교회 제공 실제 자료. SECTION 의 eyebrow/heading/lead 는 사실 진술 placeholder —
// 최종 문구는 교회 확인 필요. 홈 섹션은 단순 안내, 상세 절차는 등록·문의 패널('새가족 과정 안내')에서.

export const SECTION = {
  eyebrow: '● NEW FAMILY',
  headingShort: '처음 오신 분께',
  lead: '등록부터 교구 편성까지, 새가족이 교회에 정착하는 과정을 안내합니다.',
  ctaLabel: '새가족 등록·문의',
};

// 등록절차 6단계 — 패널 '새가족 과정 안내'에서 펼쳐 보여줌.
export type RegisterStep = { no: string; title: string; desc: string };
export const REGISTER_STEPS: RegisterStep[] = [
  { no: '01', title: '등록카드', desc: '교회에 소속되기 위한 등록카드를 작성합니다. 예배당 내 안내위원의 안내를 받으실 수 있습니다.' },
  { no: '02', title: '담당교역자 만남', desc: '새가족 담당교역자와 만나 신앙상담과 교회에 대한 간략한 소개를 받습니다.' },
  { no: '03', title: '새가족 심방', desc: '등록을 마친 후 이른 시일 내 가정을 심방합니다.' },
  { no: '04', title: '새가족 5주 과정', desc: '5주 과정(새생명의 길·새생활의 길)을 통해 하나님과 교회, 이웃을 알아갑니다.' },
  { no: '05', title: '새가족 수료식', desc: '5주 과정을 마친 분들은 수료식을 통해 각 교구로 편성됩니다.' },
  { no: '06', title: '교구 편성', desc: '상황에 맞는 교구로 편성되어 새로운 가족들과 교제하며 신앙이 성장하도록 돕습니다.' },
];

// 새가족 5주 과정.
export type CourseWeek = { wk: string; title: string; desc: string };
export const COURSE_WEEKS: CourseWeek[] = [
  { wk: '1주', title: '교회 소개', desc: '성복교회의 목회자와 기관, 부서 등을 소개합니다.' },
  { wk: '2주', title: '우리가 믿는 하나님', desc: '창조주 성부, 구원자 성자, 구원을 완성하시는 성령 하나님을 배웁니다.' },
  { wk: '3주', title: '우리가 믿는 성경', desc: '성경이 무엇인지 배워 인생을 살아가는 기준을 세웁니다.' },
  { wk: '4주', title: '우리가 섬기는 교회', desc: '공동체인 교회를 배우고 좋은 구성원이 되기 위해 훈련합니다.' },
  { wk: '5주', title: '우리의 신앙생활', desc: '기독교인의 삶과 신앙생활의 어려움을 이기는 힘을 배웁니다.' },
];

export type IntentKey = 'guide' | 'register' | 'inquiry';
export type Intent = { key: IntentKey; label: string; desc: string; kind: 'info' | 'form' };
export const INTENTS: Intent[] = [
  { key: 'guide', label: '새가족 과정 안내', desc: '등록 절차와 5주 과정을 안내합니다', kind: 'info' },
  { key: 'register', label: '새가족 등록', desc: '새가족 등록을 신청합니다', kind: 'form' },
  { key: 'inquiry', label: '문의하기', desc: '궁금한 점을 남겨 주세요', kind: 'form' },
];

export type Field = { name: string; label: string; type: 'text' | 'tel' | 'date' | 'textarea'; required?: boolean };
// 수집 항목 — 전송처(담당자 메일) 연동 시 함께 확정.
export const FORM_FIELDS: Field[] = [
  { name: 'name', label: '이름', type: 'text', required: true },
  { name: 'phone', label: '연락처', type: 'tel', required: true },
  { name: 'visit', label: '방문 예정일', type: 'date' },
  { name: 'message', label: '남기실 말', type: 'textarea' },
];

export const DONE = {
  heading: '접수되었습니다',
  text: '남겨주신 내용을 담당자가 확인한 뒤 연락드립니다.',
};

export const CONTACT = {
  phone: '02-2245-5840',
  email: 'sungbok1979@naver.com',
};
