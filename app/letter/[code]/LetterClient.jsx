'use client';

import { useState, useCallback, useEffect } from 'react';
import WritingReveal from '@/components/letter/WritingReveal';
import EnvelopeAnimation from '@/components/letter/EnvelopeAnimation';
import PasswordGate from '@/components/letter/PasswordGate';
import LetterPreloader from '@/components/letter/LetterPreloader';
import TextReveal from '@/components/letter/TextReveal';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

export default function LetterView({ letter, code }) {
  const [phase, setPhase] = useState(letter.hasPassword ? 'password' : 'envelope');
  const [pages, setPages] = useState(letter.pages || []);
  const [title, setTitle] = useState(letter.title || '');
  const [kind, setKind] = useState(letter.kind || 'scan');
  const [font, setFont] = useState(letter.font || 'fz');
  const [contentJSON, setContentJSON] = useState(letter.contentJSON || null);

  useEffect(() => {
    const t = title ? `${title} — Thư tay` : 'Thư tay';
    document.title = t;
  }, [title]);

  useEffect(() => {
    if (phase !== 'preloading') return;

    if (!pages || pages.length === 0 || kind === 'text') {
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
  }, [phase, pages, kind]);

  const handlePasswordVerified = useCallback((data) => {
    setPages(data.pages || []);
    if (data.title) setTitle(data.title);
    if (data.kind) setKind(data.kind);
    if (data.font) setFont(data.font);
    if (data.contentJSON) setContentJSON(data.contentJSON);
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
      {phase === 'reading' && (
        kind === 'text' ? (
          <div className="min-h-screen w-full flex items-center justify-center p-6 md:p-12 bg-[#faf7f2] text-[#4a3f35] font-sans">
            <div className="w-full max-w-3xl bg-white border border-[#eae1d4] shadow-xl rounded-lg p-8 md:p-16 relative overflow-hidden my-12 min-h-[60vh] flex flex-col justify-between">
              {/* Decorative handwritten paper styling */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#d97706]/40 via-[#b45309]/50 to-[#d97706]/40" />
              <div className="prose prose-stone max-w-none flex-grow">
                <TextReveal
                  contentJSON={contentJSON}
                  font={font}
                  enableAnimation={letter.enableAnimation}
                />
              </div>
              <div className="mt-12 text-right text-sm italic text-[#8c7a6b] select-none border-t border-[#eae1d4]/60 pt-4">
                Thư tay điện tử • yunkhngn.dev
              </div>
            </div>
          </div>
        ) : (
          <WritingReveal pages={pages} />
        )
      )}
    </ErrorBoundary>
  );
}
