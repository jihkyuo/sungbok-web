import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormField } from './form-field';

describe('FormField', () => {
  it('links the label to the input', () => {
    render(
      <FormField label="이름" htmlFor="name">
        <input id="name" />
      </FormField>
    );
    expect(screen.getByLabelText('이름')).toBeInTheDocument();
  });

  it('marks the input invalid and describes it with the error', () => {
    render(
      <FormField label="이름" htmlFor="name" help="실명을 적어 주세요" error="이름을 입력해 주세요">
        <input id="name" />
      </FormField>
    );
    const input = screen.getByLabelText('이름');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'name-help name-error');
    expect(screen.getByRole('alert')).toHaveTextContent('이름을 입력해 주세요');
  });

  it('describes the input with help text only when there is no error', () => {
    render(
      <FormField label="이름" htmlFor="name" help="실명을 적어 주세요">
        <input id="name" />
      </FormField>
    );
    const input = screen.getByLabelText('이름');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAttribute('aria-describedby', 'name-help');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('keeps the child describedby and marks required fields', () => {
    render(
      <FormField label="이름" htmlFor="name" help="실명을 적어 주세요" required>
        <input id="name" aria-describedby="extra" />
      </FormField>
    );
    const input = screen.getByLabelText(/이름/);
    expect(input).toHaveAttribute('aria-describedby', 'extra name-help');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it("keeps the child's own aria-required when the field is not marked required", () => {
    render(
      <FormField label="이름" htmlFor="name">
        <input id="name" aria-required />
      </FormField>
    );
    expect(screen.getByLabelText('이름')).toHaveAttribute('aria-required', 'true');
  });
});
