import { Section } from '@/domains/home/components/features/Section';
import { SectionTitle } from '@/domains/home/components/features/SectionTitle';
import { Reveal } from '@/shared/components/features/Reveal';
import { ArrowUpRight, Bus, Car, MapPin, Phone } from 'lucide-react';

import { MapEmbed } from './MapEmbed';

const ADDRESS = '서울특별시 동대문구 장안벚꽃로 139';
const ADDRESS_DETAIL = '성복교회 예루살렘성전';
const PHONE = '02-2245-5840';
const MAP_QUERY = encodeURIComponent('성복교회 서울 동대문구 장안벚꽃로 139');
const NAVER_DIRECTIONS = `https://map.naver.com/p/search/${MAP_QUERY}`;
const KAKAO_DIRECTIONS = `https://map.kakao.com/?q=${MAP_QUERY}`;

const ACCESS_INFO = [
  {
    icon: Car,
    label: 'PARKING',
    title: '교회 주차장',
    description: '예배 시간 무료 이용 · 주차 안내 위원이 안내해 드립니다.',
  },
  {
    icon: Bus,
    label: 'PUBLIC TRANSIT',
    title: '대중교통',
    description: '지하철 5호선 장한평역 도보 7분 · 버스 장안초교 정류장 하차',
  },
  {
    icon: Phone,
    label: 'CONTACT',
    title: PHONE,
    description: '평일 09:00 – 18:00 · 주일 종일 응대',
  },
];

export const LocationMap = () => {
  return (
    <Section id="location" className="bg-b1-bg">
      <Reveal>
        <SectionTitle
          tier="editorial"
          eyebrow="● LOCATION"
          title="찾아오시는 길"
          action={
            <p className="text-b1-sub text-body-sm m-0 max-w-[360px] leading-[1.8]">
              지하철·버스·자차 모두 편리합니다. 처음 오시는 분께는 안내 위원이 자리까지 안내해
              드립니다.
            </p>
          }
        />
      </Reveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <Reveal delay={60} className="md:col-span-8">
          <div className="bg-b1-surface border-b1-border b1-card-hover overflow-hidden rounded-2xl border">
            <MapEmbed query={MAP_QUERY} title="성복교회 위치" />
            <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-5 md:px-7 md:py-6">
              <div>
                <div className="b1-mono text-b1-muted text-eyebrow tracking-[0.08em]">
                  SUNGBOK · ADDRESS
                </div>
                <div className="mt-1.5 flex items-start gap-2">
                  <MapPin size={18} strokeWidth={1.8} className="text-b1-accent mt-0.5 shrink-0" />
                  <div>
                    <div className="text-title font-bold tracking-[-0.01em]">{ADDRESS}</div>
                    <div className="text-b1-sub text-caption mt-0.5">{ADDRESS_DETAIL}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={NAVER_DIRECTIONS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-b1-accent text-b1-bg text-caption inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2.5 font-semibold transition-all duration-300 ease-out hover:opacity-90 active:scale-[0.97]"
                >
                  네이버 지도
                  <ArrowUpRight size={13} strokeWidth={2} />
                </a>
                <a
                  href={KAKAO_DIRECTIONS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-b1-surface text-b1-text border-b1-border hover:bg-b1-bg text-caption inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2.5 font-semibold transition-all duration-300 ease-out active:scale-[0.97]"
                >
                  카카오 지도
                  <ArrowUpRight size={13} strokeWidth={2} />
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={140} className="md:col-span-4">
          <div className="flex h-full flex-col gap-3">
            {ACCESS_INFO.map(({ icon: Icon, label, title, description }, i) => (
              <div
                key={label}
                className="bg-b1-surface border-b1-border b1-card-hover flex flex-1 items-start gap-4 rounded-2xl border p-5"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="bg-b1-bg border-b1-border flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
                  <Icon size={18} strokeWidth={1.8} className="text-b1-accent" />
                </div>
                <div>
                  <div className="b1-mono text-b1-muted text-eyebrow tracking-[0.08em]">
                    {label}
                  </div>
                  <div className="text-body-sm mt-1 font-bold tracking-[-0.01em]">{title}</div>
                  <div className="text-b1-sub text-caption mt-1 leading-[1.6]">{description}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
};
