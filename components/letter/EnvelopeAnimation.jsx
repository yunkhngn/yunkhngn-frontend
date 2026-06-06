'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

const LINE_WIDTHS = [72, 85, 68, 90, 76];

export default function EnvelopeAnimation({ onComplete, coverImage }) {
  const [phase, setPhase] = useState('closed');

  const handleOpen = (e) => {
    e.stopPropagation();
    if (phase !== 'closed') return;
    
    // Step 1: Seal breaks (phase becomes 'seal-broken')
    setPhase('seal-broken');
    
    // Step 2: Flap opens
    setTimeout(() => {
      setPhase('opening');
    }, 500);

    // Step 3: Letter is pulled out
    setTimeout(() => {
      setPhase('pulling');
    }, 1500);

    // Step 4: Finished pulling, blur and fade away
    setTimeout(() => {
      setPhase('done');
    }, 2800);

    // Step 5: Transition to main reading view
    setTimeout(() => {
      onComplete();
    }, 3400);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#18130f] via-[#100b08] to-[#080504] flex items-center justify-center z-50 overflow-hidden">
      <div className="relative flex flex-col items-center">
        <motion.div
          className="relative w-[320px] h-[220px] sm:w-[450px] sm:h-[310px] drop-shadow-[0_25px_50px_rgba(0,0,0,0.65)]"
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={
            phase === 'done'
              ? { opacity: 0, scale: 0.85, y: -40, filter: 'blur(10px)' }
              : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
          }
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ perspective: '1200px' }}
        >
          {/* Envelope Inside / Back */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#dfd5c2] to-[#c7bca5] rounded-lg shadow-inner overflow-hidden border border-[#d3c2a9]">
            {/* Elegant contrasting paper lining inside */}
            <div className="absolute inset-2 bg-[#f4ece1] rounded shadow-inner opacity-90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15)_0%,_transparent_75%)] pointer-events-none" />
          </div>

          {/* Letter Paper Wrapper with clipping to hide lower half inside envelope */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ clipPath: 'polygon(-20% -500%, 120% -500%, 120% 100%, -20% 100%)' }}
          >
            <motion.div
              className="absolute left-6 right-6 bg-[#fdfbf7] rounded-sm shadow-[0_4px_25px_rgba(0,0,0,0.25)] overflow-hidden"
              style={{ bottom: '4%', height: '92%' }} 
              initial={{ y: 0 }}
              animate={
                phase === 'pulling' || phase === 'done'
                  ? { y: -280 }
                  : phase === 'opening'
                    ? { y: 15 }
                    : { y: 0 }
              }
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Realistic Letter Texture preview */}
              {coverImage ? (
                <div className="absolute inset-4 object-contain opacity-80 mix-blend-multiply">
                  <Image
                    src={coverImage}
                    alt=""
                    fill
                    className="object-cover object-top opacity-90 blur-[0.5px]"
                    sizes="(max-width: 640px) 20rem, 28rem"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="p-6 relative h-full">
                  {/* Miniature stamp in top-right */}
                  <div className="absolute top-4 right-4 w-6 h-8 shadow-sm opacity-60 select-none overflow-hidden rotate-[2deg]">
                    <Image
                      src="/image/stamp.png"
                      alt="Postage Stamp"
                      fill
                      className="object-cover object-center"
                      unoptimized
                    />
                  </div>
                  <div className="space-y-2 pt-6 opacity-35">
                    {LINE_WIDTHS.map((w, i) => (
                      <div
                        key={i}
                        className="h-0.5 bg-[#8c7a61] rounded-full"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {/* Shadow gradient indicating depth inside envelope pocket */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#cfbe9f] via-transparent to-transparent opacity-70 mix-blend-multiply pointer-events-none" />
            </motion.div>
          </div>

          {/* Envelope Front Body (Sides & Bottom merged) */}
          <div
            className="absolute inset-0 bg-gradient-to-tr from-[#242c29] via-[#2d3733] to-[#252e2a] rounded-b-lg z-20 shadow-[0_-4px_15px_rgba(0,0,0,0.15)] border-t border-[#37433e]/30"
            style={{
              clipPath: 'polygon(0 18%, 50% 55%, 100% 18%, 100% 100%, 0 100%)',
            }}
          >
            {/* Subtle inner ambient shading */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.05)_0%,_transparent_75%)] pointer-events-none" />
          </div>

          {/* Double-sided Top Flap with 3D Flip */}
          <div 
            className={`absolute top-0 left-0 right-0 h-full ${(phase === 'closed' || phase === 'seal-broken' || phase === 'opening') ? 'z-30' : 'z-0'}`} 
            style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
          >
            <motion.div
              className="absolute inset-0 w-full h-full origin-top"
              style={{ transformStyle: 'preserve-3d', originY: 0 }}
              initial={{ rotateX: 0 }}
              animate={
                phase !== 'closed' && phase !== 'seal-broken' 
                  ? { rotateX: 180 } 
                  : { rotateX: 0 }
              }
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Front of Flap (visible when closed) */}
              <div 
                className="absolute inset-0 bg-gradient-to-b from-[#2d3733] to-[#242c29] rounded-t-lg border-b border-black/10 shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
                style={{ 
                  clipPath: 'polygon(0 0, 100% 0, 100% 20%, 50% 60%, 0 20%)',
                  backfaceVisibility: 'hidden'
                }}
              />
              {/* Back / Inside of Flap (visible when open) */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-[#ebdcc5] to-[#dfd5c2] rounded-t-lg border-b border-black/5"
                style={{ 
                  clipPath: 'polygon(0 0, 100% 0, 100% 20%, 50% 60%, 0 20%)',
                  transform: 'rotateY(180deg)',
                  backfaceVisibility: 'hidden'
                }}
              />
            </motion.div>
          </div>

          {/* Premium Monogrammed Organic Wax Seal Wrapper */}
          <AnimatePresence>
            {(phase === 'closed' || phase === 'seal-broken') && (
              <div className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 w-16 h-16 z-40">
                <motion.div
                  onClick={handleOpen}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full h-full cursor-pointer relative"
                  initial={{ scale: 0, opacity: 0, rotate: -45 }}
                  animate={
                    phase === 'seal-broken'
                      ? { scale: 0.8, opacity: 0, y: 40, rotate: 15, filter: 'blur(2px)' }
                      : { scale: 1, opacity: 1, rotate: 0 }
                  }
                  exit={{ scale: 0.8, opacity: 0, y: 40, rotate: 15 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Outer organic poured wax rim */}
                  <div className="absolute inset-0 bg-[#8c1818] rounded-[52%_48%_51%_49%_/_49%_52%_48%_51%] shadow-[0_4px_12px_rgba(0,0,0,0.4),_inset_0_2px_4px_rgba(255,255,255,0.2),_inset_0_-2px_4px_rgba(0,0,0,0.4)] border border-[#a62424]/20" />
                  
                  {/* Inner depressed monogram disc */}
                  <div className="absolute inset-2 bg-[#7a1212] rounded-[50%] shadow-[inset_0_2px_5px_rgba(0,0,0,0.6),_0_1px_2px_rgba(255,255,255,0.15)] flex items-center justify-center border border-[#6b0f0f]">
                    <span className="text-[#e8b6b6] font-serif italic font-extrabold text-xl select-none" style={{ textShadow: '-1px -1px 1px #400404, 1px 1px 1px rgba(255,255,255,0.2)' }}>
                      Y
                    </span>
                  </div>

                  {/* Gentle Pulsing Glow Ring */}
                  {phase === 'closed' && (
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -inset-1 rounded-full border border-[#ff3b3b]/20 pointer-events-none"
                    />
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Elegant helper description */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={phase === 'closed' ? { opacity: 0.5, y: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-12 text-center font-serif text-[#ebdcc5]/60 text-xs tracking-[0.2em] uppercase pointer-events-none select-none"
        >
          Nhấp vào con dấu để mở thư
        </motion.p>
      </div>
    </div>
  );
}
