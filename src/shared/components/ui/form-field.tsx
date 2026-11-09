import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import * as React from 'react';

type FormFieldProps = {
  label: string;
  /** 자식 입력칸의 id 와 같아야 한다 — 라벨 클릭·스크린리더 연결 */
  htmlFor: string;
  help?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactElement<{
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
    'aria-required'?: boolean;
  }>;
};

/**
 * 라벨 + 입력칸 + 도움말/오류 묶음. 오류가 있으면 입력칸에 aria-invalid·aria-describedby 를 붙인다.
 * 관리자 폼의 기본 단위 — 설계 .md/specs/2026-11-05-design-system-design.md §5.6
 */
export function FormField({
  label,
  htmlFor,
  help,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  const helpId = help ? `${htmlFor}-help` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  // 자식이 원래 가진 설명(aria-describedby)도 지우지 않고 앞에 둔다
  const describedBy =
    [children.props['aria-describedby'], helpId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div data-slot="form-field" className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && (
          <span aria-hidden className="text-b1-danger">
            *
          </span>
        )}
      </Label>
      {React.cloneElement(children, {
        'aria-invalid': error ? true : children.props['aria-invalid'],
        'aria-describedby': describedBy,
        'aria-required': required || children.props['aria-required'],
      })}
      {help && (
        <p id={helpId} className="text-caption text-b1-sub m-0">
          {help}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-caption text-b1-danger m-0">
          {error}
        </p>
      )}
    </div>
  );
}
