'use client';

import { buttonVariants } from '@/shared/components/ui/button';
import { reorder } from '@/shared/lib/reorder';
import { cn } from '@/shared/lib/utils';
import { ArrowLeft, ArrowRight, ImagePlus, X } from 'lucide-react';
import { useId } from 'react';

export type DropzoneImage = { id: string; previewUrl: string };

type ImageDropzoneProps = {
  value: DropzoneImage[];
  onChange: (next: DropzoneImage[]) => void;
  /** 새로 고른 파일. 축소·업로드는 부르는 쪽(관리자 기능)이 한다 — 이 부품은 UI 만 */
  onAddFiles: (files: File[]) => void;
  max?: number;
  className?: string;
};

const iconButton = cn(
  buttonVariants({ variant: 'secondary', size: 'icon' }),
  'bg-b1-surface/90 shadow-sm'
);

/** 사진 여러 장 고르기 + 미리보기 + 순서 바꾸기 + 삭제. 휴대폰에서는 카메라·앨범을 바로 연다. */
export function ImageDropzone({ value, onChange, onAddFiles, max, className }: ImageDropzoneProps) {
  const inputId = useId();
  const full = max !== undefined && value.length >= max;

  return (
    <div data-slot="image-dropzone" className={cn('flex flex-col gap-3', className)}>
      <label
        htmlFor={inputId}
        className={cn(
          'border-b1-border text-b1-sub flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed px-4 py-6',
          'hover:border-b1-accent hover:text-b1-accent duration-fast transition-colors',
          'has-[:focus-visible]:ring-ring/50 has-[:focus-visible]:ring-[3px]',
          full && 'pointer-events-none opacity-50'
        )}
      >
        <ImagePlus aria-hidden className="size-6" />
        <span className="text-label">{full ? `최대 ${max}장까지 올릴 수 있습니다` : '사진 추가'}</span>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          disabled={full}
          aria-label="사진 선택"
          className="sr-only"
          onChange={e => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) onAddFiles(files);
            e.target.value = '';
          }}
        />
      </label>

      {value.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((img, i) => (
            <li key={img.id} className="bg-b1-placeholder relative overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element -- 업로드 전 로컬 blob 미리보기라 next/image 대상이 아니다 */}
              <img src={img.previewUrl} alt={`${i + 1}번째 사진`} className="aspect-square w-full object-cover" />
              <div className="absolute inset-x-1 bottom-1 flex justify-between">
                <button
                  type="button"
                  className={iconButton}
                  disabled={i === 0}
                  aria-label={`${i + 1}번째 사진을 앞으로`}
                  onClick={() => onChange(reorder(value, i, i - 1))}
                >
                  <ArrowLeft aria-hidden />
                </button>
                <button
                  type="button"
                  className={iconButton}
                  disabled={i === value.length - 1}
                  aria-label={`${i + 1}번째 사진을 뒤로`}
                  onClick={() => onChange(reorder(value, i, i + 1))}
                >
                  <ArrowRight aria-hidden />
                </button>
              </div>
              <button
                type="button"
                className={cn(iconButton, 'absolute top-1 right-1')}
                aria-label={`${i + 1}번째 사진 삭제`}
                onClick={() => onChange(value.filter(v => v.id !== img.id))}
              >
                <X aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
