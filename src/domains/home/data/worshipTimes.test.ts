import {
  DAY_SECTIONS,
  isGenService,
  SUNDAY_TIMES,
  sundayAt,
  WEEKDAY_SECTIONS,
  WORSHIP_GROUPS,
  toMinutes,
} from '@/domains/home/data/worshipTimes';
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

// 수요 청년예배는 장년이 아니라 다음세대 예배다 — 요일은 수요일, 구분은 다음세대.
describe('요일·세대 구분', () => {
  const names = (list: { name: string }[]) => list.map(s => s.name);

  it('수요 청년예배는 다음세대 예배로 구분된다', () => {
    const wed = WEEKDAY_SECTIONS.find(s => s.day === '수요일')!.services;
    expect(wed.map(isGenService)).toEqual([false, true]);
    expect(names(WORSHIP_GROUPS[0].services)).not.toContain('수요 청년예배');
  });

  it('주일 시간표에는 주일 예배만 들어간다', () => {
    expect(names(SUNDAY_TIMES.flatMap(sundayAt))).not.toContain('수요 청년예배');
    expect(SUNDAY_TIMES.flatMap(sundayAt)).toHaveLength(13);
  });

  it('요일별 묶음은 주일(장년·다음세대) → 새벽 → 수요일 → 금요일 순서로 모든 예배를 한 번씩 담는다', () => {
    expect(DAY_SECTIONS.map(s => s.day)).toEqual(['주일', '매일 새벽', '수요일', '금요일']);
    expect(DAY_SECTIONS[0].lanes.map(l => l.label)).toEqual(['장년', '다음세대']);
    const all = DAY_SECTIONS.flatMap(s => s.lanes.flatMap(l => l.services));
    expect(all).toHaveLength(17);
    expect(new Set(all).size).toBe(17);
  });

  it('한 묶음 안의 예배는 시간 순서다 — 다음세대도 장년처럼 이른 시각부터(같은 시각은 나이 순 유지)', () => {
    for (const lane of DAY_SECTIONS.flatMap(s => s.lanes)) {
      const minutes = lane.services.map(s => toMinutes(s.time));
      expect(minutes).toEqual([...minutes].sort((a, b) => a - b));
    }
    expect(names(DAY_SECTIONS[0].lanes[1].services)).toEqual([
      '고등부',
      '영아부',
      '유치부',
      '유년부',
      '초등부',
      '중등부',
      '청년부',
      '영어예배',
    ]);
  });
});
