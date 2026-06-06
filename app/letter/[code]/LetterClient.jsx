'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
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
          <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-12 bg-[#f4ece1] text-[#4a3f35] font-sans transition-colors duration-500">
            <div className="relative w-full max-w-3xl my-12">
              {/* Stack effect: Paper sheet 3 (bottom) */}
              <div className="absolute inset-0 bg-[#faf6ee] border border-[#e5dcd0] rounded-sm rotate-[-1deg] translate-y-1.5 shadow-sm" />
              {/* Stack effect: Paper sheet 2 (middle) */}
              <div className="absolute inset-0 bg-[#fbf9f4] border border-[#e8dfd3] rounded-sm rotate-[0.6deg] translate-x-1 translate-y-0.5 shadow-md" />
              
              {/* Main Sheet (top) */}
              <div className="relative w-full bg-[#fdfbf7] border border-[#ded7c8] rounded-sm pt-20 pb-8 px-6 md:pt-28 md:pb-12 md:px-16 min-h-[60vh] flex flex-col justify-between shadow-[0_10px_35px_rgba(139,109,71,0.12)] overflow-hidden">
                {/* Fine Linen Texture Overlay */}
                <div className="absolute inset-0 pointer-events-none select-none opacity-[0.012]" style={{
                  backgroundImage: `
                    linear-gradient(90deg, #8b6d47 1px, transparent 1px),
                    linear-gradient(0deg, #8b6d47 1px, transparent 1px)
                  `,
                  backgroundSize: '4px 4px'
                }} />

                {/* Fold lines overlay */}
                <div className="absolute inset-0 pointer-events-none select-none mix-blend-multiply opacity-50">
                  {/* Horizontal fold 1 */}
                  <div className="absolute top-[33.3%] left-0 right-0 h-[6px] bg-gradient-to-b from-black/0 via-black/[0.015] to-white/[0.03] border-b border-black/[0.005]" />
                  {/* Horizontal fold 2 */}
                  <div className="absolute top-[66.6%] left-0 right-0 h-[6px] bg-gradient-to-b from-black/0 via-black/[0.015] to-white/[0.03] border-b border-black/[0.005]" />
                  {/* Vertical fold */}
                  <div className="absolute top-0 bottom-0 left-[50%] w-[6px] -ml-[3px] bg-gradient-to-r from-black/0 via-black/[0.01] to-white/[0.02] border-r border-black/[0.003]" />
                </div>

                 {/* Postage Stamp */}
                <div className="absolute top-6 right-6 md:top-8 md:right-8 w-16 h-20 shadow-md rotate-[4deg] select-none pointer-events-none z-10 overflow-hidden">
                  <Image
                    src="/image/stamp.png"
                    alt="Postage Stamp"
                    fill
                    className="object-cover object-center"
                    unoptimized
                  />
                </div>

                {/* Postmark / Cancellation mark */}
                <div className="absolute top-10 right-16 md:top-12 md:right-20 w-16 h-16 rounded-full border border-[#8b6d47]/20 flex items-center justify-center -rotate-12 select-none pointer-events-none z-10">
                  <div className="w-14 h-14 rounded-full border border-dashed border-[#8b6d47]/20 flex flex-col items-center justify-center text-[5px] text-[#8b6d47]/40 font-serif leading-none">
                    <span className="mb-0.5">DELIVERED</span>
                    <span>yunkhngn.dev</span>
                  </div>
                </div>

                {/* Content */}
                <div className="prose prose-stone max-w-none flex-grow relative z-0">
                  <TextReveal
                    contentJSON={contentJSON}
                    font={font}
                    enableAnimation={letter.enableAnimation}
                  />
                </div>

                {/* Footer Signature */}
                <div className="mt-12 text-right text-sm italic text-[#8c7a6b] select-none border-t border-[#eae1d4]/60 pt-4 relative z-10">
                  sent from yunkhngn.dev
                </div>
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
