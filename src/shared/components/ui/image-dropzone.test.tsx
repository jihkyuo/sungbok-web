import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ImageDropzone } from './image-dropzone';

const value = [
  { id: 'a', previewUrl: 'blob:a' },
  { id: 'b', previewUrl: 'blob:b' },
];

describe('ImageDropzone', () => {
  it('passes selected files to onAddFiles', () => {
    const onAddFiles = vi.fn();
    render(<ImageDropzone value={[]} onChange={() => {}} onAddFiles={onAddFiles} />);
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('사진 선택'), { target: { files: [file] } });
    expect(onAddFiles).toHaveBeenCalledWith([file]);
  });

  it('moves a photo forward with the move button', () => {
    const onChange = vi.fn();
    render(<ImageDropzone value={value} onChange={onChange} onAddFiles={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '1번째 사진을 뒤로' }));
    expect(onChange).toHaveBeenCalledWith([value[1], value[0]]);
  });

  it('removes a photo', () => {
    const onChange = vi.fn();
    render(<ImageDropzone value={value} onChange={onChange} onAddFiles={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '2번째 사진 삭제' }));
    expect(onChange).toHaveBeenCalledWith([value[0]]);
  });

  it('disables picking more photos at the max', () => {
    render(<ImageDropzone value={value} onChange={() => {}} onAddFiles={() => {}} max={2} />);
    expect(screen.getByLabelText('사진 선택')).toBeDisabled();
  });
});
