import { motion } from 'framer-motion';

export default function LetterPreloader() {
  return (
    <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2a2119] via-[#140e0b] to-[#0a0705] flex items-center justify-center z-[100]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative w-16 h-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-amber-900/40 rounded-full border-t-amber-600/60"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border border-amber-900/20 rounded-full border-b-amber-700/50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-amber-600/80 rounded-full shadow-[0_0_10px_rgba(217,119,6,0.5)]" />
          </div>
        </div>
        <motion.p
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="font-serif text-amber-100/50 text-xs tracking-[0.3em] uppercase"
        >
          Đang tải thư...
        </motion.p>
      </motion.div>
    </div>
  );
}
