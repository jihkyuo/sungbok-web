// 새가족 등록·문의 패널 (채널톡식 모프). 홈 전용 플로팅 버튼(Fab) + 단계형 패널.
// 단계: intent(의도 선택) → guide(등록절차·5주 과정 전체) | form(등록·문의 폼) → done.
'use client';

import { ArrowRight, Check, ChevronLeft, Mail, Phone, UserPlus, X } from 'lucide-react';
import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useIsClient } from '@/shared/lib/hooks/useIsClient';
import { cn } from '@/shared/lib/utils';

import {
  CONTACT,
  COURSE_WEEKS,
  DONE,
  FORM_FIELDS,
  INTENTS,
  REGISTER_STEPS,
  SECTION,
  type IntentKey,
} from './data';

export type Step = 'intent' | 'guide' | 'form' | 'done';

export function usePanelFlow() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('intent');
  const [intent, setIntent] = useState<IntentKey>('register');

  const openPanel = () => {
    setStep('intent');
    setOpen(true);
  };
  const close = () => setOpen(false);
  const selectIntent = (k: IntentKey) => {
    setIntent(k);
    const meta = INTENTS.find(i => i.key === k);
    setStep(meta?.kind === 'info' ? 'guide' : 'form');
  };
  const back = () => setStep('intent');
  const submit = () => setStep('done');

  // 닫힘 트랜지션이 끝난 뒤 단계 초기화(다시 열면 의도 선택부터).
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => setStep('intent'), 320);
    return () => clearTimeout(t);
  }, [open]);

  return { open, step, intent, openPanel, close, selectIntent, back, submit };
}
export type PanelFlow = ReturnType<typeof usePanelFlow>;

/* ── 포털 ───────────────────────────────────────────────────────── */
// 홈 래퍼 `<div class="relative z-0">` 가 스태킹 컨텍스트를 만들어 fixed 오버레이를
// 헤더(z-50) 아래로 가둔다. 오버레이는 body 로 포털해 컨텍스트를 탈출시킨다.
function Portal({ children }: { children: ReactNode }) {
  if (!useIsClient()) return null;
  return createPortal(children, document.body);
}

/* ── 플로팅 버튼(홈 전용, 항상 표시 — 패널이 열려 있을 때만 숨김) ─── */
function Fab({
  flow,
  buttonRef,
}: {
  flow: PanelFlow;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      data-floating-cta
      onClick={flow.openPanel}
      aria-label={SECTION.ctaLabel}
      className={cn(
        'bg-b1-accent shadow-b1-accent/30 text-label fixed right-6 bottom-6 z-[60] flex min-h-12 items-center gap-2 rounded-full px-5 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl',
        flow.open
          ? 'pointer-events-none invisible translate-y-3 opacity-0'
          : 'translate-y-0 opacity-100'
      )}
    >
      <UserPlus size={17} strokeWidth={2} />
      {SECTION.ctaLabel}
    </button>
  );
}

