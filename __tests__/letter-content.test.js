import { tokenizeLetterContent } from '../lib/letterContent';

describe('tokenizeLetterContent', () => {
  test('returns empty array for invalid input', () => {
    expect(tokenizeLetterContent(null)).toEqual([]);
    expect(tokenizeLetterContent('')).toEqual([]);
    expect(tokenizeLetterContent('invalid-json')).toEqual([]);
  });

  test('tokenizes simple paragraph with words and spaces', () => {
    const tipTap = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello world' }],
        },
      ],
    };
    const tokens = tokenizeLetterContent(JSON.stringify(tipTap));
    expect(tokens).toEqual([
      { type: 'word', text: 'Hello' },
      { type: 'space', text: ' ' },
      { type: 'word', text: 'world' },
    ]);
  });

  test('inserts newlines between multiple block nodes', () => {
    const tipTap = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'First' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Second' }],
        },
      ],
    };
    const tokens = tokenizeLetterContent(JSON.stringify(tipTap));
    expect(tokens).toEqual([
      { type: 'word', text: 'First' },
      { type: 'newline', text: '\n' },
      { type: 'word', text: 'Second' },
    ]);
  });

  test('preserves consecutive whitespace and handles empty paragraphs', () => {
    const tipTap = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'A  B' }],
        },
        {
          type: 'paragraph',
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'C' }],
        },
      ],
    };
    const tokens = tokenizeLetterContent(JSON.stringify(tipTap));
    expect(tokens).toEqual([
      { type: 'word', text: 'A' },
      { type: 'space', text: ' ' },
      { type: 'space', text: ' ' },
      { type: 'word', text: 'B' },
      { type: 'newline', text: '\n' },
      { type: 'newline', text: '\n' },
      { type: 'word', text: 'C' },
    ]);
  });
});
