import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const LINE_WIDTHS = [72, 85, 68, 90, 76];

export default function EnvelopeAnimation({ onComplete }) {
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
    <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2a2119] via-[#140e0b] to-[#0a0705] flex items-center justify-center z-50">
      <motion.div
        className="relative w-80 h-56 sm:w-[28rem] sm:h-72 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        animate={phase === 'done' ? { opacity: 0, scale: 0.85, filter: 'blur(10px)' } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Envelope Inside / Back */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#b39162] to-[#8c6c41] rounded-lg shadow-inner overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Letter Paper */}
        <motion.div
          className="absolute left-6 right-6 bg-gradient-to-b from-[#fffbf5] to-[#f4ecd8] rounded-t-sm shadow-[0_0_20px_rgba(0,0,0,0.15)] z-10 border border-[#e8dcc4]"
          style={{ bottom: '40%', height: '85%' }}
          initial={{ y: 80 }}
          animate={
            phase === 'pulling' || phase === 'done'
              ? { y: -160 }
              : phase === 'opening'
                ? { y: 20 }
                : { y: 80 }
          }
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="p-6 space-y-3 pt-8 opacity-60">
            {LINE_WIDTHS.map((w, i) => (
              <div
                key={i}
                className="h-1.5 bg-gradient-to-r from-[#d1c5ae] to-[#c4b59d] rounded-full"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </motion.div>

        {/* Envelope Bottom Flap */}
        <div
          className="absolute inset-0 bg-gradient-to-tl from-[#e0be88] to-[#cda56b] rounded-lg z-20 overflow-hidden shadow-[0_-5px_15px_rgba(0,0,0,0.05)] border border-[#e2c18d] border-t-0"
          style={{
            clipPath: 'polygon(0 35%, 50% 65%, 100% 35%, 100% 100%, 0 100%)',
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50" />
        </div>

        {/* Envelope Top Flap */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#edcc97] to-[#d6ab6c] z-30 origin-top rounded-t-lg border border-[#efcf9c] border-b-0 drop-shadow-md"
          style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}
          initial={{ rotateX: 0 }}
          animate={phase !== 'closed' ? { rotateX: 180, zIndex: 5 } : { rotateX: 0 }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
        </motion.div>

        {/* Wax Seal */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-[#a62a00] to-[#631900] shadow-[0_4px_10px_rgba(0,0,0,0.4),0_0_0_2px_rgba(166,42,0,0.2)] z-40 flex items-center justify-center border border-[#c43200]"
          animate={
            phase !== 'closed'
              ? { opacity: 0, scale: 0.6, rotate: -45 }
              : { opacity: 1, scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.4, ease: 'easeIn' }}
        >
          <div className="absolute inset-1 rounded-full border border-[#852200] opacity-50" />
          <span className="text-[#ffcb9e] text-sm font-serif opacity-80 drop-shadow-md">✦</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
