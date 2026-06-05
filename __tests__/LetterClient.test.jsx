import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LetterClient from '../app/letter/[code]/LetterClient';

// Mock child components
jest.mock('@/components/letter/PasswordGate', () => () => <div data-testid="password-gate" />);
jest.mock('@/components/letter/LetterPreloader', () => () => <div data-testid="preloader" />);
jest.mock('@/components/letter/EnvelopeAnimation', () => () => <div data-testid="envelope" />);
jest.mock('@/components/letter/WritingReveal', () => () => <div data-testid="writing-reveal" />);
jest.mock('@/components/letter/TextReveal', () => () => <div data-testid="text-reveal" />);

describe('LetterClient Component Branching', () => {
  test('renders PasswordGate if letter has password', () => {
    const letter = { hasPassword: true, kind: 'text' };
    render(<LetterClient letter={letter} code="123" />);
    expect(screen.getByTestId('password-gate')).toBeInTheDocument();
  });

  test('renders envelope first if no password, then transitions', () => {
    const letter = { hasPassword: false, kind: 'text', contentJSON: '{}', font: 'fz' };
    render(<LetterClient letter={letter} code="123" />);
    expect(screen.getByTestId('envelope')).toBeInTheDocument();
  });
});
