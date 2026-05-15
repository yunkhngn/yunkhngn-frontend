'use client';

import { motion } from 'framer-motion';

const orbs = [
  {
    className: 'w-96 h-96 bg-primary/10 top-[-10%] left-[-5%]',
    duration: 10,
    animate: { x: [0, 40, -20, 0], y: [0, -30, 20, 0] },
  },
  {
    className: 'w-80 h-80 bg-secondary/10 top-[20%] right-[-5%]',
    duration: 12,
    animate: { x: [0, -30, 50, 0], y: [0, 40, -10, 0] },
  },
  {
    className: 'w-64 h-64 bg-primary/5 bottom-[10%] left-[30%]',
    duration: 8,
    animate: { x: [0, 20, -40, 0], y: [0, -20, 30, 0] },
  },
];

export default function HeroBackground() {
  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden -z-10 pointer-events-none">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[120px] ${orb.className}`}
          animate={orb.animate}
          transition={{ duration: orb.duration, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}
