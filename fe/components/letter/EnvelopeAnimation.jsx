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
    <div className="fixed inset-0 bg-[#1a1410] flex items-center justify-center z-50">
      <motion.div
        className="relative w-72 h-48 sm:w-96 sm:h-64"
        animate={phase === 'done' ? { opacity: 0, scale: 0.8 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[#c4a87c] rounded-lg shadow-2xl" />
        <motion.div
          className="absolute left-4 right-4 bg-[#f5f0e8] rounded-t-sm shadow-md z-10"
          style={{ bottom: '50%', height: '80%' }}
          initial={{ y: 60 }}
          animate={
            phase === 'pulling' || phase === 'done'
              ? { y: -120 }
              : phase === 'opening'
                ? { y: 30 }
                : { y: 60 }
          }
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="p-4 space-y-2 pt-6">
            {LINE_WIDTHS.map((w, i) => (
              <div
                key={i}
                className="h-1 bg-[#d4cfc5] rounded"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </motion.div>
        <div
          className="absolute inset-0 bg-[#d4a860] rounded-lg z-20 overflow-hidden"
          style={{
            clipPath: 'polygon(0 40%, 50% 70%, 100% 40%, 100% 100%, 0 100%)',
          }}
        />
        <motion.div
          className="absolute top-0 left-0 right-0 h-1/2 bg-[#c4a050] z-30 origin-top"
          style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}
          initial={{ rotateX: 0 }}
          animate={phase !== 'closed' ? { rotateX: 180 } : { rotateX: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#8b2500] shadow-lg z-40 flex items-center justify-center"
          animate={
            phase !== 'closed'
              ? { opacity: 0, scale: 0.5 }
              : { opacity: 1, scale: 1 }
          }
          transition={{ duration: 0.3 }}
        >
          <span className="text-amber-200/60 text-xs font-serif">✦</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
