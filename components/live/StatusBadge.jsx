'use client';

import { useAdminStatus } from '@/hooks/useAdminStatus';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import EditStatusModal from './EditStatusModal';
import { Edit2 } from 'lucide-react';

export default function StatusBadge() {
  const status = useAdminStatus();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isOnline = status.online;
  const isBusy = status.busy;
  const statusText = status.text;

  // Determine dot color and label
  let dotColor = 'bg-zinc-500';
  let dotRing = 'ring-zinc-500/20';
  let defaultLabel = 'Offline';

  if (isOnline) {
    if (isBusy) {
      dotColor = 'bg-rose-500';
      dotRing = 'ring-rose-500/30';
      defaultLabel = 'Do Not Disturb';
    } else {
      dotColor = 'bg-emerald-500';
      dotRing = 'ring-emerald-500/30';
      defaultLabel = 'Active Now';
    }
  } else {
    dotColor = 'bg-amber-500/80';
    dotRing = 'ring-amber-500/10';
    defaultLabel = 'Away';
  }

  const displayText = statusText || defaultLabel;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center"
      >
        <button
          onClick={() => isAdmin && setModalOpen(true)}
          disabled={!isAdmin}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-neutral-950/80 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 select-none group text-left ${
            isAdmin
              ? 'cursor-pointer hover:border-blue-500/50 hover:bg-neutral-950 hover:scale-105'
              : 'cursor-default hover:border-white/20 hover:scale-105'
          }`}
        >
          {/* Breathing/Pulsing indicator dot wrapper */}
          <div className="relative flex h-2 w-2">
            {isOnline && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
          </div>

          {/* Text */}
          <span className="text-[10px] font-mono tracking-wide text-zinc-300 font-medium whitespace-nowrap max-w-[150px] truncate group-hover:text-white transition-colors duration-200">
            {displayText}
          </span>

          {/* Edit Icon for Admin */}
          {isAdmin && (
            <Edit2
              size={8}
              className="text-zinc-500 group-hover:text-blue-400 transition-colors duration-200 ml-0.5 opacity-0 group-hover:opacity-100"
            />
          )}
        </button>
      </motion.div>

      <EditStatusModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