/* ── 채널톡식 모프 패널 ──────────────────────────────────────────── */
export function MorphPanel({ flow }: { flow: PanelFlow }) {
  const fabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  // 늘 최신 close 를 부르되 effect 를 다시 돌리지 않는다(렌더 중 ref 쓰기 대신 — React Compiler 규칙)
  const closeOnEscape = useEffectEvent(() => flow.close());

  // 키보드 접근성: 열면 패널로 포커스를 옮기고, 닫으면 떠 있는 버튼으로 돌려준다. Esc 로 닫는다.
  // 열림 상태가 바뀔 때만 돈다(close 는 매 렌더 새 함수라 의존성에 넣으면 입력 중 포커스를 빼앗는다).
  useEffect(() => {
    if (flow.open) {
      panelRef.current?.focus();
      const panel = panelRef.current;
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeOnEscape();
      panel?.addEventListener('keydown', onKey); // 패널 안의 Esc 만 — 다른 부품의 Esc 와 겹치지 않게
      wasOpen.current = true;
      return () => panel?.removeEventListener('keydown', onKey);
    }
    if (wasOpen.current) fabRef.current?.focus();
  }, [flow.open]);

  return (
    <Portal>
      <Fab flow={flow} buttonRef={fabRef} />
      {/* 코너 click-catcher (디밍 없이 바깥 클릭만 닫기) */}
      <div
        aria-hidden
        onClick={flow.close}
        className={cn('fixed inset-0 z-[70]', flow.open ? '' : 'pointer-events-none')}
      />
      {/* 닫혀 있을 때는 inert — 보이지 않는 버튼에 키보드 포커스가 들어가지 않게 한다 */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={flow.step === 'done' ? undefined : 'register-panel-title'}
        aria-label={flow.step === 'done' ? '새가족 등록 완료' : undefined}
        tabIndex={-1}
        inert={!flow.open}
        aria-hidden={!flow.open}
        className={cn(
          'bg-b1-surface fixed right-6 bottom-6 z-[80] flex max-h-[min(600px,calc(100vh-120px))] w-[min(390px,calc(100vw-32px))] origin-bottom-right flex-col overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ease-out outline-none',
          flow.open ? 'scale-100 opacity-100' : 'pointer-events-none scale-50 opacity-0'
        )}
      >
        <PanelContent flow={flow} />
      </div>
    </Portal>
  );
}

/* ── 단계 내용 ──────────────────────────────────────────────────── */
const STEP_TITLE = (flow: PanelFlow): string => {
  if (flow.step === 'guide') return '새가족 과정 안내';
  if (flow.step === 'form')
    return INTENTS.find(i => i.key === flow.intent)?.label ?? SECTION.ctaLabel;
  if (flow.step === 'done') return '';
  return SECTION.ctaLabel;
};

function PanelHeader({ flow }: { flow: PanelFlow }) {
  const canBack = flow.step === 'guide' || flow.step === 'form';
  return (
    <div className="border-b1-border flex items-center gap-1 border-b px-4 py-3.5">
      {canBack && (
        <button
          type="button"
          onClick={flow.back}
          aria-label="이전"
          className="text-b1-sub hover:bg-b1-bg -ml-2 flex size-11 items-center justify-center rounded-full transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      <span id="register-panel-title" className="text-b1-text text-body-sm flex-1 px-1 font-bold">
        {STEP_TITLE(flow)}
      </span>
      <button
        type="button"
        onClick={flow.close}
        aria-label="닫기"
        className="text-b1-muted hover:bg-b1-bg hover:text-b1-text -mr-2 flex size-11 items-center justify-center rounded-full transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function IntentMenu({ onSelect }: { onSelect: (k: IntentKey) => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-b1-sub text-caption mb-1 leading-[1.6]">필요한 항목을 선택해 주세요.</p>
      {INTENTS.map(i => (
        <button
          key={i.key}
          type="button"
          onClick={() => onSelect(i.key)}
          className="group border-b1-border bg-b1-surface hover:border-b1-accent hover:bg-b1-accent-soft flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors"
        >
          <div className="flex-1">
            <div className="text-b1-text text-label font-bold">{i.label}</div>
            <div className="text-b1-sub text-caption mt-0.5">{i.desc}</div>
          </div>
          <ArrowRight
            size={16}
            className="text-b1-muted group-hover:text-b1-accent shrink-0 transition-transform group-hover:translate-x-0.5"
          />
        </button>
      ))}
    </div>
  );
}

// 새가족 과정 전체 상세 — 홈 요약의 펼친 버전(등록절차 6단계 + 5주 과정).
function GuidePanel({ onRegister }: { onRegister: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="b1-mono text-b1-accent text-caption mb-3 tracking-[0.12em]">등록절차</div>
        <ol className="flex flex-col gap-3">
          {REGISTER_STEPS.map(s => (
            <li key={s.no} className="flex gap-3">
              <span className="bg-b1-accent-soft text-b1-accent text-caption mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold">
                {s.no}
              </span>
              <div>
                <div className="text-b1-text text-caption font-bold">{s.title}</div>
                <p className="text-b1-sub text-caption mt-0.5 leading-[1.55]">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section>
        <div className="b1-mono text-b1-accent text-caption mb-3 tracking-[0.12em]">
          새가족 5주 과정
        </div>
        <ul className="flex flex-col gap-2">
          {COURSE_WEEKS.map(w => (
            <li key={w.wk} className="border-b1-border bg-b1-bg rounded-lg border px-3.5 py-2.5">
              <div className="text-b1-text text-caption font-bold">
                <span className="text-b1-accent">{w.wk}</span> {w.title}
              </div>
              <p className="text-b1-sub text-caption mt-0.5 leading-[1.5]">{w.desc}</p>
            </li>
          ))}
        </ul>
      </section>
      <button
        type="button"
        onClick={onRegister}
        className="bg-b1-accent text-label flex items-center justify-center gap-1.5 rounded-xl py-3 font-bold text-white"
      >
        새가족 등록하기
        <ArrowRight size={15} />
      </button>
      <div className="text-caption flex gap-2">
        <a
          href={`tel:${CONTACT.phone}`}
          className="border-b1-border text-b1-sub flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 no-underline"
        >
          <Phone size={14} />
          전화
        </a>
        <a
          href={`mailto:${CONTACT.email}`}
          className="border-b1-border text-b1-sub flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 no-underline"
        >
          <Mail size={14} />
          메일
        </a>
      </div>
    </div>
  );
}

function MiniForm({ intent, onSubmit }: { intent: IntentKey; onSubmit: () => void }) {
  const fields = FORM_FIELDS.filter(f => !(intent === 'inquiry' && f.name === 'visit'));
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        // TODO: 전송처(담당자 메일) 연동 — 현재 미동작, 제출 시 완료 화면만 표시.
        onSubmit();
      }}
      className="flex flex-col gap-4"
    >
      {fields.map(f => (
        <label key={f.name} className="block">
          <span className="text-b1-sub text-caption mb-1.5 block font-semibold">
            {f.label}
            {f.required ? (
              <span className="text-b1-accent"> *</span>
            ) : (
              <span className="text-b1-muted"> (선택)</span>
            )}
          </span>
          {f.type === 'textarea' ? (
            <textarea
              rows={3}
              className="border-b1-border bg-b1-surface text-b1-text focus:border-b1-accent text-body w-full resize-none rounded-lg border px-3.5 py-2.5 transition-colors outline-none"
            />
          ) : (
            <input
              type={f.type}
              className="border-b1-border bg-b1-surface text-b1-text focus:border-b1-accent text-body w-full rounded-lg border px-3.5 py-2.5 transition-colors outline-none"
            />
          )}
        </label>
      ))}
      <button
        type="submit"
        className="bg-b1-accent text-label mt-1 rounded-xl py-3 font-bold text-white"
      >
        보내기
      </button>
    </form>
  );
}

function DonePanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
      <div className="bg-b1-accent-soft text-b1-accent flex h-14 w-14 items-center justify-center rounded-full">
        <Check size={26} strokeWidth={2.4} />
      </div>
      <div>
        <div className="text-b1-text text-[18px] font-bold">{DONE.heading}</div>
        <p className="text-b1-sub text-caption mt-1.5 leading-[1.6]">{DONE.text}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="border-b1-border text-b1-sub text-caption mt-2 rounded-full border px-5 py-2 font-semibold"
      >
        닫기
      </button>
    </div>
  );
}

function PanelContent({ flow }: { flow: PanelFlow }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PanelHeader flow={flow} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {flow.step === 'intent' && <IntentMenu onSelect={flow.selectIntent} />}
        {flow.step === 'guide' && <GuidePanel onRegister={() => flow.selectIntent('register')} />}
        {flow.step === 'form' && <MiniForm intent={flow.intent} onSubmit={flow.submit} />}
        {flow.step === 'done' && <DonePanel onClose={flow.close} />}
      </div>
    </div>
  );
}
