'use client';

import { useState, useCallback, useEffect } from 'react';
import WritingReveal from '@/components/letter/WritingReveal';
import EnvelopeAnimation from '@/components/letter/EnvelopeAnimation';
import PasswordGate from '@/components/letter/PasswordGate';
import LetterPreloader from '@/components/letter/LetterPreloader';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

export default function LetterView({ letter, code }) {
  const [phase, setPhase] = useState(letter.hasPassword ? 'password' : 'envelope');
  const [pages, setPages] = useState(letter.pages || []);
  const [title, setTitle] = useState(letter.title || '');

  useEffect(() => {
    const t = title ? `${title} — Thư tay` : 'Thư tay';
    document.title = t;
  }, [title]);

  useEffect(() => {
    if (phase !== 'preloading') return;

    if (!pages || pages.length === 0) {
      setPhase('reading');
      return;
    }

    const firstPage = pages[0];
    const imagesToLoad = [];
    if (firstPage.imageUrl) imagesToLoad.push(firstPage.imageUrl);
    if (firstPage.revealMapUrl) imagesToLoad.push(firstPage.revealMapUrl);

    if (imagesToLoad.length === 0) {
      setPhase('reading');
      return;
    }

    let loadedCount = 0;
    const totalToLoad = imagesToLoad.length;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalToLoad) {
        setPhase('reading');
      }
    };

    imagesToLoad.forEach((url) => {
      const img = new window.Image();
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded;
      img.src = url;
    });
  }, [phase, pages]);

  const handlePasswordVerified = useCallback((data) => {
    setPages(data.pages);
    if (data.title) setTitle(data.title);
    setPhase('envelope');
  }, []);

  const handleEnvelopeComplete = useCallback(() => setPhase('preloading'), []);

  return (
    <ErrorBoundary>
      {phase === 'password' && <PasswordGate code={code} onVerified={handlePasswordVerified} />}
      {phase === 'preloading' && <LetterPreloader />}
      {phase === 'envelope' && (
        <EnvelopeAnimation onComplete={handleEnvelopeComplete} coverImage={pages[0]?.imageUrl} />
      )}
      {phase === 'reading' && <WritingReveal pages={pages} />}
    </ErrorBoundary>
  );
}
