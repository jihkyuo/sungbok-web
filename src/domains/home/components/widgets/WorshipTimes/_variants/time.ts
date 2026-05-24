// 시안 비교용 임시 헬퍼 (worship-preview). 시안 확정 후 정리 예정.
export const stripPeriod = (t: string) => t.replace('오전 ', '').replace('오후 ', '');

export const periodLabel = (t: string) => (t.includes('오전') ? 'AM' : 'PM');

export const toMinutes = (t: string) => {
  const pm = t.includes('오후');
  const [h, m] = stripPeriod(t).split(':').map(Number);
  const hour = pm && h !== 12 ? h + 12 : h;
  return hour * 60 + m;
};
