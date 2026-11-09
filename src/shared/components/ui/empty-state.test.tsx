import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('shows the title, description and action', () => {
    render(<EmptyState title="아직 주보가 없습니다" description="첫 주보를 올려 주세요" action={<button>주보 올리기</button>} />);
    expect(screen.getByRole('heading', { name: '아직 주보가 없습니다' })).toBeInTheDocument();
    expect(screen.getByText('첫 주보를 올려 주세요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '주보 올리기' })).toBeInTheDocument();
  });
});
