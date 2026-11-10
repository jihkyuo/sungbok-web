import { WEEKDAY_SECTIONS, toMinutes } from '@/domains/home/data/worshipTimes';
import { describe, expect, it } from 'vitest';

// 시드(순수 함수): 12시간 한글 표기 → 정렬용 분(minute) 변환.
// 진짜 경계는 정오('오후 12'는 +12 하면 안 됨)이며, 가드 `pm && h !== 12` 가 이를 처리한다.
// 자정('오전 12')은 예배 데이터에 존재하지 않는 입력이라 의도적으로 다루지 않으므로 단정하지 않는다.
describe('toMinutes', () => {
  it('오전 시각을 분으로 변환한다', () => {
    expect(toMinutes('오전 7:00')).toBe(7 * 60);
    expect(toMinutes('오전 7:30')).toBe(7 * 60 + 30);
  });

  it('오후 시각에 12시간을 더한다', () => {
    expect(toMinutes('오후 1:00')).toBe(13 * 60);
    expect(toMinutes('오후 8:45')).toBe(20 * 60 + 45);
  });

  it('정오(오후 12시)는 12를 더하지 않는다', () => {
    expect(toMinutes('오후 12:00')).toBe(12 * 60);
  });

  it('정렬 순서가 시간 순서와 일치한다', () => {
    const ordered = ['오전 6:00', '오전 11:30', '오후 12:00', '오후 1:00', '오후 7:00'];
    const sorted = [...ordered].sort((a, b) => toMinutes(a) - toMinutes(b));
    expect(sorted).toEqual(ordered);
  });
});

// 기획 D9: "청년수요예배" 가 아니라 요일을 앞에 둔 "수요 청년예배". 수요일 칸에 수요예배와 함께 놓인다.
describe('WEEKDAY_SECTIONS', () => {
  it('수요일 칸에 수요예배와 수요 청년예배가 순서대로 들어간다', () => {
    const wed = WEEKDAY_SECTIONS.find(s => s.day === '수요일');
    expect(wed?.services.map(s => s.name)).toEqual(['수요예배', '수요 청년예배']);
  });

  it('주중 예배가 빠짐없이 한 칸씩에 들어간다', () => {
    expect(WEEKDAY_SECTIONS.flatMap(s => s.services.map(v => v.name))).toEqual([
      '새벽예배',
      '수요예배',
      '수요 청년예배',
      '금요생수의강',
    ]);
  });
});
