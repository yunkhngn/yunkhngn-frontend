import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LetterEditor from '../components/admin/LetterEditor';

describe('LetterEditor Component', () => {
  test('parses TipTap JSON value and renders it in textarea', () => {
    const json = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'World' }],
        },
      ],
    });

    render(<LetterEditor value={json} font="fz" onChange={jest.fn()} onFontChange={jest.fn()} />);

    const textarea = screen.getByPlaceholderText(/Viết nội dung thư/);
    expect(textarea.value).toBe('Hello\n\nWorld');
  });

  test('calls onChange with correct TipTap JSON structure when typing', () => {
    const onChange = jest.fn();
    render(<LetterEditor value="" font="fz" onChange={onChange} onFontChange={jest.fn()} />);

    const textarea = screen.getByPlaceholderText(/Viết nội dung thư/);
    fireEvent.change(textarea, { target: { value: 'Line1\n\nLine2' } });

    expect(onChange).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Line1' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Line2' }] },
        ],
      }),
    );
  });

  test('calls onFontChange when font buttons are clicked', () => {
    const onFontChange = jest.fn();
    render(<LetterEditor value="" font="fz" onChange={jest.fn()} onFontChange={onFontChange} />);

    const buttonReebie = screen.getByText('Cỡ chữ Reebie');
    fireEvent.click(buttonReebie);

    expect(onFontChange).toHaveBeenCalledWith('reebie');
  });
});
