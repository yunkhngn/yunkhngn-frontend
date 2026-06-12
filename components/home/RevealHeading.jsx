'use client';

import { m as motion } from 'framer-motion';

export default function RevealHeading({ children, index, className = '' }) {
  return (
    <div>
      {index !== undefined && (
        <p className="font-mono text-xs text-muted-foreground/60 mb-2 tracking-widest">
          {String(index).padStart(2, '0')}
        </p>
      )}
      <motion.div
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        whileInView={{ clipPath: 'inset(-20% 0% -20% 0%)' }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`pb-2 ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
}
