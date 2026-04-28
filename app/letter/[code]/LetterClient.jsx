'use client';

import { useState, useCallback, useEffect } from 'react';
import EnvelopeAnimation from '@/components/letter/EnvelopeAnimation';
import WritingReveal from '@/components/letter/WritingReveal';
import PasswordGate from '@/components/letter/PasswordGate';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

export default function LetterView({ letter, code }) {
  const [phase, setPhase] = useState(letter.hasPassword ? 'password' : 'envelope');
  const [pages, setPages] = useState(letter.pages || []);
  const [title, setTitle] = useState(letter.title || '');

  useEffect(() => {
    const t = title ? `${title} — Thư tay` : 'Thư tay';
    document.title = t;
  }, [title]);

  const handlePasswordVerified = useCallback((data) => {
    setPages(data.pages);
    if (data.title) setTitle(data.title);
    setPhase('envelope');
  }, []);

  const handleEnvelopeComplete = useCallback(() => setPhase('reading'), []);

  return (
    <ErrorBoundary>
      {phase === 'password' && <PasswordGate code={code} onVerified={handlePasswordVerified} />}
      {phase === 'envelope' && (
        <EnvelopeAnimation onComplete={handleEnvelopeComplete} coverImage={pages[0]?.imageUrl} />
      )}
      {phase === 'reading' && <WritingReveal pages={pages} />}
    </ErrorBoundary>
  );
}
