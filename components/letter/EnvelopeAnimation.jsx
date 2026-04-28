'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const LINE_WIDTHS = [72, 85, 68, 90, 76];

export default function EnvelopeAnimation({ onComplete, coverImage }) {
  const [phase, setPhase] = useState('closed');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('opening'), 800);
    const t2 = setTimeout(() => setPhase('pulling'), 1800);
    const t3 = setTimeout(() => setPhase('done'), 3200);
    const t4 = setTimeout(() => onComplete(), 3800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#0d0d0d] flex items-center justify-center z-50 overflow-hidden">
      <motion.div
        className="relative w-[320px] h-[220px] sm:w-[450px] sm:h-[310px] drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)]"
        initial={{ opacity: 0, y: 80, scale: 0.95 }}
        animate={
          phase === 'done'
            ? { opacity: 0, scale: 0.85, y: -40, filter: 'blur(10px)' }
            : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
        }
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Envelope Inside / Back */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#dcd7c9] to-[#c9c2af] rounded-lg shadow-inner overflow-hidden">
          <div className="absolute inset-0 bg-black/5" />
        </div>

        {/* Letter Paper Wrapper with bottom clipping */}
        <div 
          className="absolute inset-0 z-10"
          style={{ clipPath: 'polygon(-20% -500%, 120% -500%, 120% 100%, -20% 100%)' }}
        >
          <motion.div
            className="absolute left-6 right-6 bg-[#fdfaf5] rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden"
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
          {/* Realistic Letter Texture */}
          {coverImage ? (
            <div className="absolute inset-4 object-contain opacity-80 mix-blend-multiply">
              <Image
                src={coverImage}
                alt=""
                fill
                className="object-cover object-top opacity-90 blur-[1px]"
                sizes="(max-width: 640px) 20rem, 28rem"
                unoptimized
              />
            </div>
          ) : (
            <div className="p-6 space-y-3 pt-8 opacity-40">
              {LINE_WIDTHS.map((w, i) => (
                <div
                  key={i}
                  className="h-1 bg-[#8c7a61] rounded-full"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          )}
          {/* Shadow gradient indicating depth inside envelope */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#d1b894] via-transparent to-transparent opacity-80 mix-blend-multiply" />
        </motion.div>
        </div>

        {/* Envelope Bottom Flap */}
        <div
          className="absolute inset-0 bg-gradient-to-tr from-[#f2ebd9] to-[#dfd5c2] rounded-b-lg z-20 overflow-hidden drop-shadow-[-5px_-5px_15px_rgba(0,0,0,0.15)] border-t border-white/20"
          style={{
            clipPath: 'polygon(0 40%, 50% 65%, 100% 40%, 100% 100%, 0 100%)',
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50" />
        </div>

        {/* Envelope Top Flap */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[65%] bg-gradient-to-b from-[#f9f3e6] to-[#e7dec7] z-30 origin-top rounded-t-lg drop-shadow-[0_15px_15px_rgba(0,0,0,0.15)]"
          style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}
          initial={{ rotateX: 0 }}
          animate={phase !== 'closed' ? { rotateX: 180, zIndex: 5 } : { rotateX: 0 }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
        </motion.div>
      </motion.div>
    </div>
  );
}
