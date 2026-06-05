import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TextReveal from '../components/letter/TextReveal';

// Mock tokenizer to avoid JSON dependency or external issues
jest.mock('../lib/letterContent', () => ({
  tokenizeLetterContent: jest.fn((content) => {
    if (!content) return [];
    return [
      { type: 'word', text: 'Hello' },
      { type: 'space', text: ' ' },
      { type: 'word', text: 'world' },
    ];
  }),
}));

describe('TextReveal Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders all words immediately with opacity-100 when enableAnimation is false', () => {
    render(
      <TextReveal
        contentJSON='{"dummy":true}'
        font="reebie"
        enableAnimation={false}
      />,
    );

    const word1 = screen.getByText('Hello');
    const word2 = screen.getByText('world');

    expect(word1).toBeInTheDocument();
    expect(word1).toHaveClass('opacity-100');
    expect(word2).toHaveClass('opacity-100');
  });

  test('starts at opacity-0 and reveals word-by-word when enableAnimation is true', () => {
    const onComplete = jest.fn();
    render(
      <TextReveal
        contentJSON='{"dummy":true}'
        font="fz"
        enableAnimation={true}
        onComplete={onComplete}
      />,
    );

    const word1 = screen.getByText('Hello');
    const word2 = screen.getByText('world');

    // Initially, both should be hidden (opacity-0)
    expect(word1).toHaveClass('opacity-0');
    expect(word2).toHaveClass('opacity-0');

    // Run first timer
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // "Hello" is revealed
    expect(word1).toHaveClass('opacity-100');
    expect(word2).toHaveClass('opacity-0');

    // Advance for next word
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // "world" is revealed
    expect(word1).toHaveClass('opacity-100');
    expect(word2).toHaveClass('opacity-100');

    // Final timer triggers completion
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(onComplete).toHaveBeenCalled();
  });
});
